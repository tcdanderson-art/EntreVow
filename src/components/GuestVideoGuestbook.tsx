"use client";

import { useEffect, useState } from "react";
import { Video } from "@/types/video";
import { publicStorageUrl } from "@/lib/storage-url";
import { supabaseBrowser } from "@/lib/supabase-browser";
import VideoRecorder from "@/components/VideoRecorder";

const MAX_BYTES = 40 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["video/webm", "video/mp4"]);
const POLL_INTERVAL_MS = 20000;

export default function GuestVideoGuestbook({
  code,
  initialVideos,
}: {
  code: string;
  initialVideos: Video[];
}) {
  const [videos, setVideos] = useState(initialVideos);
  const [recording, setRecording] = useState(false);
  const [recorderKey, setRecorderKey] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/guest/${code}`, { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        setVideos(data.videos);
      } catch {
        // silently skip — will retry next interval
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [code]);

  function startRecording() {
    setRecorderKey((k) => k + 1);
    setRecording(true);
    setSubmitted(false);
    setError(null);
  }

  async function handleSubmit(blob: Blob, durationSeconds: number) {
    setError(null);

    if (blob.size > MAX_BYTES) {
      setError("Recording is too large — try a shorter clip");
      return;
    }
    const contentType = ALLOWED_TYPES.has(blob.type) ? blob.type : "video/webm";

    setSubmitting(true);
    try {
      const mintRes = await fetch(`/api/guest/${code}/videos/upload-url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentType, size: blob.size }),
      });
      const mintData = await mintRes.json();
      if (!mintRes.ok) {
        setError(mintData.error ?? "Upload failed");
        return;
      }

      const { error: uploadError } = await supabaseBrowser()
        .storage.from("videos")
        .uploadToSignedUrl(mintData.path, mintData.token, blob, { contentType });
      if (uploadError) {
        setError("Upload failed — try again");
        return;
      }

      const res = await fetch(`/api/guest/${code}/videos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storage_key: mintData.path, duration_seconds: durationSeconds }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Upload failed");
        return;
      }

      setRecording(false);
      setSubmitted(true);
    } catch {
      setError("Upload failed — try again");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="px-5 py-3 border-t border-border-warm">
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs font-semibold uppercase tracking-wide text-foreground/50">
          Video Guestbook
        </div>
        {!recording && (
          <button onClick={startRecording} className="text-sm font-medium text-brand touch-manipulation">
            + Record a message
          </button>
        )}
      </div>

      {error && <p className="text-sm text-red-600 mb-2">{error}</p>}

      {submitted && (
        <p className="text-sm text-foreground/60 mb-2">
          Thanks! Your video is awaiting the couple&apos;s approval.
        </p>
      )}

      {recording && (
        <div className="mb-3">
          <VideoRecorder
            key={recorderKey}
            onSubmit={handleSubmit}
            onRetake={() => setRecorderKey((k) => k + 1)}
            onCancel={() => setRecording(false)}
            submitting={submitting}
          />
        </div>
      )}

      {videos.length === 0 ? (
        <p className="text-sm text-foreground/40">No video messages yet — be the first to leave one.</p>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {videos.map((v) => (
            <div key={v.id} className="rounded-md overflow-hidden bg-cream">
              <video
                src={publicStorageUrl("videos", v.storage_key)}
                controls
                playsInline
                className="w-full aspect-video object-cover bg-black"
              />
              <div className="px-1.5 py-1 text-[11px] text-foreground/60 truncate">{v.guest_name}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
