import { ZipArchive } from "archiver";
import { Readable } from "node:stream";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// Keeps each part comfortably inside a serverless function's execution window —
// splitting into several small zips that each succeed beats one big zip that times out.
// Netlify's synchronous function timeout is 10s on this project's plan (Personal, $9/mo);
// 26s requires Pro+ and a support-enabled opt-in, so we budget for the stricter 10s ceiling.
export const MAX_PART_ITEMS = 250;
export const PHOTOS_MAX_PART_BYTES = 250 * 1024 * 1024;
// Videos get a larger byte budget than photos: concurrent downloads and skipping
// DEFLATE on already-compressed media (both below) cut wall-clock time enough to
// still land well inside the 10s window at this size.
export const VIDEOS_MAX_PART_BYTES = 350 * 1024 * 1024;

// Fetch several files at once instead of one-at-a-time — the wait is almost all
// network latency to Supabase Storage, so overlapping requests is what actually
// buys back time within the function's fixed timeout.
const DOWNLOAD_CONCURRENCY = 6;

export interface ZipItem {
  key: string;
  filename: string;
}

interface SizedItem extends ZipItem {
  size: number;
}

export function sanitizeSegment(value: string): string {
  return value.replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "").toLowerCase() || "guest";
}

function storagePrefix(weddingId: number): string {
  const prefix = process.env.CONTEXT === "production" ? "prod" : "preview";
  return `${prefix}/${weddingId}`;
}

// Supabase Storage's list() caps each call at 1000 entries — page through with
// offset so a wedding with >1000 uploaded files doesn't silently get size: 0
// for everything past the first page (which would badly under-budget a zip
// part and risk it running past the function timeout mid-stream).
async function sizeItems(
  bucket: "photos" | "videos",
  weddingId: number,
  items: ZipItem[]
): Promise<SizedItem[]> {
  const storage = supabaseAdmin().storage.from(bucket);
  const prefix = storagePrefix(weddingId);
  const PAGE_SIZE = 1000;
  const sizeByName = new Map<string, number>();

  for (let offset = 0; ; offset += PAGE_SIZE) {
    const { data: listing } = await storage.list(prefix, { limit: PAGE_SIZE, offset });
    for (const f of listing ?? []) sizeByName.set(f.name, f.metadata?.size ?? 0);
    if (!listing || listing.length < PAGE_SIZE) break;
  }

  return items.map((item) => ({
    ...item,
    size: sizeByName.get(item.key.split("/").pop() ?? "") ?? 0,
  }));
}

function planParts(items: SizedItem[], maxPartBytes: number): SizedItem[][] {
  const parts: SizedItem[][] = [];
  let current: SizedItem[] = [];
  let currentBytes = 0;

  for (const item of items) {
    const wouldOverflow =
      current.length > 0 &&
      (currentBytes + item.size > maxPartBytes || current.length >= MAX_PART_ITEMS);
    if (wouldOverflow) {
      parts.push(current);
      current = [];
      currentBytes = 0;
    }
    current.push(item);
    currentBytes += item.size;
  }
  if (current.length > 0) parts.push(current);
  return parts;
}

// Splits `items` into zip-sized batches. Byte sizes come from a storage listing
// rather than the DB, since we don't persist file sizes on upload.
export async function planZipParts(
  bucket: "photos" | "videos",
  weddingId: number,
  items: ZipItem[]
): Promise<ZipItem[][]> {
  const sized = await sizeItems(bucket, weddingId, items);
  const maxPartBytes = bucket === "videos" ? VIDEOS_MAX_PART_BYTES : PHOTOS_MAX_PART_BYTES;
  return planParts(sized, maxPartBytes);
}

async function downloadIntoArchive(
  storage: ReturnType<ReturnType<typeof supabaseAdmin>["storage"]["from"]>,
  part: ZipItem[],
  archive: ZipArchive
) {
  let next = 0;
  async function worker() {
    while (next < part.length) {
      const item = part[next++];
      const { data, error } = await storage.download(item.key);
      if (error || !data) continue;
      // store: true skips DEFLATE — photos/videos are already compressed, so
      // deflating them again just burns CPU time we'd rather spend on I/O.
      archive.append(Buffer.from(await data.arrayBuffer()), { name: item.filename, store: true });
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(DOWNLOAD_CONCURRENCY, part.length) }, worker)
  );
}

export function zipPartResponse(
  bucket: "photos" | "videos",
  part: ZipItem[],
  filename: string
): NextResponse {
  const storage = supabaseAdmin().storage.from(bucket);
  // archiver 8 dropped the archiver("zip", opts) factory in favor of format-specific classes.
  const archive = new ZipArchive({ zlib: { level: 6 } });
  archive.on("error", (err: Error) => console.error("zip stream error", err));

  downloadIntoArchive(storage, part, archive).then(
    () => archive.finalize(),
    (err) => console.error("zip download error", err)
  );

  const webStream = Readable.toWeb(archive as unknown as Readable) as ReadableStream;
  return new NextResponse(webStream, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
