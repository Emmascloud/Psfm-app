import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms that govern using PSMF Family.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-ink">
      <div className="mx-auto max-w-2xl px-6 py-16">
        <Link href="/" className="font-display text-lg text-cream block mb-10">
          PSMF <span className="text-marigold">Family</span>
        </Link>

        <p className="font-data text-sm text-marigold mb-3 tracking-widest uppercase">
          Agreement
        </p>
        <h1 className="font-display text-4xl text-cream mb-3">Terms of Service</h1>
        <p className="font-body text-sage text-sm mb-10">
          Last updated: August 2026. This is a plain-language summary, not a
          finished legal document — it should be reviewed by a qualified
          lawyer before this platform is opened to the wider public. By
          creating an account, you agree to these terms and to the{" "}
          <Link href="/rules" className="text-marigold hover:underline">
            group rules
          </Link>
          .
        </p>

        <Section title="1. Who can join">
          <p>
            You must be at least 18 years old to create an account. PSMF
            Family is a community for singles and married people to connect
            and learn about relationships together — you're welcome
            regardless of your relationship status, as long as you're here
            in that spirit.
          </p>
        </Section>

        <Section title="2. Your account">
          <ul>
            <li>You're responsible for keeping your password secure and for activity on your account</li>
            <li>The information you provide (name, birthday, etc.) should be accurate</li>
            <li>One account per person</li>
          </ul>
        </Section>

        <Section title="3. Your content">
          <p>
            You own what you post — photos, timeline updates, comments,
            messages. By posting it, you give the platform permission to
            store and display it to other signed-in members as intended by
            the feature you posted it through (your timeline, the feed, a
            chat, a private message). We don't claim ownership of it, and we
            don't use it for anything beyond running the platform.
          </p>
        </Section>

        <Section title="4. Acceptable use">
          <p>
            Follow the <Link href="/rules" className="text-marigold hover:underline">group rules</Link>. In short: be respectful, no spam or
            unsolicited advertising, no harassment, no vulgar or explicit
            content, and respect other members' privacy. Anything shared in
            the community is expected to stay in the community.
          </p>
        </Section>

        <Section title="5. Reporting and moderation">
          <p>
            Members can report a post, comment, or message they believe
            breaks these terms or the group rules. Admins may review
            reported content and, at their discretion, remove content or
            suspend an account that violates these terms. Suspension blocks
            access to the platform; it doesn't affect your rights under
            applicable law.
          </p>
        </Section>

        <Section title="6. Account termination">
          <p>
            You can stop using the platform and request account deletion at
            any time by contacting an admin. We may suspend or remove an
            account that violates these terms or the group rules, or that
            we reasonably believe poses a risk to other members.
          </p>
        </Section>

        <Section title="7. No warranty">
          <p>
            The platform is provided as-is. We work to keep it running
            reliably and securely but can't guarantee it will always be
            available or error-free.
          </p>
        </Section>

        <Section title="8. Limitation of liability">
          <p>
            To the extent permitted by law, PSMF Family and those who run
            it aren't liable for indirect or consequential damages arising
            from your use of the platform. Nothing here limits liability
            that can't legally be limited.
          </p>
        </Section>

        <Section title="9. Governing law">
          <p>These terms are governed by the laws of Nigeria.</p>
        </Section>

        <Section title="10. Changes to these terms">
          <p>
            If these terms change in a meaningful way, we'll update the
            date at the top of this page and let members know.
          </p>
        </Section>

        <Section title="11. Contact">
          <p>Questions about these terms can be sent to a platform admin.</p>
        </Section>
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="font-display text-xl text-cream mb-3">{title}</h2>
      <div className="font-body text-sage text-sm leading-relaxed space-y-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_li]:text-sage">
        {children}
      </div>
    </section>
  );
}
