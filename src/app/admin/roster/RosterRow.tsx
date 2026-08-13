"use client";

import { useState } from "react";

export default function RosterRow({
  name,
  dateLabel,
  inviteToken,
  claimed,
}: {
  name: string;
  dateLabel: string;
  inviteToken: string;
  claimed: boolean;
}) {
  const [copied, setCopied] = useState(false);

  function copyLink() {
    const url = `${window.location.origin}/signup?invite=${inviteToken}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-panel px-4 py-3">
      <div className="min-w-0">
        <p className="font-body text-cream truncate">{name}</p>
        <p className="font-data text-xs text-sage">{dateLabel}</p>
      </div>
      {claimed ? (
        <span className="font-data text-xs text-sage shrink-0">✓ claimed</span>
      ) : (
        <button
          onClick={copyLink}
          className="font-data text-xs rounded-full bg-marigold px-3 py-1.5 font-medium text-ink-on-paper hover:bg-marigold-soft transition-colors shrink-0"
        >
          {copied ? "Copied!" : "Copy invite link"}
        </button>
      )}
    </div>
  );
}
