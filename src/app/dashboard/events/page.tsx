import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import RsvpButtons from "./RsvpButtons";
import type { Event, EventRsvp } from "@/lib/types";

export default async function EventsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: events }, { data: rsvps }, { data: me }] = await Promise.all([
    supabase.from("events").select("*").order("starts_at", { ascending: true }).returns<Event[]>(),
    supabase.from("event_rsvps").select("*").returns<EventRsvp[]>(),
    user
      ? supabase.from("profiles").select("is_admin").eq("id", user.id).single()
      : Promise.resolve({ data: null }),
  ]);

  const now = Date.now();
  const upcoming = (events ?? []).filter((e) => new Date(e.starts_at).getTime() >= now);
  const past = (events ?? []).filter((e) => new Date(e.starts_at).getTime() < now).reverse();

  const rsvpsByEvent = new Map<string, EventRsvp[]>();
  for (const r of rsvps ?? []) {
    rsvpsByEvent.set(r.event_id, [...(rsvpsByEvent.get(r.event_id) ?? []), r]);
  }

  return (
    <div className="px-6 py-8 lg:px-10 lg:py-10 max-w-2xl">
      <h1 className="font-display text-2xl text-cream mb-1">Events</h1>
      <p className="font-body text-sm text-sage mb-6">
        Seminars and get-togethers for the family.
      </p>

      {upcoming.length === 0 ? (
        <p className="font-body text-sage text-sm mb-8">No upcoming events yet — check back soon.</p>
      ) : (
        <div className="space-y-4 mb-10">
          {upcoming.map((e) => {
            const going = (rsvpsByEvent.get(e.id) ?? []).filter((r) => r.status === "going").length;
            const mine = (rsvpsByEvent.get(e.id) ?? []).find((r) => r.user_id === user?.id);
            return (
              <div key={e.id} className="rounded-2xl bg-panel p-5">
                <p className="font-data text-xs text-marigold mb-1">
                  {new Date(e.starts_at).toLocaleString(undefined, {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
                <h2 className="font-display text-lg text-cream mb-1">{e.title}</h2>
                {e.location && <p className="font-body text-sm text-sage mb-1">📍 {e.location}</p>}
                {e.description && (
                  <p className="font-body text-sm text-cream/90 mb-3 whitespace-pre-wrap">{e.description}</p>
                )}
                {e.event_link && (
                  <a
                    href={e.event_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-body text-sm text-marigold hover:underline block mb-3"
                  >
                    Event link →
                  </a>
                )}
                <div className="flex items-center justify-between">
                  {user && <RsvpButtons eventId={e.id} initialStatus={mine?.status ?? null} />}
                  <span className="font-data text-xs text-sage">{going} going</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {past.length > 0 && (
        <>
          <h2 className="font-display text-lg text-cream mb-3">Past events</h2>
          <div className="space-y-2">
            {past.map((e) => (
              <div key={e.id} className="rounded-xl bg-panel/50 px-4 py-3">
                <p className="font-data text-[11px] text-sage">
                  {new Date(e.starts_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                </p>
                <p className="font-body text-sm text-cream/70">{e.title}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {me?.is_admin && (
        <p className="font-body text-xs text-sage mt-8">
          <Link href="/admin/events" className="hover:text-cream">
            Admins: manage events →
          </Link>
        </p>
      )}
    </div>
  );
}
