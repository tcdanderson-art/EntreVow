import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withErrorHandling } from "@/lib/route-handler";
import { rateLimit } from "@/lib/rate-limit";
import { Wedding } from "@/types/wedding";
import { Photo } from "@/types/photo";
import { isPaid } from "@/lib/plan";

// Moderators can hide/unhide, but not delete — that stays couple-only,
// so a more casually-shared link can't be used to wipe out guest photos.
export const PATCH = withErrorHandling(async (
  req: NextRequest,
  { params }: { params: Promise<{ code: string; photoId: string }> }
) => {
  const { code, photoId } = await params;

  const limited = rateLimit(req, "moderator-photo-hide", 60, 60_000, code);
  if (limited) return limited;

  const database = db();

  const weddings = (await database.sql`
    SELECT * FROM weddings WHERE moderator_code = ${code}
  `) as Wedding[];
  const wedding = weddings[0];
  if (!wedding || !isPaid(wedding)) {
    return NextResponse.json({ error: "Moderator link not found" }, { status: 404 });
  }

  const { hidden } = await req.json();
  if (typeof hidden !== "boolean") {
    return NextResponse.json({ error: "hidden must be a boolean" }, { status: 400 });
  }

  const [photo] = (await database.sql`
    UPDATE photos SET hidden = ${hidden} WHERE id = ${Number(photoId)} AND wedding_id = ${wedding.id}
    RETURNING *
  `) as Photo[];

  if (!photo) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ photo });
});
