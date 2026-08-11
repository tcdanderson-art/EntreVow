import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireCoupleId } from "@/lib/require-auth";
import { withErrorHandling } from "@/lib/route-handler";
import { slugify } from "@/lib/slug";
import { geocodeAddress } from "@/lib/geocode";
import { Wedding } from "@/types/wedding";

export const PATCH = withErrorHandling(async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const coupleId = await requireCoupleId();
  if (!coupleId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const weddingId = Number((await params).id);
  const { title, weddingDate, emergencyPhone, slug, venueAddress } = await req.json();
  if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 });

  const cleanSlug = slug ? slugify(slug) : null;

  const existing = (await db().sql`
    SELECT venue_address, venue_lat, venue_lng FROM weddings
    WHERE id = ${weddingId} AND couple_id = ${coupleId}
  `) as Pick<Wedding, "venue_address" | "venue_lat" | "venue_lng">[];
  if (!existing[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const cleanAddress = venueAddress?.trim() || null;
  let venueLat = existing[0].venue_lat;
  let venueLng = existing[0].venue_lng;

  if (!cleanAddress) {
    venueLat = null;
    venueLng = null;
  } else if (cleanAddress !== existing[0].venue_address) {
    // Address changed — re-geocode. If it fails, keep the previous coordinates
    // rather than silently losing the venue location.
    const coords = await geocodeAddress(cleanAddress);
    if (coords) {
      venueLat = coords.lat;
      venueLng = coords.lng;
    }
  }

  const [wedding] = (await db().sql`
    UPDATE weddings
    SET title = ${title}, wedding_date = ${weddingDate ?? null},
        emergency_phone = ${emergencyPhone ?? null}, slug = ${cleanSlug || null},
        venue_address = ${cleanAddress}, venue_lat = ${venueLat}, venue_lng = ${venueLng}
    WHERE id = ${weddingId} AND couple_id = ${coupleId}
    RETURNING *
  `) as Wedding[];

  if (!wedding) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ wedding });
});

export const DELETE = withErrorHandling(async (
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const coupleId = await requireCoupleId();
  if (!coupleId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const weddingId = Number((await params).id);

  await db().sql`DELETE FROM weddings WHERE id = ${weddingId} AND couple_id = ${coupleId}`;

  return NextResponse.json({ ok: true });
});
