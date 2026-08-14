"use client";

import { useState, useTransition } from "react";
import { setRsvp } from "@/lib/events/actions";

export default function RsvpButtons({
  eventId,
  initialStatus,
}: {
  eventId: string;
  initialStatus: "going" | "interested" | null;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [, startTransition] = useTransition();

  function pick(next: "going" | "interested") {
    const value = status === next ? null : next;
    setStatus(value);
    startTransition(() => {
      setRsvp(eventId, value);
    });
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => pick("going")}
        className={`font-data text-xs rounded-full px-3 py-1.5 transition-colors ${
          status === "going"
            ? "bg-marigold text-ink-on-paper"
            : "bg-panel-raised text-cream hover:bg-panel-raised/70"
        }`}
      >
        Going
      </button>
      <button
        onClick={() => pick("interested")}
        className={`font-data text-xs rounded-full px-3 py-1.5 transition-colors ${
          status === "interested"
            ? "bg-marigold-soft text-ink-on-paper"
            : "bg-panel-raised text-cream hover:bg-panel-raised/70"
        }`}
      >
        Interested
      </button>
    </div>
  );
}
