import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireCoupleId } from "@/lib/require-auth";
import { coupleOwnsWedding } from "@/lib/wedding-ownership";
import { withErrorHandling } from "@/lib/route-handler";
import { notifyGuests } from "@/lib/push";
import { addMinutesToWallClock } from "@/lib/wall-clock";
import { ItineraryItem } from "@/types/itinerary";

const MAX_DELAY_MINUTES = 480; // 8 hours — generous ceiling against a fat-fingered entry

export const POST = withErrorHandling(async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) => {
  const coupleId = await requireCoupleId();
  if (!coupleId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id, itemId } = await params;
  const weddingId = Number(id);
  if (!(await coupleOwnsWedding(coupleId, weddingId))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { minutes } = await req.json();
  if (typeof minutes !== "number" || !Number.isFinite(minutes) || minutes <= 0 || minutes > MAX_DELAY_MINUTES) {
    return NextResponse.json({ error: `Enter a delay between 1 and ${MAX_DELAY_MINUTES} minutes` }, { status: 400 });
  }

  const database = db();

  const [target] = (await database.sql`
    SELECT * FROM itinerary_items WHERE id = ${Number(itemId)} AND wedding_id = ${weddingId}
  `) as ItineraryItem[];
  if (!target) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Everything at or after the delayed item's original time shifts by the same
  // amount — the item itself included, so "Ceremony is running 15 min late" moves
  // Ceremony and every item scheduled after it in one action.
  const affected = (await database.sql`
    SELECT * FROM itinerary_items
    WHERE wedding_id = ${weddingId} AND start_time >= ${target.start_time}
    ORDER BY start_time ASC
  `) as ItineraryItem[];

  const updated: ItineraryItem[] = [];
  for (const item of affected) {
    const newStart = addMinutesToWallClock(item.start_time, minutes);
    const newEnd = item.end_time ? addMinutesToWallClock(item.end_time, minutes) : null;
    const [row] = (await database.sql`
      UPDATE itinerary_items SET start_time = ${newStart}, end_time = ${newEnd}
      WHERE id = ${item.id}
      RETURNING *
    `) as ItineraryItem[];
    updated.push(row);
  }

  const affectedGroups = Array.from(new Set(affected.flatMap((item) => item.visible_to_groups)));
  if (affectedGroups.length > 0) {
    await notifyGuests({
      weddingId,
      visibleToGroups: affectedGroups,
      title: "Schedule update",
      body: `Running ${minutes} min behind — check your updated itinerary.`,
      tag: "itinerary",
    });
  }

  return NextResponse.json({ items: updated });
});
