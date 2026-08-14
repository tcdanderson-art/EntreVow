"use client";

import { useState } from "react";
import { Video } from "@/types/video";
import { publicStorageUrl } from "@/lib/storage-url";

export default function ModeratorVideoReview({
  moderatorCode,
  weddingTitle,
  initialVideos,
  children,
}: {
  moderatorCode: string;
  weddingTitle: string;
  initialVideos: Video[];
  children?: React.ReactNode;
}) {
  const [videos, setVideos] = useState(initialVideos);

  const pending = videos.filter((v) => v.status === "pending");
  const approved = videos.filter((v) => v.status === "approved");

  async function handleModerate(videoId: number, status: "approved" | "rejected") {
    // Update locally right away so the guest's name stays attached to the card —
    // the API response doesn't carry it back (it's joined in, not a column).
    setVideos((prev) => prev.map((v) => (v.id === videoId ? { ...v, status } : v)));

    const res = await fetch(`/api/moderator/${moderatorCode}/videos/${videoId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      // Revert on failure
      setVideos((prev) => prev.map((v) => (v.id === videoId ? { ...v, status: "pending" } : v)));
    }
  }

  return (
    <div className="flex flex-col min-h-full bg-cream">
      <header className="px-4 sm:px-10 py-6 max-w-3xl mx-auto w-full">
        <h1 className="font-display text-2xl text-foreground">{weddingTitle}</h1>
        <p className="text-sm text-foreground/80 mt-1">
          Guestbook &amp; photo review — no account needed, just this link.
        </p>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-10 pb-16">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground/75 mb-3">
            Awaiting approval ({pending.length})
          </h2>
          {pending.length === 0 ? (
            <p className="text-sm text-foreground/70">Nothing waiting on you right now.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {pending.map((v) => (
                <div key={v.id} className="rounded-lg overflow-hidden bg-white border border-border-warm shadow-sm">
                  <video
                    src={publicStorageUrl("videos", v.storage_key)}
                    controls
                    playsInline
                    className="w-full aspect-video bg-black"
                  />
                  <div className="px-3 py-2.5">
                    <div className="text-xs text-foreground/80 truncate mb-2">{v.guest_name}</div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleModerate(v.id, "approved")}
                        className="text-xs font-semibold text-brand"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleModerate(v.id, "rejected")}
                        className="text-xs font-medium text-foreground/75"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {approved.length > 0 && (
          <div className="mt-10">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground/75 mb-3">
              Already approved ({approved.length})
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {approved.map((v) => (
                <div key={v.id} className="rounded-lg overflow-hidden bg-white border border-border-warm shadow-sm opacity-75">
                  <video
                    src={publicStorageUrl("videos", v.storage_key)}
                    controls
                    playsInline
                    className="w-full aspect-video bg-black"
                  />
                  <div className="px-3 py-2.5 text-xs text-foreground/80 truncate">{v.guest_name}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {children}
      </main>
    </div>
  );
}
