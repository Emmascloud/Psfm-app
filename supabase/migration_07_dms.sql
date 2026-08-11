-- PSMF Family — migration 07: private messages between members
-- Paste and run each numbered section separately.

-- 1) Table
create table if not exists public.direct_messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles (id) on delete cascade,
  recipient_id uuid not null references public.profiles (id) on delete cascade,
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.direct_messages enable row level security;

create policy "Participants can view their conversation"
  on public.direct_messages for select to authenticated
  using (auth.uid() = sender_id or auth.uid() = recipient_id);

create policy "Members can send a DM as themselves"
  on public.direct_messages for insert to authenticated
  with check (auth.uid() = sender_id);

-- Lets the recipient mark a message read, and lets either side (or an
-- admin) delete one — same moderation pattern as posts/comments/chat.
create policy "Recipient can mark a message read"
  on public.direct_messages for update to authenticated
  using (auth.uid() = recipient_id)
  with check (auth.uid() = recipient_id);

create policy "Participant or admin can delete a DM"
  on public.direct_messages for delete to authenticated
  using (
    auth.uid() = sender_id
    or auth.uid() = recipient_id
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
  );

-- 2) Let members report a DM they received (reuses the reports table)
alter table public.reports drop constraint if exists reports_target_type_check;
alter table public.reports add constraint reports_target_type_check
  check (target_type in ('post', 'comment', 'message', 'dm'));

-- 3) Realtime, so a conversation updates live for both people
alter publication supabase_realtime add table public.direct_messages;
