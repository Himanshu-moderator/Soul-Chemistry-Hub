-- Pdb backend schema.
-- Run this once in the Supabase SQL editor (or with `supabase db push`).
-- Real accounts, profiles, follows, community membership and live community chat.
-- Every table has Row Level Security; the app only ever uses the public anon key.

-- ---------------------------------------------------------------- profiles
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default 'New member'
    check (char_length(display_name) between 1 and 40),
  username text unique check (username ~ '^[a-z0-9_]{3,20}$'),
  bio text not null default '' check (char_length(bio) <= 160),
  mbti text check (mbti ~ '^[EI][SN][TF][JP]$'),
  enneagram text check (char_length(enneagram) <= 4),
  socionics text check (char_length(socionics) <= 4),
  selected_theme text not null default 't1',
  chat_theme text not null default 'nebula' check (chat_theme in ('nebula', 'aurora', 'eclipse')),
  onboarded boolean not null default false,
  -- Economy: only changed by the functions below, never directly by the client.
  coins integer not null default 100 check (coins >= 0),
  xp integer not null default 0 check (xp >= 0),
  streak integer not null default 0 check (streak >= 0),
  last_checkin date,
  is_premium boolean not null default false,
  trial_started_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Members can see each other's public profile (needed for chat names and types).
create policy "profiles are readable by signed-in users"
  on public.profiles for select to authenticated using (true);

create policy "users update their own profile"
  on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- Clients may only edit these columns; coins, streak, premium etc. go through functions.
revoke insert, update, delete on public.profiles from anon, authenticated;
grant update (display_name, username, bio, mbti, enneagram, socionics, selected_theme, chat_theme, onboarded)
  on public.profiles to authenticated;

-- A profile row is created automatically for every new account.
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    left(coalesce(nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''), split_part(new.email, '@', 1), 'New member'), 40)
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------- follows
create table public.follows (
  user_id uuid not null references public.profiles (id) on delete cascade default auth.uid(),
  person_id text not null check (char_length(person_id) <= 40),
  created_at timestamptz not null default now(),
  primary key (user_id, person_id)
);
alter table public.follows enable row level security;
create policy "own follows" on public.follows for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- --------------------------------------------------------------- communities
create table public.community_members (
  user_id uuid not null references public.profiles (id) on delete cascade default auth.uid(),
  community_id text not null check (char_length(community_id) <= 40),
  joined_at timestamptz not null default now(),
  primary key (user_id, community_id)
);
alter table public.community_members enable row level security;
create policy "own memberships" on public.community_members for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Member counts for everyone (runs as the view owner, so it can count across users).
create view public.community_stats as
  select community_id, count(*)::int as members
  from public.community_members
  group by community_id;
grant select on public.community_stats to authenticated;

create table public.community_messages (
  id bigint generated always as identity primary key,
  community_id text not null check (char_length(community_id) <= 40),
  user_id uuid not null references public.profiles (id) on delete cascade default auth.uid(),
  body text not null check (char_length(body) between 1 and 500),
  created_at timestamptz not null default now()
);
create index community_messages_room_idx on public.community_messages (community_id, created_at desc);
alter table public.community_messages enable row level security;

-- You can read and write a room only if you have joined it.
create policy "members read their rooms" on public.community_messages for select to authenticated
  using (exists (
    select 1 from public.community_members m
    where m.community_id = community_messages.community_id and m.user_id = auth.uid()
  ));
create policy "members post as themselves" on public.community_messages for insert to authenticated
  with check (user_id = auth.uid() and exists (
    select 1 from public.community_members m
    where m.community_id = community_messages.community_id and m.user_id = auth.uid()
  ));
create policy "authors delete their messages" on public.community_messages for delete to authenticated
  using (user_id = auth.uid());

-- Simple flood control: at most one message per second per person.
create function public.limit_message_rate() returns trigger
language plpgsql as $$
begin
  if exists (
    select 1 from public.community_messages
    where user_id = new.user_id and created_at > now() - interval '1 second'
  ) then
    raise exception 'You are sending messages too fast' using errcode = 'P0001';
  end if;
  return new;
end;
$$;
create trigger limit_message_rate before insert on public.community_messages
  for each row execute function public.limit_message_rate();

-- Live updates for the chat rooms.
alter publication supabase_realtime add table public.community_messages;

-- ----------------------------------------------------------------- economy
-- Daily check-in: once per (UTC) day, keeps a streak, pays a few coins.
create function public.claim_daily_checkin(reward integer default 5)
returns public.profiles
language plpgsql security definer set search_path = public as $$
declare p public.profiles;
begin
  select * into p from public.profiles where id = auth.uid() for update;
  if p.id is null then raise exception 'No profile'; end if;
  if p.last_checkin = current_date then return p; end if;
  update public.profiles set
    coins = coins + least(greatest(reward, 0), 10),
    xp = xp + 10,
    streak = case when p.last_checkin = current_date - 1 then p.streak + 1 else 1 end,
    last_checkin = current_date
  where id = p.id
  returning * into p;
  return p;
end;
$$;

-- 14-day free trial: the start date can only be set once.
create function public.start_trial()
returns public.profiles
language plpgsql security definer set search_path = public as $$
declare p public.profiles;
begin
  update public.profiles
    set is_premium = true, trial_started_at = coalesce(trial_started_at, now())
  where id = auth.uid()
  returning * into p;
  return p;
end;
$$;

-- Prototype only: "buying" a coin pack is free and just credits the coins.
-- Replace with a real payment webhook before launching anything for real.
create function public.demo_purchase_coins(pack_coins integer)
returns public.profiles
language plpgsql security definer set search_path = public as $$
declare p public.profiles;
begin
  if pack_coins not in (10, 80, 450, 950, 2000, 5500) then
    raise exception 'Unknown coin pack';
  end if;
  update public.profiles set coins = coins + pack_coins where id = auth.uid() returning * into p;
  return p;
end;
$$;

revoke all on function public.claim_daily_checkin(integer), public.start_trial(), public.demo_purchase_coins(integer) from public, anon;
grant execute on function public.claim_daily_checkin(integer), public.start_trial(), public.demo_purchase_coins(integer) to authenticated;
