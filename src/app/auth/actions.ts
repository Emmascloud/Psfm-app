"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ActionState = { error: string | null };
export type ForgotPasswordState = { error: string | null; sent: boolean };

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
  const phone = String(formData.get("phone") || "").trim() || null;

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

  if (phone) {
    await supabase.from("contacts").insert({ id: data.user.id, phone });
  }

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
  const phone = String(formData.get("phone") || "").trim() || null;

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

  await supabase.from("contacts").upsert({ id: user.id, phone });

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
    .select("is_admin, is_owner")
    .eq("id", user.id)
    .single();
  if (!me?.is_admin) return { error: "Admins only." };

  const { data: target } = await supabase
    .from("profiles")
    .select("is_admin, is_owner")
    .eq("id", userId)
    .single();

  if (target?.is_owner) return { error: "The owner can't be suspended." };
  if (target?.is_admin && !me.is_owner) {
    return { error: "Only the owner can suspend another admin." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ is_suspended: suspend })
    .eq("id", userId);

  if (error) return { error: error.message };
  revalidatePath("/admin");
  return { error: null };
}

export async function requestPasswordReset(
  _prev: ForgotPasswordState,
  formData: FormData,
): Promise<ForgotPasswordState> {
  const email = String(formData.get("email") || "").trim();
  if (!email) return { error: "Enter your email.", sent: false };

  const supabase = await createClient();
  const headersList = await headers();
  const host = headersList.get("host");
  const protocol = host?.startsWith("localhost") ? "http" : "https";

  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${protocol}://${host}/auth/callback?next=/reset-password`,
  });

  // Always report success, whether or not that email has an account —
  // this avoids letting the form be used to check who's a member.
  return { error: null, sent: true };
}

export async function updatePassword(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const password = String(formData.get("password") || "");
  const confirm = String(formData.get("confirm") || "");

  if (password.length < 6) return { error: "Password must be at least 6 characters." };
  if (password !== confirm) return { error: "Passwords don't match." };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };

  redirect("/dashboard");
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
