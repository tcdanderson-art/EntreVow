import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withErrorHandling } from "@/lib/route-handler";
import { rateLimit } from "@/lib/rate-limit";
import { supabaseAdmin } from "@/lib/supabase";
import { storageKey } from "@/lib/storage-key";
import { isPaid } from "@/lib/plan";
import { Guest } from "@/types/guest";
import { Wedding } from "@/types/wedding";

const MAX_BYTES = 8 * 1024 * 1024; // client compresses before upload, this is a sanity backstop on the declared size
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export const POST = withErrorHandling(async (
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) => {
  const { code } = await params;

  const limited = rateLimit(req, "guest-photo-mint", 10, 60 * 60_000, code);
  if (limited) return limited;

  const database = db();

  const guests = (await database.sql`SELECT * FROM guests WHERE access_code = ${code}`) as Guest[];
  const guest = guests[0];
  if (!guest) return NextResponse.json({ error: "Guest link not found" }, { status: 404 });

  const weddings = (await database.sql`SELECT paid_at FROM weddings WHERE id = ${guest.wedding_id}`) as Pick<Wedding, "paid_at">[];
  if (!weddings[0] || !isPaid(weddings[0])) {
    return NextResponse.json({ error: "Guest access isn't active yet" }, { status: 402 });
  }

  const { contentType, size } = await req.json();

  if (typeof contentType !== "string" || !ALLOWED_TYPES.has(contentType)) {
    return NextResponse.json({ error: "Only JPEG, PNG, or WebP images are allowed" }, { status: 400 });
  }
  if (typeof size !== "number" || size > MAX_BYTES) {
    return NextResponse.json({ error: "Photo is too large" }, { status: 400 });
  }

  const extension = contentType === "image/png" ? "png" : contentType === "image/webp" ? "webp" : "jpg";
  const key = storageKey(guest.wedding_id, extension);

  const { data, error } = await supabaseAdmin().storage.from("photos").createSignedUploadUrl(key);
  if (error || !data) return NextResponse.json({ error: "Could not prepare upload" }, { status: 500 });

  return NextResponse.json({ path: data.path, token: data.token });
});
