import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withErrorHandling } from "@/lib/route-handler";
import { rateLimit } from "@/lib/rate-limit";
import { Shuttle } from "@/types/shuttle";
import { Wedding } from "@/types/wedding";
import { isFullTier } from "@/lib/plan";

export const GET = withErrorHandling(async (
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) => {
  const limited = rateLimit(req, "driver-lookup", 60, 60_000);
  if (limited) return limited;

  const { code } = await params;
  const database = db();

  const shuttles = (await database.sql`
    SELECT * FROM shuttles WHERE driver_code = ${code}
  `) as Shuttle[];
  const shuttle = shuttles[0];
  if (!shuttle) {
    return NextResponse.json({ error: "Driver link not found" }, { status: 404 });
  }

  const weddings = (await database.sql`
    SELECT id, title, plan_tier FROM weddings WHERE id = ${shuttle.wedding_id}
  `) as Wedding[];
  const wedding = weddings[0];
  if (!wedding || !isFullTier(wedding)) {
    return NextResponse.json({ error: "Driver link not found" }, { status: 404 });
  }

  return NextResponse.json({ shuttle, wedding });
});
