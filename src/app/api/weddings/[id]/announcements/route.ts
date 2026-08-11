import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireCoupleId } from "@/lib/require-auth";
import { coupleOwnsWedding } from "@/lib/wedding-ownership";
import { withErrorHandling } from "@/lib/route-handler";
import { Announcement } from "@/types/announcement";

export const GET = withErrorHandling(async (
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const coupleId = await requireCoupleId();
  if (!coupleId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const weddingId = Number((await params).id);
  if (!(await coupleOwnsWedding(coupleId, weddingId))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const announcements = (await db().sql`
    SELECT * FROM announcements WHERE wedding_id = ${weddingId} ORDER BY created_at DESC
  `) as Announcement[];

  return NextResponse.json({ announcements });
});

export const POST = withErrorHandling(async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const coupleId = await requireCoupleId();
  if (!coupleId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const weddingId = Number((await params).id);
  if (!(await coupleOwnsWedding(coupleId, weddingId))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { message, visibleToGroups } = await req.json();
  if (!message) return NextResponse.json({ error: "Message is required" }, { status: 400 });

  const groups: string[] = Array.isArray(visibleToGroups) && visibleToGroups.length > 0
    ? visibleToGroups
    : ["general"];

  const [announcement] = (await db().sql`
    INSERT INTO announcements (wedding_id, message, visible_to_groups)
    VALUES (${weddingId}, ${message}, ${groups})
    RETURNING *
  `) as Announcement[];

  return NextResponse.json({ announcement });
});
