"use client";

import { useState } from "react";
import { Guest, RsvpStatus } from "@/types/guest";
import { formatWallClockTime } from "@/lib/wall-clock";

const RSVP_LABEL: Record<RsvpStatus, string> = {
  pending: "Pending",
  attending: "Attending",
  declined: "Declined",
};

const RSVP_COLOR: Record<RsvpStatus, string> = {
  pending: "text-foreground/70",
  attending: "text-brand",
  declined: "text-red-600",
};

export default function GuestRow({
  weddingId,
  weddingSlug,
  guest,
  mealOptions,
  onUpdate,
  onDelete,
}: {
  weddingId: number;
  weddingSlug: string | null;
  guest: Guest;
  mealOptions: string[];
  onUpdate: (guest: Guest) => void;
  onDelete: (id: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(guest.name);
  const [guestGroup, setGuestGroup] = useState(guest.guest_group);
  const [rsvpStatus, setRsvpStatus] = useState<RsvpStatus>(guest.rsvp_status);
  const [tableLabel, setTableLabel] = useState(guest.table_label ?? "");
  const [email, setEmail] = useState(guest.email ?? "");
  const [plusOneAllowed, setPlusOneAllowed] = useState(guest.plus_one_allowed);
  const [mealChoice, setMealChoice] = useState(guest.meal_choice ?? "");
  const [songRequest, setSongRequest] = useState(guest.song_request ?? "");
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

  function linkFor() {
    const origin = weddingSlug ? `https://${weddingSlug}.entrevow.com` : window.location.origin;
    return `${origin}/g/${guest.access_code}`;
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
      body: JSON.stringify({
        name,
        guestGroup,
        rsvpStatus,
        tableLabel,
        email,
        plusOneAllowed,
        mealChoice,
        songRequest,
      }),
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

  async function handleInvite() {
    setInviteError(null);
    setInviting(true);

    const res = await fetch(`/api/weddings/${weddingId}/guests/${guest.id}/invite`, {
      method: "POST",
    });
    const data = await res.json();

    setInviting(false);
    if (res.ok) {
      onUpdate(data.guest);
    } else {
      setInviteError(data.error ?? "Failed to send invite");
    }
  }

  if (editing) {
    return (
      <li className="border border-border-warm rounded-md px-3 py-2 text-sm">
        <form onSubmit={handleSave} className="flex gap-2 flex-wrap">
          <label htmlFor={`guest-name-${guest.id}`} className="sr-only">Guest name</label>
          <input
            id={`guest-name-${guest.id}`}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="flex-1 min-w-[120px] border border-border-warm rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
          <label htmlFor={`guest-group-${guest.id}`} className="sr-only">Guest group</label>
          <input
            id={`guest-group-${guest.id}`}
            type="text"
            value={guestGroup}
            onChange={(e) => setGuestGroup(e.target.value)}
            className="flex-1 min-w-[140px] border border-border-warm rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
          <label htmlFor={`guest-rsvp-${guest.id}`} className="sr-only">RSVP status</label>
          <select
            id={`guest-rsvp-${guest.id}`}
            value={rsvpStatus}
            onChange={(e) => setRsvpStatus(e.target.value as RsvpStatus)}
            className="border border-border-warm rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
          >
            <option value="pending">Pending</option>
            <option value="attending">Attending</option>
            <option value="declined">Declined</option>
          </select>
          <label htmlFor={`guest-table-${guest.id}`} className="sr-only">Table</label>
          <input
            id={`guest-table-${guest.id}`}
            type="text"
            placeholder="Table (e.g. Table 5)"
            value={tableLabel}
            onChange={(e) => setTableLabel(e.target.value)}
            className="flex-1 min-w-[120px] border border-border-warm rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
          <label htmlFor={`guest-email-${guest.id}`} className="sr-only">Guest email</label>
          <input
            id={`guest-email-${guest.id}`}
            type="email"
            placeholder="Email (optional, for invites)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 min-w-[180px] border border-border-warm rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
          <label className="flex items-center gap-2 text-sm text-foreground/70 whitespace-nowrap">
            <input
              type="checkbox"
              checked={plusOneAllowed}
              onChange={(e) => setPlusOneAllowed(e.target.checked)}
            />
            Allow a plus-one
          </label>
          <label htmlFor={`guest-meal-${guest.id}`} className="sr-only">Meal choice</label>
          <select
            id={`guest-meal-${guest.id}`}
            value={mealChoice}
            onChange={(e) => setMealChoice(e.target.value)}
            className="border border-border-warm rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
          >
            <option value="">Meal choice</option>
            {mealOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <label htmlFor={`guest-song-${guest.id}`} className="sr-only">Song request</label>
          <input
            id={`guest-song-${guest.id}`}
            type="text"
            placeholder="Song request"
            value={songRequest}
            onChange={(e) => setSongRequest(e.target.value)}
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
            className="text-foreground/80 text-sm font-medium"
          >
            Cancel
          </button>
        </form>
      </li>
    );
  }

  return (
    <li className="flex items-center justify-between gap-3 border border-border-warm rounded-md px-3 py-2 text-sm flex-wrap">
      <span>
        {guest.name} <span className="text-foreground/75">({guest.guest_group})</span>{" "}
        <span className={`font-medium ${RSVP_COLOR[guest.rsvp_status]}`}>
          · {RSVP_LABEL[guest.rsvp_status]}
        </span>
        {guest.table_label && (
          <span className="text-foreground/75"> · {guest.table_label}</span>
        )}
        {guest.checked_in_at && (
          <span className="text-brand font-medium"> · ✓ Checked in</span>
        )}
        {guest.invite_sent_at && (
          <span className="text-foreground/70"> · invited</span>
        )}
        {guest.plus_one_name ? (
          <span className="text-foreground/75"> · +{guest.plus_one_name}</span>
        ) : (
          guest.plus_one_allowed && <span className="text-foreground/70"> · plus-one allowed</span>
        )}
        {guest.meal_choice && (
          <span className="text-foreground/75"> · {guest.meal_choice}</span>
        )}
        {guest.kids_meal_count > 0 && (
          <span className="text-foreground/75">
            {" "}
            · {guest.kids_meal_count} kids&apos; meal{guest.kids_meal_count === 1 ? "" : "s"}
          </span>
        )}
        {guest.song_request && (
          <span className="text-foreground/75"> · 🎵 {guest.song_request}</span>
        )}
        {guest.flight_number && (
          <span className="text-foreground/75">
            {" "}
            · ✈ {guest.flight_number}
            {guest.arrival_time &&
              ` (${formatWallClockTime(guest.arrival_time, { dateStyle: "medium", timeStyle: "short" })})`}
          </span>
        )}
        {guest.rsvp_note && (
          <span className="block text-xs text-foreground/75 mt-0.5">“{guest.rsvp_note}”</span>
        )}
        {inviteError && <span className="block text-xs text-red-600 mt-0.5">{inviteError}</span>}
      </span>
      <span className="flex items-center gap-3 whitespace-nowrap">
        {guest.email && (
          <button onClick={handleInvite} disabled={inviting} className="text-brand font-medium disabled:opacity-60">
            {inviting ? "Sending…" : guest.invite_sent_at ? "Resend invite" : "Send invite"}
          </button>
        )}
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
