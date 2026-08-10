"use client";

import { useTransition } from "react";
import { toggleSuspension } from "@/app/auth/actions";

export default function SuspendButton({
  userId,
  suspended,
}: {
  userId: string;
  suspended: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      disabled={pending}
      onClick={() =>
        startTransition(() => {
          toggleSuspension(userId, !suspended);
        })
      }
      className={`font-data text-xs rounded-full px-3 py-1 border transition-colors disabled:opacity-50 ${
        suspended
          ? "border-sage text-sage hover:text-cream hover:border-cream"
          : "border-ember text-ember hover:bg-ember hover:text-ink"
      }`}
    >
      {pending ? "…" : suspended ? "Unsuspend" : "Suspend"}
    </button>
  );
}
