"use client";

import { useRef, useState } from "react";
import { Guest } from "@/types/guest";
import { parseGuestCsv, guestsToCsv } from "@/lib/csv";
import GuestRow from "@/components/GuestRow";

export default function GuestManager({
  weddingId,
  weddingSlug,
  initialGuests,
  mealOptions,
}: {
  weddingId: number;
  weddingSlug: string | null;
  initialGuests: Guest[];
  mealOptions: string[];
}) {
  const [guests, setGuests] = useState(initialGuests);
  const [search, setSearch] = useState("");
  const [name, setName] = useState("");
  const [guestGroup, setGuestGroup] = useState("general");
  const [email, setEmail] = useState("");
  const [plusOneAllowed, setPlusOneAllowed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [invitingAll, setInvitingAll] = useState(false);
  const [inviteAllResult, setInviteAllResult] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setAddError(null);

    const res = await fetch(`/api/weddings/${weddingId}/guests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, guestGroup, email, plusOneAllowed }),
    });
    const data = await res.json();

    setLoading(false);
    if (res.ok) {
      setGuests((prev) => [...prev, data.guest]);
      setName("");
      setEmail("");
      setPlusOneAllowed(false);
    } else {
      setAddError(data.error ?? "Failed to add guest");
    }
  }

  async function handleInviteAll() {
    setInvitingAll(true);
    setInviteAllResult(null);

    const res = await fetch(`/api/weddings/${weddingId}/guests/invite-all`, { method: "POST" });
    const data = await res.json();

    setInvitingAll(false);
    if (res.ok) {
      setGuests((prev) => {
        const byId = new Map(data.guests.map((g: Guest) => [g.id, g]));
        return prev.map((g) => (byId.has(g.id) ? (byId.get(g.id) as Guest) : g));
      });
      setInviteAllResult(
        data.sent === 0
          ? "No new invites to send — every guest with an email has already been invited."
          : `Sent ${data.sent} invite${data.sent === 1 ? "" : "s"}${data.failed ? `, ${data.failed} failed` : ""}.`
      );
    } else {
      setInviteAllResult(data.error ?? "Failed to send invites");
    }
  }

  async function handleCsvSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError(null);
    setImporting(true);

    const text = await file.text();
    const rows = parseGuestCsv(text);

    if (rows.length === 0) {
      setImporting(false);
      setImportError("No guest rows found in that file.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const res = await fetch(`/api/weddings/${weddingId}/guests/bulk`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guests: rows }),
    });
    const data = await res.json();

    setImporting(false);
    if (fileInputRef.current) fileInputRef.current.value = "";

    if (res.ok) {
      setGuests((prev) => [...prev, ...data.guests]);
    } else {
      setImportError(data.error ?? "Import failed");
    }
  }

  function handleExport() {
    const blob = new Blob([guestsToCsv(guests)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "guest-list.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  const attending = guests.filter((g) => g.rsvp_status === "attending").length;
  const declined = guests.filter((g) => g.rsvp_status === "declined").length;
  const pending = guests.length - attending - declined;
  const plusOnes = guests.filter((g) => g.plus_one_name).length;
  const uninvitedCount = guests.filter((g) => g.email && !g.invite_sent_at).length;

  const query = search.trim().toLowerCase();
  const filteredGuests = query
    ? guests.filter(
        (g) => g.name.toLowerCase().includes(query) || g.guest_group.toLowerCase().includes(query)
      )
    : guests;

  return (
    <div className="flex flex-col gap-4">
      {guests.length > 0 && (
        <>
          <div className="text-xs text-foreground/50">
            <span className="text-brand font-medium">{attending} attending</span>
            {" · "}
            <span className="text-red-600 font-medium">{declined} declined</span>
            {" · "}
            <span>{pending} pending</span>
            {plusOnes > 0 && (
              <>
                {" · "}
                <span>
                  {plusOnes} plus-one{plusOnes === 1 ? "" : "s"} ({attending + plusOnes} total heads)
                </span>
              </>
            )}
          </div>
          {guests.length > 5 && (
            <input
              type="text"
              placeholder="Search by name or group…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-border-warm rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
            />
          )}
          {filteredGuests.length === 0 ? (
            <p className="text-sm text-foreground/50">No guests match &ldquo;{search}&rdquo;.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {filteredGuests.map((guest) => (
                <GuestRow
                  key={guest.id}
                  weddingId={weddingId}
                  weddingSlug={weddingSlug}
                  guest={guest}
                  mealOptions={mealOptions}
                  onUpdate={(updated) =>
                    setGuests((prev) => prev.map((g) => (g.id === updated.id ? updated : g)))
                  }
                  onDelete={(id) => setGuests((prev) => prev.filter((g) => g.id !== id))}
                />
              ))}
            </ul>
          )}
        </>
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
        <input
          type="email"
          placeholder="Email (optional)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 min-w-[160px] border border-border-warm rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
        />
        <label className="flex items-center gap-2 text-sm text-foreground/70 whitespace-nowrap">
          <input
            type="checkbox"
            checked={plusOneAllowed}
            onChange={(e) => setPlusOneAllowed(e.target.checked)}
          />
          Allow a plus-one
        </label>
        <button
          type="submit"
          disabled={loading}
          className="bg-brand text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-brand-hover transition-colors disabled:opacity-60"
        >
          {loading ? "Adding…" : "Add guest"}
        </button>
      </form>
      {addError && <p className="text-sm text-red-600">{addError}</p>}

      <div className="flex items-center gap-3 border-t border-border-warm pt-3">
        <label className="text-sm font-medium text-brand cursor-pointer">
          {importing ? "Importing…" : "Import guests from CSV"}
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            onChange={handleCsvSelected}
            disabled={importing}
            className="hidden"
          />
        </label>
        <span className="text-xs text-foreground/40">columns: name, group, email</span>
      </div>
      {importError && <p className="text-sm text-red-600">{importError}</p>}

      <div className="flex items-center gap-4 flex-wrap">
        {guests.length > 0 && (
          <button
            onClick={handleExport}
            className="text-sm font-medium text-brand"
          >
            Export guest list (CSV)
          </button>
        )}
        {uninvitedCount > 0 && (
          <button
            onClick={handleInviteAll}
            disabled={invitingAll}
            className="text-sm font-medium text-brand disabled:opacity-60"
          >
            {invitingAll ? "Sending…" : `Email invites to ${uninvitedCount} guest${uninvitedCount === 1 ? "" : "s"}`}
          </button>
        )}
      </div>
      {inviteAllResult && <p className="text-sm text-foreground/60">{inviteAllResult}</p>}
    </div>
  );
}
