"use client";

import { useEffect, useState } from "react";
import { Video } from "@/types/video";
import { publicStorageUrl } from "@/lib/storage-url";
import { supabaseBrowser } from "@/lib/supabase-browser";
import VideoRecorder from "@/components/VideoRecorder";
import AudioRecorder from "@/components/AudioRecorder";

const MAX_BYTES = 40 * 1024 * 1024;
const VIDEO_TYPES = new Set(["video/webm", "video/mp4"]);
const AUDIO_TYPES = new Set(["audio/webm", "audio/mp4", "audio/mpeg"]);
const POLL_INTERVAL_MS = 20000;

type RecordingMode = "video" | "audio" | null;

export default function GuestVideoGuestbook({
  code,
  initialVideos,
}: {
  code: string;
  initialVideos: Video[];
}) {
  const [videos, setVideos] = useState(initialVideos);
  const [recording, setRecording] = useState<RecordingMode>(null);
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

  function startRecording(mode: RecordingMode) {
    setRecorderKey((k) => k + 1);
    setRecording(mode);
    setSubmitted(false);
    setError(null);
  }

  async function handleSubmit(blob: Blob, durationSeconds: number) {
    const kind = recording === "audio" ? "audio" : "video";
    setError(null);

    if (blob.size > MAX_BYTES) {
      setError("Recording is too large — try a shorter clip");
      return;
    }
    const allowedTypes = kind === "audio" ? AUDIO_TYPES : VIDEO_TYPES;
    const contentType = allowedTypes.has(blob.type) ? blob.type : kind === "audio" ? "audio/webm" : "video/webm";

    setSubmitting(true);
    try {
      const mintRes = await fetch(`/api/guest/${code}/videos/upload-url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentType, size: blob.size, kind }),
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
        body: JSON.stringify({ storage_key: mintData.path, duration_seconds: durationSeconds, kind }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Upload failed");
        return;
      }

      setRecording(null);
      setSubmitted(true);
    } catch {
      setError("Upload failed — try again");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="px-5 py-3 border-t border-border-warm">
      <div className="flex items-center justify-between mb-3 gap-2">
        <div className="text-xs font-semibold uppercase tracking-wide text-foreground/75">Guestbook</div>
        {!recording && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => startRecording("video")}
              className="text-sm font-medium text-brand touch-manipulation"
            >
              + Record a video
            </button>
            <button
              onClick={() => startRecording("audio")}
              className="text-sm font-medium text-brand touch-manipulation"
            >
              + Leave a voice message
            </button>
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-600 mb-2">{error}</p>}

      {submitted && (
        <p className="text-sm text-foreground/80 mb-2">
          Thanks! Your message is awaiting the couple&apos;s approval.
        </p>
      )}

      {recording === "video" && (
        <div className="mb-3">
          <VideoRecorder
            key={recorderKey}
            onSubmit={handleSubmit}
            onRetake={() => setRecorderKey((k) => k + 1)}
            onCancel={() => setRecording(null)}
            submitting={submitting}
          />
        </div>
      )}

      {recording === "audio" && (
        <div className="mb-3">
          <AudioRecorder
            key={recorderKey}
            onSubmit={handleSubmit}
            onRetake={() => setRecorderKey((k) => k + 1)}
            onCancel={() => setRecording(null)}
            submitting={submitting}
          />
        </div>
      )}

      {videos.length === 0 ? (
        <p className="text-sm text-foreground/70">No messages yet — be the first to leave one.</p>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {videos.map((v) =>
            v.kind === "audio" ? (
              <div key={v.id} className="rounded-md overflow-hidden bg-cream border border-border-warm p-2">
                <audio src={publicStorageUrl("videos", v.storage_key)} controls className="w-full" />
                <div className="px-0.5 pt-1.5 text-[11px] text-foreground/80 truncate">{v.guest_name}</div>
              </div>
            ) : (
              <div key={v.id} className="rounded-md overflow-hidden bg-cream">
                <video
                  src={publicStorageUrl("videos", v.storage_key)}
                  controls
                  playsInline
                  className="w-full aspect-video object-cover bg-black"
                />
                <div className="px-1.5 py-1 text-[11px] text-foreground/80 truncate">{v.guest_name}</div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
