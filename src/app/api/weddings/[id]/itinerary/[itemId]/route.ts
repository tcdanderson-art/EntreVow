import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireCoupleId } from "@/lib/require-auth";
import { coupleOwnsWedding } from "@/lib/wedding-ownership";
import { withErrorHandling } from "@/lib/route-handler";
import { notifyGuests } from "@/lib/push";
import { formatWallClockTime } from "@/lib/wall-clock";
import { ItineraryItem } from "@/types/itinerary";

async function assertOwnership(weddingId: number) {
  const coupleId = await requireCoupleId();
  if (!coupleId) return { error: NextResponse.json({ error: "Not authenticated" }, { status: 401 }) };
  if (!(await coupleOwnsWedding(coupleId, weddingId))) {
    return { error: NextResponse.json({ error: "Not found" }, { status: 404 }) };
  }
  return { error: null };
}

export const PATCH = withErrorHandling(async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) => {
  const { id, itemId } = await params;
  const weddingId = Number(id);

  const { error } = await assertOwnership(weddingId);
  if (error) return error;

  const { title, location, startTime, endTime, transportInfo, visibleToGroups } = await req.json();
  if (!title || !startTime) {
    return NextResponse.json({ error: "Title and start time are required" }, { status: 400 });
  }

  const groups: string[] = Array.isArray(visibleToGroups) && visibleToGroups.length > 0
    ? visibleToGroups
    : ["general"];

  const [existing] = (await db().sql`
    SELECT location, start_time FROM itinerary_items
    WHERE id = ${Number(itemId)} AND wedding_id = ${weddingId}
  `) as Pick<ItineraryItem, "location" | "start_time">[];
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const [item] = (await db().sql`
    UPDATE itinerary_items
    SET title = ${title},
        location = ${location ?? null},
        start_time = ${startTime},
        end_time = ${endTime ?? null},
        transport_info = ${transportInfo ?? null},
        visible_to_groups = ${groups}
    WHERE id = ${Number(itemId)} AND wedding_id = ${weddingId}
    RETURNING *
  `) as ItineraryItem[];

  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const meaningfulChange =
    existing.start_time !== item.start_time || (existing.location ?? "") !== (item.location ?? "");

  if (meaningfulChange) {
    await notifyGuests({
      weddingId,
      visibleToGroups: item.visible_to_groups,
      title: "Itinerary updated",
      body: `${item.title} — ${formatWallClockTime(item.start_time, { hour: "numeric", minute: "2-digit" })}${
        item.location ? ` @ ${item.location}` : ""
      }`,
      tag: "itinerary",
    });
  }

  return NextResponse.json({ item });
});

export const DELETE = withErrorHandling(async (
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) => {
  const { id, itemId } = await params;
  const weddingId = Number(id);

  const { error } = await assertOwnership(weddingId);
  if (error) return error;

  await db().sql`DELETE FROM itinerary_items WHERE id = ${Number(itemId)} AND wedding_id = ${weddingId}`;

  return NextResponse.json({ ok: true });
});
