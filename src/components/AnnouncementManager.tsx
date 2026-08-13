"use client";

import { useState } from "react";
import { Announcement } from "@/types/announcement";
import { publicStorageUrl } from "@/lib/storage-url";
import { supabaseBrowser } from "@/lib/supabase-browser";

const MAX_VIDEO_BYTES = 60 * 1024 * 1024;
const ALLOWED_VIDEO_TYPES = new Set(["video/webm", "video/mp4"]);

export default function AnnouncementManager({
  weddingId,
  initialAnnouncements,
  knownGroups,
}: {
  weddingId: number;
  initialAnnouncements: Announcement[];
  knownGroups: string[];
}) {
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [message, setMessage] = useState("");
  const [selectedGroups, setSelectedGroups] = useState<string[]>(knownGroups);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);

  function handleVideoSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setVideoError(null);

    if (!ALLOWED_VIDEO_TYPES.has(file.type)) {
      setVideoError("Only MP4 or WebM video is allowed");
      e.target.value = "";
      return;
    }
    if (file.size > MAX_VIDEO_BYTES) {
      setVideoError("Video is too large");
      e.target.value = "";
      return;
    }
    setVideoFile(file);
  }

  function toggleGroup(group: string) {
    setSelectedGroups((prev) =>
      prev.includes(group) ? prev.filter((g) => g !== group) : [...prev, group]
    );
  }

  async function handlePost(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setVideoError(null);

    try {
      let videoKey: string | null = null;
      if (videoFile) {
        const mintRes = await fetch(`/api/weddings/${weddingId}/announcement-video/upload-url`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contentType: videoFile.type, size: videoFile.size }),
        });
        const mintData = await mintRes.json();
        if (!mintRes.ok) {
          setVideoError(mintData.error ?? "Video upload failed");
          return;
        }

        const { error: uploadError } = await supabaseBrowser()
          .storage.from("videos")
          .uploadToSignedUrl(mintData.path, mintData.token, videoFile, { contentType: videoFile.type });
        if (uploadError) {
          setVideoError("Video upload failed — try again");
          return;
        }

        videoKey = mintData.path;
      }

      const res = await fetch(`/api/weddings/${weddingId}/announcements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, visibleToGroups: selectedGroups, videoKey }),
      });
      const data = await res.json();

      if (res.ok) {
        setAnnouncements((prev) => [data.announcement, ...prev]);
        setMessage("");
        setVideoFile(null);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Remove this announcement? Guests will stop seeing it.")) return;

    const res = await fetch(`/api/weddings/${weddingId}/announcements/${id}`, {
      method: "DELETE",
    });
    if (res.ok) setAnnouncements((prev) => prev.filter((a) => a.id !== id));
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-foreground/60">
        Push a short update straight to guests&apos; itinerary pages — e.g. a venue change or
        weather contingency. They see it within seconds, no group text required.
      </p>

      {announcements.length > 0 && (
        <ul className="flex flex-col gap-2">
          {announcements.map((a) => (
            <li
              key={a.id}
              className="flex items-start justify-between gap-3 border border-border-warm rounded-md px-3 py-2 text-sm"
            >
              <div>
                <p>{a.message}</p>
                {a.video_key && (
                  <video
                    src={publicStorageUrl("videos", a.video_key)}
                    controls
                    playsInline
                    className="w-full max-w-[200px] aspect-video rounded-md bg-black mt-1.5"
                  />
                )}
                <p className="text-xs text-foreground/50 mt-0.5">
                  visible to: {a.visible_to_groups.join(", ")}
                </p>
              </div>
              <button
                onClick={() => handleDelete(a.id)}
                className="text-red-600 font-medium whitespace-nowrap"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handlePost} className="flex flex-col gap-2">
        <textarea
          placeholder="e.g. Ceremony is moving indoors due to rain — follow signs to the Garden Room."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          rows={2}
          className="border border-border-warm rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 resize-none"
        />

        <div className="flex items-center gap-3 flex-wrap text-sm">
          <span className="text-foreground/60">Visible to:</span>
          {knownGroups.map((group) => (
            <label key={group} className="flex items-center gap-1.5">
              <input
                type="checkbox"
                checked={selectedGroups.includes(group)}
                onChange={() => toggleGroup(group)}
              />
              {group}
            </label>
          ))}
        </div>

        <label className="self-start text-sm font-medium text-brand cursor-pointer">
          {videoFile ? `Video: ${videoFile.name}` : "+ Attach a video (optional)"}
          <input type="file" accept="video/mp4,video/webm" onChange={handleVideoSelected} className="hidden" />
        </label>
        {videoError && <p className="text-sm text-red-600">{videoError}</p>}

        <button
          type="submit"
          disabled={loading}
          className="self-start bg-brand text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-brand-hover transition-colors disabled:opacity-60"
        >
          {loading ? "Posting…" : "Post announcement"}
        </button>
      </form>
    </div>
  );
}
