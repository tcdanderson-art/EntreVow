import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireCoupleId } from "@/lib/require-auth";
import { coupleOwnsWedding } from "@/lib/wedding-ownership";
import { generateAccessCode } from "@/lib/access-code";
import { withErrorHandling } from "@/lib/route-handler";
import { isFullTier, ESSENTIALS_GUEST_CAP } from "@/lib/plan";
import { Guest } from "@/types/guest";
import { Wedding } from "@/types/wedding";

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

  const weddings = (await database.sql`SELECT plan_tier FROM weddings WHERE id = ${weddingId}`) as Pick<Wedding, "plan_tier">[];
  if (!isFullTier(weddings[0] ?? { plan_tier: null })) {
    const [{ count }] = (await database.sql`
      SELECT COUNT(*)::int AS count FROM guests WHERE wedding_id = ${weddingId}
    `) as { count: number }[];
    if (count + guests.length > ESSENTIALS_GUEST_CAP) {
      return NextResponse.json(
        { error: `The Essentials plan is limited to ${ESSENTIALS_GUEST_CAP} guests — upgrade to Full Day-Of for unlimited guests.` },
        { status: 402 }
      );
    }
  }

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
