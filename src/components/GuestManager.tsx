"use client";

import { useState } from "react";
import { Guest } from "@/types/guest";

export default function GuestManager({
  weddingId,
  initialGuests,
}: {
  weddingId: number;
  initialGuests: Guest[];
}) {
  const [guests, setGuests] = useState(initialGuests);
  const [name, setName] = useState("");
  const [guestGroup, setGuestGroup] = useState("general");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch(`/api/weddings/${weddingId}/guests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, guestGroup }),
    });
    const data = await res.json();

    setLoading(false);
    if (res.ok) {
      setGuests((prev) => [...prev, data.guest]);
      setName("");
    }
  }

  function linkFor(guest: Guest) {
    return `${window.location.origin}/g/${guest.access_code}`;
  }

  async function copyLink(guest: Guest) {
    await navigator.clipboard.writeText(linkFor(guest));
    setCopiedId(guest.id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  return (
    <div className="flex flex-col gap-4">
      {guests.length > 0 && (
        <ul className="flex flex-col gap-2">
          {guests.map((guest) => (
            <li
              key={guest.id}
              className="flex items-center justify-between gap-3 border border-border-warm rounded-md px-3 py-2 text-sm"
            >
              <span>
                {guest.name}{" "}
                <span className="text-foreground/50">({guest.guest_group})</span>
              </span>
              <button
                onClick={() => copyLink(guest)}
                className="text-brand font-medium whitespace-nowrap"
              >
                {copiedId === guest.id ? "Copied!" : "Copy link"}
              </button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleAdd} className="flex gap-2 flex-wrap">
        <input
          type="text"
          placeholder="Guest name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="flex-1 min-w-[140px] border border-border-warm rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
        />
        <input
          type="text"
          placeholder="Group (e.g. vip, bridal_party, general)"
          value={guestGroup}
          onChange={(e) => setGuestGroup(e.target.value)}
          className="flex-1 min-w-[180px] border border-border-warm rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-brand text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-brand-hover transition-colors disabled:opacity-60"
        >
          {loading ? "Adding…" : "Add guest"}
        </button>
      </form>
    </div>
  );
}
