-- PSMF Family — migration 13: RLS security pass
-- Found by reviewing every policy across migrations 01–12 together,
-- as a set, rather than each in isolation. Four real gaps found —
-- none exploitable through the app's own UI, all exploitable by
-- calling Supabase's REST API directly with a valid member session
-- (which any signed-up member has). Paste and run each numbered
-- section separately.

-- 1) BIGGEST ONE. "Members can update their own profile" only checks
-- that you're updating YOUR OWN row — it never restricted WHICH
-- columns. That means any signed-up member could, right now, call the
-- Supabase API directly and set is_admin = true or is_owner = true on
-- their own account — full privilege escalation, no admin action
-- required. The same gap lets a suspended member quietly set
-- is_suspended = false on themselves before their session expires.
-- This trigger closes both: it fires on every profiles update and
-- blocks admin/owner/suspension changes unless the person making the
-- change is actually authorized to make it — regardless of which RLS
-- policy let the update through in the first place.
create or replace function public.protect_profile_privilege_fields()
returns trigger
language plpgsql
security definer
as $$
declare
  caller_is_admin boolean;
  caller_is_owner boolean;
begin
  select is_admin, is_owner into caller_is_admin, caller_is_owner
    from public.profiles where id = auth.uid();

  if (new.is_admin is distinct from old.is_admin
      or new.is_owner is distinct from old.is_owner)
     and not coalesce(caller_is_owner, false) then
    raise exception 'Only the owner can change admin or owner status.';
  end if;

  if (new.is_suspended is distinct from old.is_suspended)
     and not coalesce(caller_is_admin, false) then
    raise exception 'Only an admin can change suspension status.';
  end if;

  return new;
end;
$$;

create trigger profiles_protect_privilege_fields
  before update on public.profiles
  for each row execute function public.protect_profile_privilege_fields();

-- 2) The "Edit" button on posts has had no matching UPDATE policy
-- since it was built — the app's edit action calls .update() with no
-- error (Postgres silently affects 0 rows rather than rejecting), so
-- it likely looked like it worked while never actually saving. This
-- adds the missing policy.
create policy "Owner can edit their own post"
  on public.posts for update to authenticated
  using (author_id = auth.uid())
  with check (author_id = auth.uid());

-- 3) The DM "recipient can mark read" policy was only ever meant to
-- let the recipient set read_at — but with no column restriction, it
-- also let a recipient silently rewrite the message body they
-- received (tamper with what was actually sent, including after
-- reporting it). This trigger keeps every other column locked once a
-- DM exists; only read_at may change after insert.
create or replace function public.protect_dm_immutability()
returns trigger
language plpgsql
security definer
as $$
begin
  if new.sender_id is distinct from old.sender_id
     or new.recipient_id is distinct from old.recipient_id
     or new.body is distinct from old.body
     or new.created_at is distinct from old.created_at then
    raise exception 'A delivered message cannot be altered — only read_at may change.';
  end if;
  return new;
end;
$$;

create trigger direct_messages_protect_immutability
  before update on public.direct_messages
  for each row execute function public.protect_dm_immutability();

-- 4) push_subscriptions had no UPDATE policy, only insert/select/
-- delete. The app re-enables notifications with an upsert, which
-- needs UPDATE permission whenever the same device's endpoint already
-- has a row (e.g. re-enabling after a partial failure to remove the
-- old one) — without this, that path could fail. Low-risk, but worth
-- closing since the table is already owner-scoped.
create policy "Members can update their own subscription"
  on public.push_subscriptions for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
