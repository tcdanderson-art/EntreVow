"use client";

import { useRef, useState } from "react";
import { Guest } from "@/types/guest";
import { parseGuestCsv } from "@/lib/csv";
import GuestRow from "@/components/GuestRow";

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
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  return (
    <div className="flex flex-col gap-4">
      {guests.length > 0 && (
        <ul className="flex flex-col gap-2">
          {guests.map((guest) => (
            <GuestRow
              key={guest.id}
              weddingId={weddingId}
              guest={guest}
              onUpdate={(updated) =>
                setGuests((prev) => prev.map((g) => (g.id === updated.id ? updated : g)))
              }
              onDelete={(id) => setGuests((prev) => prev.filter((g) => g.id !== id))}
            />
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
        <span className="text-xs text-foreground/40">columns: name, group</span>
      </div>
      {importError && <p className="text-sm text-red-600">{importError}</p>}
    </div>
  );
}
