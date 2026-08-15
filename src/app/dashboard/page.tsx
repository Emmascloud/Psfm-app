import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import YearWheel from "@/components/YearWheel";
import Avatar from "@/components/Avatar";
import { daysUntil, monthName, ordinal, type Profile } from "@/lib/types";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .returns<Profile[]>();

  const all = profiles ?? [];
  const me = all.find((p) => p.id === user?.id);

  const upcoming = [...all]
    .map((p) => ({ p, until: daysUntil(p.birth_month, p.birth_day) }))
    .sort((a, b) => a.until - b.until)
    .slice(0, 8);

  return (
    <div className="px-6 py-8 lg:px-10 lg:py-10 max-w-6xl">
      {me && (
        <div className="flex items-center gap-3 mb-8">
          <Avatar url={me.avatar_url} name={me.full_name} size={36} />
          <p className="font-body text-sage">
            Welcome back, <span className="text-cream">{me.full_name.split(" ")[0]}</span>.
          </p>
        </div>
      )}

      <section className="grid lg:grid-cols-[1fr_1.15fr] gap-6 lg:gap-8 items-start">
        <div className="card-float rounded-2xl bg-panel p-6">
          <h2 className="font-display text-xl text-cream mb-4">Coming up</h2>
          <ol className="space-y-2">
            {upcoming.map(({ p, until }) => (
              <li key={p.id}>
                <Link
                  href={`/dashboard/members/${p.id}`}
                  className="flex items-center justify-between gap-4 hover:bg-panel-raised -mx-2 px-2 py-1.5 rounded-lg transition-colors"
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <Avatar url={p.avatar_url} name={p.full_name} size={28} />
                    <span className="font-body text-cream truncate">{p.full_name}</span>
                  </span>
                  <span className="font-data text-sm text-marigold whitespace-nowrap">
                    {until === 0
                      ? "today"
                      : until === 1
                        ? "tomorrow"
                        : `in ${until}d`}{" "}
                    · {ordinal(p.birth_day)} {monthName(p.birth_month).slice(0, 3)}
                  </span>
                </Link>
              </li>
            ))}
            {upcoming.length === 0 && (
              <p className="font-body text-sage text-sm">
                No dates yet — be the first to add yours.
              </p>
            )}
          </ol>
        </div>

        <div className="card-float rounded-2xl bg-panel p-6">
          <YearWheel profiles={all} />
        </div>
      </section>
    </div>
  );
}
