import { NextRequest, NextResponse } from "next/server";
import { db, transaction } from "@/lib/db";
import { requireCoupleId } from "@/lib/require-auth";
import { coupleOwnsWedding } from "@/lib/wedding-ownership";
import { generateAccessCode } from "@/lib/access-code";
import { withErrorHandling, HttpError } from "@/lib/route-handler";
import { isFullTier, ESSENTIALS_GUEST_CAP } from "@/lib/plan";
import { Guest } from "@/types/guest";
import { Wedding } from "@/types/wedding";

export const GET = withErrorHandling(async (
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const coupleId = await requireCoupleId();
  if (!coupleId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const weddingId = Number((await params).id);
  if (!(await coupleOwnsWedding(coupleId, weddingId))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const guests = (await db().sql`
    SELECT * FROM guests WHERE wedding_id = ${weddingId} ORDER BY created_at ASC
  `) as Guest[];

  return NextResponse.json({ guests });
});

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

  const { name, guestGroup, email, plusOneAllowed } = await req.json();
  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  // pg_advisory_xact_lock serializes concurrent guest-count-check-then-insert
  // calls for the same wedding so two requests can't both read a stale count,
  // both pass the cap check, and both insert — the lock auto-releases when
  // the transaction commits or rolls back.
  const guest = await transaction(async (sql) => {
    await sql`SELECT pg_advisory_xact_lock(${weddingId})`;

    const weddings = (await sql`SELECT plan_tier FROM weddings WHERE id = ${weddingId}`) as Pick<Wedding, "plan_tier">[];
    if (!isFullTier(weddings[0] ?? { plan_tier: null })) {
      const [{ count }] = (await sql`
        SELECT COUNT(*)::int AS count FROM guests WHERE wedding_id = ${weddingId}
      `) as { count: number }[];
      if (count >= ESSENTIALS_GUEST_CAP) {
        throw new HttpError(
          402,
          `The Essentials plan is limited to ${ESSENTIALS_GUEST_CAP} guests — upgrade to Full Day-Of for unlimited guests.`
        );
      }
    }

    const accessCode = generateAccessCode();
    const [inserted] = (await sql`
      INSERT INTO guests (wedding_id, name, guest_group, access_code, email, plus_one_allowed)
      VALUES (${weddingId}, ${name}, ${guestGroup ?? "general"}, ${accessCode}, ${email || null}, ${!!plusOneAllowed})
      RETURNING *
    `) as Guest[];
    return inserted;
  });

  return NextResponse.json({ guest });
});
