import { createClient } from "@/lib/supabase/server";
import ChatRoom from "@/components/ChatRoom";
import type { Message } from "@/lib/types";

export default async function ChatPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: me }, { data: profiles }, { data: messages }] = await Promise.all([
    user
      ? supabase.from("profiles").select("is_admin").eq("id", user.id).single()
      : Promise.resolve({ data: null }),
    supabase.from("profiles").select("id, full_name, avatar_url"),
    supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: true })
      .limit(200)
      .returns<Message[]>(),
  ]);

  const authorsById = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]));

  return (
    <div className="px-6 py-8 lg:px-10 lg:py-10 max-w-2xl">
      <h1 className="font-display text-2xl text-cream mb-1">Family chat</h1>
      <p className="font-body text-sm text-sage mb-6">
        One room, everyone in it. Be kind — see the{" "}
        <a href="/rules" className="text-marigold hover:underline">
          group rules
        </a>
        .
      </p>
      <ChatRoom
        initialMessages={messages ?? []}
        authorsById={authorsById}
        currentUserId={user?.id ?? null}
        isAdmin={!!me?.is_admin}
      />
    </div>
  );
}
