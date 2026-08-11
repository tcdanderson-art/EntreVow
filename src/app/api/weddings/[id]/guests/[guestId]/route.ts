import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireCoupleId } from "@/lib/require-auth";
import { coupleOwnsWedding } from "@/lib/wedding-ownership";
import { withErrorHandling } from "@/lib/route-handler";
import { Guest } from "@/types/guest";

export const PATCH = withErrorHandling(async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string; guestId: string }> }
) => {
  const coupleId = await requireCoupleId();
  if (!coupleId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id, guestId } = await params;
  const weddingId = Number(id);
  if (!(await coupleOwnsWedding(coupleId, weddingId))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { name, guestGroup, rsvpStatus, tableLabel, email } = await req.json();
  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  const validStatus = ["pending", "attending", "declined"].includes(rsvpStatus)
    ? rsvpStatus
    : null;

  const [guest] = validStatus
    ? ((await db().sql`
        UPDATE guests
        SET name = ${name}, guest_group = ${guestGroup ?? "general"},
            rsvp_status = ${validStatus},
            rsvp_responded_at = CASE WHEN ${validStatus} = 'pending' THEN NULL ELSE NOW() END,
            table_label = ${tableLabel || null}, email = ${email || null}
        WHERE id = ${Number(guestId)} AND wedding_id = ${weddingId}
        RETURNING *
      `) as Guest[])
    : ((await db().sql`
        UPDATE guests
        SET name = ${name}, guest_group = ${guestGroup ?? "general"}, table_label = ${tableLabel || null},
            email = ${email || null}
        WHERE id = ${Number(guestId)} AND wedding_id = ${weddingId}
        RETURNING *
      `) as Guest[]);

  if (!guest) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ guest });
});

export const DELETE = withErrorHandling(async (
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; guestId: string }> }
) => {
  const coupleId = await requireCoupleId();
  if (!coupleId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id, guestId } = await params;
  const weddingId = Number(id);
  if (!(await coupleOwnsWedding(coupleId, weddingId))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db().sql`DELETE FROM guests WHERE id = ${Number(guestId)} AND wedding_id = ${weddingId}`;

  return NextResponse.json({ ok: true });
});
