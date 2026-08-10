import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireCoupleId } from "@/lib/require-auth";
import { coupleOwnsWedding } from "@/lib/wedding-ownership";
import { withErrorHandling } from "@/lib/route-handler";
import { ItineraryItem } from "@/types/itinerary";

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

  const items = (await db().sql`
    SELECT * FROM itinerary_items WHERE wedding_id = ${weddingId} ORDER BY start_time ASC
  `) as ItineraryItem[];

  return NextResponse.json({ items });
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

  const { title, location, startTime, endTime, transportInfo, visibleToGroups } = await req.json();
  if (!title || !startTime) {
    return NextResponse.json({ error: "Title and start time are required" }, { status: 400 });
  }

  const groups: string[] = Array.isArray(visibleToGroups) && visibleToGroups.length > 0
    ? visibleToGroups
    : ["general"];

  const [item] = (await db().sql`
    INSERT INTO itinerary_items (wedding_id, title, location, start_time, end_time, transport_info, visible_to_groups)
    VALUES (${weddingId}, ${title}, ${location ?? null}, ${startTime}, ${endTime ?? null}, ${transportInfo ?? null}, ${groups})
    RETURNING *
  `) as ItineraryItem[];

  return NextResponse.json({ item });
});
