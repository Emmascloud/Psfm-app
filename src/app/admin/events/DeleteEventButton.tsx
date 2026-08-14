"use client";

import { useTransition } from "react";
import { deleteEvent } from "@/lib/events/actions";

export default function DeleteEventButton({ eventId }: { eventId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      disabled={pending}
      onClick={() => {
        if (confirm("Delete this event?")) startTransition(() => { deleteEvent(eventId); });
      }}
      className="font-data text-xs text-sage hover:text-ember transition-colors disabled:opacity-50"
    >
      {pending ? "…" : "Delete"}
    </button>
  );
}
