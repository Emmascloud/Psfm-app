# PSFM Circle

A members-only birthday & anniversary directory for Peculiar Singles and
Married — sign in, keep your own dates current, see who's coming up next.
Built with Next.js (App Router) + Supabase (auth + database).

## 1. Create the Supabase project

1. Go to supabase.com → New project. Pick a name and a strong database
   password (save it somewhere safe).
2. Once it's ready: **SQL Editor → New query** → paste the contents of
   `supabase/schema.sql` → **Run**. This creates the `profiles` table and
   locks it down so members can only edit their own row and can only be
   read by other signed-in members (never the public internet).
3. **Project Settings → API** → copy the **Project URL** and the
   **anon public key**.
4. **Authentication → Providers**: Email is on by default, that's all you
   need for now.
5. **Authentication → URL Configuration**: once you have a Vercel URL
   (step 3 below), add it as a **Redirect URL** and **Site URL**.

## 2. Run it locally in Termux

```bash
cp .env.local.example .env.local
# edit .env.local and paste in the Project URL + anon key from step 1
nano .env.local

npm install
npm run dev
```

Open the printed URL — sign up with a real email (Supabase sends a
confirmation link by default; you can turn that off for testing under
**Authentication → Providers → Email → Confirm email**).

## 3. Push to GitHub and deploy on Vercel

```bash
git init
git add .
git commit -m "PSFM Circle: birthday & anniversary directory"
git branch -M main
git remote add origin https://github.com/<your-username>/psfm-circle.git
git push -u origin main
```

Then on vercel.com: **New Project → import the repo** → before deploying,
add the two environment variables from `.env.local` under
**Environment Variables** (same names: `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_ANON_KEY`) → **Deploy**.

`.env.local` is git-ignored by default (Next.js does this out of the box)
— never commit it.

## What's in here

- `/` — public landing page, no member data shown.
- `/signup`, `/login` — email + password auth via Supabase.
- `/dashboard` — signed-in members only. Shows the next 8 upcoming dates
  and "The Circle", a radial wheel plotting every member's birthday
  (marigold) and anniversary (sage) around the year, with today marked.
- `/dashboard/profile` — each member edits only their own name, status,
  birthday, and anniversary.
- `supabase/schema.sql` — the one-time database setup, including the
  row-level security rules that keep dates members-only.

## Loading the existing WhatsApp list

The 150+ birthdays already collected in the group aren't in this
database yet — the schema only holds real signed-up accounts (each row
is tied to an `auth.users` id). Two ways to bring the existing names in:

1. **Let people self-serve** — share the site, everyone signs up and
   enters their own date once. Cleanest long-term, but slow to fill.
2. **Bulk-seed it** — a script that creates an account per person from
   the spreadsheet (with a one-time password they reset on first login)
   so the wheel is populated from day one. Ask and I'll put that
   together next.

## Suggested next steps

- Add a "my upcoming reminders" email (Supabase can trigger one via a
  scheduled Edge Function) so people get nudged a few days before
  someone's day, not just when they open the site.
- An admin view to see everyone's status in one table.
- Only after the above feel solid: the chat/relationship forum piece,
  with a moderation plan in place first.
