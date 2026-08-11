"use client";

import { useState, useTransition } from "react";
import { setReaction } from "@/lib/posts/actions";

const EMOJIS = ["👍", "❤️", "😂", "🙌", "🎉"];

export default function ReactionBar({
  postId,
  counts,
  myReaction,
}: {
  postId: string;
  counts: Record<string, number>;
  myReaction: string | null;
}) {
  const [mine, setMine] = useState(myReaction);
  const [localCounts, setLocalCounts] = useState(counts);
  const [open, setOpen] = useState(false);
  const [, startTransition] = useTransition();

  function pick(emoji: string) {
    setOpen(false);
    const next = mine === emoji ? null : emoji;

    setLocalCounts((prev) => {
      const updated = { ...prev };
      if (mine) updated[mine] = Math.max(0, (updated[mine] ?? 1) - 1);
      if (next) updated[next] = (updated[next] ?? 0) + 1;
      return updated;
    });
    setMine(next);
    startTransition(() => {
      setReaction(postId, next);
    });
  }

  const activeEmojis = Object.entries(localCounts).filter(([, n]) => n > 0);

  return (
    <div className="relative flex items-center gap-2 mt-2">
      {activeEmojis.map(([emoji, count]) => (
        <button
          key={emoji}
          onClick={() => pick(emoji)}
          className={`font-data text-xs rounded-full px-2 py-0.5 border transition-colors ${
            mine === emoji
              ? "border-marigold bg-marigold/15 text-marigold"
              : "border-hairline text-sage hover:text-cream"
          }`}
        >
          {emoji} {count}
        </button>
      ))}
      <button
        onClick={() => setOpen(!open)}
        className="font-data text-xs text-sage hover:text-cream transition-colors"
      >
        {activeEmojis.length ? "+" : "React"}
      </button>

      {open && (
        <div className="absolute bottom-full left-0 mb-1 flex gap-1 bg-panel-raised rounded-full px-2 py-1.5 shadow-lg z-10">
          {EMOJIS.map((e) => (
            <button
              key={e}
              onClick={() => pick(e)}
              className="text-lg hover:scale-125 transition-transform"
            >
              {e}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
