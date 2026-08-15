-- PSMF Family — migration 15: birthday auto-post tracking
-- One row per (member, date) a birthday post was already sent for —
-- makes the daily cron job safe to run more than once on the same day
-- without posting twice. Only ever touched by the server-side cron
-- route (service-role key), so RLS is enabled with no policies at
-- all — nobody reaches this table through the app itself.

create table if not exists public.birthday_announcements (
  profile_id uuid not null references public.profiles (id) on delete cascade,
  sent_on date not null,
  created_at timestamptz not null default now(),
  primary key (profile_id, sent_on)
);

alter table public.birthday_announcements enable row level security;
