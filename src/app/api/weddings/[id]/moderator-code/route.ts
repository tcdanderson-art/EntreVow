import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireCoupleId } from "@/lib/require-auth";
import { coupleOwnsWedding } from "@/lib/wedding-ownership";
import { generateAccessCode } from "@/lib/access-code";
import { withErrorHandling } from "@/lib/route-handler";
import { Wedding } from "@/types/wedding";

// Creates a new video-moderator code, replacing any existing one (old links stop working).
export const POST = withErrorHandling(async (
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const coupleId = await requireCoupleId();
  if (!coupleId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const weddingId = Number((await params).id);
  if (!(await coupleOwnsWedding(coupleId, weddingId))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const moderatorCode = generateAccessCode();
  const [wedding] = (await db().sql`
    UPDATE weddings SET moderator_code = ${moderatorCode} WHERE id = ${weddingId}
    RETURNING *
  `) as Wedding[];

  return NextResponse.json({ wedding });
});

// Revokes the moderator link entirely — no new link is issued, delegation is off
// until the couple generates a fresh one.
export const DELETE = withErrorHandling(async (
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const coupleId = await requireCoupleId();
  if (!coupleId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const weddingId = Number((await params).id);
  if (!(await coupleOwnsWedding(coupleId, weddingId))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const [wedding] = (await db().sql`
    UPDATE weddings SET moderator_code = NULL WHERE id = ${weddingId}
    RETURNING *
  `) as Wedding[];

  return NextResponse.json({ wedding });
});
