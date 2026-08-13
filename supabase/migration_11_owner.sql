-- PSMF Family — migration 11: owner protection
-- Adds a tier above "admin" so any admin you add later can moderate
-- regular members but can never suspend you (or another admin) —
-- only the owner can do that.
-- Paste and run each numbered section separately.

-- 1) Column
alter table public.profiles add column if not exists is_owner boolean not null default false;

-- 2) One-time: mark your own account as the owner. Replace the email
-- below with your own account's email, then run this once.
update public.profiles set is_owner = true
  where id = (select id from auth.users where email = 'REPLACE_WITH_YOUR_EMAIL');
