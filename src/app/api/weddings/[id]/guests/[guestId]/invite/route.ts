import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireCoupleId } from "@/lib/require-auth";
import { coupleOwnsWedding } from "@/lib/wedding-ownership";
import { withErrorHandling } from "@/lib/route-handler";
import { sendGuestInviteEmail } from "@/lib/email";
import { Guest } from "@/types/guest";
import { Wedding } from "@/types/wedding";

export const POST = withErrorHandling(async (
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

  const database = db();
  const [wedding] = (await database.sql`
    SELECT * FROM weddings WHERE id = ${weddingId}
  `) as Wedding[];
  const [guest] = (await database.sql`
    SELECT * FROM guests WHERE id = ${Number(guestId)} AND wedding_id = ${weddingId}
  `) as Guest[];

  if (!guest) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!guest.email) {
    return NextResponse.json({ error: "This guest has no email address on file" }, { status: 400 });
  }

  const origin = wedding.slug ? `https://${wedding.slug}.entrevow.com` : req.nextUrl.origin;
  const guestUrl = `${origin}/g/${guest.access_code}`;
  await sendGuestInviteEmail(guest.email, guest.name, wedding.title, guestUrl);

  const [updated] = (await database.sql`
    UPDATE guests SET invite_sent_at = NOW() WHERE id = ${guest.id}
    RETURNING *
  `) as Guest[];

  return NextResponse.json({ guest: updated });
});
