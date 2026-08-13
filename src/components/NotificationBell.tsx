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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ok = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
    setSupported(ok);
    if (!ok) {
      setError("This browser doesn't support push notifications.");
      return;
    }
    navigator.serviceWorker.ready.then(async (reg) => {
      const sub = await reg.pushManager.getSubscription();
      setEnabled(!!sub && Notification.permission === "granted");
    });
  }, []);

  async function enable() {
    setBusy(true);
    setError(null);
    try {
      if (Notification.permission === "denied") {
        setError(
          "Notifications are blocked for this site in your browser settings. Tap the lock/info icon next to the address bar → Permissions → Notifications → Allow, then try again.",
        );
        return;
      }

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setError("Permission wasn't granted, so notifications stayed off.");
        return;
      }

      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!publicKey) {
        setError(
          "The site isn't configured for push yet (missing public key). This means NEXT_PUBLIC_VAPID_PUBLIC_KEY wasn't set in Vercel at build time — add it and redeploy.",
        );
        return;
      }

      const reg = await navigator.serviceWorker.ready;
      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        });
      }

      const json = sub.toJSON();
      if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
        setError("Subscription came back incomplete — try again.");
        return;
      }

      const result = await savePushSubscription({
        endpoint: json.endpoint,
        keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
      });
      if (result?.error) {
        setError(`Saved locally but the server rejected it: ${result.error}`);
        return;
      }

      setEnabled(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong turning notifications on.");
    } finally {
      setBusy(false);
    }
  }

  async function disable() {
    setBusy(true);
    setError(null);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await removePushSubscription(sub.endpoint);
        await sub.unsubscribe();
      }
      setEnabled(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't turn notifications off.");
    } finally {
      setBusy(false);
    }
  }

  if (!supported && !error) return null;

  return (
    <div className="relative">
      <button
        onClick={enabled ? disable : enable}
        disabled={busy || !supported}
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
      {error && (
        <div className="absolute right-0 top-10 z-30 w-64 rounded-xl bg-panel-raised border border-hairline p-3 shadow-lg">
          <p className="font-body text-xs text-cream leading-relaxed">{error}</p>
          <button
            onClick={() => setError(null)}
            className="font-data text-[10px] text-sage hover:text-cream mt-2"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}
