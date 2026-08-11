"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Avatar from "./Avatar";
import { signOut } from "@/app/auth/actions";

type NavUser = {
  name: string;
  avatarUrl: string | null;
  isAdmin: boolean;
};

const LINKS = [
  { href: "/dashboard", label: "The Circle" },
  { href: "/dashboard/feed", label: "Feed" },
  { href: "/dashboard/chat", label: "Chat" },
  { href: "/dashboard/members", label: "Members" },
  { href: "/rules", label: "Rules" },
  { href: "/dashboard/profile", label: "My profile" },
];

export default function AppShell({ user, children }: { user: NavUser; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const allLinks = user.isAdmin ? [...LINKS, { href: "/admin", label: "Admin" }] : LINKS;

  return (
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
              className={`font-data text-sm rounded-lg px-3 py-2 transition-colors ${
                pathname === l.href
                  ? "bg-panel-raised text-marigold"
                  : "text-sage hover:text-cream hover:bg-panel"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3 pt-6 border-t border-hairline">
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
      </aside>

      {/* Mobile top bar */}
      <header className="lg:hidden sticky top-0 z-20 bg-ink/95 backdrop-blur border-b border-hairline px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-display text-lg text-cream">
          PSMF <span className="text-marigold">Family</span>
        </Link>
        <button
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="text-cream p-2 -mr-2"
        >
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
                className={`font-data text-sm rounded-lg px-3 py-3 transition-colors ${
                  pathname === l.href ? "bg-panel-raised text-marigold" : "text-sage hover:text-cream"
                }`}
              >
                {l.label}
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
  );
}
