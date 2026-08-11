-- PSMF Family — migration 06: member contact number
-- Kept in its own table (not a plain profiles column) so it can stay
-- private to the member themselves and to admins — everyone else who
-- can read "profiles" should NOT automatically be able to read phone
-- numbers on a platform like this one.
-- Paste and run each numbered section separately.

-- 1) Table
create table if not exists public.contacts (
  id uuid primary key references public.profiles (id) on delete cascade,
  phone text,
  updated_at timestamptz not null default now()
);

alter table public.contacts enable row level security;

-- 2) Policies: a member can read/write only their own row; admins can
-- read everyone's (so they can reach out), but still cannot edit
-- someone else's number.
create policy "Owner or admin can view a contact"
  on public.contacts for select to authenticated
  using (
    id = auth.uid()
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
  );

create policy "Owner can insert their own contact"
  on public.contacts for insert to authenticated
  with check (id = auth.uid());

create policy "Owner can update their own contact"
  on public.contacts for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- 3) Keep updated_at current
create trigger contacts_set_updated_at
  before update on public.contacts
  for each row execute function public.set_updated_at();
