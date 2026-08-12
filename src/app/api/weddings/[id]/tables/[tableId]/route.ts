import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireCoupleId } from "@/lib/require-auth";
import { coupleOwnsWedding } from "@/lib/wedding-ownership";
import { withErrorHandling } from "@/lib/route-handler";
import { WeddingTable } from "@/types/table";

export const PATCH = withErrorHandling(async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string; tableId: string }> }
) => {
  const coupleId = await requireCoupleId();
  if (!coupleId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id, tableId } = await params;
  const weddingId = Number(id);
  if (!(await coupleOwnsWedding(coupleId, weddingId))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { name, capacity } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "Table name is required" }, { status: 400 });
  const cleanName = name.trim();
  const cleanCapacity = Number.isFinite(capacity) && capacity > 0 ? Math.trunc(capacity) : null;

  const database = db();

  const [current] = (await database.sql`
    SELECT * FROM wedding_tables WHERE id = ${Number(tableId)} AND wedding_id = ${weddingId}
  `) as WeddingTable[];
  if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const conflicting = await database.sql`
    SELECT id FROM wedding_tables
    WHERE wedding_id = ${weddingId} AND name = ${cleanName} AND id != ${Number(tableId)}
  `;
  if (conflicting.length > 0) {
    return NextResponse.json({ error: "A table with that name already exists" }, { status: 409 });
  }

  const [table] = (await database.sql`
    UPDATE wedding_tables SET name = ${cleanName}, capacity = ${cleanCapacity}
    WHERE id = ${Number(tableId)} AND wedding_id = ${weddingId}
    RETURNING *
  `) as WeddingTable[];

  // Guests are assigned to a table by matching table_label to the table's name
  // (see the seating chart builder) — renaming the table has to carry every
  // assigned guest's label along with it, or they'd silently fall back to
  // "unassigned" on next load.
  if (cleanName !== current.name) {
    await database.sql`
      UPDATE guests SET table_label = ${cleanName}
      WHERE wedding_id = ${weddingId} AND table_label = ${current.name}
    `;
  }

  return NextResponse.json({ table });
});

export const DELETE = withErrorHandling(async (
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; tableId: string }> }
) => {
  const coupleId = await requireCoupleId();
  if (!coupleId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id, tableId } = await params;
  const weddingId = Number(id);
  if (!(await coupleOwnsWedding(coupleId, weddingId))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const database = db();

  const [table] = (await database.sql`
    DELETE FROM wedding_tables WHERE id = ${Number(tableId)} AND wedding_id = ${weddingId}
    RETURNING *
  `) as WeddingTable[];
  if (!table) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Free the guests this table held so they reappear as unassigned instead of
  // pointing at a table name that no longer exists.
  await database.sql`
    UPDATE guests SET table_label = NULL
    WHERE wedding_id = ${weddingId} AND table_label = ${table.name}
  `;

  return NextResponse.json({ ok: true });
});
