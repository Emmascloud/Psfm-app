"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createPost(profileId: string, body: string, imageUrl: string | null) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.id !== profileId) return { error: "Not allowed." };
  if (!body.trim()) return { error: "Say something first." };

  const { error } = await supabase
    .from("posts")
    .insert({ author_id: user.id, body: body.trim(), image_url: imageUrl });

  if (error) return { error: error.message };
  revalidatePath(`/dashboard/members/${profileId}`);
  revalidatePath("/dashboard/feed");
  return { error: null };
}

export async function deletePost(postId: string, profileId: string) {
  const supabase = await createClient();
  await supabase.from("posts").delete().eq("id", postId);
  revalidatePath(`/dashboard/members/${profileId}`);
  revalidatePath("/dashboard/feed");
}

export async function createComment(postId: string, profileId: string, body: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in first." };
  if (!body.trim()) return { error: "Write something first." };

  const { error } = await supabase
    .from("comments")
    .insert({ post_id: postId, author_id: user.id, body: body.trim() });

  if (error) return { error: error.message };
  revalidatePath(`/dashboard/members/${profileId}`);
  revalidatePath("/dashboard/feed");
  return { error: null };
}

export async function deleteComment(commentId: string, profileId: string) {
  const supabase = await createClient();
  await supabase.from("comments").delete().eq("id", commentId);
  revalidatePath(`/dashboard/members/${profileId}`);
  revalidatePath("/dashboard/feed");
}

export async function editPost(postId: string, profileId: string, body: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in first." };
  if (!body.trim()) return { error: "Say something first." };

  const { error } = await supabase
    .from("posts")
    .update({ body: body.trim(), edited_at: new Date().toISOString() })
    .eq("id", postId)
    .eq("author_id", user.id);

  if (error) return { error: error.message };
  revalidatePath(`/dashboard/members/${profileId}`);
  revalidatePath("/dashboard/feed");
  return { error: null };
}

export async function setReaction(postId: string, emoji: string | null) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  if (emoji === null) {
    await supabase
      .from("reactions")
      .delete()
      .eq("target_type", "post")
      .eq("target_id", postId)
      .eq("user_id", user.id);
    return;
  }

  await supabase.from("reactions").upsert(
    { target_type: "post", target_id: postId, user_id: user.id, emoji },
    { onConflict: "target_type,target_id,user_id" },
  );
}
export async function reportContent(
  targetType: "post" | "comment",
  targetId: string,
  profileId: string,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("reports")
    .insert({ target_type: targetType, target_id: targetId, reporter_id: user.id });
  revalidatePath(`/dashboard/members/${profileId}`);
  revalidatePath("/dashboard/feed");
}
