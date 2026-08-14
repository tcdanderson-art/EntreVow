"use client";

import { useEffect, useState } from "react";
import { urlBase64ToUint8Array } from "@/lib/push-client";

type Status = "checking" | "ios-hint" | "unsupported" | "denied" | "idle" | "subscribed" | "requesting" | "error";

export default function GuestPushOptIn({ code, vapidPublicKey }: { code: string; vapidPublicKey: string }) {
  const [status, setStatus] = useState<Status>("checking");

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
      setStatus("unsupported");
      return;
    }

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isIOS && !isStandalone) {
      setStatus("ios-hint");
      return;
    }
    if (Notification.permission === "denied") {
      setStatus("denied");
      return;
    }

    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setStatus(sub ? "subscribed" : "idle"))
      .catch(() => setStatus("idle"));
  }, []);

  async function enable() {
    setStatus("requesting");
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      setStatus("denied");
      return;
    }
    try {
      const reg = await navigator.serviceWorker.ready;
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
      });
      const res = await fetch(`/api/guest/${code}/push-subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription: subscription.toJSON() }),
      });
      setStatus(res.ok ? "subscribed" : "error");
    } catch {
      setStatus("error");
    }
  }

  async function disable() {
    const reg = await navigator.serviceWorker.ready;
    const subscription = await reg.pushManager.getSubscription();
    if (subscription) {
      await fetch(`/api/guest/${code}/push-subscribe`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: subscription.endpoint }),
      });
      await subscription.unsubscribe();
    }
    setStatus("idle");
  }

  if (status === "checking" || status === "unsupported" || status === "denied") return null;

  if (status === "ios-hint") {
    return (
      <div className="mx-5 mt-4 p-3 bg-cream border border-border-warm rounded-lg text-xs text-foreground/80">
        Add Entrevow to your Home Screen (Share → Add to Home Screen) to get notified about updates.
      </div>
    );
  }

  if (status === "subscribed") {
    return (
      <div className="mx-5 mt-4 p-3 bg-cream border border-border-warm rounded-lg flex items-center justify-between gap-3">
        <span className="text-xs text-foreground/80">Notifications are on</span>
        <button onClick={disable} className="text-brand text-sm font-medium whitespace-nowrap">
          Turn off
        </button>
      </div>
    );
  }

  return (
    <div className="mx-5 mt-4 p-3 bg-cream border border-border-warm rounded-lg flex items-center justify-between gap-3">
      <span className="text-xs text-foreground/80">Get notified about updates</span>
      <button
        onClick={enable}
        disabled={status === "requesting"}
        className="text-brand text-sm font-medium whitespace-nowrap disabled:opacity-60"
      >
        {status === "requesting" ? "Enabling…" : "Enable"}
      </button>
    </div>
  );
}
