"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import CrewBroadcastFeed from "@/components/CrewBroadcastFeed";

const MIN_UPDATE_INTERVAL_MS = 10000;

export default function DriverTracker({
  driverCode,
  shuttleLabel,
  weddingTitle,
}: {
  driverCode: string;
  shuttleLabel: string;
  weddingTitle: string;
}) {
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSentAt, setLastSentAt] = useState<number | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const lastSentRef = useRef(0);

  const sendLocation = useCallback(
    async (lat: number, lng: number) => {
      try {
        await fetch(`/api/driver/${driverCode}/location`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lat, lng }),
        });
        lastSentRef.current = Date.now();
        setLastSentAt(lastSentRef.current);
      } catch {
        // silently skip — the next position update will retry
      }
    },
    [driverCode]
  );

  useEffect(() => {
    if (!sharing) return;

    const id = navigator.geolocation.watchPosition(
      (position) => {
        setError(null);
        const now = Date.now();
        if (now - lastSentRef.current < MIN_UPDATE_INTERVAL_MS) return;
        sendLocation(position.coords.latitude, position.coords.longitude);
      },
      () => {
        setError("Location access denied — enable it in your browser settings to share your position.");
        setSharing(false);
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 20000 }
    );
    watchIdRef.current = id;

    return () => {
      navigator.geolocation.clearWatch(id);
      watchIdRef.current = null;
    };
  }, [sharing, sendLocation]);

  return (
    <div className="flex-1 flex flex-col items-center bg-foreground text-white min-h-dvh pb-[env(safe-area-inset-bottom)] text-center">
      <CrewBroadcastFeed endpoint={`/api/driver/${driverCode}/broadcasts`} />

      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <p className="text-sm text-white/60">{weddingTitle}</p>
        <h1 className="font-display text-2xl mt-1 mb-8">{shuttleLabel}</h1>

        <button
          onClick={() => {
            if (!sharing && !("geolocation" in navigator)) {
              setError("This device doesn't support location sharing.");
              return;
            }
            setError(null);
            setSharing((s) => !s);
          }}
          className={`w-full max-w-xs rounded-full py-4 text-base font-semibold touch-manipulation transition-colors ${
            sharing ? "bg-red-600 text-white" : "bg-brand text-white"
          }`}
        >
          {sharing ? "Stop sharing location" : "Start sharing location"}
        </button>

        <p className="text-sm text-white/60 mt-6 max-w-xs">
          {sharing
            ? lastSentAt
              ? "Sharing your location live — guests can see this shuttle on their map."
              : "Getting your location…"
            : "Guests won't see this shuttle move until you start sharing."}
        </p>

        {error && <p className="text-sm text-red-400 mt-4 max-w-xs">{error}</p>}

        <p className="text-xs text-white/70 mt-10 max-w-xs">
          Keep this page open while driving. Closing the tab or locking the screen stops sharing.
        </p>
      </div>
    </div>
  );
}
