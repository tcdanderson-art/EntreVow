import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireCoupleId } from "@/lib/require-auth";
import { coupleOwnsWedding } from "@/lib/wedding-ownership";
import { withErrorHandling } from "@/lib/route-handler";
import { supabaseAdmin } from "@/lib/supabase";
import { isOwnStorageKey } from "@/lib/storage-key";
import { Wedding } from "@/types/wedding";

// Confirms a welcome video already uploaded direct-to-storage, replacing any
// existing one (couple-uploaded, no moderation needed).
export const POST = withErrorHandling(async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const coupleId = await requireCoupleId();
  if (!coupleId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;
  const weddingId = Number(id);
  if (!(await coupleOwnsWedding(coupleId, weddingId))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { storage_key } = await req.json();
  if (typeof storage_key !== "string" || !storage_key || !isOwnStorageKey(storage_key, weddingId)) {
    return NextResponse.json({ error: "Invalid storage_key" }, { status: 400 });
  }

  const [existing] = (await db().sql`SELECT welcome_video_key FROM weddings WHERE id = ${weddingId}`) as Pick<Wedding, "welcome_video_key">[];
  if (existing?.welcome_video_key) {
    await supabaseAdmin().storage.from("videos").remove([existing.welcome_video_key]);
  }

  const [wedding] = (await db().sql`
    UPDATE weddings SET welcome_video_key = ${storage_key} WHERE id = ${weddingId}
    RETURNING *
  `) as Wedding[];

  return NextResponse.json({ wedding });
});

export const DELETE = withErrorHandling(async (
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const coupleId = await requireCoupleId();
  if (!coupleId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;
  const weddingId = Number(id);
  if (!(await coupleOwnsWedding(coupleId, weddingId))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const [existing] = (await db().sql`SELECT welcome_video_key FROM weddings WHERE id = ${weddingId}`) as Pick<Wedding, "welcome_video_key">[];
  if (existing?.welcome_video_key) {
    await supabaseAdmin().storage.from("videos").remove([existing.welcome_video_key]);
  }

  await db().sql`UPDATE weddings SET welcome_video_key = NULL WHERE id = ${weddingId}`;

  return NextResponse.json({ ok: true });
});
