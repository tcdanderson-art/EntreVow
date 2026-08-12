import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withErrorHandling } from "@/lib/route-handler";
import { rateLimit } from "@/lib/rate-limit";
import { isFullTier } from "@/lib/plan";
import { Shuttle } from "@/types/shuttle";
import { Wedding } from "@/types/wedding";

export const POST = withErrorHandling(async (
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) => {
  const { code } = await params;

  // Client throttles to 1 update/10s already; this is a server-side backstop
  // against a compromised or scripted client, not the primary rate control.
  const limited = rateLimit(req, "driver-location", 30, 60_000, code);
  if (limited) return limited;

  const { lat, lng } = await req.json();

  if (typeof lat !== "number" || typeof lng !== "number") {
    return NextResponse.json({ error: "lat and lng are required" }, { status: 400 });
  }

  const database = db();

  const existingShuttles = (await database.sql`SELECT wedding_id FROM shuttles WHERE driver_code = ${code}`) as Pick<Shuttle, "wedding_id">[];
  if (!existingShuttles[0]) {
    return NextResponse.json({ error: "Driver link not found" }, { status: 404 });
  }

  const weddings = (await database.sql`
    SELECT plan_tier FROM weddings WHERE id = ${existingShuttles[0].wedding_id}
  `) as Pick<Wedding, "plan_tier">[];
  if (!weddings[0] || !isFullTier(weddings[0])) {
    return NextResponse.json({ error: "Driver link not found" }, { status: 404 });
  }

  const [shuttle] = (await database.sql`
    UPDATE shuttles SET lat = ${lat}, lng = ${lng}, location_updated_at = NOW()
    WHERE driver_code = ${code}
    RETURNING *
  `) as Shuttle[];

  return NextResponse.json({ shuttle });
});
