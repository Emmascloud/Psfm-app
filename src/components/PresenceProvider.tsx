"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const PresenceContext = createContext<Set<string>>(new Set());

export function usePresence(userId: string): boolean {
  const online = useContext(PresenceContext);
  return online.has(userId);
}

export function PresenceProvider({
  userId,
  children,
}: {
  userId: string;
  children: React.ReactNode;
}) {
  const [online, setOnline] = useState<Set<string>>(new Set());

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase.channel("presence:family", {
      config: { presence: { key: userId } },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        setOnline(new Set(Object.keys(state)));
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ online_at: new Date().toISOString() });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return <PresenceContext.Provider value={online}>{children}</PresenceContext.Provider>;
}
