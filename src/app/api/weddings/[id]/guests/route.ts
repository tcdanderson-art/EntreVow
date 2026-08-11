import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireCoupleId } from "@/lib/require-auth";
import { coupleOwnsWedding } from "@/lib/wedding-ownership";
import { generateAccessCode } from "@/lib/access-code";
import { withErrorHandling } from "@/lib/route-handler";
import { Guest } from "@/types/guest";

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

  const { name, guestGroup, email } = await req.json();
  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  const accessCode = generateAccessCode();
  const [guest] = (await db().sql`
    INSERT INTO guests (wedding_id, name, guest_group, access_code, email)
    VALUES (${weddingId}, ${name}, ${guestGroup ?? "general"}, ${accessCode}, ${email || null})
    RETURNING *
  `) as Guest[];

  return NextResponse.json({ guest });
});
