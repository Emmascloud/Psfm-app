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

async function sendToUsers(admin: ReturnType<typeof createAdminClient>, userIds: string[], payload: object) {
  if (!admin || userIds.length === 0) return;
  const { data: subs } = await admin
    .from("push_subscriptions")
    .select("*")
    .in("user_id", userIds)
    .returns<PushSub[]>();

  if (!subs || subs.length === 0) return;

  const results = await Promise.allSettled(
    subs.map((s) =>
      webpush.sendNotification(
        { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
        JSON.stringify(payload),
      ),
    ),
  );

  // Clean up subscriptions the push service says are gone (expired,
  // uninstalled, permission revoked, etc.) so we stop retrying them.
  const dead: string[] = [];
  results.forEach((r, i) => {
    if (r.status === "rejected") {
      const status = (r.reason as { statusCode?: number })?.statusCode;
      if (status === 404 || status === 410) dead.push(subs[i].id);
    }
  });
  if (dead.length) await admin.from("push_subscriptions").delete().in("id", dead);
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

  if (table === "messages") {
    const authorId = record.author_id as string;
    const { data: author } = await admin.from("profiles").select("full_name").eq("id", authorId).single();
    const { data: everyone } = await admin.from("profiles").select("id").neq("id", authorId);
    const recipientIds = (everyone ?? []).map((p) => p.id);
    await sendToUsers(admin, recipientIds, {
      title: "New message in Family Chat",
      body: `${author?.full_name ?? "Someone"}: ${truncate(String(record.body ?? ""))}`,
      url: "/dashboard/chat",
    });
  } else if (table === "direct_messages") {
    const senderId = record.sender_id as string;
    const recipientId = record.recipient_id as string;
    const { data: sender } = await admin.from("profiles").select("full_name").eq("id", senderId).single();
    await sendToUsers(admin, [recipientId], {
      title: `${sender?.full_name ?? "Someone"} sent you a message`,
      body: truncate(String(record.body ?? "")),
      url: `/dashboard/inbox/${senderId}`,
    });
  } else if (table === "posts") {
    const authorId = record.author_id as string;
    const { data: author } = await admin.from("profiles").select("full_name").eq("id", authorId).single();
    const { data: followers } = await admin.from("follows").select("follower_id").eq("following_id", authorId);
    const recipientIds = (followers ?? []).map((f) => f.follower_id);
    await sendToUsers(admin, recipientIds, {
      title: `${author?.full_name ?? "Someone"} posted something new`,
      body: truncate(String(record.body ?? "")),
      url: `/dashboard/members/${authorId}`,
    });
  }

  return NextResponse.json({ ok: true });
}
