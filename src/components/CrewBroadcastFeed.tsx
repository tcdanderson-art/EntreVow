"use client";

import { useEffect, useState } from "react";
import { CrewBroadcast } from "@/types/crew-broadcast";

const POLL_INTERVAL_MS = 20000;

// Shared polling feed for the staff/driver/vendor day-of crew pages — none of them
// have accounts or push subscriptions, so a short poll against a per-role endpoint
// is the simplest way for a couple's update to reach a closed-but-open tab.
export default function CrewBroadcastFeed({ endpoint }: { endpoint: string }) {
  const [broadcasts, setBroadcasts] = useState<CrewBroadcast[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch(endpoint, { cache: "no-store" });
        if (!res.ok || cancelled) return;
        const data = await res.json();
        if (!cancelled) setBroadcasts(data.broadcasts ?? []);
      } catch {
        // silently skip — will retry next interval
      }
    }

    poll();
    const interval = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [endpoint]);

  if (broadcasts.length === 0) return null;

  return (
    <div className="px-4 pt-4 flex flex-col gap-2">
      {broadcasts.map((b) => (
        <div
          key={b.id}
          className="bg-brand/15 border border-brand/40 rounded-lg px-3 py-2 text-sm text-white"
        >
          {b.message}
        </div>
      ))}
    </div>
  );
}
