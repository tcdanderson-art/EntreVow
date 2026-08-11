"use client";

import { useEffect, useRef, useState } from "react";
import { Photo } from "@/types/photo";
import { compressImage } from "@/lib/compress-image";

const POLL_INTERVAL_MS = 20000;

export default function GuestPhotos({
  code,
  initialPhotos,
}: {
  code: string;
  initialPhotos: Photo[];
}) {
  const [photos, setPhotos] = useState(initialPhotos);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/guest/${code}`, { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        setPhotos(data.photos);
      } catch {
        // silently skip — will retry next interval
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [code]);

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (fileInputRef.current) fileInputRef.current.value = "";

    setError(null);
    setUploading(true);
    try {
      const compressed = await compressImage(file);
      const form = new FormData();
      form.set("photo", compressed, "photo.jpg");

      const res = await fetch(`/api/guest/${code}/photos`, { method: "POST", body: form });
      const data = await res.json();

      if (res.ok) {
        setPhotos((prev) => [data.photo, ...prev]);
      } else {
        setError(data.error ?? "Upload failed");
      }
    } catch {
      setError("Upload failed — try again");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="px-5 py-3 border-t border-border-warm">
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs font-semibold uppercase tracking-wide text-foreground/50">
          Photos
        </div>
        <label className="text-sm font-medium text-brand touch-manipulation cursor-pointer">
          {uploading ? "Uploading…" : "+ Add photo"}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelected}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {error && <p className="text-sm text-red-600 mb-2">{error}</p>}

      {photos.length === 0 ? (
        <p className="text-sm text-foreground/40">
          No photos yet — be the first to share one.
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-1.5">
          {photos.map((p) => (
            <img
              key={p.id}
              src={`/api/photos/${p.blob_key}`}
              alt={p.caption ?? `Photo by ${p.guest_name}`}
              loading="lazy"
              className="w-full aspect-square object-cover rounded-md bg-cream"
            />
          ))}
        </div>
      )}
    </div>
  );
}
