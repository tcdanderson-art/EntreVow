import { supabaseAdmin } from "@/lib/supabase";
import { storageKey } from "@/lib/storage-key";

const ALLOWED_TYPES = new Set(["video/webm", "video/mp4"]);

export function validateVideoUpload(contentType: unknown, size: unknown, maxBytes: number): string | null {
  if (typeof contentType !== "string" || !ALLOWED_TYPES.has(contentType)) {
    return "Only MP4 or WebM video is allowed";
  }
  if (typeof size !== "number" || size > maxBytes) {
    return "Video is too large";
  }
  return null;
}

export function mintVideoUploadUrl(weddingId: number, contentType: string) {
  const extension = contentType === "video/mp4" ? "mp4" : "webm";
  const key = storageKey(weddingId, extension);
  return supabaseAdmin().storage.from("videos").createSignedUploadUrl(key);
}
