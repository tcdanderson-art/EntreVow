import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withErrorHandling } from "@/lib/route-handler";
import { Shuttle } from "@/types/shuttle";
import { Wedding } from "@/types/wedding";

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
    SELECT * FROM weddings WHERE id = ${shuttle.wedding_id}
  `) as Wedding[];

  return NextResponse.json({ shuttle, wedding: weddings[0] });
});
