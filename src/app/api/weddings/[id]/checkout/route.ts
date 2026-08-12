import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireCoupleId } from "@/lib/require-auth";
import { withErrorHandling } from "@/lib/route-handler";
import { rateLimit } from "@/lib/rate-limit";
import { stripe, PLAN_PRICES, UPGRADE_PRICE } from "@/lib/stripe";
import { isFullTier, TIER_LABELS } from "@/lib/plan";
import { Wedding } from "@/types/wedding";

export const POST = withErrorHandling(async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const coupleId = await requireCoupleId();
  if (!coupleId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const limited = rateLimit(req, "checkout", 10, 60_000, String(coupleId));
  if (limited) return limited;

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
  if (isFullTier(wedding) && tier === "essentials") {
    return NextResponse.json({ error: "Can't downgrade from Full Day-Of" }, { status: 400 });
  }

  // An Essentials wedding upgrading to Full Day-Of pays only the difference,
  // not the full $249 again. Flagged via `isUpgrade` metadata so a refund of
  // this specific charge can downgrade to Essentials instead of revoking the
  // wedding's plan entirely (see the webhook's charge.refunded handler).
  const isUpgrade = wedding.plan_tier === "essentials" && tier === "full";
  const priceId = isUpgrade ? UPGRADE_PRICE.priceId : PLAN_PRICES[tier].priceId;
  const origin = req.nextUrl.origin;
  const metadata = {
    weddingId: String(weddingId),
    tier,
    isUpgrade: String(isUpgrade),
  };

  const session = await stripe().checkout.sessions.create({
    mode: "payment",
    line_items: [{ price: priceId, quantity: 1 }],
    metadata,
    // Also stamp metadata onto the resulting Charge (not just the Checkout
    // Session) — a charge.refunded event only carries the Charge's own
    // metadata, and we need weddingId (and isUpgrade) there to revoke or
    // downgrade access on refund.
    payment_intent_data: {
      metadata,
      // The line item name is fixed to the shared Stripe Product (required by
      // this account's Managed Payments setup), so the wedding-specific
      // identification has to come from the charge description instead —
      // otherwise a couple with multiple weddings can't tell which purchase
      // a receipt or Stripe Dashboard charge belongs to.
      description: `Entrevow ${TIER_LABELS[tier]} — ${wedding.title}`,
    },
    success_url: `${origin}/dashboard/${weddingId}?checkout=success`,
    cancel_url: `${origin}/dashboard/${weddingId}?checkout=cancelled`,
  });

  return NextResponse.json({ url: session.url });
});
