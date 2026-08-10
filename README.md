# PSFM Circle

A members-only relationship-platform companion site for Peculiar Singles
and Married — sign in, keep your own dates current, see who's coming up
next, read the group's own group rules, and (for admins) moderate the
member list. Built with Next.js (App Router) + Supabase (auth + database).

## 1. Create the Supabase project

1. Go to supabase.com → New project.
2. **SQL Editor → New query** → paste `supabase/schema.sql` → Run. Then
   do the same with `supabase/migration_02_admin.sql` → Run. This creates
   the `profiles` table, its RLS policies, and the `is_admin` /
   `is_suspended` columns used by the admin panel.
3. **Project Settings → API** → copy the **Project URL**, the
   **anon public key**, and the **service_role key** (further down the
   same page — keep this one secret).
4. **Authentication → Providers → Email**: turn **off** "Confirm email"
   (recommended for this use case — see note below).
5. **Authentication → URL Configuration**: once you have a Vercel URL,
   add it as both Site URL and a Redirect URL.

### Making yourself an admin

Open `migration_02_admin.sql`'s last two lines, uncomment them, put in
your own account's email, and run just that snippet in the SQL Editor —
once, after you've signed up on the site yourself. That flips your
`is_admin` flag on and unlocks `/admin`.

## 2. Environment variables

Copy `.env.local.example` to `.env.local` and fill in all three values
(URL, anon key, service role key). Locally:

```bash
npm install
npm run dev
```

On Vercel: **Settings → Environment Variables**, add all three with the
same names, tick Production (and Preview/Development), then redeploy —
`NEXT_PUBLIC_*` values are baked in at build time, so a plain save
without a rebuild won't take effect.

`SUPABASE_SERVICE_ROLE_KEY` has no `NEXT_PUBLIC_` prefix on purpose —
that keeps it server-only. It's what lets `/admin` show member emails
(which live in Supabase's private `auth.users` table, not in
`profiles`) without ever exposing that key to a browser.

## What's in here

- `/` — public landing page. Describes PSFM, links to the group rules,
  and links out to the WhatsApp group.
- `/rules` — the group's rules, public, no sign-in required.
- `/signup`, `/login` — email + password auth via Supabase.
- `/dashboard` — signed-in members only. "Coming up" list plus **The
  Circle**, a radial wheel of everyone's birthday (marigold) and
  anniversary (sage) through the year.
- `/dashboard/members` — directory of all members; click through to a
  read-only profile (name, status, birthday, anniversary — no email).
- `/dashboard/profile` — each member edits only their own info.
- `/admin` — **admins only** (redirects everyone else to `/dashboard`).
  Lists every member with their email, birthday, and a Suspend /
  Unsuspend toggle. A suspended member is signed out and blocked from
  `/dashboard` and `/admin` at the middleware level, not just hidden in
  the UI.
- `supabase/schema.sql` + `supabase/migration_02_admin.sql` — the
  database setup and its row-level security rules.

## Why "Confirm email" should stay off

`signUp()` only returns a live session if email confirmation is
disabled. With it on, the profile row can't be created in the same step
(no session yet to prove who they are), which throws a row-level-security
error on signup. Leaving confirmation off is a normal tradeoff for an
internal community tool with a known membership. If you want it back on
later, the fix is a Postgres trigger that creates the profile row
server-side the moment `auth.users` gets a new row — ask and I'll add it.

## Not built yet: chat room & forum

Deliberately held back until admin/moderation (above) has been used for
a bit:

- **Forum** (admin-created threads, member comments, tagging, viewing
  profiles from a comment) — async, easier to moderate, natural next
  step.
- **Live chat room** — real-time, higher moderation load, best built
  once reporting/blocking exists and the forum's moderation patterns are
  proven out. At 1,000+ members this is the piece most worth not
  rushing.

## Loading the existing WhatsApp list

The 150+ birthdays already collected aren't in this database yet — each
row is tied to a real signed-up account. Either let people self-serve
(share the link, everyone signs up), or ask for a bulk-seed script that
creates an account per person from the spreadsheet with a
reset-on-first-login password.
