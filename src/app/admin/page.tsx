import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import AppShell from "@/components/AppShell";
import { monthName, ordinal, type Profile } from "@/lib/types";
import SuspendButton from "./SuspendButton";
import ReportRow from "./ReportRow";

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
  // If the key isn't configured yet, degrade gracefully instead of
  // crashing the whole page.
  const admin = createAdminClient();
  let emailById = new Map<string, string | undefined>();
  let emailLookupFailed = false;
  if (admin) {
    try {
      const { data: authUsers } = await admin.auth.admin.listUsers({ perPage: 1000 });
      emailById = new Map(authUsers?.users.map((u) => [u.id, u.email]) ?? []);
    } catch {
      emailLookupFailed = true;
    }
  } else {
    emailLookupFailed = true;
  }

  const { data: reports } = await supabase
    .from("reports")
    .select("*")
    .order("created_at", { ascending: false });

  const postIds = (reports ?? []).filter((r) => r.target_type === "post").map((r) => r.target_id);
  const commentIds = (reports ?? [])
    .filter((r) => r.target_type === "comment")
    .map((r) => r.target_id);
  const messageIds = (reports ?? [])
    .filter((r) => r.target_type === "message")
    .map((r) => r.target_id);

  const [{ data: reportedPosts }, { data: reportedComments }, { data: reportedMessages }] =
    await Promise.all([
      postIds.length
        ? supabase.from("posts").select("*").in("id", postIds)
        : Promise.resolve({ data: [] as { id: string; body: string; author_id: string }[] }),
      commentIds.length
        ? supabase.from("comments").select("*").in("id", commentIds)
        : Promise.resolve({ data: [] as { id: string; body: string; author_id: string }[] }),
      messageIds.length
        ? supabase.from("messages").select("*").in("id", messageIds)
        : Promise.resolve({ data: [] as { id: string; body: string; author_id: string }[] }),
    ]);

  const postById = new Map((reportedPosts ?? []).map((p) => [p.id, p]));
  const commentById = new Map((reportedComments ?? []).map((c) => [c.id, c]));
  const messageById = new Map((reportedMessages ?? []).map((m) => [m.id, m]));
  const nameById = new Map((profiles ?? []).map((p) => [p.id, p.full_name]));

  return (
    <AppShell user={{ name: profiles?.find((p) => p.id === user.id)?.full_name ?? "Admin", avatarUrl: profiles?.find((p) => p.id === user.id)?.avatar_url ?? null, isAdmin: true }}>
      <div className="px-6 py-8 lg:px-10 lg:py-10 max-w-5xl">
        <p className="font-data text-xs text-ember uppercase tracking-widest mb-2">Admin</p>
        <h1 className="font-display text-2xl text-cream mb-1">Members</h1>
        <p className="font-body text-sm text-sage mb-6">
          {profiles?.length ?? 0} members · click a name for their full profile
          and timeline · reach out for birthdays/anniversaries and moderate
          accounts here.
        </p>

        {emailLookupFailed && (
          <p className="font-body text-sm text-ember bg-ember/10 rounded-lg px-4 py-3 mb-6">
            Couldn't load member emails — SUPABASE_SERVICE_ROLE_KEY is
            missing or incorrect in this environment's variables. Everything
            else on this page still works.
          </p>
        )}

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
                    <Link
                      href={`/dashboard/members/${p.id}`}
                      className="hover:text-marigold transition-colors"
                    >
                      {p.full_name}
                    </Link>
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

        {(reports?.length ?? 0) > 0 && (
          <div className="mt-10">
            <h2 className="font-display text-xl text-cream mb-1">Reported content</h2>
            <p className="font-body text-sm text-sage mb-4">
              {reports?.length} open report{reports?.length === 1 ? "" : "s"} from members.
            </p>
            <div className="space-y-3">
              {reports?.map((r) => {
                const content =
                  r.target_type === "post"
                    ? postById.get(r.target_id)
                    : r.target_type === "comment"
                      ? commentById.get(r.target_id)
                      : messageById.get(r.target_id);
                if (!content) return null;
                return (
                  <div key={r.id} className="rounded-xl bg-panel p-4 flex items-start justify-between gap-4">
                    <div>
                      <p className="font-data text-xs text-marigold uppercase mb-1">
                        {r.target_type} · by {nameById.get(content.author_id) ?? "unknown"}
                      </p>
                      <p className="font-body text-cream text-sm">{content.body}</p>
                      <p className="font-data text-xs text-sage mt-1">
                        reported by {nameById.get(r.reporter_id) ?? "a member"}
                      </p>
                    </div>
                    <ReportRow reportId={r.id} targetType={r.target_type} targetId={r.target_id} />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
