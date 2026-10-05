import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireCoupleId } from "@/lib/require-auth";
import { withErrorHandling } from "@/lib/route-handler";
import { rateLimit } from "@/lib/rate-limit";
import { stripe, PLAN_PRICES, UPGRADE_PRICE } from "@/lib/stripe";
import { isFullTier, PAID_CHECKOUT_ENABLED, TIER_LABELS } from "@/lib/plan";
import { tryClaimBetaGrant } from "@/lib/beta-offer";
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
  const { tier: rawTier, fingerprint, betaCode } = await req.json();
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

  // Beta offer: a couple holding an emailed single-use code gets Full Day-Of
  // free, once each, while the 35 spots last. Without a code they fall through
  // to normal paid checkout below.
  if (wedding.plan_tier == null && typeof betaCode === "string" && betaCode.trim()) {
    const [couple] = (await db().sql`SELECT email FROM couples WHERE id = ${coupleId}`) as { email: string }[];
    const result = await tryClaimBetaGrant({ req, coupleId, email: couple.email, weddingId, fingerprint, code: betaCode });
    if (result === "granted") return NextResponse.json({ granted: true });
    const messages = {
      bad_code: "That code isn't valid or has already been used.",
      sold_out: "All the free beta spots have been claimed.",
      duplicate: "A free spot has already been claimed from this account or device.",
    } as const;
    return NextResponse.json({ error: messages[result] }, { status: 400 });
  }

  if (!PAID_CHECKOUT_ENABLED) {
    return NextResponse.json(
      { error: "Paid plans are paused for now. Email hello@entrevow.com to hear when they open." },
      { status: 403 }
    );
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

  // Bucketed per minute so a double-click or client retry within that window
  // replays the same Checkout Session instead of creating a second one (and
  // risking a double charge if both get completed), while a genuinely new
  // checkout attempt a few minutes later still gets a fresh session.
  const idempotencyKey = `checkout-${weddingId}-${tier}-${Math.floor(Date.now() / 60_000)}`;

  const session = await stripe().checkout.sessions.create(
    {
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
    },
    { idempotencyKey }
  );

  return NextResponse.json({ url: session.url });
});
