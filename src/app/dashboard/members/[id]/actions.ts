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
  return { error: null };
}

export async function deletePost(postId: string, profileId: string) {
  const supabase = await createClient();
  await supabase.from("posts").delete().eq("id", postId);
  revalidatePath(`/dashboard/members/${profileId}`);
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
  return { error: null };
}

export async function deleteComment(commentId: string, profileId: string) {
  const supabase = await createClient();
  await supabase.from("comments").delete().eq("id", commentId);
  revalidatePath(`/dashboard/members/${profileId}`);
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
}
