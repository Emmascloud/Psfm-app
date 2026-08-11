"use client";

import { useState, useTransition } from "react";
import { toggleFollow } from "@/lib/follows/actions";

export default function FollowButton({
  targetId,
  initiallyFollowing,
}: {
  targetId: string;
  initiallyFollowing: boolean;
}) {
  const [following, setFollowing] = useState(initiallyFollowing);
  const [pending, startTransition] = useTransition();

  function toggle() {
    const next = !following;
    setFollowing(next);
    startTransition(() => {
      toggleFollow(targetId, next);
    });
  }

  return (
    <button
      onClick={toggle}
      disabled={pending}
      className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 font-data text-xs font-medium transition-colors disabled:opacity-60 ${
        following
          ? "bg-panel-raised text-cream hover:text-ember"
          : "bg-marigold text-ink-on-paper hover:bg-marigold-soft"
      }`}
    >
      {following ? "Following" : "Follow"}
    </button>
  );
}
