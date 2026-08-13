import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireCoupleId } from "@/lib/require-auth";
import { coupleOwnsWedding } from "@/lib/wedding-ownership";
import { withErrorHandling } from "@/lib/route-handler";
import { supabaseAdmin } from "@/lib/supabase";
import { Announcement } from "@/types/announcement";

export const DELETE = withErrorHandling(async (
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; announcementId: string }> }
) => {
  const coupleId = await requireCoupleId();
  if (!coupleId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id, announcementId } = await params;
  const weddingId = Number(id);
  if (!(await coupleOwnsWedding(coupleId, weddingId))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const [announcement] = (await db().sql`
    DELETE FROM announcements WHERE id = ${Number(announcementId)} AND wedding_id = ${weddingId}
    RETURNING *
  `) as Announcement[];

  if (announcement?.video_key) {
    await supabaseAdmin().storage.from("videos").remove([announcement.video_key]);
  }

  return NextResponse.json({ ok: true });
});
