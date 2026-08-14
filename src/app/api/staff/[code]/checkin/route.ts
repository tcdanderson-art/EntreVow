import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withErrorHandling } from "@/lib/route-handler";
import { rateLimit } from "@/lib/rate-limit";
import { Wedding } from "@/types/wedding";
import { StaffGuest } from "@/types/guest";
import { isFullTier } from "@/lib/plan";

export const POST = withErrorHandling(async (
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) => {
  const { code } = await params;

  // Generous limit — real ushers scan dozens of guests per minute at the door.
  const limited = rateLimit(req, "staff-checkin", 60, 60_000, code);
  if (limited) return limited;

  // guestCode: the access_code decoded from a guest's own QR pass (scan mode) — that
  // value comes from the guest's device, not from anything we send an usher's browser.
  // guestId: identifies a guest picked from the search-mode list, which (deliberately)
  // never carries access_code — see StaffGuest.
  const { guestCode, guestId } = await req.json();
  if (!guestCode && !guestId) {
    return NextResponse.json({ error: "guestCode or guestId is required" }, { status: 400 });
  }

  const database = db();

  const weddings = (await database.sql`
    SELECT id, plan_tier FROM weddings WHERE staff_code = ${code}
  `) as Wedding[];
  const wedding = weddings[0];
  if (!wedding || !isFullTier(wedding)) {
    return NextResponse.json({ error: "Staff link not found" }, { status: 404 });
  }

  const existing = (
    guestCode
      ? await database.sql`
          SELECT id, wedding_id, name, guest_group, table_label, checked_in_at
          FROM guests WHERE access_code = ${guestCode} AND wedding_id = ${wedding.id}
        `
      : await database.sql`
          SELECT id, wedding_id, name, guest_group, table_label, checked_in_at
          FROM guests WHERE id = ${guestId} AND wedding_id = ${wedding.id}
        `
  ) as StaffGuest[];
  if (!existing[0]) {
    return NextResponse.json({ error: "This guest isn't on the list for this wedding" }, { status: 404 });
  }

  if (existing[0].checked_in_at) {
    return NextResponse.json({ guest: existing[0], alreadyCheckedIn: true });
  }

  const [guest] = (
    guestCode
      ? await database.sql`
          UPDATE guests SET checked_in_at = NOW()
          WHERE access_code = ${guestCode} AND wedding_id = ${wedding.id}
          RETURNING id, wedding_id, name, guest_group, table_label, checked_in_at
        `
      : await database.sql`
          UPDATE guests SET checked_in_at = NOW()
          WHERE id = ${guestId} AND wedding_id = ${wedding.id}
          RETURNING id, wedding_id, name, guest_group, table_label, checked_in_at
        `
  ) as StaffGuest[];

  return NextResponse.json({ guest, alreadyCheckedIn: false });
});
