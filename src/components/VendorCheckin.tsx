"use client";

import { useState } from "react";
import CrewBroadcastFeed from "@/components/CrewBroadcastFeed";

export default function VendorCheckin({
  vendorCode,
  vendorName,
  vendorCategory,
  weddingTitle,
  initialCheckedInAt,
}: {
  vendorCode: string;
  vendorName: string;
  vendorCategory: string;
  weddingTitle: string;
  initialCheckedInAt: string | null;
}) {
  const [checkedInAt, setCheckedInAt] = useState(initialCheckedInAt);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function checkin() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/vendor/${vendorCode}/checkin`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong — try again");
        return;
      }
      setCheckedInAt(data.vendor.checked_in_at);
    } catch {
      setError("Network error — try again");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex-1 flex flex-col bg-foreground text-white min-h-dvh pb-[env(safe-area-inset-bottom)]">
      <CrewBroadcastFeed endpoint={`/api/vendor/${vendorCode}/broadcasts`} />

      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <p className="text-sm text-white/60">{weddingTitle}</p>
        <h1 className="font-display text-2xl mt-1">{vendorName}</h1>
        <p className="text-sm text-white/60 mt-0.5">{vendorCategory}</p>

        {checkedInAt ? (
          <>
            <div className="mt-8 w-full max-w-xs rounded-full py-4 text-base font-semibold bg-brand/20 text-brand border border-brand/40">
              ✓ Checked in
            </div>
            <p className="text-sm text-white/60 mt-6 max-w-xs">
              Thanks — the couple can see you&apos;ve arrived.
            </p>
          </>
        ) : (
          <>
            <button
              onClick={checkin}
              disabled={loading}
              className="mt-8 w-full max-w-xs rounded-full py-4 text-base font-semibold touch-manipulation bg-brand text-white disabled:opacity-60"
            >
              {loading ? "Checking in…" : "I've arrived"}
            </button>
            <p className="text-sm text-white/60 mt-6 max-w-xs">
              Tap once you&apos;re on site — the couple&apos;s day-of coordinator will see it instantly.
            </p>
          </>
        )}

        {error && <p className="text-sm text-red-400 mt-4 max-w-xs">{error}</p>}
      </div>
    </div>
  );
}
