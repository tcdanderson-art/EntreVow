"use client";

import { useState } from "react";

// The installed home-screen PWA has no browser chrome, so there's no reload
// button if the service worker ever gets stuck serving a stale cached page
// after a deploy. This clears its cache and re-registers it from scratch.
export default function GuestRefreshLink() {
  const [refreshing, setRefreshing] = useState(false);

  async function handleRefresh() {
    setRefreshing(true);
    try {
      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((key) => caches.delete(key)));
      }
      if ("serviceWorker" in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((r) => r.unregister()));
      }
    } finally {
      window.location.reload();
    }
  }

  return (
    <div className="text-center py-3 border-t border-border-warm bg-cream-card">
      <button
        onClick={handleRefresh}
        disabled={refreshing}
        className="text-xs text-foreground/40 hover:text-foreground/60 transition-colors disabled:opacity-60"
      >
        {refreshing ? "Refreshing…" : "Not seeing the latest updates? Refresh"}
      </button>
    </div>
  );
}
