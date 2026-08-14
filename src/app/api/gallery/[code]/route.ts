import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withErrorHandling } from "@/lib/route-handler";
import { Wedding } from "@/types/wedding";
import { Photo } from "@/types/photo";
import { isPaid } from "@/lib/plan";

export const GET = withErrorHandling(async (
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) => {
  const { code } = await params;
  const database = db();

  const weddings = (await database.sql`
    SELECT * FROM weddings WHERE gallery_code = ${code}
  `) as Wedding[];
  const wedding = weddings[0];
  if (!wedding || !isPaid(wedding)) {
    return NextResponse.json({ error: "Gallery link not found" }, { status: 404 });
  }

  const photos = (await database.sql`
    SELECT photos.*, guests.name AS guest_name
    FROM photos JOIN guests ON guests.id = photos.guest_id
    WHERE photos.wedding_id = ${wedding.id} AND photos.hidden = false
    ORDER BY photos.created_at DESC
  `) as Photo[];

  return NextResponse.json({ wedding: { title: wedding.title }, photos });
});
