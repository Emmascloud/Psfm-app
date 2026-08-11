"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function toggleFollow(targetId: string, follow: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  if (user.id === targetId) return;

  if (follow) {
    await supabase.from("follows").insert({ follower_id: user.id, following_id: targetId });
  } else {
    await supabase
      .from("follows")
      .delete()
      .eq("follower_id", user.id)
      .eq("following_id", targetId);
  }

  revalidatePath(`/dashboard/members/${targetId}`);
}
