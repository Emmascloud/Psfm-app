-- PSMF Family — migration 09: push notification subscriptions
-- Paste and run each numbered section separately.

-- 1) One row per device a member has enabled notifications on.
create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

alter table public.push_subscriptions enable row level security;

-- 2) A member can only manage their own subscriptions. The sending
-- side (an API route) reads across everyone using the service-role
-- key, same pattern as the admin panel — it does not go through these
-- policies at all.
create policy "Members can view their own subscriptions"
  on public.push_subscriptions for select to authenticated
  using (user_id = auth.uid());

create policy "Members can add their own subscription"
  on public.push_subscriptions for insert to authenticated
  with check (user_id = auth.uid());

create policy "Members can remove their own subscription"
  on public.push_subscriptions for delete to authenticated
  using (user_id = auth.uid());
