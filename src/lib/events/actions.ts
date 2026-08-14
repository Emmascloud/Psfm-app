"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function setRsvp(eventId: string, status: "going" | "interested" | null) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  if (status === null) {
    await supabase.from("event_rsvps").delete().eq("event_id", eventId).eq("user_id", user.id);
  } else {
    await supabase
      .from("event_rsvps")
      .upsert({ event_id: eventId, user_id: user.id, status }, { onConflict: "event_id,user_id" });
  }
  revalidatePath("/dashboard/events");
}

export async function createEvent(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in first." };

  const { data: me } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!me?.is_admin) return { error: "Admins only." };

  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim() || null;
  const location = String(formData.get("location") || "").trim() || null;
  const eventLink = String(formData.get("event_link") || "").trim() || null;
  const date = String(formData.get("date") || "");
  const time = String(formData.get("time") || "") || "18:00";

  if (!title || !date) return { error: "Title and date are required." };

  const startsAt = new Date(`${date}T${time}:00`);
  if (Number.isNaN(startsAt.getTime())) return { error: "Invalid date/time." };

  const { error } = await supabase.from("events").insert({
    title,
    description,
    location,
    event_link: eventLink,
    starts_at: startsAt.toISOString(),
    created_by: user.id,
  });

  if (error) return { error: error.message };
  revalidatePath("/dashboard/events");
  revalidatePath("/admin/events");
  return { error: null };
}

export async function deleteEvent(eventId: string) {
  const supabase = await createClient();
  await supabase.from("events").delete().eq("id", eventId);
  revalidatePath("/dashboard/events");
  revalidatePath("/admin/events");
}
