import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireCoupleId } from "@/lib/require-auth";
import { coupleOwnsWedding } from "@/lib/wedding-ownership";
import { generateAccessCode } from "@/lib/access-code";
import { withErrorHandling } from "@/lib/route-handler";
import { Shuttle } from "@/types/shuttle";

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

  const shuttles = (await db().sql`
    SELECT * FROM shuttles WHERE wedding_id = ${weddingId} ORDER BY created_at ASC
  `) as Shuttle[];

  return NextResponse.json({ shuttles });
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

  const { label, pickupTime } = await req.json();
  if (!label || typeof label !== "string" || !label.trim()) {
    return NextResponse.json({ error: "Label is required" }, { status: 400 });
  }

  const driverCode = generateAccessCode();
  const [shuttle] = (await db().sql`
    INSERT INTO shuttles (wedding_id, label, driver_code, pickup_time)
    VALUES (${weddingId}, ${label.trim()}, ${driverCode}, ${typeof pickupTime === "string" && pickupTime ? pickupTime : null})
    RETURNING *
  `) as Shuttle[];

  return NextResponse.json({ shuttle });
});
