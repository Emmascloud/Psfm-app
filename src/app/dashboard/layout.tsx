import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/AppShell";
import type { Profile } from "@/lib/types";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: me } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle<Profile>();

  return (
    <AppShell
      user={{
        name: me?.full_name ?? "Member",
        avatarUrl: me?.avatar_url ?? null,
        isAdmin: !!me?.is_admin,
      }}
    >
      {children}
    </AppShell>
  );
}
