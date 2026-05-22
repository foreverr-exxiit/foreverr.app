-- Fix handle_new_user trigger to handle conflicts gracefully
-- Previously: bare INSERT would fail if username already existed (e.g. partial signup retries)
-- Now: ON CONFLICT (id) DO UPDATE ensures idempotency; username gets a random suffix on conflict

create or replace function public.handle_new_user()
returns trigger as $$
declare
  desired_username text;
  final_username text;
begin
  desired_username := coalesce(new.raw_user_meta_data->>'username', 'user_' || substr(new.id::text, 1, 8));

  -- Check if username is taken by another user
  if exists (select 1 from public.profiles where username = desired_username and id != new.id) then
    final_username := desired_username || '_' || substr(md5(new.id::text || now()::text), 1, 6);
  else
    final_username := desired_username;
  end if;

  insert into public.profiles (id, username, display_name, avatar_url)
  values (
    new.id,
    final_username,
    coalesce(new.raw_user_meta_data->>'display_name', 'New User'),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do update set
    display_name = coalesce(excluded.display_name, profiles.display_name),
    avatar_url = coalesce(excluded.avatar_url, profiles.avatar_url),
    updated_at = now();

  -- Grant signup bonus ribbons (only if no prior transaction for this user)
  insert into public.ribbon_transactions (user_id, amount, type, description, balance_after)
  select new.id, 100, 'signup_bonus', 'Welcome to eterrn!', 100
  where not exists (
    select 1 from public.ribbon_transactions
    where user_id = new.id and type = 'signup_bonus'
  );

  return new;
end;
$$ language plpgsql security definer;
