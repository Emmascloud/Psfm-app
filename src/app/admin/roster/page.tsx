import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/AppShell";
import { monthName, ordinal, type Profile } from "@/lib/types";
import RosterRow from "./RosterRow";

type RosterEntry = {
  id: string;
  full_name: string;
  birth_month: number;
  birth_day: number;
  invite_token: string;
  claimed_by: string | null;
};

export default async function RosterPage() {
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
  if (!me?.is_admin) redirect("/dashboard");

  const { data: roster } = await supabase
    .from("roster")
    .select("*")
    .order("full_name")
    .returns<RosterEntry[]>();

  const claimed = (roster ?? []).filter((r) => r.claimed_by).length;
  const total = roster?.length ?? 0;

  return (
    <AppShell user={{ id: user.id, name: me.full_name, avatarUrl: me.avatar_url, isAdmin: true }}>
      <div className="px-6 py-8 lg:px-10 lg:py-10 max-w-3xl">
        <p className="font-data text-xs text-ember uppercase tracking-widest mb-2">Admin</p>
        <h1 className="font-display text-2xl text-cream mb-1">Roster</h1>
        <p className="font-body text-sm text-sage mb-6">
          {claimed} of {total} claimed. Send each unclaimed link over WhatsApp — it opens
          /signup with that person's name and birthday already filled in.
        </p>

        <div className="space-y-2">
          {roster?.map((r) => (
            <RosterRow
              key={r.id}
              name={r.full_name}
              dateLabel={`${ordinal(r.birth_day)} ${monthName(r.birth_month).slice(0, 3)}`}
              inviteToken={r.invite_token}
              claimed={!!r.claimed_by}
            />
          ))}
        </div>
      </div>
    </AppShell>
  );
}
