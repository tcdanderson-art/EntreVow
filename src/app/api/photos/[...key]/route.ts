import { NextRequest, NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/route-handler";
import { getPhotoStore } from "@/lib/photo-store";

export const GET = withErrorHandling(async (
  _req: NextRequest,
  { params }: { params: Promise<{ key: string[] }> }
) => {
  const { key } = await params;
  const blobKey = key.join("/");

  const store = getPhotoStore();
  const result = await store.getWithMetadata(blobKey, { type: "arrayBuffer" });
  if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const contentType = (result.metadata?.contentType as string) || "application/octet-stream";

  return new NextResponse(result.data, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
});
