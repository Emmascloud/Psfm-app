import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { monthName, ordinal, type Profile } from "@/lib/types";
import SuspendButton from "./SuspendButton";

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: me } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();
  if (!me?.is_admin) redirect("/dashboard");

  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .order("full_name")
    .returns<Profile[]>();

  // Emails live in auth.users, not the public profiles table — fetched
  // here with the service-role key, server-side only, admin-gated above.
  const admin = createAdminClient();
  const { data: authUsers } = await admin.auth.admin.listUsers({ perPage: 1000 });
  const emailById = new Map(authUsers?.users.map((u) => [u.id, u.email]) ?? []);

  return (
    <main className="min-h-screen bg-ink">
      <div className="mx-auto max-w-4xl px-6 py-10">
        <header className="flex items-center justify-between mb-10">
          <span className="font-display text-lg text-cream">
            PSFM <span className="text-marigold">Circle</span>{" "}
            <span className="font-data text-xs text-ember align-middle ml-2">ADMIN</span>
          </span>
          <Link href="/dashboard" className="font-data text-sm text-sage hover:text-cream">
            Back to Circle
          </Link>
        </header>

        <h1 className="font-display text-2xl text-cream mb-1">Members</h1>
        <p className="font-body text-sm text-sage mb-6">
          {profiles?.length ?? 0} members · visible here so you can reach out
          for birthdays/anniversaries and moderate accounts.
        </p>

        <div className="rounded-2xl bg-panel overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-hairline">
                <th className="font-data text-xs text-sage uppercase px-4 py-3">Name</th>
                <th className="font-data text-xs text-sage uppercase px-4 py-3">Email</th>
                <th className="font-data text-xs text-sage uppercase px-4 py-3">Birthday</th>
                <th className="font-data text-xs text-sage uppercase px-4 py-3">Status</th>
                <th className="font-data text-xs text-sage uppercase px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {profiles?.map((p) => (
                <tr key={p.id} className="border-b border-hairline last:border-0">
                  <td className="font-body text-cream px-4 py-3">
                    {p.full_name}
                    {p.is_admin && (
                      <span className="ml-2 font-data text-[10px] text-marigold">ADMIN</span>
                    )}
                  </td>
                  <td className="font-body text-sage text-sm px-4 py-3">
                    {emailById.get(p.id) ?? "—"}
                  </td>
                  <td className="font-data text-sm text-cream px-4 py-3">
                    {ordinal(p.birth_day)} {monthName(p.birth_month).slice(0, 3)}
                  </td>
                  <td className="px-4 py-3">
                    {p.is_suspended ? (
                      <span className="font-data text-xs text-ember">suspended</span>
                    ) : (
                      <span className="font-data text-xs text-sage">active</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {!p.is_admin && <SuspendButton userId={p.id} suspended={p.is_suspended} />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
