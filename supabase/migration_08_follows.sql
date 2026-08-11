-- PSMF Family — migration 08: following other members
-- Paste and run each numbered section separately.

-- 1) Table
create table if not exists public.follows (
  follower_id uuid not null references public.profiles (id) on delete cascade,
  following_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  constraint no_self_follow check (follower_id <> following_id)
);

alter table public.follows enable row level security;

-- 2) Policies: anyone signed in can see who follows whom (needed for
-- follower/following counts to show on a profile); a member can only
-- create or remove their own follow relationship.
create policy "Members can view all follows"
  on public.follows for select to authenticated using (true);

create policy "Members can follow as themselves"
  on public.follows for insert to authenticated
  with check (follower_id = auth.uid());

create policy "Members can unfollow as themselves"
  on public.follows for delete to authenticated
  using (follower_id = auth.uid());
