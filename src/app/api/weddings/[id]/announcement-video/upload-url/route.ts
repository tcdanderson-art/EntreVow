import { NextRequest, NextResponse } from "next/server";
import { requireCoupleId } from "@/lib/require-auth";
import { coupleOwnsWedding } from "@/lib/wedding-ownership";
import { withErrorHandling } from "@/lib/route-handler";
import { rateLimit } from "@/lib/rate-limit";
import { validateVideoUpload, mintVideoUploadUrl } from "@/lib/video-upload";

const MAX_BYTES = 60 * 1024 * 1024;

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

  const limited = rateLimit(req, "announcement-video-mint", 20, 60_000, String(coupleId));
  if (limited) return limited;

  const { contentType, size } = await req.json();
  const validationError = validateVideoUpload(contentType, size, MAX_BYTES);
  if (validationError) return NextResponse.json({ error: validationError }, { status: 400 });

  const { data, error } = await mintVideoUploadUrl(weddingId, contentType);
  if (error || !data) return NextResponse.json({ error: "Could not prepare upload" }, { status: 500 });

  return NextResponse.json({ path: data.path, token: data.token });
});
