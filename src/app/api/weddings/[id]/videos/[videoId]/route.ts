import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireCoupleId } from "@/lib/require-auth";
import { coupleOwnsWedding } from "@/lib/wedding-ownership";
import { withErrorHandling } from "@/lib/route-handler";
import { supabaseAdmin } from "@/lib/supabase";
import { Video } from "@/types/video";

export const PATCH = withErrorHandling(async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string; videoId: string }> }
) => {
  const coupleId = await requireCoupleId();
  if (!coupleId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id, videoId } = await params;
  const weddingId = Number(id);
  if (!(await coupleOwnsWedding(coupleId, weddingId))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { status } = await req.json();
  if (status !== "approved" && status !== "rejected") {
    return NextResponse.json({ error: "status must be 'approved' or 'rejected'" }, { status: 400 });
  }

  const [video] = (await db().sql`
    UPDATE videos SET status = ${status} WHERE id = ${Number(videoId)} AND wedding_id = ${weddingId}
    RETURNING *
  `) as Video[];

  if (!video) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ video });
});

export const DELETE = withErrorHandling(async (
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; videoId: string }> }
) => {
  const coupleId = await requireCoupleId();
  if (!coupleId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id, videoId } = await params;
  const weddingId = Number(id);
  if (!(await coupleOwnsWedding(coupleId, weddingId))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const [video] = (await db().sql`
    DELETE FROM videos WHERE id = ${Number(videoId)} AND wedding_id = ${weddingId}
    RETURNING *
  `) as Video[];

  if (!video) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await supabaseAdmin().storage.from("videos").remove([video.storage_key]);

  return NextResponse.json({ ok: true });
});
