-- The new-user trigger function is only meant to run from the trigger, never over the API.
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- Pin the search path of the rate-limit trigger.
alter function public.limit_message_rate() set search_path = public;

-- The persona-ai edge function reads the Gemini key from Supabase Vault (encrypted at rest)
-- through this function. Only the service role (the edge function) may call it, so the key
-- is never reachable from the app or the public API.
-- To store the key (SQL editor, once):
--   select vault.create_secret('YOUR-GEMINI-KEY', 'GEMINI_API_KEY', 'Gemini key for persona-ai');
create or replace function public.get_gemini_key()
returns text
language sql security definer set search_path = ''
as $$
  select decrypted_secret from vault.decrypted_secrets
  where name = 'GEMINI_API_KEY'
  order by created_at desc
  limit 1
$$;

revoke all on function public.get_gemini_key() from public, anon, authenticated;
grant execute on function public.get_gemini_key() to service_role;
