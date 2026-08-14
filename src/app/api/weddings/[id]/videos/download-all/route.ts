import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireCoupleId } from "@/lib/require-auth";
import { coupleOwnsWedding } from "@/lib/wedding-ownership";
import { withErrorHandling } from "@/lib/route-handler";
import { planZipParts, zipPartResponse, sanitizeSegment, ZipItem } from "@/lib/zip-download";
import { Video } from "@/types/video";

export const runtime = "nodejs";

// No ?part param: returns how many zip parts this wedding's guestbook needs.
// ?part=N: streams that part as a zip file.
export const GET = withErrorHandling(async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const coupleId = await requireCoupleId();
  if (!coupleId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const weddingId = Number((await params).id);
  if (!(await coupleOwnsWedding(coupleId, weddingId))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const database = db();
  // Approved guestbook messages only — the welcome video is the couple's own upload,
  // and rejected/pending videos haven't been signed off on yet.
  const videos = (await database.sql`
    SELECT videos.*, guests.name AS guest_name
    FROM videos JOIN guests ON guests.id = videos.guest_id
    WHERE videos.wedding_id = ${weddingId} AND videos.status = 'approved'
    ORDER BY videos.created_at ASC, videos.id ASC
  `) as (Video & { guest_name: string })[];

  if (videos.length === 0) {
    return NextResponse.json({ error: "No approved guestbook messages to download yet" }, { status: 404 });
  }

  const items: ZipItem[] = videos.map((v) => ({
    key: v.storage_key,
    filename: `${sanitizeSegment(v.guest_name)}-${v.id}.${v.storage_key.split(".").pop() || (v.kind === "audio" ? "m4a" : "mp4")}`,
  }));

  const parts = await planZipParts("videos", weddingId, items);

  const partParam = req.nextUrl.searchParams.get("part");
  if (!partParam) {
    return NextResponse.json({ parts: parts.length, totalItems: videos.length });
  }

  const partIndex = Number(partParam);
  if (!Number.isInteger(partIndex) || partIndex < 1 || partIndex > parts.length) {
    return NextResponse.json({ error: "Invalid part" }, { status: 400 });
  }

  const filename =
    parts.length > 1
      ? `wedding-${weddingId}-guestbook-part-${partIndex}-of-${parts.length}.zip`
      : `wedding-${weddingId}-guestbook.zip`;

  return zipPartResponse("videos", parts[partIndex - 1], filename);
});
