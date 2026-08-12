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

## What's new this round

- **SEO** — `robots.txt` and `sitemap.xml` are now generated
  automatically (`src/app/robots.ts`, `src/app/sitemap.ts`). Private
  routes (`/dashboard`, `/admin`, auth pages) are explicitly blocked
  from crawling — a relationship platform's member data has no reason
  to show up in search results. Public pages (home, rules, signup,
  login) get real titles/descriptions instead of one generic tag, plus
  Open Graph and Twitter Card metadata so a shared link actually shows
  a preview card (image + title + description) instead of a bare URL.
  **One thing only you can do**: set `NEXT_PUBLIC_SITE_URL` in Vercel's
  environment variables to your real domain once you have one — until
  then it falls back to the `.vercel.app` URL, which works but isn't
  what you want indexed long-term.
- **Installable as a home-screen app** — `manifest.json` + icons mean
  Android Chrome and iOS Safari can both "Add to Home Screen" and it
  opens full-screen, no browser chrome, its own icon. This is real and
  works today, on both platforms, with no app store involved.

## On APK / iOS App Store distribution

Worth being direct about what's realistic here. Home-screen install
(above) is live now. Actual Google Play / Apple App Store listings are
a different, bigger project — not because the web app isn't ready, but
because of what those stores require outside of code:

- A **Google Play Developer account** ($25 one-time) and an **Apple
  Developer Program** membership ($99/year) — accounts only you can
  create, tied to your identity/payment method.
- Wrapping the site in a native shell — the standard tool for this is
  **Capacitor**, which takes an existing web app and produces a real
  Android project (buildable into an `.apk`/`.aab`) and a real iOS
  Xcode project, both loading this site inside a native wrapper.
- **Building the iOS half requires a Mac with Xcode.** There's no way
  around this — Apple only allows iOS builds on their own OS. Android's
  build can happen anywhere with Android Studio installed, including
  Windows/Linux.
- Both stores review every submission before it goes live (days, not
  minutes), and both have content-policy angles worth knowing upfront
  for a relationship/chat platform — Apple in particular scrutinizes
  apps with user-generated chat and member profiles for moderation and
  reporting tooling. The `/admin` reported-content system already
  built here is exactly what that review looks for, so you're in a
  reasonable position on that front already.

None of that can be done inside this environment — no Android SDK, no
Mac. What I *can* do next: add the Capacitor config to this project so
it's ready to build the moment you (or someone with the right machine)
run it. Say the word and I'll scaffold that in.

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
