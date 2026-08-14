import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withErrorHandling } from "@/lib/route-handler";
import { Wedding } from "@/types/wedding";
import { StaffGuest } from "@/types/guest";
import { isFullTier } from "@/lib/plan";

export const GET = withErrorHandling(async (
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) => {
  const { code } = await params;
  const database = db();

  const weddings = (await database.sql`
    SELECT id, title, plan_tier FROM weddings WHERE staff_code = ${code}
  `) as Wedding[];
  const wedding = weddings[0];
  if (!wedding || !isFullTier(wedding)) {
    return NextResponse.json({ error: "Staff link not found" }, { status: 404 });
  }

  // access_code deliberately excluded — see StaffGuest.
  const guests = (await database.sql`
    SELECT id, wedding_id, name, guest_group, table_label, checked_in_at
    FROM guests WHERE wedding_id = ${wedding.id} ORDER BY name ASC
  `) as StaffGuest[];

  return NextResponse.json({ wedding, guests });
});
