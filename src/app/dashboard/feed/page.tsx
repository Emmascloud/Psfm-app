import { createClient } from "@/lib/supabase/server";
import PostForm from "@/components/posts/PostForm";
import PostCard from "@/components/posts/PostCard";
import type { Post, Comment } from "@/lib/types";

export default async function FeedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: me }, { data: allProfiles }, { data: posts }] = await Promise.all([
    user
      ? supabase.from("profiles").select("is_admin").eq("id", user.id).single()
      : Promise.resolve({ data: null }),
    supabase.from("profiles").select("id, full_name, avatar_url"),
    supabase.from("posts").select("*").order("created_at", { ascending: false }).returns<Post[]>(),
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

  return (
    <div className="px-6 py-8 lg:px-10 lg:py-10 max-w-2xl">
      <h1 className="font-display text-3xl text-cream mb-2">Feed</h1>
      <p className="font-body text-sm text-sage mb-6">
        Every member's timeline, newest first.
      </p>

      {user && <PostForm profileId={user.id} />}

      <div className="space-y-4">
        {(posts ?? []).map((post) => (
          <PostCard
            key={post.id}
            post={post}
            comments={commentsByPost.get(post.id) ?? []}
            authorsById={authorsById}
            profileId={post.author_id}
            currentUserId={user?.id ?? null}
            isAdmin={!!me?.is_admin}
          />
        ))}
        {(posts ?? []).length === 0 && (
          <p className="font-body text-sage text-sm">
            No posts yet — be the first to share something.
          </p>
        )}
      </div>
    </div>
  );
}
