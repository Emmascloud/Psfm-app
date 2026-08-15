import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PresentAvatar from "@/components/PresentAvatar";
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
    <div className="max-w-2xl mx-auto pb-10">
      <div className="px-6 lg:px-10 pt-4">
        <Link href="/dashboard/members" className="font-data text-sm text-sage hover:text-cream mb-2 inline-block">
          ← All members
        </Link>
      </div>

      <div className="rounded-2xl overflow-hidden bg-panel mb-8 mx-6 lg:mx-10">
        {/* Cover banner */}
        <div
          className="h-28 sm:h-36"
          style={{
            background:
              "linear-gradient(135deg, var(--marigold) 0%, var(--panel-raised) 55%, var(--ink-soft) 100%)",
          }}
        />

        <div className="px-6 pb-6">
          <div className="flex items-end justify-between -mt-10 sm:-mt-12 mb-3">
            <div className="rounded-full ring-4 ring-panel">
              <PresentAvatar userId={profile.id} url={profile.avatar_url} name={profile.full_name} size={84} />
            </div>
            {!isOwnProfile && user ? (
              <div className="flex items-center gap-2 pb-1">
                <FollowButton targetId={profile.id} initiallyFollowing={isFollowing} />
                <Link
                  href={`/dashboard/inbox/${profile.id}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-hairline px-4 py-1.5 font-data text-xs font-medium text-cream hover:bg-panel-raised transition-colors"
                >
                  Message
                </Link>
              </div>
            ) : (
              isOwnProfile && (
                <Link
                  href="/dashboard/profile"
                  className="inline-flex items-center gap-1.5 rounded-full border border-hairline px-4 py-1.5 font-data text-xs font-medium text-cream hover:bg-panel-raised transition-colors mb-1"
                >
                  Edit profile
                </Link>
              )
            )}
          </div>

          <h1 className="font-display text-2xl text-cream mb-0.5">{profile.full_name}</h1>
          {profile.status && (
            <p className="font-data text-xs text-marigold uppercase tracking-wide mb-3">
              {profile.status}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-body text-sm text-sage mb-4">
            <span>🎂 {ordinal(profile.birth_day)} {monthName(profile.birth_month)}</span>
            {profile.anniversary_month && profile.anniversary_day && (
              <span>💍 {ordinal(profile.anniversary_day)} {monthName(profile.anniversary_month)}</span>
            )}
          </div>

          <div className="flex items-center gap-4 font-data text-xs text-sage">
            {isOwnProfile ? (
              <>
                <Link href="/dashboard/connections?tab=followers" className="hover:text-cream transition-colors">
                  <span className="text-cream font-medium">{followers?.length ?? 0}</span> followers
                </Link>
                <Link href="/dashboard/connections?tab=following" className="hover:text-cream transition-colors">
                  <span className="text-cream font-medium">{following?.length ?? 0}</span> following
                </Link>
              </>
            ) : (
              <>
                <span><span className="text-cream font-medium">{followers?.length ?? 0}</span> followers</span>
                <span><span className="text-cream font-medium">{following?.length ?? 0}</span> following</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="px-6 lg:px-10">
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
    </div>
  );
}
