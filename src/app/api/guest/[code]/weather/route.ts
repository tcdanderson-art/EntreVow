import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withErrorHandling } from "@/lib/route-handler";
import { getWeddingDayForecast } from "@/lib/weather";
import { isPaid } from "@/lib/plan";
import { Guest } from "@/types/guest";
import { Wedding } from "@/types/wedding";

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
    return NextResponse.json({ available: false, reason: "requires_full_tier" });
  }

  return NextResponse.json(await getWeddingDayForecast(wedding));
});
