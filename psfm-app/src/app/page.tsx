import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-ink">
      <div className="mx-auto max-w-5xl px-6 py-16 md:py-24">
        <header className="flex items-center justify-between mb-20">
          <span className="font-display text-lg tracking-wide text-cream">
            PSFM <span className="text-marigold">Circle</span>
          </span>
          <nav className="flex items-center gap-6 font-data text-sm">
            <Link href="/login" className="text-sage hover:text-cream transition-colors">
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-marigold px-4 py-2 text-ink-on-paper font-medium hover:bg-marigold-soft transition-colors"
            >
              Join the circle
            </Link>
          </nav>
        </header>

        <section className="grid md:grid-cols-[1.2fr_0.8fr] gap-16 items-center">
          <div>
            <p className="font-data text-sm text-marigold mb-4 tracking-widest uppercase">
              Peculiar Singles &amp; Married
            </p>
            <h1 className="font-display text-5xl md:text-6xl leading-[1.05] text-cream mb-6">
              Kept, and keeping
              <br /> each other.
            </h1>
            <p className="font-body text-lg text-sage max-w-md mb-10 leading-relaxed">
              One place for the fellowship to hold its birthdays and
              anniversaries — so no one in the circle is forgotten on their
              day.
            </p>
            <div className="flex items-center gap-4">
              <Link
                href="/signup"
                className="rounded-full bg-marigold px-6 py-3 font-body font-medium text-ink-on-paper hover:bg-marigold-soft transition-colors"
              >
                Add your dates
              </Link>
              <Link
                href="/login"
                className="rounded-full border border-hairline px-6 py-3 font-body text-cream hover:border-marigold transition-colors"
              >
                I already have an account
              </Link>
            </div>
          </div>

          <DecorativeRing />
        </section>

        <section className="grid sm:grid-cols-3 gap-6 mt-24 pt-16 border-t border-hairline">
          <Feature
            eyebrow="01"
            title="Keep your own dates"
            body="Sign in and set your birthday and wedding anniversary once. Update them yourself whenever they change."
          />
          <Feature
            eyebrow="02"
            title="See who's coming up"
            body="The Circle shows whose day is next, at a glance, instead of a birthday message getting lost in a group chat."
          />
          <Feature
            eyebrow="03"
            title="Only for members"
            body="Dates are visible to signed-in fellowship members only — never public, never searchable."
          />
        </section>
      </div>
    </main>
  );
}

function Feature({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return (
    <div>
      <p className="font-data text-xs text-marigold mb-2">{eyebrow}</p>
      <h3 className="font-display text-xl text-cream mb-2">{title}</h3>
      <p className="font-body text-sm text-sage leading-relaxed">{body}</p>
    </div>
  );
}

function DecorativeRing() {
  const dots = Array.from({ length: 24 }, (_, i) => i);
  return (
    <div className="relative aspect-square w-full max-w-[320px] mx-auto">
      <svg viewBox="0 0 320 320" className="w-full h-full" aria-hidden="true">
        <circle cx={160} cy={160} r={130} fill="none" stroke="var(--panel-raised)" strokeWidth={1.5} />
        {dots.map((i) => {
          const ang = (i / dots.length) * 360 - 90;
          const rad = (ang * Math.PI) / 180;
          const r = i % 5 === 0 ? 5 : 3;
          const x = 160 + 130 * Math.cos(rad);
          const y = 160 + 130 * Math.sin(rad);
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={r}
              fill={i % 7 === 0 ? "var(--marigold)" : "var(--sage)"}
              opacity={i % 7 === 0 ? 1 : 0.55}
            />
          );
        })}
        <text
          x={160}
          y={155}
          textAnchor="middle"
          className="font-display"
          fontSize={22}
          fill="var(--cream)"
        >
          The Circle
        </text>
        <text
          x={160}
          y={178}
          textAnchor="middle"
          className="font-data"
          fontSize={10}
          fill="var(--sage)"
        >
          365 days, held together
        </text>
      </svg>
    </div>
  );
}
