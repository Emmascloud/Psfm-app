"use client";

import { useEffect, useState } from "react";
import { savePushSubscription, removePushSubscription } from "@/lib/push/actions";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export default function NotificationBell() {
  const [supported, setSupported] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const ok = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
    setSupported(ok);
    if (!ok) return;
    navigator.serviceWorker.ready.then(async (reg) => {
      const sub = await reg.pushManager.getSubscription();
      setEnabled(!!sub && Notification.permission === "granted");
    });
  }, []);

  async function enable() {
    setBusy(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setBusy(false);
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!publicKey) {
        console.error("NEXT_PUBLIC_VAPID_PUBLIC_KEY is not set");
        setBusy(false);
        return;
      }
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
      const json = sub.toJSON();
      await savePushSubscription({
        endpoint: json.endpoint!,
        keys: { p256dh: json.keys!.p256dh, auth: json.keys!.auth },
      });
      setEnabled(true);
    } finally {
      setBusy(false);
    }
  }

  async function disable() {
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await removePushSubscription(sub.endpoint);
        await sub.unsubscribe();
      }
      setEnabled(false);
    } finally {
      setBusy(false);
    }
  }

  if (!supported) return null;

  return (
    <button
      onClick={enabled ? disable : enable}
      disabled={busy}
      aria-label={enabled ? "Disable notifications" : "Enable notifications"}
      title={enabled ? "Notifications on for this device" : "Turn on notifications"}
      className="w-8 h-8 rounded-full flex items-center justify-center text-sage hover:text-cream hover:bg-panel transition-colors shrink-0 disabled:opacity-50"
    >
      {enabled ? (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 15a1.7 1.7 0 0 0 1.7-1.7H6.3A1.7 1.7 0 0 0 8 15Zm5-4.3V7.3a5 5 0 0 0-4-4.9V1.7a1 1 0 1 0-2 0v.7a5 5 0 0 0-4 4.9v3.4L1.7 12v.7h12.6V12L13 10.7Z" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M8 15a1.7 1.7 0 0 0 1.7-1.7H6.3A1.7 1.7 0 0 0 8 15Zm5-4.3V7.3a5 5 0 0 0-4-4.9V1.7a1 1 0 1 0-2 0v.7a5 5 0 0 0-4 4.9v3.4L1.7 12v.7h12.6V12L13 10.7Z"
            stroke="currentColor"
            strokeWidth="1"
          />
          <path d="M2 2l12 12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      )}
    </button>
  );
}
