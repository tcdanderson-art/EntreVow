import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireCoupleId } from "@/lib/require-auth";
import { withErrorHandling } from "@/lib/route-handler";
import { slugify } from "@/lib/slug";
import { Wedding } from "@/types/wedding";

export const PATCH = withErrorHandling(async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const coupleId = await requireCoupleId();
  if (!coupleId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const weddingId = Number((await params).id);
  const { title, weddingDate, emergencyPhone, slug } = await req.json();
  if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 });

  const cleanSlug = slug ? slugify(slug) : null;

  const [wedding] = (await db().sql`
    UPDATE weddings
    SET title = ${title}, wedding_date = ${weddingDate ?? null},
        emergency_phone = ${emergencyPhone ?? null}, slug = ${cleanSlug || null}
    WHERE id = ${weddingId} AND couple_id = ${coupleId}
    RETURNING *
  `) as Wedding[];

  if (!wedding) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ wedding });
});

export const DELETE = withErrorHandling(async (
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const coupleId = await requireCoupleId();
  if (!coupleId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const weddingId = Number((await params).id);

  await db().sql`DELETE FROM weddings WHERE id = ${weddingId} AND couple_id = ${coupleId}`;

  return NextResponse.json({ ok: true });
});
