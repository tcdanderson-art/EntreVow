import { randomUUID } from "crypto";

// Path-prefix isolation replaces Netlify Blobs' CONTEXT-based prod/preview
// store split — Supabase Storage has no deploy-scoped bucket equivalent.
export function storageKey(weddingId: number, ext: string): string {
  const prefix = process.env.CONTEXT === "production" ? "prod" : "preview";
  return `${prefix}/${weddingId}/${randomUUID()}.${ext}`;
}
