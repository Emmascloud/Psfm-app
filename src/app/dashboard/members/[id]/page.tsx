import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { monthName, ordinal, type Profile } from "@/lib/types";

export default async function MemberProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle<Profile>();

  if (!profile) notFound();

  return (
    <main className="min-h-screen bg-ink flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm text-center">
        <Link href="/dashboard/members" className="font-data text-sm text-sage hover:text-cream block mb-10">
          ← All members
        </Link>
        <div className="rounded-2xl bg-panel p-8">
          <div className="w-16 h-16 rounded-full bg-marigold text-ink-on-paper font-display text-2xl flex items-center justify-center mx-auto mb-4">
            {profile.full_name.charAt(0).toUpperCase()}
          </div>
          <h1 className="font-display text-2xl text-cream mb-1">{profile.full_name}</h1>
          {profile.status && (
            <p className="font-data text-xs text-marigold uppercase tracking-wide mb-6">
              {profile.status}
            </p>
          )}
          <div className="text-left space-y-3 mt-6 pt-6 border-t border-hairline">
            <Row label="Birthday" value={`${ordinal(profile.birth_day)} ${monthName(profile.birth_month)}`} />
            {profile.anniversary_month && profile.anniversary_day && (
              <Row
                label="Anniversary"
                value={`${ordinal(profile.anniversary_day)} ${monthName(profile.anniversary_month)}`}
              />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="font-body text-sm text-sage">{label}</span>
      <span className="font-data text-sm text-cream">{value}</span>
    </div>
  );
}
