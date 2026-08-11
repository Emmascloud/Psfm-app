-- PSMF Family — migration 05: post editing + emoji reactions on posts
-- Paste and run each numbered section separately.

-- 1) Track edits on posts
alter table public.posts add column if not exists edited_at timestamptz;

-- 2) Reactions (one emoji per member per post — picking a new one
-- replaces the old one, handled in the app via upsert)
create table if not exists public.reactions (
  id uuid primary key default gen_random_uuid(),
  target_type text not null check (target_type in ('post')),
  target_id uuid not null,
  user_id uuid not null references public.profiles (id) on delete cascade,
  emoji text not null,
  created_at timestamptz not null default now(),
  unique (target_type, target_id, user_id)
);

alter table public.reactions enable row level security;

create policy "Members can view all reactions"
  on public.reactions for select to authenticated using (true);

create policy "Members can add their own reaction"
  on public.reactions for insert to authenticated
  with check (user_id = auth.uid());

create policy "Members can change their own reaction"
  on public.reactions for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Members can remove their own reaction"
  on public.reactions for delete to authenticated
  using (user_id = auth.uid());
