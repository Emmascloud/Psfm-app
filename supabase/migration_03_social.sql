-- PSFM Circle — migration 03: profile pictures, timeline posts, comments,
-- and reporting. Run each numbered block separately in the SQL Editor
-- (paste one, Run, clear, paste the next) to avoid comment/paste issues.

-- 1) Avatar column
alter table public.profiles add column if not exists avatar_url text;

-- 2) Posts (a member's own timeline entries)
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles (id) on delete cascade,
  body text not null,
  image_url text,
  reported boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.posts enable row level security;

create policy "Members can view all posts"
  on public.posts for select to authenticated using (true);

create policy "Members can create their own posts"
  on public.posts for insert to authenticated
  with check (author_id = auth.uid());

create policy "Owner or admin can delete a post"
  on public.posts for delete to authenticated
  using (
    author_id = auth.uid()
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
  );

-- 3) Comments (on a post)
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  body text not null,
  reported boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.comments enable row level security;

create policy "Members can view all comments"
  on public.comments for select to authenticated using (true);

create policy "Members can create their own comments"
  on public.comments for insert to authenticated
  with check (author_id = auth.uid());

create policy "Owner or admin can delete a comment"
  on public.comments for delete to authenticated
  using (
    author_id = auth.uid()
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
  );

-- 4) Reports (member-filed flags on a post or comment, admin-only to read)
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  target_type text not null check (target_type in ('post', 'comment')),
  target_id uuid not null,
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.reports enable row level security;

create policy "Members can file a report"
  on public.reports for insert to authenticated
  with check (reporter_id = auth.uid());

create policy "Admins can view reports"
  on public.reports for select to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true));

create policy "Admins can clear reports"
  on public.reports for delete to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true));

-- 5) Storage bucket for avatars + post images (one shared public bucket,
-- each member writes only inside their own uid-named folder)
insert into storage.buckets (id, name, public)
  values ('media', 'media', true)
  on conflict (id) do nothing;

create policy "Public can view media"
  on storage.objects for select
  using (bucket_id = 'media');

create policy "Members can upload their own media"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Members can delete their own media"
  on storage.objects for delete to authenticated
  using (bucket_id = 'media' and (storage.foldername(name))[1] = auth.uid()::text);
