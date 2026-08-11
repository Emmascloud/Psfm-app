import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Avatar from "@/components/Avatar";
import DMThread from "@/components/DMThread";
import type { DirectMessage, Profile } from "@/lib/types";

export default async function DMThreadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: otherUserId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: other }, { data: me }, { data: messages }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", otherUserId).maybeSingle<Profile>(),
    supabase.from("profiles").select("is_admin").eq("id", user.id).single(),
    supabase
      .from("direct_messages")
      .select("*")
      .or(
        `and(sender_id.eq.${user.id},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${user.id})`,
      )
      .order("created_at", { ascending: true })
      .returns<DirectMessage[]>(),
  ]);

  if (!other) notFound();

  return (
    <div className="px-6 py-8 lg:px-10 lg:py-10 max-w-2xl">
      <Link href="/dashboard/inbox" className="font-data text-sm text-sage hover:text-cream mb-4 inline-block">
        ← Inbox
      </Link>
      <div className="flex items-center gap-3 mb-4">
        <Avatar url={other.avatar_url} name={other.full_name} size={36} />
        <Link
          href={`/dashboard/members/${other.id}`}
          className="font-display text-lg text-cream hover:text-marigold transition-colors"
        >
          {other.full_name}
        </Link>
      </div>
      <DMThread
        initialMessages={messages ?? []}
        currentUserId={user.id}
        otherUserId={otherUserId}
        isAdmin={!!me?.is_admin}
      />
    </div>
  );
}
