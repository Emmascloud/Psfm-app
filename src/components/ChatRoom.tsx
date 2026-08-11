"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { sendMessage, deleteMessage, reportMessage } from "@/lib/chat/actions";
import Avatar from "@/components/Avatar";
import type { Message } from "@/lib/types";

type Author = { id: string; full_name: string; avatar_url: string | null };

export default function ChatRoom({
  initialMessages,
  authorsById,
  currentUserId,
  isAdmin,
}: {
  initialMessages: Message[];
  authorsById: Record<string, Author>;
  currentUserId: string | null;
  isAdmin: boolean;
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [body, setBody] = useState("");
  const [pending, startTransition] = useTransition();
  const [reportedIds, setReportedIds] = useState<Set<string>>(new Set());
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("family-chat")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const m = payload.new as Message;
          setMessages((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]));
        },
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "messages" },
        (payload) => {
          const id = (payload.old as { id: string }).id;
          setMessages((prev) => prev.filter((m) => m.id !== id));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  function submit() {
    if (!body.trim()) return;
    const text = body;
    setBody("");
    startTransition(() => {
      sendMessage(text);
    });
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] lg:h-[calc(100vh-6rem)]">
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {messages.map((m) => {
          const author = authorsById[m.author_id];
          const mine = m.author_id === currentUserId;
          const canDelete = mine || isAdmin;
          const reported = reportedIds.has(m.id);
          return (
            <div key={m.id} className={`flex gap-2 ${mine ? "flex-row-reverse" : ""}`}>
              <Avatar url={author?.avatar_url} name={author?.full_name ?? "?"} size={28} />
              <div className={`max-w-[75%] ${mine ? "items-end" : "items-start"} flex flex-col`}>
                <p className="font-data text-[10px] text-sage mb-0.5">
                  {author?.full_name ?? "Member"}
                </p>
                <div
                  className={`rounded-2xl px-3 py-2 ${
                    mine ? "bg-marigold text-ink-on-paper" : "bg-panel text-cream"
                  }`}
                >
                  <p className="font-body text-sm whitespace-pre-wrap">{m.body}</p>
                </div>
                <div className="flex gap-2 mt-0.5">
                  {!reported && !mine && (
                    <button
                      onClick={() => {
                        reportMessage(m.id);
                        setReportedIds((prev) => new Set(prev).add(m.id));
                      }}
                      className="font-data text-[10px] text-sage hover:text-ember transition-colors"
                    >
                      Report
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={() => deleteMessage(m.id)}
                      className="font-data text-[10px] text-sage hover:text-ember transition-colors"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {messages.length === 0 && (
          <p className="font-body text-sage text-sm">No messages yet — say hello.</p>
        )}
        <div ref={bottomRef} />
      </div>

      {currentUserId && (
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-hairline">
          <input
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
            }}
            placeholder="Message the family…"
            className="flex-1 bg-panel rounded-full px-4 py-2.5 font-body text-sm text-cream placeholder:text-sage/60 outline-none"
          />
          <button
            disabled={pending || !body.trim()}
            onClick={submit}
            className="rounded-full bg-marigold px-5 py-2.5 font-data text-xs font-medium text-ink-on-paper hover:bg-marigold-soft transition-colors disabled:opacity-50"
          >
            Send
          </button>
        </div>
      )}
    </div>
  );
}
