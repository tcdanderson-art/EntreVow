import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireCoupleId } from "@/lib/require-auth";
import { coupleOwnsWedding } from "@/lib/wedding-ownership";
import { withErrorHandling } from "@/lib/route-handler";
import { getPhotoStore } from "@/lib/photo-store";
import { Photo } from "@/types/photo";

export const DELETE = withErrorHandling(async (
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; photoId: string }> }
) => {
  const coupleId = await requireCoupleId();
  if (!coupleId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id, photoId } = await params;
  const weddingId = Number(id);
  if (!(await coupleOwnsWedding(coupleId, weddingId))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const database = db();
  const [photo] = (await database.sql`
    DELETE FROM photos WHERE id = ${Number(photoId)} AND wedding_id = ${weddingId}
    RETURNING *
  `) as Photo[];

  if (!photo) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await getPhotoStore().delete(photo.blob_key);

  return NextResponse.json({ ok: true });
});
