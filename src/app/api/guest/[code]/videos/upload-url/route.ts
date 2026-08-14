import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withErrorHandling } from "@/lib/route-handler";
import { rateLimit } from "@/lib/rate-limit";
import { validateVideoUpload, mintVideoUploadUrl } from "@/lib/video-upload";
import { isPaid } from "@/lib/plan";
import { Guest } from "@/types/guest";
import { Wedding } from "@/types/wedding";

const MAX_BYTES = 40 * 1024 * 1024; // sanity backstop on the declared size — bucket-level limit is the hard enforcement

export const POST = withErrorHandling(async (
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) => {
  const { code } = await params;

  const limited = rateLimit(req, "guest-video-mint", 5, 60 * 60_000, code);
  if (limited) return limited;

  const database = db();

  const guests = (await database.sql`SELECT * FROM guests WHERE access_code = ${code}`) as Guest[];
  const guest = guests[0];
  if (!guest) return NextResponse.json({ error: "Guest link not found" }, { status: 404 });

  const weddings = (await database.sql`SELECT paid_at FROM weddings WHERE id = ${guest.wedding_id}`) as Pick<Wedding, "paid_at">[];
  if (!weddings[0] || !isPaid(weddings[0])) {
    return NextResponse.json({ error: "Guest access isn't active yet" }, { status: 402 });
  }

  const { contentType, size, kind } = await req.json();
  const uploadKind = kind === "audio" ? "audio" : "video";
  const validationError = validateVideoUpload(contentType, size, MAX_BYTES, uploadKind);
  if (validationError) return NextResponse.json({ error: validationError }, { status: 400 });

  const { data, error } = await mintVideoUploadUrl(guest.wedding_id, contentType);
  if (error || !data) return NextResponse.json({ error: "Could not prepare upload" }, { status: 500 });

  return NextResponse.json({ path: data.path, token: data.token });
});
