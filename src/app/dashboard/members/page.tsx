import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Avatar from "@/components/Avatar";
import ScrollTopButton from "@/components/ScrollTopButton";
import { monthName, ordinal, type Profile } from "@/lib/types";

export default async function MembersPage() {
  const supabase = await createClient();
  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .order("full_name")
    .returns<Profile[]>();

  return (
    <div className="px-6 py-8 lg:px-10 lg:py-10 max-w-5xl">
      <h1 className="font-display text-3xl text-cream mb-8">Members</h1>

      <ul className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {profiles?.map((p) => (
          <li key={p.id}>
            <Link
              href={`/dashboard/members/${p.id}`}
              className="flex items-center gap-3 rounded-xl bg-panel px-4 py-3 hover:bg-panel-raised transition-colors"
            >
              <Avatar url={p.avatar_url} name={p.full_name} size={40} />
              <div className="min-w-0">
                <p className="font-body text-cream truncate">{p.full_name}</p>
                <p className="font-data text-xs text-sage mt-1">
                  {ordinal(p.birth_day)} {monthName(p.birth_month).slice(0, 3)}
                  {p.status ? ` · ${p.status}` : ""}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      <ScrollTopButton />
    </div>
  );
}
