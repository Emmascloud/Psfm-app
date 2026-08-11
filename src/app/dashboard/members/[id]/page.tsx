import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import HomeLink from "@/components/HomeLink";
import Avatar from "@/components/Avatar";
import { monthName, ordinal, type Profile, type Post, type Comment } from "@/lib/types";
import PostForm from "./PostForm";
import PostCard from "./PostCard";

export default async function MemberProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle<Profile>();

  if (!profile) notFound();

  const [{ data: me }, { data: allProfiles }, { data: posts }] = await Promise.all([
    user
      ? supabase.from("profiles").select("is_admin").eq("id", user.id).single()
      : Promise.resolve({ data: null }),
    supabase.from("profiles").select("id, full_name, avatar_url"),
    supabase
      .from("posts")
      .select("*")
      .eq("author_id", id)
      .order("created_at", { ascending: false })
      .returns<Post[]>(),
  ]);

  const postIds = (posts ?? []).map((p) => p.id);
  const { data: comments } = postIds.length
    ? await supabase
        .from("comments")
        .select("*")
        .in("post_id", postIds)
        .order("created_at", { ascending: true })
        .returns<Comment[]>()
    : { data: [] as Comment[] };

  const authorsById = new Map((allProfiles ?? []).map((p) => [p.id, p]));
  const commentsByPost = new Map<string, Comment[]>();
  for (const c of comments ?? []) {
    commentsByPost.set(c.post_id, [...(commentsByPost.get(c.post_id) ?? []), c]);
  }

  const isOwnProfile = user?.id === id;

  return (
    <main className="min-h-screen bg-ink px-6 py-16">
      <div className="mx-auto max-w-xl">
        <div className="flex items-center justify-between mb-8">
          <HomeLink />
          <Link href="/dashboard/members" className="font-data text-sm text-sage hover:text-cream">
            ← All members
          </Link>
        </div>

        <div className="rounded-2xl bg-panel p-8 text-center mb-8">
          <div className="flex justify-center mb-4">
            <Avatar url={profile.avatar_url} name={profile.full_name} size={72} />
          </div>
          <h1 className="font-display text-2xl text-cream mb-1">{profile.full_name}</h1>
          {profile.status && (
            <p className="font-data text-xs text-marigold uppercase tracking-wide mb-6">
              {profile.status}
            </p>
          )}
          <div className="text-left space-y-3 mt-6 pt-6 border-t border-hairline">
            <Row label="Birthday" value={`${ordinal(profile.birth_day)} ${monthName(profile.birth_month)}`} />
            {profile.anniversary_month && profile.anniversary_day && (
              <Row
                label="Anniversary"
                value={`${ordinal(profile.anniversary_day)} ${monthName(profile.anniversary_month)}`}
              />
            )}
          </div>
        </div>

        <h2 className="font-display text-xl text-cream mb-4">Timeline</h2>
        {isOwnProfile && <PostForm profileId={id} />}

        <div className="space-y-4">
          {(posts ?? []).map((post) => (
            <PostCard
              key={post.id}
              post={post}
              comments={commentsByPost.get(post.id) ?? []}
              authorsById={authorsById}
              profileId={id}
              currentUserId={user?.id ?? null}
              isAdmin={!!me?.is_admin}
            />
          ))}
          {(posts ?? []).length === 0 && (
            <p className="font-body text-sage text-sm">
              {isOwnProfile ? "Nothing here yet — share your first update." : "No posts yet."}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="font-body text-sm text-sage">{label}</span>
      <span className="font-data text-sm text-cream">{value}</span>
    </div>
  );
}
