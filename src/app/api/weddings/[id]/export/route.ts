import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireCoupleId } from "@/lib/require-auth";
import { coupleOwnsWedding } from "@/lib/wedding-ownership";
import { withErrorHandling } from "@/lib/route-handler";
import { Wedding } from "@/types/wedding";
import { Guest } from "@/types/guest";
import { ItineraryItem } from "@/types/itinerary";
import { Announcement } from "@/types/announcement";
import { Shuttle } from "@/types/shuttle";
import { Photo } from "@/types/photo";
import { WeddingTable } from "@/types/table";

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

  const database = db();

  const [wedding] = (await database.sql`
    SELECT * FROM weddings WHERE id = ${weddingId}
  `) as Wedding[];

  const guests = (await database.sql`
    SELECT * FROM guests WHERE wedding_id = ${weddingId} ORDER BY created_at ASC
  `) as Guest[];

  const itinerary = (await database.sql`
    SELECT * FROM itinerary_items WHERE wedding_id = ${weddingId} ORDER BY start_time ASC
  `) as ItineraryItem[];

  const announcements = (await database.sql`
    SELECT * FROM announcements WHERE wedding_id = ${weddingId} ORDER BY created_at DESC
  `) as Announcement[];

  const shuttles = (await database.sql`
    SELECT * FROM shuttles WHERE wedding_id = ${weddingId} ORDER BY created_at ASC
  `) as Shuttle[];

  const tables = (await database.sql`
    SELECT * FROM wedding_tables WHERE wedding_id = ${weddingId} ORDER BY sort_order ASC, id ASC
  `) as WeddingTable[];

  // Metadata only — the actual photo files stay in Blob storage, not embedded here.
  const photos = (await database.sql`
    SELECT photos.id, photos.guest_id, guests.name AS guest_name, photos.caption, photos.created_at
    FROM photos JOIN guests ON guests.id = photos.guest_id
    WHERE photos.wedding_id = ${weddingId}
    ORDER BY photos.created_at ASC
  `) as (Photo & { guest_name: string })[];

  return NextResponse.json({
    exported_at: new Date().toISOString(),
    wedding,
    guests,
    itinerary,
    announcements,
    shuttles,
    tables,
    photos,
  });
});
