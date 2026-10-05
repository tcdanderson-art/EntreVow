import { NextRequest, NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/route-handler";
import { rateLimit } from "@/lib/rate-limit";
import { BETA_FREE_SPOTS, getBetaSpotsLeft } from "@/lib/beta-offer";

export const dynamic = "force-dynamic";

export const GET = withErrorHandling(async (req: NextRequest) => {
  const limited = rateLimit(req, "beta-offer", 60, 60_000);
  if (limited) return limited;
  return NextResponse.json({ total: BETA_FREE_SPOTS, remaining: await getBetaSpotsLeft() });
});
