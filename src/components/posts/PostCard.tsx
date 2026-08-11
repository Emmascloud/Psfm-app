"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Avatar from "@/components/Avatar";
import ReactionBar from "./ReactionBar";
import { deletePost, deleteComment, createComment, editPost, reportContent } from "@/lib/posts/actions";
import type { Comment } from "@/lib/types";

type Author = { id: string; full_name: string; avatar_url: string | null };

function formatTimestamp(iso: string) {
  const d = new Date(iso);
  const sameYear = d.getFullYear() === new Date().getFullYear();
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: sameYear ? undefined : "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function PostCard({
  post,
  comments,
  authorsById,
  profileId,
  currentUserId,
  isAdmin,
  reactionCounts,
  myReaction,
}: {
  post: {
    id: string;
    body: string;
    image_url: string | null;
    created_at: string;
    edited_at?: string | null;
    author_id: string;
  };
  comments: Comment[];
  authorsById: Map<string, Author>;
  profileId: string;
  currentUserId: string | null;
  isAdmin: boolean;
  reactionCounts?: Record<string, number>;
  myReaction?: string | null;
}) {
  const author = authorsById.get(post.author_id);
  const isMine = currentUserId === post.author_id;
  const canDeletePost = isMine || isAdmin;
  const [pending, startTransition] = useTransition();
  const [commentBody, setCommentBody] = useState("");
  const [showComments, setShowComments] = useState(comments.length > 0);
  const [reported, setReported] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(post.body);
  const [body, setBody] = useState(post.body);
  const [edited, setEdited] = useState(!!post.edited_at);

  function saveEdit() {
    if (!draft.trim()) return;
    const text = draft.trim();
    setBody(text);
    setEditing(false);
    setEdited(true);
    startTransition(() => {
      editPost(post.id, profileId, text);
    });
  }

  return (
    <div className="rounded-2xl bg-panel p-4 shadow-sm shadow-black/10">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/members/${post.author_id}`}>
            <Avatar url={author?.avatar_url} name={author?.full_name ?? "?"} size={30} />
          </Link>
          <div>
            <Link
              href={`/dashboard/members/${post.author_id}`}
              className="font-body text-sm text-cream hover:text-marigold transition-colors"
            >
              {author?.full_name ?? "Member"}
            </Link>
            <p className="font-data text-[10px] text-sage">
              {formatTimestamp(post.created_at)}
              {edited && " · edited"}
            </p>
          </div>
        </div>
        <div className="flex gap-1.5">
          {isMine && !editing && (
            <button
              onClick={() => {
                setDraft(body);
                setEditing(true);
              }}
              className="font-data text-[11px] text-cream/80 hover:text-cream bg-panel-raised hover:bg-panel-raised/80 rounded-full px-2.5 py-1 transition-colors"
            >
              Edit
            </button>
          )}
          {!reported && currentUserId && currentUserId !== post.author_id && (
            <button
              onClick={() =>
                startTransition(() => {
                  reportContent("post", post.id, profileId);
                  setReported(true);
                })
              }
              className="font-data text-[11px] text-cream/80 hover:text-ember bg-panel-raised hover:bg-panel-raised/80 rounded-full px-2.5 py-1 transition-colors"
            >
              Report
            </button>
          )}
          {canDeletePost && (
            <button
              disabled={pending}
              onClick={() => startTransition(() => { deletePost(post.id, profileId); })}
              className="font-data text-[11px] text-cream/80 hover:text-ember bg-panel-raised hover:bg-panel-raised/80 rounded-full px-2.5 py-1 transition-colors"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      {editing ? (
        <div className="mt-3">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
            autoFocus
            className="w-full bg-ink-soft rounded-lg p-3 font-body text-cream text-sm outline-none resize-none"
          />
          <div className="flex gap-2 mt-2 justify-end">
            <button
              onClick={() => setEditing(false)}
              className="font-data text-xs text-sage hover:text-cream px-3 py-1"
            >
              Cancel
            </button>
            <button
              onClick={saveEdit}
              className="font-data text-xs bg-marigold text-ink-on-paper rounded-full px-3 py-1 font-medium hover:bg-marigold-soft"
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <p className="font-body text-cream text-sm mt-3 whitespace-pre-wrap">{body}</p>
      )}

      {post.image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={post.image_url} alt="" className="rounded-lg mt-3 max-h-64 w-full object-cover" />
      )}

      <ReactionBar postId={post.id} counts={reactionCounts ?? {}} myReaction={myReaction ?? null} />

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
                <Link href={`/dashboard/members/${c.author_id}`}>
                  <Avatar url={cAuthor?.avatar_url} name={cAuthor?.full_name ?? "?"} size={22} />
                </Link>
                <div className="flex-1">
                  <p className="font-body text-xs text-cream">
                    <Link href={`/dashboard/members/${c.author_id}`} className="font-medium hover:text-marigold transition-colors">
                      {cAuthor?.full_name ?? "Member"}
                    </Link>{" "}
                    <span className="text-sage">{c.body}</span>
                  </p>
                  <p className="font-data text-[9px] text-sage/70 mt-0.5">
                    {formatTimestamp(c.created_at)}
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
