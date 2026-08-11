import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireCoupleId } from "@/lib/require-auth";
import { withErrorHandling } from "@/lib/route-handler";
import { slugify } from "@/lib/slug";
import { Wedding } from "@/types/wedding";

export const GET = withErrorHandling(async () => {
  const coupleId = await requireCoupleId();
  if (!coupleId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const database = db();
  const weddings = (await database.sql`
    SELECT * FROM weddings WHERE couple_id = ${coupleId} ORDER BY created_at DESC
  `) as Wedding[];

  return NextResponse.json({ weddings });
});

export const POST = withErrorHandling(async (req: NextRequest) => {
  const coupleId = await requireCoupleId();
  if (!coupleId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { title, weddingDate, emergencyPhone } = await req.json();
  if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 });

  const database = db();
  const slug = slugify(title) || null;
  const [wedding] = (await database.sql`
    INSERT INTO weddings (couple_id, title, wedding_date, emergency_phone, slug)
    VALUES (${coupleId}, ${title}, ${weddingDate ?? null}, ${emergencyPhone ?? null}, ${slug})
    RETURNING *
  `) as Wedding[];

  return NextResponse.json({ wedding });
});
