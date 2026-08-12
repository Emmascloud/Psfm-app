import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Group Rules",
  description: "The PSMF Family community guidelines — read before you join.",
};

const RULES = [
  "Be respectful and kind at all times.",
  "No spam, advertising, or unsolicited links.",
  "Keep discussions constructive and solution-focused.",
  "Respect privacy — what is shared here stays here.",
  "No vulgar language or explicit content.",
];

export default function RulesPage() {
  return (
    <main className="min-h-screen bg-ink">
      <div className="mx-auto max-w-2xl px-6 py-16">
        <Link href="/" className="font-display text-lg text-cream block mb-10">
          PSMF <span className="text-marigold">Family</span>
        </Link>

        <p className="font-data text-sm text-marigold mb-3 tracking-widest uppercase">
          Quick reminder
        </p>
        <h1 className="font-display text-4xl text-cream mb-8">Group rules</h1>

        <ol className="space-y-5 mb-10">
          {RULES.map((rule, i) => (
            <li key={i} className="flex gap-4">
              <span className="font-display text-marigold text-xl leading-none">
                {i + 1}
              </span>
              <span className="font-body text-cream leading-relaxed">{rule}</span>
            </li>
          ))}
        </ol>

        <p className="font-body text-sage italic">
          We look forward to learning from you and growing together!
        </p>
      </div>
    </main>
  );
}
