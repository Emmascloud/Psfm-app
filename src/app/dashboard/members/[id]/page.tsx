import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Avatar from "@/components/Avatar";
import { monthName, ordinal, type Profile, type Post, type Comment } from "@/lib/types";
import PostForm from "@/components/posts/PostForm";
import PostCard from "@/components/posts/PostCard";
import FollowButton from "@/components/FollowButton";

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

  const [{ data: me }, { data: allProfiles }, { data: posts }, { data: followers }, { data: following }] =
    await Promise.all([
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
      supabase.from("follows").select("follower_id").eq("following_id", id),
      supabase.from("follows").select("following_id").eq("follower_id", id),
    ]);

  const isFollowing = !!followers?.some((f) => f.follower_id === user?.id);

  const postIds = (posts ?? []).map((p) => p.id);
  const [{ data: comments }, { data: reactions }] = await Promise.all([
    postIds.length
      ? supabase
          .from("comments")
          .select("*")
          .in("post_id", postIds)
          .order("created_at", { ascending: true })
          .returns<Comment[]>()
      : Promise.resolve({ data: [] as Comment[] }),
    postIds.length
      ? supabase.from("reactions").select("*").eq("target_type", "post").in("target_id", postIds)
      : Promise.resolve({ data: [] as { target_id: string; user_id: string; emoji: string }[] }),
  ]);

  const reactionCountsByPost = new Map<string, Record<string, number>>();
  const myReactionByPost = new Map<string, string>();
  for (const r of reactions ?? []) {
    const counts = reactionCountsByPost.get(r.target_id) ?? {};
    counts[r.emoji] = (counts[r.emoji] ?? 0) + 1;
    reactionCountsByPost.set(r.target_id, counts);
    if (r.user_id === user?.id) myReactionByPost.set(r.target_id, r.emoji);
  }

  const authorsById = new Map((allProfiles ?? []).map((p) => [p.id, p]));
  const commentsByPost = new Map<string, Comment[]>();
  for (const c of comments ?? []) {
    commentsByPost.set(c.post_id, [...(commentsByPost.get(c.post_id) ?? []), c]);
  }

  const isOwnProfile = user?.id === id;

  return (
    <div className="px-6 py-8 lg:px-10 lg:py-10 max-w-2xl">
      <Link href="/dashboard/members" className="font-data text-sm text-sage hover:text-cream mb-6 inline-block">
        ← All members
      </Link>

      <div className="rounded-2xl bg-panel p-8 text-center mb-8">
        <div className="flex justify-center mb-4">
          <Avatar url={profile.avatar_url} name={profile.full_name} size={72} />
        </div>
        <h1 className="font-display text-2xl text-cream mb-1">{profile.full_name}</h1>
        {profile.status && (
          <p className="font-data text-xs text-marigold uppercase tracking-wide mb-3">
            {profile.status}
          </p>
        )}

        <div className="flex items-center justify-center gap-4 mb-4 font-data text-xs text-sage">
          <span>
            <span className="text-cream font-medium">{followers?.length ?? 0}</span> followers
          </span>
          <span>
            <span className="text-cream font-medium">{following?.length ?? 0}</span> following
          </span>
        </div>

        {!isOwnProfile && user && (
          <div className="flex items-center justify-center gap-2 mb-2">
            <FollowButton targetId={profile.id} initiallyFollowing={isFollowing} />
            <Link
              href={`/dashboard/inbox/${profile.id}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-panel-raised px-4 py-1.5 font-data text-xs font-medium text-cream hover:bg-panel-raised/70 transition-colors"
            >
              Message
            </Link>
          </div>
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
            reactionCounts={reactionCountsByPost.get(post.id)}
            myReaction={myReactionByPost.get(post.id)}
          />
        ))}
        {(posts ?? []).length === 0 && (
          <p className="font-body text-sage text-sm">
            {isOwnProfile ? "Nothing here yet — share your first update." : "No posts yet."}
          </p>
        )}
      </div>
    </div>
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
