"use client";

import { useState, useTransition } from "react";
import Avatar from "@/components/Avatar";
import { deletePost, deleteComment, createComment, reportContent } from "@/lib/posts/actions";
import type { Comment } from "@/lib/types";

type Author = { id: string; full_name: string; avatar_url: string | null };

export default function PostCard({
  post,
  comments,
  authorsById,
  profileId,
  currentUserId,
  isAdmin,
}: {
  post: { id: string; body: string; image_url: string | null; created_at: string; author_id: string };
  comments: Comment[];
  authorsById: Map<string, Author>;
  profileId: string;
  currentUserId: string | null;
  isAdmin: boolean;
}) {
  const author = authorsById.get(post.author_id);
  const canDeletePost = currentUserId === post.author_id || isAdmin;
  const [pending, startTransition] = useTransition();
  const [commentBody, setCommentBody] = useState("");
  const [showComments, setShowComments] = useState(comments.length > 0);
  const [reported, setReported] = useState(false);

  return (
    <div className="rounded-xl bg-panel p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <Avatar url={author?.avatar_url} name={author?.full_name ?? "?"} size={28} />
          <div>
            <p className="font-body text-sm text-cream">{author?.full_name ?? "Member"}</p>
            <p className="font-data text-[10px] text-sage">
              {new Date(post.created_at).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          {!reported && currentUserId && currentUserId !== post.author_id && (
            <button
              onClick={() =>
                startTransition(() => {
                  reportContent("post", post.id, profileId);
                  setReported(true);
                })
              }
              className="font-data text-[10px] text-sage hover:text-ember transition-colors"
            >
              Report
            </button>
          )}
          {canDeletePost && (
            <button
              disabled={pending}
              onClick={() => startTransition(() => { deletePost(post.id, profileId); })}
              className="font-data text-[10px] text-sage hover:text-ember transition-colors"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      <p className="font-body text-cream text-sm mt-3 whitespace-pre-wrap">{post.body}</p>
      {post.image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={post.image_url} alt="" className="rounded-lg mt-3 max-h-64 w-full object-cover" />
      )}

      <div className="mt-3 pt-3 border-t border-hairline">
        {comments.length > 0 && !showComments && (
          <button
            onClick={() => setShowComments(true)}
            className="font-data text-xs text-sage hover:text-cream"
          >
            View {comments.length} comment{comments.length === 1 ? "" : "s"}
          </button>
        )}

        {showComments &&
          comments.map((c) => {
            const cAuthor = authorsById.get(c.author_id);
            const canDeleteComment = currentUserId === c.author_id || isAdmin;
            return (
              <div key={c.id} className="flex items-start gap-2 mt-2">
                <Avatar url={cAuthor?.avatar_url} name={cAuthor?.full_name ?? "?"} size={22} />
                <div className="flex-1">
                  <p className="font-body text-xs text-cream">
                    <span className="font-medium">{cAuthor?.full_name ?? "Member"}</span>{" "}
                    <span className="text-sage">{c.body}</span>
                  </p>
                </div>
                {canDeleteComment && (
                  <button
                    onClick={() => startTransition(() => { deleteComment(c.id, profileId); })}
                    className="font-data text-[10px] text-sage hover:text-ember transition-colors"
                  >
                    ×
                  </button>
                )}
              </div>
            );
          })}

        {currentUserId && (
          <div className="flex items-center gap-2 mt-3">
            <input
              value={commentBody}
              onChange={(e) => setCommentBody(e.target.value)}
              placeholder="Write a comment…"
              className="flex-1 bg-ink-soft rounded-full px-3 py-1.5 font-body text-xs text-cream placeholder:text-sage/60 outline-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && commentBody.trim()) {
                  startTransition(async () => {
                    await createComment(post.id, profileId, commentBody);
                    setCommentBody("");
                    setShowComments(true);
                  });
                }
              }}
            />
            <button
              disabled={pending || !commentBody.trim()}
              onClick={() =>
                startTransition(async () => {
                  await createComment(post.id, profileId, commentBody);
                  setCommentBody("");
                  setShowComments(true);
                })
              }
              className="font-data text-xs text-marigold hover:text-marigold-soft disabled:opacity-40"
            >
              Send
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
