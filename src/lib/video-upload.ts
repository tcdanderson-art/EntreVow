import { supabaseAdmin } from "@/lib/supabase";
import { storageKey } from "@/lib/storage-key";

const VIDEO_TYPES = new Set(["video/webm", "video/mp4"]);
const AUDIO_TYPES = new Set(["audio/webm", "audio/mp4", "audio/mpeg"]);

const EXTENSIONS: Record<string, string> = {
  "video/mp4": "mp4",
  "video/webm": "webm",
  "audio/mp4": "m4a",
  "audio/mpeg": "mp3",
  "audio/webm": "webm",
};

export function validateVideoUpload(
  contentType: unknown,
  size: unknown,
  maxBytes: number,
  kind: "video" | "audio" = "video"
): string | null {
  const allowed = kind === "audio" ? AUDIO_TYPES : VIDEO_TYPES;
  if (typeof contentType !== "string" || !allowed.has(contentType)) {
    return kind === "audio" ? "Only MP3, MP4, or WebM audio is allowed" : "Only MP4 or WebM video is allowed";
  }
  if (typeof size !== "number" || size > maxBytes) {
    return kind === "audio" ? "Recording is too large" : "Video is too large";
  }
  return null;
}

export function mintVideoUploadUrl(weddingId: number, contentType: string) {
  const extension = EXTENSIONS[contentType] ?? "webm";
  const key = storageKey(weddingId, extension);
  return supabaseAdmin().storage.from("videos").createSignedUploadUrl(key);
}
