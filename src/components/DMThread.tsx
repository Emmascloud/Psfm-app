"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  sendDirectMessage,
  deleteDirectMessage,
  reportDirectMessage,
  markConversationRead,
} from "@/lib/dms/actions";
import type { DirectMessage } from "@/lib/types";

function timeOf(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

export default function DMThread({
  initialMessages,
  currentUserId,
  otherUserId,
  isAdmin,
}: {
  initialMessages: DirectMessage[];
  currentUserId: string;
  otherUserId: string;
  isAdmin: boolean;
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [body, setBody] = useState("");
  const [pending, startTransition] = useTransition();
  const [reportedIds, setReportedIds] = useState<Set<string>>(new Set());
  const [sendError, setSendError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    markConversationRead(otherUserId);
  }, [otherUserId]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`dm-${[currentUserId, otherUserId].sort().join("-")}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "direct_messages" },
        (payload) => {
          const m = payload.new as DirectMessage;
          const belongsHere =
            (m.sender_id === currentUserId && m.recipient_id === otherUserId) ||
            (m.sender_id === otherUserId && m.recipient_id === currentUserId);
          if (!belongsHere) return;
          setMessages((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]));
          if (m.recipient_id === currentUserId) markConversationRead(otherUserId);
        },
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "direct_messages" },
        (payload) => {
          const id = (payload.old as { id: string }).id;
          setMessages((prev) => prev.filter((m) => m.id !== id));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, otherUserId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  function submit() {
    if (!body.trim()) return;
    const text = body;
    setBody("");
    setSendError(null);
    startTransition(async () => {
      const result = await sendDirectMessage(otherUserId, text);
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

  return (
    <div className="flex flex-col h-[calc(100vh-13rem)] lg:h-[calc(100vh-9rem)] rounded-2xl bg-panel overflow-hidden">
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {messages.map((m) => {
          const mine = m.sender_id === currentUserId;
          const canDelete = mine || isAdmin;
          const reported = reportedIds.has(m.id);
          return (
            <div key={m.id} className={`group flex ${mine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] flex flex-col ${mine ? "items-end" : "items-start"}`}>
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
                        reportDirectMessage(m.id);
                        setReportedIds((prev) => new Set(prev).add(m.id));
                      }}
                      className="font-data text-[10px] text-sage/70 hover:text-ember transition-colors"
                    >
                      Report
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={() => deleteDirectMessage(m.id)}
                      className="font-data text-[10px] text-sage/70 hover:text-ember transition-colors"
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
          <p className="font-body text-sage text-sm text-center mt-10">
            Say hello 👋 — this is just between the two of you.
          </p>
        )}
        <div ref={bottomRef} />
      </div>

      {sendError && (
        <p className="font-body text-xs text-ember px-4 pt-2 bg-ink-soft">
          Couldn't send: {sendError}
        </p>
      )}
      <div className="flex items-center gap-2 px-4 py-3 border-t border-hairline bg-ink-soft">
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
          placeholder="Message…"
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
    </div>
  );
}
