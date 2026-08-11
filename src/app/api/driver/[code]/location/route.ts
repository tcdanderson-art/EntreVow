import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withErrorHandling } from "@/lib/route-handler";
import { rateLimit } from "@/lib/rate-limit";
import { Shuttle } from "@/types/shuttle";

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

  const [shuttle] = (await db().sql`
    UPDATE shuttles SET lat = ${lat}, lng = ${lng}, location_updated_at = NOW()
    WHERE driver_code = ${code}
    RETURNING *
  `) as Shuttle[];

  if (!shuttle) {
    return NextResponse.json({ error: "Driver link not found" }, { status: 404 });
  }

  return NextResponse.json({ shuttle });
});
