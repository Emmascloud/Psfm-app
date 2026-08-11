# PSFM Circle

A members-only relationship-platform companion site for Peculiar Singles
and Married. Sign in, keep your own dates and photo current, post to your
timeline, browse the group rules, and (for admins) moderate members and
reported content. Built with Next.js (App Router) + Supabase.

## 1. Database setup — run these in order

SQL Editor → New query → paste → Run → clear → next one. Do not paste
several files' contents into one query box; comments can merge lines and
throw syntax errors.

1. `supabase/schema.sql` — profiles table + base policies.
2. `supabase/migration_02_admin.sql` — `is_admin` / `is_suspended` +
   the admin-can-update-any-profile policy. **Run the two statements in
   this file as two separate pastes** (the `alter table` block, then the
   `create policy` block) — pasting them together as one block with the
   explanatory comments in between is what caused the syntax error you
   hit earlier.
3. `supabase/migration_03_social.sql` — avatar column, `posts`,
   `comments`, `reports` tables and their policies, plus the `media`
   storage bucket. This file is already split into five numbered
   sections — paste and run each one separately, same reason as above.

### Making yourself an admin

After you've signed up on the live site yourself, run (with your real
email):

```sql
update public.profiles set is_admin = true
  where id = (select id from auth.users where email = 'you@example.com');
```

## 2. Environment variables

Three now, all required:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

All three from Supabase → Project Settings → API. Set them locally in
`.env.local` (copy `.env.local.example`) and on Vercel under Settings →
Environment Variables (Production ticked), then **redeploy** — Next.js
bakes `NEXT_PUBLIC_*` values in at build time, so saving them alone
doesn't do anything until the next build runs.

If `SUPABASE_SERVICE_ROLE_KEY` is missing or wrong, `/admin` now
degrades gracefully — you'll see a banner saying member emails couldn't
load, instead of the page crashing with a 500 like before.

## What's in here

- `/` — public landing page. Links to group rules and the WhatsApp group.
- `/rules` — the group's rules, public, no sign-in required.
- `/signup`, `/login` — email + password auth.
- `/dashboard` — "Coming up" list (with photos) and **The Circle**, the
  radial birthday/anniversary wheel.
- `/dashboard/members` — directory with photos; click through to a
  profile.
- `/dashboard/members/[id]` — a member's profile **and timeline**: posts
  they've shared (text + optional photo), with comments from any
  member. Only the profile owner can post to their own timeline;
  everyone can comment. Anyone can report a post or comment they
  didn't write; the post/comment owner or an admin can delete it
  outright.
- `/dashboard/profile` — edit your own info, including your profile
  photo (upload, 5MB limit, stored in Supabase Storage).
- `/admin` — admins only. Member list with Suspend/Unsuspend, plus a
  **Reported content** section showing anything members have flagged,
  with one-click delete or dismiss.
- Every page has a small "← Home" link back to `/`, in addition to the
  in-app navigation.

## Not built yet: live chat room

Deliberately still held back. The timeline + comments above cover the
"forum" half of the original ask in a moderatable, async form — reports
go straight to `/admin`, and delete is one click. A real-time chat room
is a bigger step up in moderation load (nothing to review before it's
seen), so it's worth building only once this async layer has been used
for a while and feels solid.

## Loading the existing WhatsApp list

Still applies from before: the 150+ names already collected aren't in
this database yet, since each row is tied to a real signed-up account.
Either let people self-serve, or ask for a bulk-seed script.
