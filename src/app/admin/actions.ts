"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, ok: false as const };

  const { data: me } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  return { supabase, ok: !!me?.is_admin };
}

export async function adminDeletePost(postId: string) {
  const { supabase, ok } = await requireAdmin();
  if (!ok) return;
  await supabase.from("posts").delete().eq("id", postId);
  revalidatePath("/admin");
}

export async function adminDeleteComment(commentId: string) {
  const { supabase, ok } = await requireAdmin();
  if (!ok) return;
  await supabase.from("comments").delete().eq("id", commentId);
  revalidatePath("/admin");
}

export async function dismissReport(reportId: string) {
  const { supabase, ok } = await requireAdmin();
  if (!ok) return;
  await supabase.from("reports").delete().eq("id", reportId);
  revalidatePath("/admin");
}
