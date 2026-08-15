import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const GREETINGS = [
  "It's {name}'s birthday today! 🎉 Drop by their profile and wish them a wonderful year ahead.",
  "Happy birthday, {name}! 🎂 Wishing you a day as wonderful as you are.",
  "Today we celebrate {name}! 🎈 Here's to another beautiful year.",
];

function todayInLagos(): { month: number; day: number; dateKey: string } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Lagos",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return {
    month: parseInt(get("month"), 10),
    day: parseInt(get("day"), 10),
    dateKey: `${get("year")}-${get("month")}-${get("day")}`,
  };
}

export async function GET(request: Request) {
  // Vercel automatically sends this header for scheduled cron
  // invocations when CRON_SECRET is set as an env var — this rejects
  // anyone else who finds the URL.
  const authHeader = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "service role not configured" }, { status: 500 });

  const { month, day, dateKey } = todayInLagos();

  const { data: birthdayPeople } = await admin
    .from("profiles")
    .select("id, full_name")
    .eq("birth_month", month)
    .eq("birth_day", day);

  const results: { id: string; posted: boolean }[] = [];

  for (const person of birthdayPeople ?? []) {
    // Skip if we've already sent one for this person today (cron
    // running twice, manual re-trigger, etc.)
    const { data: already } = await admin
      .from("birthday_announcements")
      .select("profile_id")
      .eq("profile_id", person.id)
      .eq("sent_on", dateKey)
      .maybeSingle();

    if (already) {
      results.push({ id: person.id, posted: false });
      continue;
    }

    const template = GREETINGS[Math.floor(Math.random() * GREETINGS.length)];
    const body = template.replace("{name}", person.full_name);

    await admin.from("posts").insert({ author_id: person.id, body });
    await admin
      .from("birthday_announcements")
      .insert({ profile_id: person.id, sent_on: dateKey });

    // Reuse the push-send route so the same VAPID setup, subscription
    // lookup, and dead-subscription cleanup logic all apply here too.
    if (process.env.PUSH_WEBHOOK_SECRET) {
      const origin = new URL(request.url).origin;
      await fetch(`${origin}/api/push/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-webhook-secret": process.env.PUSH_WEBHOOK_SECRET,
        },
        body: JSON.stringify({
          table: "birthday",
          record: { profile_id: person.id, full_name: person.full_name },
        }),
      }).catch(() => {});
    }

    results.push({ id: person.id, posted: true });
  }

  return NextResponse.json({ ok: true, date: dateKey, checked: birthdayPeople?.length ?? 0, results });
}
