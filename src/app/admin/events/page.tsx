import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/AppShell";
import CreateEventForm from "./CreateEventForm";
import DeleteEventButton from "./DeleteEventButton";
import type { Event, EventRsvp, Profile } from "@/lib/types";

export default async function AdminEventsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: me } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle<Profile>();
  if (!me?.is_admin) redirect("/dashboard");

  const [{ data: events }, { data: rsvps }] = await Promise.all([
    supabase.from("events").select("*").order("starts_at", { ascending: false }).returns<Event[]>(),
    supabase.from("event_rsvps").select("*").returns<EventRsvp[]>(),
  ]);

  const goingCount = new Map<string, number>();
  const interestedCount = new Map<string, number>();
  for (const r of rsvps ?? []) {
    const map = r.status === "going" ? goingCount : interestedCount;
    map.set(r.event_id, (map.get(r.event_id) ?? 0) + 1);
  }

  return (
    <AppShell user={{ id: user.id, name: me.full_name, avatarUrl: me.avatar_url, isAdmin: true }}>
      <div className="px-6 py-8 lg:px-10 lg:py-10 max-w-2xl">
        <p className="font-data text-xs text-ember uppercase tracking-widest mb-2">Admin</p>
        <h1 className="font-display text-2xl text-cream mb-6">Events</h1>

        <CreateEventForm />

        <div className="space-y-2">
          {events?.map((e) => (
            <div key={e.id} className="flex items-center justify-between gap-3 rounded-xl bg-panel px-4 py-3">
              <div className="min-w-0">
                <p className="font-body text-cream truncate">{e.title}</p>
                <p className="font-data text-xs text-sage">
                  {new Date(e.starts_at).toLocaleString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}{" "}
                  · {goingCount.get(e.id) ?? 0} going · {interestedCount.get(e.id) ?? 0} interested
                </p>
              </div>
              <DeleteEventButton eventId={e.id} />
            </div>
          ))}
          {(events?.length ?? 0) === 0 && (
            <p className="font-body text-sage text-sm">No events yet.</p>
          )}
        </div>
      </div>
    </AppShell>
  );
}
