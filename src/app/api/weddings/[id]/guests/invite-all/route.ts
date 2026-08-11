import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireCoupleId } from "@/lib/require-auth";
import { coupleOwnsWedding } from "@/lib/wedding-ownership";
import { withErrorHandling } from "@/lib/route-handler";
import { sendGuestInviteEmail } from "@/lib/email";
import { Guest } from "@/types/guest";
import { Wedding } from "@/types/wedding";

// Sends only to guests who have an email on file and haven't been invited yet —
// resending to an already-invited guest is a per-guest action, not part of this batch.
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

  const database = db();
  const [wedding] = (await database.sql`SELECT * FROM weddings WHERE id = ${weddingId}`) as Wedding[];
  const guests = (await database.sql`
    SELECT * FROM guests
    WHERE wedding_id = ${weddingId} AND email IS NOT NULL AND invite_sent_at IS NULL
  `) as Guest[];

  if (guests.length === 0) {
    return NextResponse.json({ sent: 0, failed: 0, guests: [] });
  }

  const origin = wedding.slug ? `https://${wedding.slug}.entrevow.com` : req.nextUrl.origin;

  const results = await Promise.allSettled(
    guests.map((guest) =>
      sendGuestInviteEmail(
        guest.email as string,
        guest.name,
        wedding.title,
        `${origin}/g/${guest.access_code}`
      )
    )
  );

  const sent = guests.filter((_, i) => results[i].status === "fulfilled");

  const updated = (
    await Promise.all(
      sent.map(async (guest) => {
        const rows = (await database.sql`
          UPDATE guests SET invite_sent_at = NOW() WHERE id = ${guest.id}
          RETURNING *
        `) as Guest[];
        return rows[0];
      })
    )
  );

  return NextResponse.json({ sent: sent.length, failed: guests.length - sent.length, guests: updated });
});
