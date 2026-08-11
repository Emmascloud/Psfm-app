"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ActionState = { error: string | null };

export async function signUp(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const fullName = String(formData.get("full_name") || "").trim();
  const status = String(formData.get("status") || "") || null;
  const birthMonth = Number(formData.get("birth_month"));
  const birthDay = Number(formData.get("birth_day"));
  const anniversaryMonth = formData.get("anniversary_month")
    ? Number(formData.get("anniversary_month"))
    : null;
  const anniversaryDay = formData.get("anniversary_day")
    ? Number(formData.get("anniversary_day"))
    : null;

  if (!email || !password || !fullName || !birthMonth || !birthDay) {
    return { error: "Please fill in your name, birthday, email and password." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) return { error: error.message };
  if (!data.user) return { error: "Could not create your account. Try again." };

  const { error: profileError } = await supabase.from("profiles").insert({
    id: data.user.id,
    full_name: fullName,
    status,
    birth_month: birthMonth,
    birth_day: birthDay,
    anniversary_month: anniversaryMonth,
    anniversary_day: anniversaryDay,
  });

  if (profileError) return { error: profileError.message };

  redirect("/dashboard");
}

export async function signIn(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return { error: "Incorrect email or password." };

  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function updateProfile(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Your session expired — please sign in again." };

  const fullName = String(formData.get("full_name") || "").trim();
  const status = String(formData.get("status") || "") || null;
  const birthMonth = Number(formData.get("birth_month"));
  const birthDay = Number(formData.get("birth_day"));
  const anniversaryMonth = formData.get("anniversary_month")
    ? Number(formData.get("anniversary_month"))
    : null;
  const anniversaryDay = formData.get("anniversary_day")
    ? Number(formData.get("anniversary_day"))
    : null;

  if (!fullName || !birthMonth || !birthDay) {
    return { error: "Name and birthday are required." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      status,
      birth_month: birthMonth,
      birth_day: birthDay,
      anniversary_month: anniversaryMonth,
      anniversary_day: anniversaryDay,
    })
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function toggleSuspension(userId: string, suspend: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const { data: me } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();
  if (!me?.is_admin) return { error: "Admins only." };

  const { error } = await supabase
    .from("profiles")
    .update({ is_suspended: suspend })
    .eq("id", userId);

  if (error) return { error: error.message };
  revalidatePath("/admin");
  return { error: null };
}

export async function updateAvatar(url: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("profiles").update({ avatar_url: url }).eq("id", user.id);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard/members");
}
