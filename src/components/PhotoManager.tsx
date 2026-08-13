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

  if (photos.length === 0) {
    return <p className="text-sm text-foreground/40">No photos shared yet.</p>;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {photos.map((p) => (
        <div key={p.id} className="relative group">
          <img
            src={publicStorageUrl("photos", p.blob_key)}
            alt={p.caption ?? `Photo by ${p.guest_name}`}
            loading="lazy"
            className="w-full aspect-square object-cover rounded-md bg-cream"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent rounded-b-md px-2 pt-4 pb-1.5 flex items-center justify-between gap-2">
            <span className="text-[11px] text-white truncate">{p.guest_name}</span>
            <button
              onClick={() => handleDelete(p.id)}
              className="text-[11px] text-white font-medium shrink-0"
            >
              Remove
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
