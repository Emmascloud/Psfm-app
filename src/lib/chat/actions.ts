"use server";

import { createClient } from "@/lib/supabase/server";

export async function sendMessage(body: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in first." };
  if (!body.trim()) return { error: null };

  const { error } = await supabase
    .from("messages")
    .insert({ author_id: user.id, body: body.trim() });

  if (error) return { error: error.message };
  return { error: null };
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
