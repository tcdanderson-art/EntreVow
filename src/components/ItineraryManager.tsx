"use client";

import { useState } from "react";
import { ItineraryItem } from "@/types/itinerary";
import ItineraryItemRow from "@/components/ItineraryItemRow";

export default function ItineraryManager({
  weddingId,
  initialItems,
  knownGroups,
}: {
  weddingId: number;
  initialItems: ItineraryItem[];
  knownGroups: string[];
}) {
  const [items, setItems] = useState(initialItems);
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [startTime, setStartTime] = useState("");
  const [transportInfo, setTransportInfo] = useState("");
  const [selectedGroups, setSelectedGroups] = useState<string[]>(knownGroups);
  const [loading, setLoading] = useState(false);

  function toggleGroup(group: string) {
    setSelectedGroups((prev) =>
      prev.includes(group) ? prev.filter((g) => g !== group) : [...prev, group]
    );
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch(`/api/weddings/${weddingId}/itinerary`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        location: location || null,
        startTime,
        transportInfo: transportInfo || null,
        visibleToGroups: selectedGroups,
      }),
    });
    const data = await res.json();

    setLoading(false);
    if (res.ok) {
      setItems((prev) =>
        [...prev, data.item].sort(
          (a, b) => a.start_time.localeCompare(b.start_time)
        )
      );
      setTitle("");
      setLocation("");
      setStartTime("");
      setTransportInfo("");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {items.length > 0 && (
        <ul className="flex flex-col gap-2">
          {items.map((item) => (
            <ItineraryItemRow
              key={item.id}
              weddingId={weddingId}
              item={item}
              knownGroups={knownGroups}
              onUpdate={(updated) =>
                setItems((prev) =>
                  prev
                    .map((i) => (i.id === updated.id ? updated : i))
                    .sort((a, b) => a.start_time.localeCompare(b.start_time))
                )
              }
              onDelete={(id) => setItems((prev) => prev.filter((i) => i.id !== id))}
            />
          ))}
        </ul>
      )}

      <form onSubmit={handleAdd} className="flex flex-col gap-2">
        <input
          type="text"
          placeholder="Event title (e.g. Ceremony)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="border border-border-warm rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
        />
        <div className="flex gap-2 flex-wrap">
          <input
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
            className="flex-1 min-w-[180px] border border-border-warm rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
          <input
            type="text"
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="flex-1 min-w-[140px] border border-border-warm rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
        </div>
        <input
          type="text"
          placeholder="Transport info (optional)"
          value={transportInfo}
          onChange={(e) => setTransportInfo(e.target.value)}
          className="border border-border-warm rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
        />

        <div className="flex items-center gap-3 flex-wrap text-sm">
          <span className="text-foreground/60">Visible to:</span>
          {knownGroups.map((group) => (
            <label key={group} className="flex items-center gap-1.5">
              <input
                type="checkbox"
                checked={selectedGroups.includes(group)}
                onChange={() => toggleGroup(group)}
              />
              {group}
            </label>
          ))}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="self-start bg-brand text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-brand-hover transition-colors disabled:opacity-60"
        >
          {loading ? "Adding…" : "Add to itinerary"}
        </button>
      </form>
    </div>
  );
}
