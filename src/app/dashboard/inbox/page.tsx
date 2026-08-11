import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Avatar from "@/components/Avatar";
import type { DirectMessage } from "@/lib/types";

export default async function InboxPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: messages }, { data: profiles }] = await Promise.all([
    supabase
      .from("direct_messages")
      .select("*")
      .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
      .order("created_at", { ascending: false })
      .returns<DirectMessage[]>(),
    supabase.from("profiles").select("id, full_name, avatar_url"),
  ]);

  const authorsById = new Map((profiles ?? []).map((p) => [p.id, p]));

  type ConvoSummary = { otherId: string; last: DirectMessage; unread: number };
  const conversations = new Map<string, ConvoSummary>();
  for (const m of messages ?? []) {
    const otherId = m.sender_id === user.id ? m.recipient_id : m.sender_id;
    const existing = conversations.get(otherId);
    const isUnread = m.recipient_id === user.id && !m.read_at;
    if (!existing) {
      conversations.set(otherId, { otherId, last: m, unread: isUnread ? 1 : 0 });
    } else if (isUnread) {
      existing.unread += 1;
    }
  }

  const list = Array.from(conversations.values());

  return (
    <div className="px-6 py-8 lg:px-10 lg:py-10 max-w-2xl">
      <h1 className="font-display text-2xl text-cream mb-1">Inbox</h1>
      <p className="font-body text-sm text-sage mb-6">
        Private conversations, just between the two of you.
      </p>

      {list.length === 0 ? (
        <p className="font-body text-sage text-sm">
          No conversations yet — visit a member's profile and send them a message.
        </p>
      ) : (
        <div className="space-y-2">
          {list.map(({ otherId, last, unread }) => {
            const other = authorsById.get(otherId);
            return (
              <Link
                key={otherId}
                href={`/dashboard/inbox/${otherId}`}
                className="flex items-center gap-3 rounded-xl bg-panel px-4 py-3 hover:bg-panel-raised transition-colors"
              >
                <Avatar url={other?.avatar_url} name={other?.full_name ?? "?"} size={40} />
                <div className="min-w-0 flex-1">
                  <p className="font-body text-cream truncate">{other?.full_name ?? "Member"}</p>
                  <p className="font-body text-sage text-sm truncate">
                    {last.sender_id === user.id ? "You: " : ""}
                    {last.body}
                  </p>
                </div>
                {unread > 0 && (
                  <span className="font-data text-[10px] bg-marigold text-ink-on-paper rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5">
                    {unread}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
