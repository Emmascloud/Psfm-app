-- PSMF Family — migration 14: events + RSVPs
-- Paste and run each numbered section separately.

-- 1) Events — admin-created only (like the seminars you already run).
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  location text,
  event_link text,
  starts_at timestamptz not null,
  created_by uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.events enable row level security;

create policy "Members can view all events"
  on public.events for select to authenticated using (true);

create policy "Admins can create events"
  on public.events for insert to authenticated
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true));

create policy "Admins can edit events"
  on public.events for update to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true));

create policy "Admins can delete events"
  on public.events for delete to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true));

-- 2) RSVPs — any member can RSVP to any event, only for themselves.
create table if not exists public.event_rsvps (
  event_id uuid not null references public.events (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  status text not null check (status in ('going', 'interested')),
  created_at timestamptz not null default now(),
  primary key (event_id, user_id)
);

alter table public.event_rsvps enable row level security;

create policy "Members can view all RSVPs"
  on public.event_rsvps for select to authenticated using (true);

create policy "Members can RSVP as themselves"
  on public.event_rsvps for insert to authenticated
  with check (user_id = auth.uid());

create policy "Members can change their own RSVP"
  on public.event_rsvps for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Members can remove their own RSVP"
  on public.event_rsvps for delete to authenticated
  using (user_id = auth.uid());

-- 3) Notify everyone when a new event is posted — reuses the same
-- notify_push() function created in migration_10, so that migration
-- must already be applied before this section will work.
create trigger events_notify_push
  after insert on public.events
  for each row execute function public.notify_push();
