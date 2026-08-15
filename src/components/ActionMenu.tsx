"use client";

import { useEffect, useRef, useState } from "react";

export type ActionMenuItem = {
  label: string;
  onClick: () => void;
  danger?: boolean;
  icon?: React.ReactNode;
};

export default function ActionMenu({ items }: { items: ActionMenuItem[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        aria-label="More options"
        aria-expanded={open}
        className="w-6 h-6 rounded-full flex items-center justify-center text-sage hover:text-cream hover:bg-panel-raised transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
          <circle cx="7" cy="2.5" r="1.4" />
          <circle cx="7" cy="7" r="1.4" />
          <circle cx="7" cy="11.5" r="1.4" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-7 z-30 min-w-[140px] rounded-xl bg-panel-raised border border-hairline shadow-lg shadow-black/30 py-1 overflow-hidden">
          {items.map((item, i) => (
            <button
              key={i}
              onClick={() => {
                setOpen(false);
                item.onClick();
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 font-body text-xs text-left transition-colors ${
                item.danger ? "text-ember hover:bg-ember/10" : "text-cream hover:bg-panel"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
