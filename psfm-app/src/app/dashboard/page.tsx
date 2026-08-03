import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/auth/actions";
import YearWheel from "@/components/YearWheel";
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
    <main className="min-h-screen bg-ink">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <header className="flex items-center justify-between mb-12">
          <span className="font-display text-lg text-cream">
            PSFM <span className="text-marigold">Circle</span>
          </span>
          <nav className="flex items-center gap-5 font-data text-sm">
            <Link href="/dashboard/profile" className="text-sage hover:text-cream transition-colors">
              {me ? "Edit my profile" : "Complete my profile"}
            </Link>
            <form action={signOut}>
              <button className="text-sage hover:text-ember transition-colors">
                Sign out
              </button>
            </form>
          </nav>
        </header>

        {me && (
          <p className="font-body text-sage mb-10">
            Welcome back, <span className="text-cream">{me.full_name.split(" ")[0]}</span>.
          </p>
        )}

        <section className="grid md:grid-cols-[1fr_1.1fr] gap-12 items-start">
          <div className="rounded-2xl bg-panel p-6">
            <h2 className="font-display text-xl text-cream mb-4">Coming up</h2>
            <ol className="space-y-3">
              {upcoming.map(({ p, until }) => (
                <li key={p.id} className="flex items-baseline justify-between gap-4">
                  <span className="font-body text-cream">{p.full_name}</span>
                  <span className="font-data text-sm text-marigold whitespace-nowrap">
                    {until === 0
                      ? "today"
                      : until === 1
                        ? "tomorrow"
                        : `in ${until}d`}{" "}
                    · {ordinal(p.birth_day)} {monthName(p.birth_month).slice(0, 3)}
                  </span>
                </li>
              ))}
              {upcoming.length === 0 && (
                <p className="font-body text-sage text-sm">
                  No dates yet — be the first to add yours.
                </p>
              )}
            </ol>
          </div>

          <div className="rounded-2xl bg-panel p-6">
            <YearWheel profiles={all} />
          </div>
        </section>
      </div>
    </main>
  );
}
