-- PSFM Circle — profiles schema
-- Run this once in your Supabase project: Dashboard → SQL Editor → New query → paste → Run.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  status text check (status in ('single', 'married')),
  birth_month smallint not null check (birth_month between 1 and 12),
  birth_day smallint not null check (birth_day between 1 and 31),
  anniversary_month smallint check (anniversary_month between 1 and 12),
  anniversary_day smallint check (anniversary_day between 1 and 31),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Every signed-in member can see the directory (needed to show whose
-- birthday is coming up). No one outside the fellowship can read it —
-- there is no anonymous/public policy.
create policy "Members can view all profiles"
  on public.profiles for select
  to authenticated
  using (true);

-- Members can only ever write their own row.
create policy "Members can insert their own profile"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

create policy "Members can update their own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Keep updated_at current on every edit.
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();
