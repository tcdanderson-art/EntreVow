import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireCoupleId } from "@/lib/require-auth";
import { coupleOwnsWedding } from "@/lib/wedding-ownership";
import { withErrorHandling } from "@/lib/route-handler";
import { planZipParts, zipPartResponse, sanitizeSegment, ZipItem } from "@/lib/zip-download";
import { Photo } from "@/types/photo";

export const runtime = "nodejs";

// No ?part param: returns how many zip parts this wedding's photos need.
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
  // Hidden just means "not shown in the public gallery" — the couple still gets everything.
  const photos = (await database.sql`
    SELECT photos.*, guests.name AS guest_name
    FROM photos JOIN guests ON guests.id = photos.guest_id
    WHERE photos.wedding_id = ${weddingId}
    ORDER BY photos.created_at ASC, photos.id ASC
  `) as (Photo & { guest_name: string })[];

  if (photos.length === 0) {
    return NextResponse.json({ error: "No photos to download yet" }, { status: 404 });
  }

  const items: ZipItem[] = photos.map((p) => ({
    key: p.blob_key,
    filename: `${sanitizeSegment(p.guest_name)}-${p.id}.${p.blob_key.split(".").pop() || "jpg"}`,
  }));

  const parts = await planZipParts("photos", weddingId, items);

  const partParam = req.nextUrl.searchParams.get("part");
  if (!partParam) {
    return NextResponse.json({ parts: parts.length, totalItems: photos.length });
  }

  const partIndex = Number(partParam);
  if (!Number.isInteger(partIndex) || partIndex < 1 || partIndex > parts.length) {
    return NextResponse.json({ error: "Invalid part" }, { status: 400 });
  }

  const filename =
    parts.length > 1
      ? `wedding-${weddingId}-photos-part-${partIndex}-of-${parts.length}.zip`
      : `wedding-${weddingId}-photos.zip`;

  return zipPartResponse("photos", parts[partIndex - 1], filename);
});
