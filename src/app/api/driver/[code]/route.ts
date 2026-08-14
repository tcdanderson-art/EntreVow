import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withErrorHandling } from "@/lib/route-handler";
import { Shuttle } from "@/types/shuttle";
import { Wedding } from "@/types/wedding";
import { isFullTier } from "@/lib/plan";

export const GET = withErrorHandling(async (
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) => {
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
