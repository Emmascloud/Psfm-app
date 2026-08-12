"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { sendMessage, deleteMessage, reportMessage } from "@/lib/chat/actions";
import Avatar from "@/components/Avatar";
import type { Message } from "@/lib/types";

type Author = { id: string; full_name: string; avatar_url: string | null };

function timeOf(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

function dayLabel(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString(undefined, { month: "long", day: "numeric" });
}

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
  const [sendError, setSendError] = useState<string | null>(null);
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
    setSendError(null);
    startTransition(async () => {
      const result = await sendMessage(text);
      if (result.error) {
        setSendError(result.error);
        setBody(text);
        return;
      }
      if (result.message) {
        setMessages((prev) =>
          prev.some((x) => x.id === result.message!.id) ? prev : [...prev, result.message!],
        );
      }
    });
  }

  let lastDay = "";
  let lastAuthor = "";

  return (
    <div className="flex flex-col h-[calc(100vh-11rem)] lg:h-[calc(100vh-9rem)] rounded-2xl bg-panel overflow-hidden">
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {messages.map((m) => {
          const author = authorsById[m.author_id];
          const mine = m.author_id === currentUserId;
          const canDelete = mine || isAdmin;
          const reported = reportedIds.has(m.id);

          const day = dayLabel(m.created_at);
          const showDayDivider = day !== lastDay;
          lastDay = day;
          const groupedWithPrev = !showDayDivider && lastAuthor === m.author_id;
          lastAuthor = m.author_id;

          return (
            <div key={m.id}>
              {showDayDivider && (
                <div className="flex items-center justify-center my-4">
                  <span className="font-data text-[10px] text-sage bg-ink-soft rounded-full px-3 py-1">
                    {day}
                  </span>
                </div>
              )}
              <div className={`group flex gap-2 ${mine ? "flex-row-reverse" : ""} ${groupedWithPrev ? "mt-0.5" : "mt-3"}`}>
                <div className="w-7 shrink-0">
                  {!groupedWithPrev && !mine && (
                    <Link href={`/dashboard/members/${m.author_id}`}>
                      <Avatar url={author?.avatar_url} name={author?.full_name ?? "?"} size={28} />
                    </Link>
                  )}
                </div>
                <div className={`max-w-[75%] flex flex-col ${mine ? "items-end" : "items-start"}`}>
                  {!groupedWithPrev && !mine && (
                    <Link
                      href={`/dashboard/members/${m.author_id}`}
                      className="font-data text-[10px] text-sage hover:text-marigold transition-colors mb-0.5 px-1"
                    >
                      {author?.full_name ?? "Member"}
                    </Link>
                  )}
                  <div className="flex items-end gap-1.5">
                    {mine && (
                      <span className="font-data text-[10px] text-sage/70 whitespace-nowrap pb-1">
                        {timeOf(m.created_at)}
                      </span>
                    )}
                    <div
                      className={`rounded-2xl px-3.5 py-2 ${
                        mine
                          ? "bg-marigold text-ink-on-paper rounded-br-sm"
                          : "bg-panel-raised text-cream rounded-bl-sm"
                      }`}
                    >
                      <p className="font-body text-sm whitespace-pre-wrap break-words">{m.body}</p>
                    </div>
                    {!mine && (
                      <span className="font-data text-[10px] text-sage/70 whitespace-nowrap pb-1">
                        {timeOf(m.created_at)}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2 mt-0.5 px-1">
                    {!reported && !mine && (
                      <button
                        onClick={() => {
                          reportMessage(m.id);
                          setReportedIds((prev) => new Set(prev).add(m.id));
                        }}
                        className="font-data text-[10px] text-sage/70 hover:text-ember transition-colors"
                      >
                        Report
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => deleteMessage(m.id)}
                        className="font-data text-[10px] text-sage/70 hover:text-ember transition-colors"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {messages.length === 0 && (
          <p className="font-body text-sage text-sm text-center mt-10">
            No messages yet — say hello 👋
          </p>
        )}
        <div ref={bottomRef} />
      </div>

      {sendError && (
        <p className="font-body text-xs text-ember px-4 pt-2 bg-ink-soft">
          Couldn't send: {sendError}
        </p>
      )}

      {currentUserId && (
        <div className="flex items-center gap-2 px-4 py-3 border-t border-hairline bg-ink-soft">
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
            aria-label="Send"
            className="rounded-full bg-marigold w-10 h-10 flex items-center justify-center text-ink-on-paper hover:bg-marigold-soft transition-colors disabled:opacity-50 shrink-0"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 8h11M8 2l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
