import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withErrorHandling } from "@/lib/route-handler";
import { rateLimit } from "@/lib/rate-limit";
import { isPaid } from "@/lib/plan";
import { isOwnStorageKey } from "@/lib/storage-key";
import { Guest } from "@/types/guest";
import { Photo } from "@/types/photo";
import { Wedding } from "@/types/wedding";

// Confirms a photo already uploaded direct-to-storage via the upload-url route —
// the server never sees the bytes, just records the key once the client's PUT succeeds.
export const POST = withErrorHandling(async (
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) => {
  const { code } = await params;

  const limited = rateLimit(req, "guest-photo", 10, 60 * 60_000, code);
  if (limited) return limited;

  const database = db();

  const guests = (await database.sql`SELECT * FROM guests WHERE access_code = ${code}`) as Guest[];
  const guest = guests[0];
  if (!guest) return NextResponse.json({ error: "Guest link not found" }, { status: 404 });

  const weddings = (await database.sql`SELECT paid_at FROM weddings WHERE id = ${guest.wedding_id}`) as Pick<Wedding, "paid_at">[];
  if (!weddings[0] || !isPaid(weddings[0])) {
    return NextResponse.json({ error: "Guest access isn't active yet" }, { status: 402 });
  }

  const { storage_key, caption } = await req.json();
  if (typeof storage_key !== "string" || !storage_key || !isOwnStorageKey(storage_key, guest.wedding_id)) {
    return NextResponse.json({ error: "Invalid storage_key" }, { status: 400 });
  }

  const [photo] = (await database.sql`
    INSERT INTO photos (wedding_id, guest_id, blob_key, caption)
    VALUES (${guest.wedding_id}, ${guest.id}, ${storage_key}, ${typeof caption === "string" && caption.trim() ? caption.trim() : null})
    RETURNING *
  `) as Photo[];

  return NextResponse.json({ photo: { ...photo, guest_name: guest.name } });
});
