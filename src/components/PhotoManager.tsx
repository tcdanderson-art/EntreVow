"use client";

import { useState } from "react";
import { Photo } from "@/types/photo";
import { publicStorageUrl } from "@/lib/storage-url";

export default function PhotoManager({
  weddingId,
  initialPhotos,
}: {
  weddingId: number;
  initialPhotos: Photo[];
}) {
  const [photos, setPhotos] = useState(initialPhotos);

  async function handleDelete(photoId: number) {
    if (!confirm("Remove this photo? This can't be undone.")) return;

    const res = await fetch(`/api/weddings/${weddingId}/photos/${photoId}`, { method: "DELETE" });
    if (res.ok) setPhotos((prev) => prev.filter((p) => p.id !== photoId));
  }

  async function handleToggleHidden(photoId: number, hidden: boolean) {
    setPhotos((prev) => prev.map((p) => (p.id === photoId ? { ...p, hidden } : p)));

    const res = await fetch(`/api/weddings/${weddingId}/photos/${photoId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hidden }),
    });
    if (!res.ok) {
      setPhotos((prev) => prev.map((p) => (p.id === photoId ? { ...p, hidden: !hidden } : p)));
    }
  }

  if (photos.length === 0) {
    return <p className="text-sm text-foreground/70">No photos shared yet.</p>;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {photos.map((p) => (
        <div key={p.id} className="relative group">
          <img
            src={publicStorageUrl("photos", p.blob_key)}
            alt={p.caption ?? `Photo by ${p.guest_name}`}
            loading="lazy"
            className={`w-full aspect-square object-cover rounded-md bg-cream ${p.hidden ? "opacity-40" : ""}`}
          />
          {p.hidden && (
            <span className="absolute top-1.5 left-1.5 text-[10px] font-semibold uppercase tracking-wide bg-black/70 text-white rounded px-1.5 py-0.5">
              Hidden
            </span>
          )}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent rounded-b-md px-2 pt-4 pb-1.5 flex items-center justify-between gap-2">
            <span className="text-[11px] text-white truncate">{p.guest_name}</span>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleToggleHidden(p.id, !p.hidden)}
                className="text-[11px] text-white font-medium"
              >
                {p.hidden ? "Unhide" : "Hide"}
              </button>
              <button
                onClick={() => handleDelete(p.id)}
                className="text-[11px] text-white font-medium"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
