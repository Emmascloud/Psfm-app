# PSMF Family

PSMF — Peculiar Single and Married Forum — is a relationship platform
where singles and married members come together to learn and talk about
relationships. This is its members-only companion site. Built with
Next.js (App Router) + Supabase.

## 1. Database setup — run in order, each file's sections separately

SQL Editor → New query → paste one numbered section → Run → clear →
next section.

1. `supabase/schema.sql`
2. `supabase/migration_02_admin.sql` (2 sections)
3. `supabase/migration_03_social.sql` (5 sections)
4. `supabase/migration_04_chat.sql` (3 sections)
5. `supabase/migration_05_reactions_edits.sql` (2 sections)
6. `supabase/migration_06_contact.sql` (3 sections) — **new this round**:
   a private `contacts` table for phone numbers (visible only to the
   member themselves and to admins — deliberately not a plain column on
   `profiles`, which everyone can already read).

### Password reset — one setting to check

Supabase → Authentication → URL Configuration: make sure your live
domain is listed under **Redirect URLs** (e.g.
`https://your-app.vercel.app/auth/callback`). Without this, the reset
email's link will be rejected by Supabase before it ever reaches the
site.

### Making yourself an admin

```sql
update public.profiles set is_admin = true
  where id = (select id from auth.users where email = 'you@example.com');
```

## 2. Environment variables

Unchanged — still three:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

## What's new this round

- **Full visual redesign.** New palette — deep aubergine/plum base with
  a warm rose accent, replacing the teal/marigold theme — plus a new
  body typeface (Inter, replacing IBM Plex Sans) and de-mono'd UI
  labels (nav, buttons, timestamps now use a tracked weight of the body
  font instead of a monospace face, which was reading as "technical"
  rather than "relationship platform"). Because every color and font in
  the app is driven from the tokens in `src/app/globals.css`, this
  reskin touched two files and propagated everywhere — no per-page
  recoloring.
- **Copy protection.** Right-click, text selection, and copy/cut are
  now blocked site-wide (`src/components/CopyGuard.tsx` +
  `.no-copy` in `globals.css`). Being upfront about what this actually
  is: it stops casual copying, not determined copying. Anyone can still
  read the page source, open dev tools, or screenshot it — there's no
  client-side technique that prevents that. If content theft is a real
  concern, watermarking images and being selective about what gets
  posted publicly matters more than this does. It's included because
  it was asked for, not because it's a strong protection.
- **Phone number field** — on signup and on `/dashboard/profile`,
  stored in the new private `contacts` table. Visible to the member
  themselves and to admins (now a column in `/admin`'s member table),
  not to other members — same privacy level as email. If you'd rather
  members could see each other's numbers, that's a policy change in
  `migration_06_contact.sql`, not a big rebuild — just say so.
- **Forgot / reset password** — `/forgot-password` sends a reset email;
  the link routes through `/auth/callback` (which exchanges Supabase's
  code for a session) and lands on `/reset-password` to set a new one.
  Linked from the login page.

## Still true from before

Responsive app shell (sidebar on desktop, drawer on mobile), Feed,
family chat with Realtime, per-profile timeline with editable posts and
emoji reactions, admin moderation (suspend + reported-content review,
now covering messages too), member names in `/admin` link to full
profiles. The 150+ WhatsApp names still aren't pre-loaded — same two
options as before (self-serve signup, or a bulk-seed script on
request). Private member-to-member/admin-to-member messaging is not
built yet — still a separate feature from everything above.
