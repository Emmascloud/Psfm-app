"use server";

import { createClient } from "@/lib/supabase/server";
import type { Message } from "@/lib/types";

export async function sendMessage(body: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in first.", message: null };
  if (!body.trim()) return { error: null, message: null };

  const { data, error } = await supabase
    .from("messages")
    .insert({ author_id: user.id, body: body.trim() })
    .select()
    .single<Message>();

  if (error) return { error: error.message, message: null };
  return { error: null, message: data };
}

export async function deleteMessage(messageId: string) {
  const supabase = await createClient();
  await supabase.from("messages").delete().eq("id", messageId);
}

export async function reportMessage(messageId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("reports")
    .insert({ target_type: "message", target_id: messageId, reporter_id: user.id });
}
