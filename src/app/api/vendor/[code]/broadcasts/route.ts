import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withErrorHandling } from "@/lib/route-handler";
import { Wedding } from "@/types/wedding";
import { Vendor } from "@/types/vendor";
import { isFullTier } from "@/lib/plan";
import { broadcastsForRole } from "@/lib/crew-broadcasts";

export const GET = withErrorHandling(async (
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) => {
  const { code } = await params;
  const database = db();

  const vendors = (await database.sql`SELECT * FROM vendors WHERE vendor_code = ${code}`) as Vendor[];
  const vendor = vendors[0];
  if (!vendor) return NextResponse.json({ error: "Vendor link not found" }, { status: 404 });

  const weddings = (await database.sql`SELECT * FROM weddings WHERE id = ${vendor.wedding_id}`) as Wedding[];
  const wedding = weddings[0];
  if (!wedding || !isFullTier(wedding)) {
    return NextResponse.json({ error: "Vendor link not found" }, { status: 404 });
  }

  const broadcasts = await broadcastsForRole(wedding.id, "vendor");
  return NextResponse.json({ broadcasts });
});
