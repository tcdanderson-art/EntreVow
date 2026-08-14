"use client";

import { useState } from "react";
import { CrewBroadcast, CrewRole } from "@/types/crew-broadcast";

const ROLE_LABELS: Record<CrewRole, string> = {
  staff: "Ushers (door check-in)",
  driver: "Drivers",
  vendor: "Vendors",
};
const ALL_ROLES: CrewRole[] = ["staff", "driver", "vendor"];

export default function CrewBroadcastManager({
  weddingId,
  initialBroadcasts,
}: {
  weddingId: number;
  initialBroadcasts: CrewBroadcast[];
}) {
  const [broadcasts, setBroadcasts] = useState(initialBroadcasts);
  const [message, setMessage] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<CrewRole[]>(ALL_ROLES);
  const [loading, setLoading] = useState(false);

  function toggleRole(role: CrewRole) {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  }

  async function handlePost(e: React.FormEvent) {
    e.preventDefault();
    if (selectedRoles.length === 0) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/weddings/${weddingId}/crew-broadcasts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, roles: selectedRoles }),
      });
      const data = await res.json();
      if (res.ok) {
        setBroadcasts((prev) => [data.broadcast, ...prev]);
        setMessage("");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Remove this update? Crew will stop seeing it.")) return;

    const res = await fetch(`/api/weddings/${weddingId}/crew-broadcasts/${id}`, {
      method: "DELETE",
    });
    if (res.ok) setBroadcasts((prev) => prev.filter((b) => b.id !== id));
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-foreground/80">
        Message your day-of crew directly — ushers, drivers, and vendors each see this on their
        own check-in/tracking page, separate from guest announcements.
      </p>

      {broadcasts.length > 0 && (
        <ul className="flex flex-col gap-2">
          {broadcasts.map((b) => (
            <li
              key={b.id}
              className="flex items-start justify-between gap-3 border border-border-warm rounded-md px-3 py-2 text-sm"
            >
              <div>
                <p>{b.message}</p>
                <p className="text-xs text-foreground/75 mt-0.5">
                  visible to: {b.roles.map((r) => ROLE_LABELS[r]).join(", ")}
                </p>
              </div>
              <button
                onClick={() => handleDelete(b.id)}
                className="text-red-600 font-medium whitespace-nowrap"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handlePost} className="flex flex-col gap-2">
        <label htmlFor="crew-broadcast-message" className="sr-only">Message</label>
        <textarea
          id="crew-broadcast-message"
          placeholder="e.g. Ceremony delayed 15 min — hold shuttle at the hotel."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          rows={2}
          className="border border-border-warm rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 resize-none"
        />

        <div className="flex items-center gap-3 flex-wrap text-sm">
          <span className="text-foreground/80">Visible to:</span>
          {ALL_ROLES.map((role) => (
            <label key={role} className="flex items-center gap-1.5">
              <input
                type="checkbox"
                checked={selectedRoles.includes(role)}
                onChange={() => toggleRole(role)}
              />
              {ROLE_LABELS[role]}
            </label>
          ))}
        </div>

        <button
          type="submit"
          disabled={loading || selectedRoles.length === 0}
          className="self-start bg-brand text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-brand-hover transition-colors disabled:opacity-60"
        >
          {loading ? "Sending…" : "Send update"}
        </button>
      </form>
    </div>
  );
}
