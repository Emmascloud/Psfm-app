"use server";

import { createClient } from "@/lib/supabase/server";
import type { DirectMessage } from "@/lib/types";

export async function sendDirectMessage(recipientId: string, body: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in first.", message: null };
  if (!body.trim()) return { error: null, message: null };
  if (user.id === recipientId) return { error: "You can't message yourself.", message: null };

  const { data, error } = await supabase
    .from("direct_messages")
    .insert({ sender_id: user.id, recipient_id: recipientId, body: body.trim() })
    .select()
    .single<DirectMessage>();

  if (error) return { error: error.message, message: null };
  return { error: null, message: data };
}

export async function deleteDirectMessage(messageId: string) {
  const supabase = await createClient();
  await supabase.from("direct_messages").delete().eq("id", messageId);
}

export async function reportDirectMessage(messageId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("reports")
    .insert({ target_type: "dm", target_id: messageId, reporter_id: user.id });
}

export async function markConversationRead(otherUserId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("direct_messages")
    .update({ read_at: new Date().toISOString() })
    .eq("recipient_id", user.id)
    .eq("sender_id", otherUserId)
    .is("read_at", null);
}
