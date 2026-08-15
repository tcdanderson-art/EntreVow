import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withErrorHandling } from "@/lib/route-handler";
import { rateLimit } from "@/lib/rate-limit";
import { isPaid } from "@/lib/plan";
import { isOwnStorageKey } from "@/lib/storage-key";
import { Guest } from "@/types/guest";
import { Video } from "@/types/video";
import { Wedding } from "@/types/wedding";

// Confirms a guestbook video already uploaded direct-to-storage — the server never
// sees the bytes, just records the key. Starts "pending" until the couple approves it.
export const POST = withErrorHandling(async (
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) => {
  const { code } = await params;

  const limited = rateLimit(req, "guest-video", 5, 60 * 60_000, code);
  if (limited) return limited;

  const database = db();

  const guests = (await database.sql`SELECT * FROM guests WHERE access_code = ${code}`) as Guest[];
  const guest = guests[0];
  if (!guest) return NextResponse.json({ error: "Guest link not found" }, { status: 404 });

  const weddings = (await database.sql`SELECT paid_at FROM weddings WHERE id = ${guest.wedding_id}`) as Pick<Wedding, "paid_at">[];
  if (!weddings[0] || !isPaid(weddings[0])) {
    return NextResponse.json({ error: "Guest access isn't active yet" }, { status: 402 });
  }

  const { storage_key, duration_seconds, caption, kind } = await req.json();
  if (typeof storage_key !== "string" || !storage_key || !isOwnStorageKey(storage_key, guest.wedding_id)) {
    return NextResponse.json({ error: "Invalid storage_key" }, { status: 400 });
  }
  if (typeof duration_seconds !== "number" || duration_seconds > 31) {
    return NextResponse.json({ error: "Recording must be 30 seconds or less" }, { status: 400 });
  }
  const recordingKind = kind === "audio" ? "audio" : "video";

  const [video] = (await database.sql`
    INSERT INTO videos (wedding_id, guest_id, storage_key, duration_seconds, caption, status, kind)
    VALUES (${guest.wedding_id}, ${guest.id}, ${storage_key}, ${duration_seconds}, ${typeof caption === "string" && caption.trim() ? caption.trim() : null}, 'pending', ${recordingKind})
    RETURNING *
  `) as Video[];

  return NextResponse.json({ video: { ...video, guest_name: guest.name } });
});
