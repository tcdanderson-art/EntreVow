import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withErrorHandling } from "@/lib/route-handler";
import { rateLimit } from "@/lib/rate-limit";
import { Wedding } from "@/types/wedding";
import { isFullTier } from "@/lib/plan";
import { broadcastsForRole } from "@/lib/crew-broadcasts";

export const GET = withErrorHandling(async (
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) => {
  const limited = rateLimit(req, "staff-broadcasts", 60, 60_000);
  if (limited) return limited;

  const { code } = await params;
  const database = db();

  const weddings = (await database.sql`SELECT * FROM weddings WHERE staff_code = ${code}`) as Wedding[];
  const wedding = weddings[0];
  if (!wedding || !isFullTier(wedding)) {
    return NextResponse.json({ error: "Staff link not found" }, { status: 404 });
  }

  const broadcasts = await broadcastsForRole(wedding.id, "staff");
  return NextResponse.json({ broadcasts });
});
