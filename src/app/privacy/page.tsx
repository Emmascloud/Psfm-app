import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How PSMF Family collects, uses, and protects member information.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-ink">
      <div className="mx-auto max-w-2xl px-6 py-16">
        <Link href="/" className="font-display text-lg text-cream block mb-10">
          PSMF <span className="text-marigold">Family</span>
        </Link>

        <p className="font-data text-sm text-marigold mb-3 tracking-widest uppercase">
          Policy
        </p>
        <h1 className="font-display text-4xl text-cream mb-3">Privacy Policy</h1>
        <p className="font-body text-sage text-sm mb-10">
          Last updated: August 2026. This is a plain-language summary of how
          PSMF Family (the "platform," "we," "us") handles your
          information. It is not a substitute for legal advice, and it
          should be reviewed by a qualified lawyer before this platform is
          opened to the wider public.
        </p>

        <Section title="1. What we collect">
          <p>Information you give us directly when you use the platform:</p>
          <ul>
            <li>Name, email address, and password (for your account)</li>
            <li>Birthday and, if applicable, wedding anniversary</li>
            <li>Relationship status (single / married), if you choose to share it</li>
            <li>Phone number, if you choose to add one — kept private to you and admins only</li>
            <li>Profile photo, and any photos or text you post to your timeline or the group feed</li>
            <li>Messages you send in the family chat room or in private conversations with other members</li>
          </ul>
          <p>Information collected automatically:</p>
          <ul>
            <li>Basic technical data (IP address, browser type) via our hosting provider's standard logs</li>
            <li>
              If you turn on notifications, a push-subscription identifier
              tied to your device — no message content is stored in it
            </li>
          </ul>
        </Section>

        <Section title="2. Why we collect it">
          <ul>
            <li>To run the core features you signed up for: birthday/anniversary reminders, your profile, the feed, chat, and private messaging</li>
            <li>To let admins moderate the community and act on reports, consistent with the <Link href="/rules" className="text-marigold hover:underline">group rules</Link></li>
            <li>To send you a notification when you've asked for one (new chat activity, a message, a follower's post)</li>
            <li>To keep the platform working and secure</li>
          </ul>
        </Section>

        <Section title="3. Who can see what">
          <ul>
            <li>Your name, photo, birthday, anniversary, status, and timeline posts are visible to other signed-in members — never to the public internet</li>
            <li>Your email and phone number are visible only to you and to platform admins — never to other members</li>
            <li>Private messages are visible only to you and the person you're messaging (and to admins only if a message is reported, for the purpose of reviewing that report)</li>
            <li>Nothing about you is visible to anyone who hasn't signed in</li>
          </ul>
        </Section>

        <Section title="4. Who we share it with">
          <p>
            We don't sell member data. A small number of service providers
            process it on our behalf, strictly to run the platform:
          </p>
          <ul>
            <li>Supabase — our database, authentication, and file storage provider</li>
            <li>Vercel — our hosting provider</li>
            <li>Google, Mozilla, or Apple's push notification services — only if you turn notifications on, and only to deliver that notification to your device</li>
          </ul>
        </Section>

        <Section title="5. Your rights and choices">
          <ul>
            <li>You can edit or remove most of your own information at any time from your profile</li>
            <li>You can turn push notifications off at any time from the bell icon</li>
            <li>You can ask an admin to delete your account and associated data — contact one via the platform</li>
            <li>If you're in Nigeria, this applies under the Nigeria Data Protection Act (NDPR): you have the right to access, correct, or request deletion of your personal data, and to object to certain uses of it</li>
          </ul>
        </Section>

        <Section title="6. Data retention">
          <p>
            We keep your information for as long as your account is active.
            If you ask for your account to be deleted, we'll remove your
            profile, posts, messages, and photos within a reasonable time,
            except where we're required to keep something for legal reasons.
          </p>
        </Section>

        <Section title="7. Children">
          <p>
            This platform is intended for adults. It is not directed at, and
            we do not knowingly collect information from, anyone under 18.
          </p>
        </Section>

        <Section title="8. Security">
          <p>
            We use reasonable technical measures (encrypted connections,
            access controls limiting who can see what) to protect your
            information, but no platform can guarantee perfect security.
          </p>
        </Section>

        <Section title="9. Changes to this policy">
          <p>
            If this policy changes in a meaningful way, we'll update the
            date at the top of this page and let members know.
          </p>
        </Section>

        <Section title="10. Contact">
          <p>Questions about this policy can be sent to a platform admin.</p>
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
