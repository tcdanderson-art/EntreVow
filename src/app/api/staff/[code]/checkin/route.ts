import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withErrorHandling } from "@/lib/route-handler";
import { rateLimit } from "@/lib/rate-limit";
import { Wedding } from "@/types/wedding";
import { Guest } from "@/types/guest";
import { isFullTier } from "@/lib/plan";

export const POST = withErrorHandling(async (
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) => {
  const { code } = await params;

  // Generous limit — real ushers scan dozens of guests per minute at the door.
  const limited = rateLimit(req, "staff-checkin", 60, 60_000, code);
  if (limited) return limited;

  const { guestCode } = await req.json();
  if (!guestCode) return NextResponse.json({ error: "guestCode is required" }, { status: 400 });

  const database = db();

  const weddings = (await database.sql`
    SELECT * FROM weddings WHERE staff_code = ${code}
  `) as Wedding[];
  const wedding = weddings[0];
  if (!wedding || !isFullTier(wedding)) {
    return NextResponse.json({ error: "Staff link not found" }, { status: 404 });
  }

  const existing = (await database.sql`
    SELECT * FROM guests WHERE access_code = ${guestCode} AND wedding_id = ${wedding.id}
  `) as Guest[];
  if (!existing[0]) {
    return NextResponse.json({ error: "This code isn't on the guest list for this wedding" }, { status: 404 });
  }

  if (existing[0].checked_in_at) {
    return NextResponse.json({ guest: existing[0], alreadyCheckedIn: true });
  }

  const [guest] = (await database.sql`
    UPDATE guests SET checked_in_at = NOW()
    WHERE access_code = ${guestCode} AND wedding_id = ${wedding.id}
    RETURNING *
  `) as Guest[];

  return NextResponse.json({ guest, alreadyCheckedIn: false });
});
