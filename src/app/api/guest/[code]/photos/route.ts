import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withErrorHandling } from "@/lib/route-handler";
import { rateLimit } from "@/lib/rate-limit";
import { getPhotoStore } from "@/lib/photo-store";
import { Guest } from "@/types/guest";
import { Photo } from "@/types/photo";

const MAX_BYTES = 8 * 1024 * 1024; // 8MB — client compresses before upload, this is a server-side backstop
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

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

  const form = await req.formData();
  const file = form.get("photo");
  const caption = form.get("caption");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "photo is required" }, { status: 400 });
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: "Only JPEG, PNG, or WebP images are allowed" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Photo is too large" }, { status: 400 });
  }

  const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const blobKey = `${guest.wedding_id}/${randomUUID()}.${extension}`;

  const store = getPhotoStore();
  await store.set(blobKey, await file.arrayBuffer(), { metadata: { contentType: file.type } });

  const [photo] = (await database.sql`
    INSERT INTO photos (wedding_id, guest_id, blob_key, caption)
    VALUES (${guest.wedding_id}, ${guest.id}, ${blobKey}, ${typeof caption === "string" && caption.trim() ? caption.trim() : null})
    RETURNING *
  `) as Photo[];

  return NextResponse.json({ photo: { ...photo, guest_name: guest.name } });
});
