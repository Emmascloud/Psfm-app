"use client";

import { useRef, useState, useTransition } from "react";
import { createEvent } from "@/lib/events/actions";

export default function CreateEventForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function submit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createEvent(formData);
      if (result?.error) {
        setError(result.error);
        return;
      }
      formRef.current?.reset();
    });
  }

  return (
    <form ref={formRef} action={submit} className="rounded-2xl bg-panel p-5 space-y-4 mb-8">
      <h2 className="font-display text-lg text-cream">New event</h2>

      <div>
        <label className="font-data text-xs text-sage block mb-1" htmlFor="title">Title</label>
        <input
          id="title"
          name="title"
          required
          className="w-full rounded-lg bg-ink-soft px-3 py-2 font-body text-sm text-cream outline-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="font-data text-xs text-sage block mb-1" htmlFor="date">Date</label>
          <input
            id="date"
            name="date"
            type="date"
            required
            className="w-full rounded-lg bg-ink-soft px-3 py-2 font-body text-sm text-cream outline-none"
          />
        </div>
        <div>
          <label className="font-data text-xs text-sage block mb-1" htmlFor="time">Time</label>
          <input
            id="time"
            name="time"
            type="time"
            defaultValue="18:00"
            className="w-full rounded-lg bg-ink-soft px-3 py-2 font-body text-sm text-cream outline-none"
          />
        </div>
      </div>

      <div>
        <label className="font-data text-xs text-sage block mb-1" htmlFor="location">Location (optional)</label>
        <input
          id="location"
          name="location"
          placeholder="e.g. venue name, or 'Online'"
          className="w-full rounded-lg bg-ink-soft px-3 py-2 font-body text-sm text-cream outline-none"
        />
      </div>

      <div>
        <label className="font-data text-xs text-sage block mb-1" htmlFor="event_link">Event link (optional)</label>
        <input
          id="event_link"
          name="event_link"
          type="url"
          placeholder="Zoom link, registration page, etc."
          className="w-full rounded-lg bg-ink-soft px-3 py-2 font-body text-sm text-cream outline-none"
        />
      </div>

      <div>
        <label className="font-data text-xs text-sage block mb-1" htmlFor="description">Description (optional)</label>
        <textarea
          id="description"
          name="description"
          rows={3}
          className="w-full rounded-lg bg-ink-soft px-3 py-2 font-body text-sm text-cream outline-none resize-none"
        />
      </div>

      {error && <p className="font-body text-xs text-ember">{error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-marigold px-5 py-2 font-data text-xs font-medium text-ink-on-paper hover:bg-marigold-soft transition-colors disabled:opacity-50"
      >
        {pending ? "Creating…" : "Create event"}
      </button>
    </form>
  );
}
