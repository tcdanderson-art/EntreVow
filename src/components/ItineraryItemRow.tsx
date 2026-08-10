"use client";

import { useState } from "react";
import { ItineraryItem } from "@/types/itinerary";

function toLocalInputValue(isoString: string) {
  const d = new Date(isoString);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function ItineraryItemRow({
  weddingId,
  item,
  knownGroups,
  onUpdate,
  onDelete,
}: {
  weddingId: number;
  item: ItineraryItem;
  knownGroups: string[];
  onUpdate: (item: ItineraryItem) => void;
  onDelete: (id: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(item.title);
  const [location, setLocation] = useState(item.location ?? "");
  const [startTime, setStartTime] = useState(toLocalInputValue(item.start_time));
  const [transportInfo, setTransportInfo] = useState(item.transport_info ?? "");
  const [selectedGroups, setSelectedGroups] = useState<string[]>(item.visible_to_groups);
  const [saving, setSaving] = useState(false);

  function toggleGroup(group: string) {
    setSelectedGroups((prev) =>
      prev.includes(group) ? prev.filter((g) => g !== group) : [...prev, group]
    );
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const res = await fetch(`/api/weddings/${weddingId}/itinerary/${item.id}`, {
      method: "PATCH",
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

    setSaving(false);
    if (res.ok) {
      onUpdate(data.item);
      setEditing(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Remove "${item.title}" from the itinerary?`)) return;

    const res = await fetch(`/api/weddings/${weddingId}/itinerary/${item.id}`, {
      method: "DELETE",
    });
    if (res.ok) onDelete(item.id);
  }

  if (editing) {
    return (
      <li className="border border-border-warm rounded-md px-3 py-2 text-sm">
        <form onSubmit={handleSave} className="flex flex-col gap-2">
          <input
            type="text"
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
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="bg-brand text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-brand-hover transition-colors disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="text-foreground/60 text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li className="border border-border-warm rounded-md px-3 py-2 text-sm">
      <div className="flex justify-between gap-3">
        <span className="font-medium">{item.title}</span>
        <span className="text-foreground/50 whitespace-nowrap">
          {new Date(item.start_time).toLocaleString(undefined, {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })}
        </span>
      </div>
      {item.location && <div className="text-foreground/60">{item.location}</div>}
      <div className="flex items-center justify-between mt-1">
        <span className="text-foreground/40 text-xs">
          visible to: {item.visible_to_groups.join(", ")}
        </span>
        <span className="flex items-center gap-3">
          <button onClick={() => setEditing(true)} className="text-brand font-medium text-xs">
            Edit
          </button>
          <button onClick={handleDelete} className="text-red-600 font-medium text-xs">
            Remove
          </button>
        </span>
      </div>
    </li>
  );
}
