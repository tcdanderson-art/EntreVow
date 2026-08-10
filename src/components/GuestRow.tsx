"use client";

import { useState } from "react";
import { Guest } from "@/types/guest";

export default function GuestRow({
  weddingId,
  guest,
  onUpdate,
  onDelete,
}: {
  weddingId: number;
  guest: Guest;
  onUpdate: (guest: Guest) => void;
  onDelete: (id: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(guest.name);
  const [guestGroup, setGuestGroup] = useState(guest.guest_group);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  function linkFor() {
    return `${window.location.origin}/g/${guest.access_code}`;
  }

  async function copyLink() {
    await navigator.clipboard.writeText(linkFor());
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const res = await fetch(`/api/weddings/${weddingId}/guests/${guest.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, guestGroup }),
    });
    const data = await res.json();

    setSaving(false);
    if (res.ok) {
      onUpdate(data.guest);
      setEditing(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Remove ${guest.name}? Their link will stop working.`)) return;

    const res = await fetch(`/api/weddings/${weddingId}/guests/${guest.id}`, { method: "DELETE" });
    if (res.ok) onDelete(guest.id);
  }

  if (editing) {
    return (
      <li className="border border-border-warm rounded-md px-3 py-2 text-sm">
        <form onSubmit={handleSave} className="flex gap-2 flex-wrap">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="flex-1 min-w-[120px] border border-border-warm rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
          <input
            type="text"
            value={guestGroup}
            onChange={(e) => setGuestGroup(e.target.value)}
            className="flex-1 min-w-[140px] border border-border-warm rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
          <button
            type="submit"
            disabled={saving}
            className="bg-brand text-white rounded-md px-3 py-2 text-sm font-medium hover:bg-brand-hover transition-colors disabled:opacity-60"
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
        </form>
      </li>
    );
  }

  return (
    <li className="flex items-center justify-between gap-3 border border-border-warm rounded-md px-3 py-2 text-sm">
      <span>
        {guest.name} <span className="text-foreground/50">({guest.guest_group})</span>
      </span>
      <span className="flex items-center gap-3 whitespace-nowrap">
        <button onClick={copyLink} className="text-brand font-medium">
          {copied ? "Copied!" : "Copy link"}
        </button>
        <button onClick={() => setEditing(true)} className="text-brand font-medium">
          Edit
        </button>
        <button onClick={handleDelete} className="text-red-600 font-medium">
          Remove
        </button>
      </span>
    </li>
  );
}
