-- PSFM Circle — migration 02: admin + moderation
-- Run in Supabase SQL Editor after schema.sql.

alter table public.profiles
  add column if not exists is_admin boolean not null default false,
  add column if not exists is_suspended boolean not null default false;

-- Admins can update ANY profile (needed to suspend/unsuspend members).
-- Regular members keep their existing "own row only" update policy.
create policy "Admins can update any profile"
  on public.profiles for update
  to authenticated
  using (exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true
  ))
  with check (true);

-- One-time: promote yourself to admin. Replace the email below with
-- your own account's email, then run this once.
-- update public.profiles set is_admin = true
--   where id = (select id from auth.users where email = 'you@example.com');
