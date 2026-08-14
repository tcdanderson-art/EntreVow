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
  const [zipParts, setZipParts] = useState<number[] | null>(null);
  const [zipBusy, setZipBusy] = useState<"preparing" | number | null>(null);
  const [zipError, setZipError] = useState<string | null>(null);

  async function downloadBlob(url: string, filename: string) {
    const res = await fetch(url);
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      throw new Error(data?.error ?? "Could not download");
    }
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(objectUrl);
  }

  async function handleDownloadAll() {
    setZipError(null);
    setZipBusy("preparing");
    try {
      const res = await fetch(`/api/weddings/${weddingId}/photos/download-all`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Could not prepare download");

      if (data.parts <= 1) {
        setZipBusy(1);
        await downloadBlob(`/api/weddings/${weddingId}/photos/download-all?part=1`, `wedding-${weddingId}-photos.zip`);
        setZipBusy(null);
      } else {
        setZipParts(Array.from({ length: data.parts }, (_, i) => i + 1));
        setZipBusy(null);
      }
    } catch (err) {
      setZipError(err instanceof Error ? err.message : "Could not prepare download");
      setZipBusy(null);
    }
  }

  async function handleDownloadPart(part: number) {
    setZipError(null);
    setZipBusy(part);
    try {
      const filename = zipParts && zipParts.length > 1
        ? `wedding-${weddingId}-photos-part-${part}-of-${zipParts.length}.zip`
        : `wedding-${weddingId}-photos.zip`;
      await downloadBlob(`/api/weddings/${weddingId}/photos/download-all?part=${part}`, filename);
    } catch (err) {
      setZipError(err instanceof Error ? err.message : "Could not download this part");
    } finally {
      setZipBusy(null);
    }
  }

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
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={handleDownloadAll}
          disabled={zipBusy !== null}
          className="text-sm font-medium text-brand disabled:opacity-60"
        >
          {zipBusy === "preparing" ? "Preparing…" : "Download all photos"}
        </button>
        {zipParts && zipParts.length > 1 && (
          <span className="text-xs text-foreground/70">
            {zipParts.length} zip files — download each part below
          </span>
        )}
      </div>
      {zipParts && zipParts.length > 1 && (
        <div className="flex items-center gap-3 flex-wrap">
          {zipParts.map((part) => (
            <button
              key={part}
              onClick={() => handleDownloadPart(part)}
              disabled={zipBusy !== null}
              className="text-sm font-medium text-brand disabled:opacity-60"
            >
              {zipBusy === part ? `Downloading part ${part}…` : `Part ${part} of ${zipParts.length}`}
            </button>
          ))}
        </div>
      )}
      {zipError && <p className="text-sm text-red-600">{zipError}</p>}

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
                <a
                  href={publicStorageUrl("photos", p.blob_key, {
                    download: `${p.guest_name}-${p.id}.${p.blob_key.split(".").pop() || "jpg"}`,
                  })}
                  className="text-[11px] text-white font-medium"
                >
                  Download
                </a>
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
    </div>
  );
}
