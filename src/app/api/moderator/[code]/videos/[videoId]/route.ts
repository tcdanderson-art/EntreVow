import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withErrorHandling } from "@/lib/route-handler";
import { rateLimit } from "@/lib/rate-limit";
import { Wedding } from "@/types/wedding";
import { Video } from "@/types/video";
import { isPaid } from "@/lib/plan";

// Video moderators can approve/reject, but not delete — that stays couple-only,
// so a more casually-shared link can't be used to wipe out guestbook content.
export const PATCH = withErrorHandling(async (
  req: NextRequest,
  { params }: { params: Promise<{ code: string; videoId: string }> }
) => {
  const { code, videoId } = await params;

  const limited = rateLimit(req, "moderator-approve", 60, 60_000, code);
  if (limited) return limited;

  const database = db();

  const weddings = (await database.sql`
    SELECT * FROM weddings WHERE moderator_code = ${code}
  `) as Wedding[];
  const wedding = weddings[0];
  if (!wedding || !isPaid(wedding)) {
    return NextResponse.json({ error: "Moderator link not found" }, { status: 404 });
  }

  const { status } = await req.json();
  if (status !== "approved" && status !== "rejected") {
    return NextResponse.json({ error: "status must be 'approved' or 'rejected'" }, { status: 400 });
  }

  const [video] = (await database.sql`
    UPDATE videos SET status = ${status} WHERE id = ${Number(videoId)} AND wedding_id = ${wedding.id}
    RETURNING *
  `) as Video[];

  if (!video) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ video });
});
