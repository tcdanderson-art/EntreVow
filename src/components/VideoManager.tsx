"use client";

import { useState } from "react";
import { Video } from "@/types/video";
import { publicStorageUrl } from "@/lib/storage-url";
import { supabaseBrowser } from "@/lib/supabase-browser";

const MAX_WELCOME_BYTES = 60 * 1024 * 1024;
const MAX_WELCOME_SECONDS = 30;
const ALLOWED_TYPES = new Set(["video/webm", "video/mp4"]);

function readVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      resolve(video.duration);
    };
    video.onerror = () => reject(new Error("Could not read video"));
    video.src = URL.createObjectURL(file);
  });
}

export default function VideoManager({
  weddingId,
  initialWelcomeVideoKey,
  initialVideos,
}: {
  weddingId: number;
  initialWelcomeVideoKey: string | null;
  initialVideos: Video[];
}) {
  const [welcomeVideoKey, setWelcomeVideoKey] = useState(initialWelcomeVideoKey);
  const [videos, setVideos] = useState(initialVideos);
  const [uploadingWelcome, setUploadingWelcome] = useState(false);
  const [welcomeError, setWelcomeError] = useState<string | null>(null);

  const pending = videos.filter((v) => v.status === "pending");
  const approved = videos.filter((v) => v.status === "approved");

  async function handleWelcomeFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    setWelcomeError(null);

    if (!ALLOWED_TYPES.has(file.type)) {
      setWelcomeError("Only MP4 or WebM video is allowed");
      return;
    }
    if (file.size > MAX_WELCOME_BYTES) {
      setWelcomeError("Video is too large");
      return;
    }

    try {
      const duration = await readVideoDuration(file);
      if (duration > MAX_WELCOME_SECONDS + 1) {
        setWelcomeError(`Keep the welcome video to ${MAX_WELCOME_SECONDS} seconds or less`);
        return;
      }
    } catch {
      // duration check is a nicety — if it fails, let the upload proceed
    }

    setUploadingWelcome(true);
    try {
      const mintRes = await fetch(`/api/weddings/${weddingId}/welcome-video/upload-url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentType: file.type, size: file.size }),
      });
      const mintData = await mintRes.json();
      if (!mintRes.ok) {
        setWelcomeError(mintData.error ?? "Upload failed");
        return;
      }

      const { error: uploadError } = await supabaseBrowser()
        .storage.from("videos")
        .uploadToSignedUrl(mintData.path, mintData.token, file, { contentType: file.type });
      if (uploadError) {
        setWelcomeError("Upload failed — try again");
        return;
      }

      const res = await fetch(`/api/weddings/${weddingId}/welcome-video`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storage_key: mintData.path }),
      });
      const data = await res.json();
      if (!res.ok) {
        setWelcomeError(data.error ?? "Upload failed");
        return;
      }

      setWelcomeVideoKey(data.wedding.welcome_video_key);
    } catch {
      setWelcomeError("Upload failed — try again");
    } finally {
      setUploadingWelcome(false);
    }
  }

  async function handleRemoveWelcome() {
    if (!confirm("Remove the welcome video?")) return;
    const res = await fetch(`/api/weddings/${weddingId}/welcome-video`, { method: "DELETE" });
    if (res.ok) setWelcomeVideoKey(null);
  }

  async function handleModerate(videoId: number, status: "approved" | "rejected") {
    const res = await fetch(`/api/weddings/${weddingId}/videos/${videoId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const data = await res.json();
      setVideos((prev) => prev.map((v) => (v.id === videoId ? data.video : v)));
    }
  }

  async function handleRemoveGuestVideo(videoId: number) {
    if (!confirm("Remove this video? This can't be undone.")) return;
    const res = await fetch(`/api/weddings/${weddingId}/videos/${videoId}`, { method: "DELETE" });
    if (res.ok) setVideos((prev) => prev.filter((v) => v.id !== videoId));
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-sm font-semibold mb-2">Welcome video</h3>
        {welcomeVideoKey ? (
          <div className="max-w-xs">
            <video
              src={publicStorageUrl("videos", welcomeVideoKey)}
              controls
              playsInline
              className="w-full aspect-video rounded-md bg-black"
            />
            <div className="flex items-center gap-3 mt-2">
              <label className="text-sm font-medium text-brand cursor-pointer">
                {uploadingWelcome ? "Uploading…" : "Replace"}
                <input
                  type="file"
                  accept="video/mp4,video/webm"
                  onChange={handleWelcomeFileSelected}
                  disabled={uploadingWelcome}
                  className="hidden"
                />
              </label>
              <button onClick={handleRemoveWelcome} className="text-sm font-medium text-foreground/80">
                Remove
              </button>
            </div>
          </div>
        ) : (
          <label className="inline-block text-sm font-medium text-brand cursor-pointer">
            {uploadingWelcome ? "Uploading…" : "+ Upload welcome video"}
            <input
              type="file"
              accept="video/mp4,video/webm"
              onChange={handleWelcomeFileSelected}
              disabled={uploadingWelcome}
              className="hidden"
            />
          </label>
        )}
        {welcomeError && <p className="text-sm text-red-600 mt-2">{welcomeError}</p>}
        <p className="text-xs text-foreground/70 mt-1">
          Shown at the top of every guest&apos;s itinerary page. Keep it to 30 seconds or less.
        </p>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-2">Guestbook videos</h3>

        {pending.length > 0 && (
          <div className="mb-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-foreground/75 mb-2">
              Awaiting approval ({pending.length})
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {pending.map((v) => (
                <div key={v.id} className="rounded-md overflow-hidden bg-cream border border-border-warm">
                  <video
                    src={publicStorageUrl("videos", v.storage_key)}
                    controls
                    playsInline
                    className="w-full aspect-video bg-black"
                  />
                  <div className="px-2 py-1.5">
                    <div className="text-[11px] text-foreground/80 truncate mb-1.5">{v.guest_name}</div>
                    <div className="flex items-center justify-between gap-2">
                      <button onClick={() => handleModerate(v.id, "approved")} className="text-[11px] font-semibold text-brand">
                        Approve
                      </button>
                      <button onClick={() => handleModerate(v.id, "rejected")} className="text-[11px] font-medium text-foreground/75">
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {approved.length === 0 ? (
          <p className="text-sm text-foreground/70">No approved guestbook videos yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {approved.map((v) => (
              <div key={v.id} className="rounded-md overflow-hidden bg-cream border border-border-warm">
                <video
                  src={publicStorageUrl("videos", v.storage_key)}
                  controls
                  playsInline
                  className="w-full aspect-video bg-black"
                />
                <div className="px-2 py-1.5 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-foreground/80 truncate">{v.guest_name}</span>
                  <button onClick={() => handleRemoveGuestVideo(v.id)} className="text-[11px] font-medium text-foreground/75 shrink-0">
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
