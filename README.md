# PSMF Family

PSMF — Peculiar Single and Married Forum — is a relationship platform
where singles and married members come together to learn and talk about
relationships. This is its members-only companion site. Built with
Next.js (App Router) + Supabase.

## 1. Database setup — run in order, each file's sections separately

1. `supabase/schema.sql`
2. `supabase/migration_02_admin.sql` (2 sections)
3. `supabase/migration_03_social.sql` (5 sections)
4. `supabase/migration_04_chat.sql` (3 sections)
5. `supabase/migration_05_reactions_edits.sql` (2 sections)
6. `supabase/migration_06_contact.sql` (3 sections)
7. `supabase/migration_07_dms.sql` (3 sections)
8. `supabase/migration_08_follows.sql` (2 sections) — **new this round**:
   follow/unfollow between members, with live follower/following counts
   on each profile.

### Making yourself an admin

```sql
update public.profiles set is_admin = true
  where id = (select id from auth.users where email = 'you@example.com');
```

## 2. Environment variables

Unchanged — still three: `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.

## What's new this round

- **Bug fix**: Edit/Delete/Report on chat messages had become invisible
  on phones — I'd made them appear on hover, which doesn't exist on a
  touchscreen. They're always visible now, in both chat and the feed
  (which also got slightly bigger, higher-contrast buttons while I was
  in there).
- **Private messaging** — any member can message any other member.
  Start one from a member's profile page (a "Message" button) or from
  `/dashboard/inbox`. Conversations are two-person only, live via
  Realtime, and each message can be reported or deleted the same way
  posts and chat messages can.
- **Everything now links to profiles** — names and avatars in chat, the
  feed, and comments are clickable through to that member's profile,
  where you can also message them.
- **Notification dots** in the sidebar/nav for Chat, Feed, and Inbox
  when something new happens while you're elsewhere in the app. This is
  session-only — it doesn't persist an unread count across page reloads
  or devices, it just catches you up on what happened while you were on
  another tab of the site.
- **Light/dark mode** — toggle button in the sidebar (desktop) or top
  bar (mobile). Because the whole app is built on the same CSS token
  system from the last redesign, this took one new set of token values,
  not per-component work.
- **Scroll-to-top button** on Feed and Members.

## What's new this round

- **Follow** — a Follow/Following button on every member's profile
  (not shown on your own), with live follower and following counts.
  This is the "add as friends / follow" piece from last round — kept
  one-directional (like X, not a two-sided "friend request" like
  Facebook) since that's simpler to reason about and needs no
  accept/decline flow. Say if you'd rather it require mutual
  acceptance instead.

## Deliberately not in this round

- The feed doesn't yet filter by "people I follow" — it's still
  everyone's posts, newest first. That's a reasonable next step once
  follow relationships exist to filter by.
- A ground-up "make it look exactly like X or Facebook" template swap —
  still holding off on further big theme changes; small polish and bug
  fixes are fair game any time.

## Still true from before

Responsive app shell, admin moderation (suspend + reported-content
review — now covering DMs too), profile photos, editable timeline posts
with emoji reactions, private phone numbers, forgot/reset password,
copy protection, group rules page, WhatsApp invite link on the
homepage. The 150+ WhatsApp names still aren't pre-loaded — same two
options as always (self-serve signup, or a bulk-seed script on
request).
