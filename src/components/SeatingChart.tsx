"use client";

import { useState } from "react";
import { Guest } from "@/types/guest";
import { WeddingTable } from "@/types/table";

function seatWeight(guest: Guest): number {
  return guest.plus_one_name ? 2 : 1;
}

export default function SeatingChart({
  weddingId,
  initialTables,
  initialGuests,
}: {
  weddingId: number;
  initialTables: WeddingTable[];
  initialGuests: Guest[];
}) {
  const [tables, setTables] = useState(initialTables);
  const [guests, setGuests] = useState(initialGuests);
  const [newTableName, setNewTableName] = useState("");
  const [newTableCapacity, setNewTableCapacity] = useState("");
  const [addError, setAddError] = useState<string | null>(null);
  const [editingTableId, setEditingTableId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editCapacity, setEditCapacity] = useState("");
  const [dragOverTarget, setDragOverTarget] = useState<string | null>(null);

  const seatedGuests = guests.filter((g) => g.rsvp_status !== "declined");
  const tableNames = new Set(tables.map((t) => t.name));
  const unassigned = seatedGuests.filter((g) => !g.table_label || !tableNames.has(g.table_label));

  async function assignGuest(guest: Guest, tableLabel: string | null) {
    const res = await fetch(`/api/weddings/${weddingId}/guests/${guest.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: guest.name,
        guestGroup: guest.guest_group,
        rsvpStatus: guest.rsvp_status,
        tableLabel,
        email: guest.email,
        plusOneAllowed: guest.plus_one_allowed,
        mealChoice: guest.meal_choice,
        songRequest: guest.song_request,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setGuests((prev) => prev.map((g) => (g.id === guest.id ? data.guest : g)));
    }
  }

  function handleDrop(e: React.DragEvent, tableLabel: string | null) {
    e.preventDefault();
    setDragOverTarget(null);
    const guestId = Number(e.dataTransfer.getData("text/plain"));
    const guest = guests.find((g) => g.id === guestId);
    if (guest) assignGuest(guest, tableLabel);
  }

  async function handleAddTable(e: React.FormEvent) {
    e.preventDefault();
    setAddError(null);

    const res = await fetch(`/api/weddings/${weddingId}/tables`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newTableName,
        capacity: newTableCapacity ? Number(newTableCapacity) : null,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setTables((prev) => [...prev, data.table]);
      setNewTableName("");
      setNewTableCapacity("");
    } else {
      setAddError(data.error ?? "Failed to add table");
    }
  }

  function startEditing(table: WeddingTable) {
    setEditingTableId(table.id);
    setEditName(table.name);
    setEditCapacity(table.capacity != null ? String(table.capacity) : "");
  }

  async function handleSaveTable(table: WeddingTable) {
    const res = await fetch(`/api/weddings/${weddingId}/tables/${table.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editName,
        capacity: editCapacity ? Number(editCapacity) : null,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      const renamed = table.name !== data.table.name;
      setTables((prev) => prev.map((t) => (t.id === table.id ? data.table : t)));
      if (renamed) {
        setGuests((prev) =>
          prev.map((g) => (g.table_label === table.name ? { ...g, table_label: data.table.name } : g))
        );
      }
      setEditingTableId(null);
    }
  }

  async function handleDeleteTable(table: WeddingTable) {
    if (!confirm(`Delete "${table.name}"? Assigned guests will become unassigned.`)) return;

    const res = await fetch(`/api/weddings/${weddingId}/tables/${table.id}`, { method: "DELETE" });
    if (res.ok) {
      setTables((prev) => prev.filter((t) => t.id !== table.id));
      setGuests((prev) =>
        prev.map((g) => (g.table_label === table.name ? { ...g, table_label: null } : g))
      );
    }
  }

  function GuestChip({ guest }: { guest: Guest }) {
    return (
      <li
        draggable
        onDragStart={(e) => e.dataTransfer.setData("text/plain", String(guest.id))}
        className="bg-cream-card border border-border-warm rounded-md px-2 py-1 text-xs cursor-grab active:cursor-grabbing whitespace-nowrap"
      >
        {guest.name}
        {guest.plus_one_name && <span className="text-foreground/50"> +1</span>}
        {guest.rsvp_status === "pending" && <span className="text-foreground/40"> (pending)</span>}
      </li>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-foreground/50">
        Drag guests onto a table. Declined guests are left out automatically.
      </p>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOverTarget("unassigned");
        }}
        onDragLeave={() => setDragOverTarget(null)}
        onDrop={(e) => handleDrop(e, null)}
        className={`border border-dashed rounded-lg p-3 ${
          dragOverTarget === "unassigned" ? "border-brand bg-cream" : "border-border-warm"
        }`}
      >
        <div className="text-xs font-semibold uppercase tracking-wide text-foreground/50 mb-2">
          Unassigned ({unassigned.length})
        </div>
        {unassigned.length === 0 ? (
          <p className="text-xs text-foreground/40">Everyone's seated.</p>
        ) : (
          <ul className="flex flex-wrap gap-1.5">
            {unassigned.map((guest) => (
              <GuestChip key={guest.id} guest={guest} />
            ))}
          </ul>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {tables.map((table) => {
          const members = seatedGuests.filter((g) => g.table_label === table.name);
          const seats = members.reduce((sum, g) => sum + seatWeight(g), 0);
          const overCapacity = table.capacity != null && seats > table.capacity;

          if (editingTableId === table.id) {
            return (
              <div key={table.id} className="border border-border-warm rounded-lg p-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 min-w-0 border border-border-warm rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
                  />
                  <input
                    type="number"
                    min={1}
                    placeholder="Cap."
                    value={editCapacity}
                    onChange={(e) => setEditCapacity(e.target.value)}
                    className="w-16 border border-border-warm rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
                  />
                </div>
                <div className="flex gap-3 mt-2 text-xs font-medium">
                  <button onClick={() => handleSaveTable(table)} className="text-brand">
                    Save
                  </button>
                  <button onClick={() => setEditingTableId(null)} className="text-foreground/60">
                    Cancel
                  </button>
                  <button onClick={() => handleDeleteTable(table)} className="text-red-600 ml-auto">
                    Delete
                  </button>
                </div>
              </div>
            );
          }

          return (
            <div
              key={table.id}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverTarget(table.name);
              }}
              onDragLeave={() => setDragOverTarget(null)}
              onDrop={(e) => handleDrop(e, table.name)}
              className={`border rounded-lg p-3 ${
                dragOverTarget === table.name ? "border-brand bg-cream" : "border-border-warm"
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-sm font-semibold">{table.name}</span>
                <span className="flex items-center gap-2">
                  <span className={`text-xs font-medium ${overCapacity ? "text-red-600" : "text-foreground/50"}`}>
                    {seats}
                    {table.capacity != null ? ` / ${table.capacity}` : ""}
                  </span>
                  <button
                    onClick={() => startEditing(table)}
                    className="text-brand text-xs font-medium"
                  >
                    Edit
                  </button>
                </span>
              </div>
              {members.length === 0 ? (
                <p className="text-xs text-foreground/40">Drop guests here</p>
              ) : (
                <ul className="flex flex-wrap gap-1.5">
                  {members.map((guest) => (
                    <GuestChip key={guest.id} guest={guest} />
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      <form onSubmit={handleAddTable} className="flex gap-2 flex-wrap border-t border-border-warm pt-3">
        <input
          type="text"
          placeholder="Table name (e.g. Table 5)"
          value={newTableName}
          onChange={(e) => setNewTableName(e.target.value)}
          required
          className="flex-1 min-w-[140px] border border-border-warm rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
        />
        <input
          type="number"
          min={1}
          placeholder="Capacity (optional)"
          value={newTableCapacity}
          onChange={(e) => setNewTableCapacity(e.target.value)}
          className="w-40 border border-border-warm rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
        />
        <button
          type="submit"
          className="bg-brand text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-brand-hover transition-colors"
        >
          Add table
        </button>
      </form>
      {addError && <p className="text-sm text-red-600">{addError}</p>}
    </div>
  );
}
