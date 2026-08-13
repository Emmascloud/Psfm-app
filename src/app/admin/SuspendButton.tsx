"use client";

import { useState, useTransition } from "react";
import { toggleSuspension } from "@/app/auth/actions";

export default function SuspendButton({
  userId,
  suspended,
}: {
  userId: string;
  suspended: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <button
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const result = await toggleSuspension(userId, !suspended);
            if (result?.error) setError(result.error);
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
      {error && <p className="font-body text-[10px] text-ember mt-1 max-w-[140px]">{error}</p>}
    </div>
  );
}
