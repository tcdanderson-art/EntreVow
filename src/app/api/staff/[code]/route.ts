import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withErrorHandling } from "@/lib/route-handler";
import { Wedding } from "@/types/wedding";
import { Guest } from "@/types/guest";

export const GET = withErrorHandling(async (
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) => {
  const { code } = await params;
  const database = db();

  const weddings = (await database.sql`
    SELECT * FROM weddings WHERE staff_code = ${code}
  `) as Wedding[];
  const wedding = weddings[0];
  if (!wedding) {
    return NextResponse.json({ error: "Staff link not found" }, { status: 404 });
  }

  const guests = (await database.sql`
    SELECT * FROM guests WHERE wedding_id = ${wedding.id} ORDER BY name ASC
  `) as Guest[];

  return NextResponse.json({ wedding, guests });
});
