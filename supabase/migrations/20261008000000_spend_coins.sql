-- Coins are spent on Superchat (start a chat without waiting for a request to be
-- accepted). Like the other economy functions this runs on the server, so the
-- balance can never be edited from the app.

create or replace function public.spend_coins(amount integer)
returns public.profiles
language plpgsql security definer set search_path = public as $$
declare p public.profiles;
begin
  if amount is null or amount <= 0 or amount > 500 then
    raise exception 'Invalid amount';
  end if;
  update public.profiles
     set coins = coins - amount
   where id = auth.uid() and coins >= amount
   returning * into p;
  if not found then
    raise exception 'Not enough coins';
  end if;
  return p;
end;
$$;

revoke all on function public.spend_coins(integer) from public, anon;
grant execute on function public.spend_coins(integer) to authenticated;
