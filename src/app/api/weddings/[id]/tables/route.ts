import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireCoupleId } from "@/lib/require-auth";
import { coupleOwnsWedding } from "@/lib/wedding-ownership";
import { withErrorHandling } from "@/lib/route-handler";
import { WeddingTable } from "@/types/table";

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

  const tables = (await db().sql`
    SELECT * FROM wedding_tables WHERE wedding_id = ${weddingId} ORDER BY sort_order ASC, id ASC
  `) as WeddingTable[];

  return NextResponse.json({ tables });
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

  const { name, capacity } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "Table name is required" }, { status: 400 });

  const cleanCapacity = Number.isFinite(capacity) && capacity > 0 ? Math.trunc(capacity) : null;

  const existing = await db().sql`
    SELECT id FROM wedding_tables WHERE wedding_id = ${weddingId} AND name = ${name.trim()}
  `;
  if (existing.length > 0) {
    return NextResponse.json({ error: "A table with that name already exists" }, { status: 409 });
  }

  const [{ count }] = (await db().sql`
    SELECT COUNT(*)::int AS count FROM wedding_tables WHERE wedding_id = ${weddingId}
  `) as { count: number }[];

  const [table] = (await db().sql`
    INSERT INTO wedding_tables (wedding_id, name, capacity, sort_order)
    VALUES (${weddingId}, ${name.trim()}, ${cleanCapacity}, ${count})
    RETURNING *
  `) as WeddingTable[];

  return NextResponse.json({ table });
});
