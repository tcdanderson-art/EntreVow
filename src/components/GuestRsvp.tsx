"use client";

import { useState } from "react";
import { Guest, RsvpStatus } from "@/types/guest";

export default function GuestRsvp({
  code,
  initialGuest,
  mealOptions,
}: {
  code: string;
  initialGuest: Guest;
  mealOptions: string[];
}) {
  const [guest, setGuest] = useState(initialGuest);
  const [editing, setEditing] = useState(guest.rsvp_status === "pending");
  const [note, setNote] = useState(guest.rsvp_note ?? "");
  const [plusOneName, setPlusOneName] = useState(guest.plus_one_name ?? "");
  const [mealChoice, setMealChoice] = useState(guest.meal_choice ?? "");
  const [songRequest, setSongRequest] = useState(guest.song_request ?? "");
  const [saving, setSaving] = useState<RsvpStatus | null>(null);

  async function respond(status: RsvpStatus) {
    setSaving(status);
    const res = await fetch(`/api/guest/${code}/rsvp`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, note, plusOneName, mealChoice, songRequest }),
    });
    const data = await res.json();
    setSaving(null);
    if (res.ok) {
      setGuest(data.guest);
      setEditing(false);
    }
  }

  if (!editing) {
    return (
      <div className="mx-5 mt-4 mb-2 p-3 bg-cream border border-border-warm rounded-lg flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-foreground/50">RSVP</div>
          <div className={`text-sm font-semibold ${guest.rsvp_status === "attending" ? "text-brand" : "text-foreground/70"}`}>
            {guest.rsvp_status === "attending" ? "You're attending 🎉" : "You can't make it"}
          </div>
          {guest.plus_one_name && (
            <div className="text-xs text-foreground/60 mt-0.5">+ {guest.plus_one_name}</div>
          )}
          {guest.meal_choice && (
            <div className="text-xs text-foreground/60 mt-0.5">Meal: {guest.meal_choice}</div>
          )}
        </div>
        <button onClick={() => setEditing(true)} className="text-brand text-sm font-medium whitespace-nowrap">
          Change
        </button>
      </div>
    );
  }

  return (
    <div className="mx-5 mt-4 mb-2 p-3 bg-cream border border-border-warm rounded-lg flex flex-col gap-3">
      <div className="text-xs font-semibold uppercase tracking-wide text-foreground/50">
        Will you be there?
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => respond("attending")}
          disabled={saving !== null}
          className="flex-1 bg-brand text-white rounded-md px-3 py-2 text-sm font-medium hover:bg-brand-hover transition-colors disabled:opacity-60"
        >
          {saving === "attending" ? "Saving…" : "I'll be there"}
        </button>
        <button
          onClick={() => respond("declined")}
          disabled={saving !== null}
          className="flex-1 border border-border-warm rounded-md px-3 py-2 text-sm font-medium hover:bg-white transition-colors disabled:opacity-60"
        >
          {saving === "declined" ? "Saving…" : "Can't make it"}
        </button>
      </div>
      {guest.plus_one_allowed && (
        <input
          type="text"
          placeholder="Bringing a plus-one? Their name (optional)"
          value={plusOneName}
          onChange={(e) => setPlusOneName(e.target.value)}
          className="border border-border-warm rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
        />
      )}
      <select
        value={mealChoice}
        onChange={(e) => setMealChoice(e.target.value)}
        className="border border-border-warm rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
      >
        <option value="">Meal choice (optional)</option>
        {mealOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <input
        type="text"
        placeholder="Song request (optional)"
        value={songRequest}
        onChange={(e) => setSongRequest(e.target.value)}
        className="border border-border-warm rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
      />
      <input
        type="text"
        placeholder="Note for the couple (optional, e.g. dietary needs)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="border border-border-warm rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
      />
    </div>
  );
}
