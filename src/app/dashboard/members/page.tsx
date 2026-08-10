import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { monthName, ordinal, type Profile } from "@/lib/types";

export default async function MembersPage() {
  const supabase = await createClient();
  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .order("full_name")
    .returns<Profile[]>();

  return (
    <main className="min-h-screen bg-ink">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <Link href="/dashboard" className="font-data text-sm text-sage hover:text-cream">
          ← Back to the Circle
        </Link>
        <h1 className="font-display text-3xl text-cream mt-4 mb-8">Members</h1>

        <ul className="grid sm:grid-cols-2 gap-3">
          {profiles?.map((p) => (
            <li key={p.id}>
              <Link
                href={`/dashboard/members/${p.id}`}
                className="block rounded-xl bg-panel px-4 py-3 hover:bg-panel-raised transition-colors"
              >
                <p className="font-body text-cream">{p.full_name}</p>
                <p className="font-data text-xs text-sage mt-1">
                  {ordinal(p.birth_day)} {monthName(p.birth_month).slice(0, 3)}
                  {p.status ? ` · ${p.status}` : ""}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
