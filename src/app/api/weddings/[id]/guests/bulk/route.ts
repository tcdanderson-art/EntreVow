import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireCoupleId } from "@/lib/require-auth";
import { coupleOwnsWedding } from "@/lib/wedding-ownership";
import { generateAccessCode } from "@/lib/access-code";
import { withErrorHandling } from "@/lib/route-handler";
import { Guest } from "@/types/guest";

export const POST = withErrorHandling(async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const coupleId = await requireCoupleId();
  if (!coupleId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const weddingId = Number((await params).id);
  if (!(await coupleOwnsWedding(coupleId, weddingId))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { guests } = await req.json();
  if (!Array.isArray(guests) || guests.length === 0) {
    return NextResponse.json({ error: "No guests provided" }, { status: 400 });
  }

  const database = db();
  const rows = guests.map((g: { name: string; guestGroup?: string; email?: string }) => [
    weddingId,
    g.name,
    g.guestGroup || "general",
    generateAccessCode(),
    g.email || null,
  ]);

  const values = database.sql.values(rows);
  const inserted = (await database.sql`
    INSERT INTO guests (wedding_id, name, guest_group, access_code, email)
    VALUES ${values}
    RETURNING *
  `) as Guest[];

  return NextResponse.json({ guests: inserted });
});
