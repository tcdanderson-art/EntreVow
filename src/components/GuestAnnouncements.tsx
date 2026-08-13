"use client";

import { useEffect, useState } from "react";
import { Announcement } from "@/types/announcement";
import { publicStorageUrl } from "@/lib/storage-url";

const POLL_INTERVAL_MS = 20000;

export default function GuestAnnouncements({
  code,
  initialAnnouncements,
}: {
  code: string;
  initialAnnouncements: Announcement[];
}) {
  const [announcements, setAnnouncements] = useState(initialAnnouncements);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/guest/${code}`, { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        setAnnouncements(data.announcements);
      } catch {
        // silently skip — will retry next interval
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [code]);

  if (announcements.length === 0) return null;

  return (
    <div className="mx-5 mt-4 flex flex-col gap-2">
      {announcements.map((a) => (
        <div
          key={a.id}
          className="bg-brand/10 border border-brand/30 rounded-lg px-3 py-2 text-sm text-foreground"
        >
          {a.message}
          {a.video_key && (
            <video
              src={publicStorageUrl("videos", a.video_key)}
              controls
              playsInline
              className="w-full aspect-video rounded-md bg-black mt-2"
            />
          )}
        </div>
      ))}
    </div>
  );
}
