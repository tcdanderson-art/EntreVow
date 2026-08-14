"use client";

import { useState } from "react";
import { Shuttle } from "@/types/shuttle";
import { formatWallClockTime } from "@/lib/wall-clock";

function driverLinkFor(code: string) {
  return `${window.location.origin}/driver/${code}`;
}

export default function ShuttleManager({
  weddingId,
  initialShuttles,
}: {
  weddingId: number;
  initialShuttles: Shuttle[];
}) {
  const [shuttles, setShuttles] = useState(initialShuttles);
  const [label, setLabel] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [creating, setCreating] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  async function addShuttle(e: React.FormEvent) {
    e.preventDefault();
    if (!label.trim()) return;
    setCreating(true);
    try {
      const res = await fetch(`/api/weddings/${weddingId}/shuttles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: label.trim(), pickupTime: pickupTime || null }),
      });
      const data = await res.json();
      if (res.ok) {
        setShuttles((prev) => [...prev, data.shuttle]);
        setLabel("");
        setPickupTime("");
      }
    } finally {
      setCreating(false);
    }
  }

  async function removeShuttle(shuttleId: number) {
    if (!confirm("Remove this shuttle? Its driver link will stop working immediately.")) return;
    setShuttles((prev) => prev.filter((s) => s.id !== shuttleId));
    await fetch(`/api/weddings/${weddingId}/shuttles/${shuttleId}`, { method: "DELETE" });
  }

  async function copyLink(shuttle: Shuttle) {
    await navigator.clipboard.writeText(driverLinkFor(shuttle.driver_code));
    setCopiedId(shuttle.id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-1.5">
        <p className="text-sm text-foreground/80">
          Add a shuttle and send the driver link to whoever&rsquo;s driving. It opens a page on their
          phone that shares their live location — no app or account needed. Guests see the shuttle
          move on a map from their itinerary page. Set a pickup time and guests who&rsquo;ve shared
          their flight arrival will see which shuttle fits their landing time.
        </p>
        <button
          onClick={() => setShowHelp((v) => !v)}
          aria-label="How to use this"
          aria-expanded={showHelp}
          className="shrink-0 mt-0.5 w-4 h-4 rounded-full bg-cream border border-border-warm text-[10px] font-bold text-foreground/70 leading-none flex items-center justify-center hover:bg-white"
        >
          ?
        </button>
      </div>

      {showHelp && (
        <ol className="text-sm text-foreground/80 bg-cream border border-border-warm rounded-md px-4 py-3 list-decimal list-inside flex flex-col gap-1">
          <li>Add the shuttle below, then tap &ldquo;Copy link&rdquo; next to it.</li>
          <li>Send that link to the driver — text or email works.</li>
          <li>They open it on their phone and allow location sharing when asked.</li>
          <li>Guests then see the shuttle move live on their itinerary page — nothing else for the driver to do.</li>
        </ol>
      )}

      {shuttles.length > 0 && (
        <ul className="flex flex-col gap-2">
          {shuttles.map((s) => (
            <li
              key={s.id}
              className="flex items-center justify-between gap-3 flex-wrap border border-border-warm rounded-lg px-4 py-3"
            >
              <div className="min-w-[120px]">
                <div className="font-medium text-sm">{s.label}</div>
                <div className="text-xs text-foreground/75">
                  {s.pickup_time
                    ? `Departs ${formatWallClockTime(s.pickup_time, { dateStyle: "medium", timeStyle: "short" })}`
                    : "No pickup time set"}
                  {" · "}
                  {s.location_updated_at ? "Has shared location" : "Not sharing yet"}
                </div>
              </div>
              <code className="text-xs bg-cream border border-border-warm rounded-md px-3 py-2 flex-1 min-w-[160px] truncate">
                {driverLinkFor(s.driver_code)}
              </code>
              <button onClick={() => copyLink(s)} className="text-brand text-sm font-medium whitespace-nowrap">
                {copiedId === s.id ? "Copied!" : "Copy link"}
              </button>
              <button
                onClick={() => removeShuttle(s.id)}
                className="text-red-600 text-sm font-medium whitespace-nowrap"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={addShuttle} className="flex items-center gap-2 flex-wrap">
        <label htmlFor="shuttle-label" className="sr-only">Shuttle name</label>
        <input
          id="shuttle-label"
          type="text"
          placeholder="Shuttle name, e.g. Hotel A pickup"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="flex-1 min-w-[200px] border border-border-warm rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
        />
        <label htmlFor="shuttle-pickup-time" className="sr-only">Pickup time (optional)</label>
        <input
          id="shuttle-pickup-time"
          type="datetime-local"
          value={pickupTime}
          onChange={(e) => setPickupTime(e.target.value)}
          className="flex-1 min-w-[180px] border border-border-warm rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
        />
        <button
          type="submit"
          disabled={creating || !label.trim()}
          className="bg-brand text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-brand-hover transition-colors disabled:opacity-60"
        >
          {creating ? "Adding…" : "Add shuttle"}
        </button>
      </form>
    </div>
  );
}
