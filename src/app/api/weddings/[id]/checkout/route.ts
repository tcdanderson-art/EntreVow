import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireCoupleId } from "@/lib/require-auth";
import { withErrorHandling } from "@/lib/route-handler";
import { stripe, PLAN_PRICES, UPGRADE_PRICE } from "@/lib/stripe";
import { Wedding } from "@/types/wedding";

export const POST = withErrorHandling(async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const coupleId = await requireCoupleId();
  if (!coupleId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const weddingId = Number((await params).id);
  const { tier: rawTier } = await req.json();
  if (rawTier !== "essentials" && rawTier !== "full") {
    return NextResponse.json({ error: "Invalid plan tier" }, { status: 400 });
  }
  const tier: "essentials" | "full" = rawTier;

  const weddings = (await db().sql`
    SELECT * FROM weddings WHERE id = ${weddingId} AND couple_id = ${coupleId}
  `) as Wedding[];
  const wedding = weddings[0];
  if (!wedding) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (wedding.plan_tier === tier) {
    return NextResponse.json({ error: "This wedding is already on that plan" }, { status: 400 });
  }
  if (wedding.plan_tier === "full" && tier === "essentials") {
    return NextResponse.json({ error: "Can't downgrade from Full Day-Of" }, { status: 400 });
  }

  // An Essentials wedding upgrading to Full Day-Of pays only the difference,
  // not the full $249 again.
  const priceId =
    wedding.plan_tier === "essentials" && tier === "full" ? UPGRADE_PRICE.priceId : PLAN_PRICES[tier].priceId;
  const origin = req.nextUrl.origin;

  const session = await stripe().checkout.sessions.create({
    mode: "payment",
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: { weddingId: String(weddingId), tier },
    success_url: `${origin}/dashboard/${weddingId}?checkout=success`,
    cancel_url: `${origin}/dashboard/${weddingId}?checkout=cancelled`,
  });

  return NextResponse.json({ url: session.url });
});
