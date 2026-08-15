import { NextResponse } from "next/server";
import webpush from "web-push";
import { createAdminClient } from "@/lib/supabase/admin";

// Configure web-push once per cold start.
function configureWebPush() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const contact = process.env.VAPID_CONTACT_EMAIL || "mailto:admin@example.com";
  if (!publicKey || !privateKey) return false;
  webpush.setVapidDetails(contact, publicKey, privateKey);
  return true;
}

type PushSub = { id: string; user_id: string; endpoint: string; p256dh: string; auth: string };

type SendReport = {
  recipientsConsidered: number;
  subscriptionsFound: number;
  sent: number;
  failed: number;
  sampleErrors: string[];
};

async function sendToUsers(
  admin: ReturnType<typeof createAdminClient>,
  userIds: string[],
  payload: object,
): Promise<SendReport> {
  const report: SendReport = {
    recipientsConsidered: userIds.length,
    subscriptionsFound: 0,
    sent: 0,
    failed: 0,
    sampleErrors: [],
  };
  if (!admin || userIds.length === 0) return report;

  const { data: subs, error: subsError } = await admin
    .from("push_subscriptions")
    .select("*")
    .in("user_id", userIds)
    .returns<PushSub[]>();

  if (subsError) {
    report.sampleErrors.push(`subscription lookup failed: ${subsError.message}`);
    return report;
  }
  if (!subs || subs.length === 0) return report;
  report.subscriptionsFound = subs.length;

  const results = await Promise.allSettled(
    subs.map((s) =>
      webpush.sendNotification(
        { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
        JSON.stringify(payload),
      ),
    ),
  );

  const dead: string[] = [];
  results.forEach((r, i) => {
    if (r.status === "fulfilled") {
      report.sent += 1;
      return;
    }
    report.failed += 1;
    const reason = r.reason as { statusCode?: number; body?: string; message?: string };
    const msg = `status ${reason?.statusCode ?? "?"}: ${reason?.body || reason?.message || "unknown error"}`;
    if (report.sampleErrors.length < 5) report.sampleErrors.push(msg);
    if (reason?.statusCode === 404 || reason?.statusCode === 410) dead.push(subs[i].id);
  });

  if (dead.length) await admin.from("push_subscriptions").delete().in("id", dead);
  return report;
}

function truncate(text: string, max = 90) {
  return text.length > max ? text.slice(0, max - 1) + "…" : text;
}

export async function POST(request: Request) {
  const secret = request.headers.get("x-webhook-secret");
  if (!process.env.PUSH_WEBHOOK_SECRET || secret !== process.env.PUSH_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (!configureWebPush()) {
    return NextResponse.json({ error: "VAPID keys not configured" }, { status: 500 });
  }

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "service role not configured" }, { status: 500 });

  const body = await request.json();
  const table = body.table as string;
  const record = body.record as Record<string, unknown>;

  let report: SendReport = {
    recipientsConsidered: 0,
    subscriptionsFound: 0,
    sent: 0,
    failed: 0,
    sampleErrors: [],
  };

  if (table === "messages") {
    const authorId = record.author_id as string;
    const { data: author } = await admin.from("profiles").select("full_name").eq("id", authorId).single();
    const { data: everyone } = await admin.from("profiles").select("id").neq("id", authorId);
    const recipientIds = (everyone ?? []).map((p) => p.id);
    report = await sendToUsers(admin, recipientIds, {
      title: "New message in Family Chat",
      body: `${author?.full_name ?? "Someone"}: ${truncate(String(record.body ?? ""))}`,
      url: "/dashboard/chat",
    });
  } else if (table === "direct_messages") {
    const senderId = record.sender_id as string;
    const recipientId = record.recipient_id as string;
    const { data: sender } = await admin.from("profiles").select("full_name").eq("id", senderId).single();
    report = await sendToUsers(admin, [recipientId], {
      title: `${sender?.full_name ?? "Someone"} sent you a message`,
      body: truncate(String(record.body ?? "")),
      url: `/dashboard/inbox/${senderId}`,
    });
  } else if (table === "posts") {
    const authorId = record.author_id as string;
    const { data: author } = await admin.from("profiles").select("full_name").eq("id", authorId).single();
    const { data: followers } = await admin.from("follows").select("follower_id").eq("following_id", authorId);
    const recipientIds = (followers ?? []).map((f) => f.follower_id);
    report = await sendToUsers(admin, recipientIds, {
      title: `${author?.full_name ?? "Someone"} posted something new`,
      body: truncate(String(record.body ?? "")),
      url: `/dashboard/members/${authorId}`,
    });
  } else if (table === "events") {
    const createdBy = record.created_by as string;
    const { data: everyone } = await admin.from("profiles").select("id").neq("id", createdBy);
    const recipientIds = (everyone ?? []).map((p) => p.id);
    const when = record.starts_at
      ? new Date(String(record.starts_at)).toLocaleDateString(undefined, { month: "short", day: "numeric" })
      : "";
    report = await sendToUsers(admin, recipientIds, {
      title: `New event: ${String(record.title ?? "")}`,
      body: [when, record.location ? String(record.location) : null].filter(Boolean).join(" · "),
      url: "/dashboard/events",
    });
  } else if (table === "birthday") {
    const profileId = record.profile_id as string;
    const { data: everyone } = await admin.from("profiles").select("id").neq("id", profileId);
    const recipientIds = (everyone ?? []).map((p) => p.id);
    report = await sendToUsers(admin, recipientIds, {
      title: `🎉 It's ${String(record.full_name ?? "someone's")}'s birthday!`,
      body: "Stop by their profile and wish them well.",
      url: `/dashboard/members/${profileId}`,
    });
  } else {
    return NextResponse.json({ ok: true, note: `no handler for table "${table}"` });
  }

  return NextResponse.json({ ok: true, table, ...report });
}
