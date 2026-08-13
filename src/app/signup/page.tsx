import type { Metadata } from "next";
import SignupForm from "./SignupForm";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  title: "Join the Family",
  description:
    "Create your PSMF Family account — add your birthday, and never miss a celebration in the group again.",
};

type RosterPrefill = {
  full_name: string;
  birth_month: number;
  birth_day: number;
  anniversary_month: number | null;
  anniversary_day: number | null;
  invite_token: string;
};

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ invite?: string }>;
}) {
  const { invite } = await searchParams;
  let prefill: RosterPrefill | null = null;

  if (invite) {
    const admin = createAdminClient();
    if (admin) {
      const { data } = await admin
        .from("roster")
        .select("full_name, birth_month, birth_day, anniversary_month, anniversary_day, invite_token")
        .eq("invite_token", invite)
        .is("claimed_by", null)
        .maybeSingle<RosterPrefill>();
      prefill = data ?? null;
    }
  }

  return <SignupForm prefill={prefill} />;
}
