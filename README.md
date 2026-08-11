# PSFM Family

PSFM — Peculiar Single and Married Forum — is a relationship platform
where singles and married members come together to learn and talk about
relationships. This is its members-only companion site: sign in, keep
your own dates and photo current, post to a shared feed or your own
timeline, chat live with the family, browse the group rules, and (for
admins) moderate members and reported content. Built with Next.js (App
Router) + Supabase.

## 1. Database setup — run in order, each file's sections separately

SQL Editor → New query → paste one numbered section → Run → clear →
next section. Don't paste a whole multi-section file at once — comments
can merge lines together and throw syntax errors, as happened before.

1. `supabase/schema.sql`
2. `supabase/migration_02_admin.sql` (2 sections)
3. `supabase/migration_03_social.sql` (5 sections)
4. `supabase/migration_04_chat.sql` (3 sections) — **new this round**:
   creates the `messages` table for live chat, lets members report a
   chat message (widens the existing `reports` table), and turns on
   Supabase Realtime for `messages` so chat updates without a refresh.

### Making yourself an admin

```sql
update public.profiles set is_admin = true
  where id = (select id from auth.users where email = 'you@example.com');
```

## 2. Environment variables

Still three, unchanged from last round:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

If `/admin` is showing "Couldn't load member emails," that specific
variable isn't set (or isn't set for Production) on Vercel yet — add it
under Settings → Environment Variables, tick Production, then redeploy.
This one doesn't crash the page anymore, but it does mean that one
column stays empty until it's set.

## What's new this round

- **Responsive app shell** — every signed-in page now shares one
  layout: a persistent left sidebar with all navigation on desktop
  (`lg` breakpoint and up), collapsing to a sticky top bar with a
  hamburger menu on mobile/tablet. This replaced the per-page headers
  that were making the site feel static and inconsistent.
- **Feed** (`/dashboard/feed`) — every member's timeline posts in one
  scrollable, newest-first stream, Facebook/X-style, with a "share
  something" box at the top that posts to your own timeline. This is
  the answer to "the timeline is hard to find" — it's now in the main
  nav, not buried on each profile.
- **Family chat** (`/dashboard/chat`) — one shared, real-time room.
  Messages appear instantly for everyone via Supabase Realtime, no
  refresh needed. Anyone can report a message; the sender or an admin
  can delete one outright.
- **Admin's Reported content** section now covers messages too, not
  just posts/comments.

## Still true from before

- Only the profile owner posts to their own timeline; anyone can
  comment. Anyone can report a post/comment/message they didn't write;
  the owner or an admin can delete it. Suspending a member in `/admin`
  signs them out and blocks them at the middleware level.
- The 150+ names already collected in WhatsApp aren't in this database
  yet — each row is tied to a real signed-up account. Either let people
  self-serve, or ask for a bulk-seed script.
