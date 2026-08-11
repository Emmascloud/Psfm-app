-- PSFM Family — migration 04: family chat room
-- Paste and run each numbered section separately.

-- 1) Messages table
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;

create policy "Members can view all messages"
  on public.messages for select to authenticated using (true);

create policy "Members can send their own messages"
  on public.messages for insert to authenticated
  with check (author_id = auth.uid());

create policy "Owner or admin can delete a message"
  on public.messages for delete to authenticated
  using (
    author_id = auth.uid()
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
  );

-- 2) Let members report a chat message too (reuses the existing
-- reports table from migration 03 — widens what target_type accepts)
alter table public.reports drop constraint if exists reports_target_type_check;
alter table public.reports add constraint reports_target_type_check
  check (target_type in ('post', 'comment', 'message'));

-- 3) Turn on Realtime for the messages table so the chat updates live
-- without anyone refreshing the page.
alter publication supabase_realtime add table public.messages;
