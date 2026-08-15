import { randomUUID } from "crypto";

// Path-prefix isolation replaces Netlify Blobs' CONTEXT-based prod/preview
// store split — Supabase Storage has no deploy-scoped bucket equivalent.
export function storageKey(weddingId: number, ext: string): string {
  const prefix = process.env.CONTEXT === "production" ? "prod" : "preview";
  return `${prefix}/${weddingId}/${randomUUID()}.${ext}`;
}

const GENERATED_KEY_SUFFIX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.[a-z0-9]+$/i;

// Upload-confirm routes record a client-supplied storage_key with no way to
// verify the client actually PUT to it — but they can at least reject any key
// that wasn't minted for this exact wedding, closing off cross-tenant splicing
// (attaching another wedding's uploaded object to this wedding's gallery/video).
export function isOwnStorageKey(key: string, weddingId: number): boolean {
  const prefix = process.env.CONTEXT === "production" ? "prod" : "preview";
  const expectedDir = `${prefix}/${weddingId}/`;
  return key.startsWith(expectedDir) && GENERATED_KEY_SUFFIX.test(key.slice(expectedDir.length));
}
