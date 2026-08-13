-- PSMF Family — migration 12: member roster + invite links
-- This is how the 150+ names from the original WhatsApp list become
-- real accounts WITHOUT us inventing fake email addresses for people
-- (we were never given real ones, and a fake email can't receive a
-- password reset or actually belong to the person). Instead: each
-- roster row gets a private, unguessable invite link. Send it to that
-- person over WhatsApp; they open it, and /signup is pre-filled with
-- their name and birthday — they just add their own real email and
-- password. Paste and run each numbered section separately.

-- 1) Table
create table if not exists public.roster (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  birth_month smallint not null check (birth_month between 1 and 12),
  birth_day smallint not null check (birth_day between 1 and 31),
  anniversary_month smallint check (anniversary_month between 1 and 12),
  anniversary_day smallint check (anniversary_day between 1 and 31),
  invite_token text not null unique default encode(gen_random_bytes(12), 'hex'),
  claimed_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.roster enable row level security;

-- Admin-only. The /signup page looks up a single row by its token
-- using the service-role key server-side, which bypasses RLS
-- entirely — it never needs a public policy here, so the list of 150
-- names+birthdays is never queryable by anyone but an admin.
create policy "Admins can view the roster"
  on public.roster for select to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true));
