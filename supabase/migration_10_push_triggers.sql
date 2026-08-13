-- PSMF Family — migration 10: push-notification triggers
-- Use this INSTEAD of the dashboard's Webhooks UI if you can't find
-- that tab — it does exactly the same thing, just written as SQL.
-- Paste and run each numbered section separately.

-- 1) Make sure pg_net (lets Postgres make HTTP calls) is enabled.
-- Safe to run even if it's already on.
create extension if not exists pg_net with schema extensions;

-- 2) The function every trigger below will call. REPLACE THE TWO
-- PLACEHOLDER VALUES before running this section:
--   - your-app.vercel.app  → your real Vercel domain
--   - YOUR_SECRET_HERE     → the exact value of PUSH_WEBHOOK_SECRET
--                             from your .env.local / Vercel env vars
create or replace function public.notify_push()
returns trigger
language plpgsql
security definer
as $$
begin
  perform
    net.http_post(
      url := 'https://your-app.vercel.app/api/push/send',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-webhook-secret', 'YOUR_SECRET_HERE'
      ),
      body := jsonb_build_object(
        'table', TG_TABLE_NAME,
        'record', row_to_json(NEW)
      )
    );
  return NEW;
end;
$$;

-- 3) Attach it to the three tables that should trigger a notification.
create trigger messages_notify_push
  after insert on public.messages
  for each row execute function public.notify_push();

create trigger direct_messages_notify_push
  after insert on public.direct_messages
  for each row execute function public.notify_push();

create trigger posts_notify_push
  after insert on public.posts
  for each row execute function public.notify_push();
