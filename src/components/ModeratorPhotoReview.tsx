"use client";

import { useState } from "react";
import { Photo } from "@/types/photo";
import { publicStorageUrl } from "@/lib/storage-url";

export default function ModeratorPhotoReview({
  moderatorCode,
  initialPhotos,
}: {
  moderatorCode: string;
  initialPhotos: Photo[];
}) {
  const [photos, setPhotos] = useState(initialPhotos);

  const visible = photos.filter((p) => !p.hidden);
  const hidden = photos.filter((p) => p.hidden);

  async function handleToggleHidden(photoId: number, hidden: boolean) {
    setPhotos((prev) => prev.map((p) => (p.id === photoId ? { ...p, hidden } : p)));

    const res = await fetch(`/api/moderator/${moderatorCode}/photos/${photoId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hidden }),
    });
    if (!res.ok) {
      setPhotos((prev) => prev.map((p) => (p.id === photoId ? { ...p, hidden: !hidden } : p)));
    }
  }

  if (photos.length === 0) {
    return null;
  }

  return (
    <div className="mt-10">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground/50 mb-3">
        Photo gallery ({visible.length} visible{hidden.length > 0 ? `, ${hidden.length} hidden` : ""})
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {photos.map((p) => (
          <div
            key={p.id}
            className={`rounded-lg overflow-hidden bg-white border border-border-warm shadow-sm ${p.hidden ? "opacity-60" : ""}`}
          >
            <img
              src={publicStorageUrl("photos", p.blob_key)}
              alt={p.caption ?? `Photo by ${p.guest_name}`}
              className="w-full aspect-square object-cover bg-cream"
            />
            <div className="px-3 py-2.5">
              <div className="text-xs text-foreground/60 truncate mb-2">{p.guest_name}</div>
              <button
                onClick={() => handleToggleHidden(p.id, !p.hidden)}
                className="text-xs font-semibold text-brand"
              >
                {p.hidden ? "Unhide" : "Hide"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
