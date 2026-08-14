"use client";

import { useEffect, useState } from "react";
import { Photo } from "@/types/photo";
import { publicStorageUrl } from "@/lib/storage-url";

const ADVANCE_INTERVAL_MS = 7000;
const REFRESH_INTERVAL_MS = 20000;
const FADE_MS = 500;

export default function GalleryKiosk({
  code,
  weddingTitle,
  initialPhotos,
}: {
  code: string;
  weddingTitle: string;
  initialPhotos: Photo[];
}) {
  const [photos, setPhotos] = useState(initialPhotos);
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/gallery/${code}`, { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        setPhotos(data.photos);
      } catch {
        // silently skip — will retry next interval
      }
    }, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [code]);

  useEffect(() => {
    if (index >= photos.length) setIndex(0);
  }, [photos.length, index]);

  useEffect(() => {
    if (photos.length < 2) return;
    const advance = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % photos.length);
        setVisible(true);
      }, FADE_MS);
    }, ADVANCE_INTERVAL_MS);
    return () => clearInterval(advance);
  }, [photos.length]);

  const photo = photos[index];

  return (
    <div className="fixed inset-0 bg-[#1a2530] flex items-center justify-center overflow-hidden">
      {photo ? (
        <img
          key={photo.id}
          src={publicStorageUrl("photos", photo.blob_key)}
          alt={photo.caption ?? `Photo by ${photo.guest_name}`}
          className={`max-h-[90vh] max-w-[92vw] object-contain rounded-lg shadow-2xl transition-opacity ease-in-out ${
            visible ? "opacity-100" : "opacity-0"
          }`}
          style={{ transitionDuration: `${FADE_MS}ms` }}
        />
      ) : (
        <p className="text-white/70 text-lg font-medium px-8 text-center">
          Waiting for the first photo to be shared…
        </p>
      )}

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-8 pt-16 pb-6 flex items-center justify-between gap-4">
        <span className="text-white font-medium text-lg truncate">{weddingTitle}</span>
        {photo?.guest_name && (
          <span className="text-white/70 text-sm whitespace-nowrap">Shared by {photo.guest_name}</span>
        )}
      </div>
    </div>
  );
}
