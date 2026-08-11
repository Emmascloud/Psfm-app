"use client";

import { useTransition } from "react";
import { adminDeletePost, adminDeleteComment, adminDeleteMessage, adminDeleteDM, dismissReport } from "./actions";

export default function ReportRow({
  reportId,
  targetType,
  targetId,
}: {
  reportId: string;
  targetType: "post" | "comment" | "message" | "dm";
  targetId: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex gap-2">
      <button
        disabled={pending}
        onClick={() =>
          startTransition(() => {
            if (targetType === "post") adminDeletePost(targetId);
            else if (targetType === "comment") adminDeleteComment(targetId);
            else if (targetType === "message") adminDeleteMessage(targetId);
            else adminDeleteDM(targetId);
          })
        }
        className="font-data text-xs rounded-full px-3 py-1 border border-ember text-ember hover:bg-ember hover:text-ink transition-colors disabled:opacity-50"
      >
        Delete content
      </button>
      <button
        disabled={pending}
        onClick={() => startTransition(() => { dismissReport(reportId); })}
        className="font-data text-xs rounded-full px-3 py-1 border border-sage text-sage hover:text-cream hover:border-cream transition-colors disabled:opacity-50"
      >
        Dismiss
      </button>
    </div>
  );
}
