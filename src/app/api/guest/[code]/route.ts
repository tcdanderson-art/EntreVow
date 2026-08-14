import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withErrorHandling } from "@/lib/route-handler";
import { Guest } from "@/types/guest";
import { Wedding } from "@/types/wedding";
import { ItineraryItem } from "@/types/itinerary";
import { Announcement } from "@/types/announcement";
import { Photo } from "@/types/photo";
import { Shuttle } from "@/types/shuttle";
import { Video } from "@/types/video";
import { isPaid, isFullTier } from "@/lib/plan";

export const GET = withErrorHandling(async (
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) => {
  const { code } = await params;
  const database = db();

  const guests = (await database.sql`SELECT * FROM guests WHERE access_code = ${code}`) as Guest[];
  const guest = guests[0];
  if (!guest) {
    return NextResponse.json({ error: "Guest link not found" }, { status: 404 });
  }

  const weddings = (await database.sql`SELECT * FROM weddings WHERE id = ${guest.wedding_id}`) as Wedding[];
  const wedding = weddings[0];

  if (!wedding || !isPaid(wedding)) {
    return NextResponse.json({ error: "Guest access isn't active yet", notActive: true }, { status: 402 });
  }

  const items = (await database.sql`
    SELECT * FROM itinerary_items
    WHERE wedding_id = ${guest.wedding_id}
      AND ${guest.guest_group} = ANY(visible_to_groups)
    ORDER BY start_time ASC
  `) as ItineraryItem[];

  const announcements = (await database.sql`
    SELECT * FROM announcements
    WHERE wedding_id = ${guest.wedding_id}
      AND ${guest.guest_group} = ANY(visible_to_groups)
    ORDER BY created_at DESC
  `) as Announcement[];

  const photos = (await database.sql`
    SELECT photos.*, guests.name AS guest_name
    FROM photos JOIN guests ON guests.id = photos.guest_id
    WHERE photos.wedding_id = ${guest.wedding_id} AND photos.hidden = false
    ORDER BY photos.created_at DESC
  `) as Photo[];

  const shuttles = isFullTier(wedding)
    ? ((await database.sql`
        SELECT * FROM shuttles WHERE wedding_id = ${guest.wedding_id} ORDER BY created_at ASC
      `) as Shuttle[])
    : [];

  const videos = (await database.sql`
    SELECT videos.*, guests.name AS guest_name
    FROM videos JOIN guests ON guests.id = videos.guest_id
    WHERE videos.wedding_id = ${guest.wedding_id} AND videos.status = 'approved'
    ORDER BY videos.created_at DESC
  `) as Video[];

  return NextResponse.json({ guest, wedding, items, announcements, photos, shuttles, videos });
});
