"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Avatar from "./Avatar";
import ThemeToggle from "./ThemeToggle";
import NotificationBell from "./NotificationBell";
import { PresenceProvider } from "./PresenceProvider";
import { signOut } from "@/app/auth/actions";
import { createClient } from "@/lib/supabase/client";

type NavUser = {
  id: string;
  name: string;
  avatarUrl: string | null;
  isAdmin: boolean;
};

const BASE_LINKS = [
  { href: "/dashboard", label: "The Circle", key: null },
  { href: "/dashboard/feed", label: "Feed", key: "feed" },
  { href: "/dashboard/chat", label: "Chat", key: "chat" },
  { href: "/dashboard/inbox", label: "Inbox", key: "inbox" },
  { href: "/dashboard/connections", label: "Connections", key: null },
  { href: "/dashboard/events", label: "Events", key: "events" },
  { href: "/dashboard/members", label: "Members", key: null },
  { href: "/rules", label: "Rules", key: null },
  { href: "/dashboard/profile", label: "My profile", key: null },
] as const;

export default function AppShell({ user, children }: { user: NavUser; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [badges, setBadges] = useState<Record<string, boolean>>({});

  const allLinks = user.isAdmin
    ? [...BASE_LINKS, { href: "/admin", label: "Admin", key: null }]
    : BASE_LINKS;

  // Clear a section's badge once the person actually visits it.
  useEffect(() => {
    setBadges((prev) => {
      const next = { ...prev };
      for (const l of allLinks) {
        if (l.key && pathname.startsWith(l.href)) next[l.key] = false;
      }
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Live badges: new activity elsewhere in the app while you're on
  // another page. Session-only — resets on reload, doesn't persist
  // an unread count across devices.
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`nav-badges-${user.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "posts" }, () => {
        if (!window.location.pathname.startsWith("/dashboard/feed")) {
          setBadges((prev) => ({ ...prev, feed: true }));
        }
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        const authorId = (payload.new as { author_id: string }).author_id;
        if (authorId !== user.id && !window.location.pathname.startsWith("/dashboard/chat")) {
          setBadges((prev) => ({ ...prev, chat: true }));
        }
      })
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "direct_messages", filter: `recipient_id=eq.${user.id}` },
        () => {
          if (!window.location.pathname.startsWith("/dashboard/inbox")) {
            setBadges((prev) => ({ ...prev, inbox: true }));
          }
        },
      )
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "events" }, () => {
        if (!window.location.pathname.startsWith("/dashboard/events")) {
          setBadges((prev) => ({ ...prev, events: true }));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user.id]);

  return (
    <PresenceProvider userId={user.id}>
    <div className="min-h-screen bg-ink lg:grid lg:grid-cols-[260px_1fr]">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:h-screen lg:sticky lg:top-0 border-r border-hairline px-6 py-8">
        <Link href="/" className="font-display text-lg text-cream mb-10 block">
          PSMF <span className="text-marigold">Family</span>
        </Link>
        <nav className="flex flex-col gap-1 flex-1">
          {allLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`font-data text-sm rounded-lg px-3 py-2 transition-colors flex items-center justify-between ${
                pathname === l.href
                  ? "bg-panel-raised text-marigold"
                  : "text-sage hover:text-cream hover:bg-panel"
              }`}
            >
              {l.label}
              {l.key && badges[l.key] && (
                <span className="w-2 h-2 rounded-full bg-ember" aria-label="New activity" />
              )}
            </Link>
          ))}
        </nav>
        <div className="flex items-center justify-between pt-6 border-t border-hairline">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar url={user.avatarUrl} name={user.name} size={36} />
            <div className="min-w-0">
              <p className="font-body text-sm text-cream truncate">{user.name}</p>
              <form action={signOut}>
                <button className="font-data text-xs text-sage hover:text-ember transition-colors">
                  Sign out
                </button>
              </form>
            </div>
          </div>
          <NotificationBell />
          <ThemeToggle />
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="lg:hidden sticky top-0 z-20 bg-ink/95 backdrop-blur border-b border-hairline px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-display text-lg text-cream">
          PSMF <span className="text-marigold">Family</span>
        </Link>
        <div className="flex items-center gap-1">
          <NotificationBell />
          <ThemeToggle />
          <button
            onClick={() => setOpen(!open)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="text-cream p-2 -mr-2 relative"
          >
            {Object.values(badges).some(Boolean) && !open && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-ember" />
            )}
            {open ? (
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path d="M2 2l18 18M20 2L2 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path d="M2 5h18M2 11h18M2 17h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>
      </header>

      {open && (
        <div className="lg:hidden fixed inset-0 top-[57px] z-10 bg-ink px-4 py-4 overflow-y-auto">
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-hairline">
            <Avatar url={user.avatarUrl} name={user.name} size={40} />
            <p className="font-body text-cream">{user.name}</p>
          </div>
          <nav className="flex flex-col gap-1">
            {allLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`font-data text-sm rounded-lg px-3 py-3 transition-colors flex items-center justify-between ${
                  pathname === l.href ? "bg-panel-raised text-marigold" : "text-sage hover:text-cream"
                }`}
              >
                {l.label}
                {l.key && badges[l.key] && (
                  <span className="w-2 h-2 rounded-full bg-ember" aria-label="New activity" />
                )}
              </Link>
            ))}
          </nav>
          <form action={signOut} className="mt-4 pt-4 border-t border-hairline">
            <button className="font-data text-sm text-ember">Sign out</button>
          </form>
        </div>
      )}

      <main className="min-w-0">{children}</main>
    </div>
    </PresenceProvider>
  );
}
