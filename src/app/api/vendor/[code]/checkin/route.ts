import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withErrorHandling } from "@/lib/route-handler";
import { rateLimit } from "@/lib/rate-limit";
import { Wedding } from "@/types/wedding";
import { Vendor } from "@/types/vendor";
import { isFullTier } from "@/lib/plan";

export const POST = withErrorHandling(async (
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) => {
  const { code } = await params;

  const limited = rateLimit(req, "vendor-checkin", 10, 60_000, code);
  if (limited) return limited;

  const database = db();

  const vendors = (await database.sql`SELECT * FROM vendors WHERE vendor_code = ${code}`) as Vendor[];
  const vendor = vendors[0];
  if (!vendor) return NextResponse.json({ error: "Vendor link not found" }, { status: 404 });

  const weddings = (await database.sql`SELECT * FROM weddings WHERE id = ${vendor.wedding_id}`) as Wedding[];
  const wedding = weddings[0];
  if (!wedding || !isFullTier(wedding)) {
    return NextResponse.json({ error: "Vendor link not found" }, { status: 404 });
  }

  if (vendor.checked_in_at) {
    return NextResponse.json({ vendor, alreadyCheckedIn: true });
  }

  const [updated] = (await database.sql`
    UPDATE vendors SET checked_in_at = NOW() WHERE vendor_code = ${code}
    RETURNING *
  `) as Vendor[];

  return NextResponse.json({ vendor: updated, alreadyCheckedIn: false });
});
