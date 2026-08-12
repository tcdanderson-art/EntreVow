import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { withErrorHandling } from "@/lib/route-handler";
import { sendPaymentReceiptEmail, sendRefundNoticeEmail } from "@/lib/email";
import { Wedding } from "@/types/wedding";
import { Couple } from "@/types/couple";
import Stripe from "stripe";

const TIER_LABELS: Record<"essentials" | "full", string> = {
  essentials: "Essentials",
  full: "Full Day-Of",
};

export const POST = withErrorHandling(async (req: NextRequest) => {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(rawBody, signature, secret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const weddingId = Number(session.metadata?.weddingId);
    const tier = session.metadata?.tier;

    if (weddingId && (tier === "essentials" || tier === "full")) {
      // Stripe can redeliver the same event — skip if this exact session was
      // already applied, so a retry doesn't re-send the receipt email.
      const [existing] = (await db().sql`
        SELECT stripe_checkout_session_id FROM weddings WHERE id = ${weddingId}
      `) as Pick<Wedding, "stripe_checkout_session_id">[];

      if (existing && existing.stripe_checkout_session_id !== session.id) {
        const [wedding] = (await db().sql`
          UPDATE weddings
          SET plan_tier = ${tier}, paid_at = NOW(), stripe_checkout_session_id = ${session.id}
          WHERE id = ${weddingId}
          RETURNING *
        `) as Wedding[];

        if (wedding && session.amount_total != null) {
          const [couple] = (await db().sql`
            SELECT email FROM couples WHERE id = ${wedding.couple_id}
          `) as Pick<Couple, "email">[];

          if (couple?.email) {
            const amount = (session.amount_total / 100).toLocaleString("en-AU", {
              style: "currency",
              currency: (session.currency ?? "aud").toUpperCase(),
            });
            await sendPaymentReceiptEmail(
              couple.email,
              wedding.title,
              TIER_LABELS[tier],
              amount,
              `${req.nextUrl.origin}/dashboard/${weddingId}`
            ).catch((err) => console.error("Failed to send payment receipt email", err));
          }
        }
      }
    }
  }

  if (event.type === "charge.refunded") {
    const charge = event.data.object as Stripe.Charge;
    const weddingId = Number(charge.metadata?.weddingId);

    // Simplification: any fully-refunded charge revokes access entirely,
    // even if it was only the essentials->full upgrade differential being
    // refunded rather than the original purchase. Good enough for now —
    // a partial-refund-aware downgrade would need to track which charge
    // paid for which tier, not just the wedding's current plan_tier.
    if (weddingId && charge.refunded) {
      const [wedding] = (await db().sql`
        UPDATE weddings
        SET plan_tier = NULL, paid_at = NULL, stripe_checkout_session_id = NULL
        WHERE id = ${weddingId}
        RETURNING *
      `) as Wedding[];

      if (wedding) {
        const [couple] = (await db().sql`
          SELECT email FROM couples WHERE id = ${wedding.couple_id}
        `) as Pick<Couple, "email">[];

        if (couple?.email) {
          await sendRefundNoticeEmail(couple.email, wedding.title).catch((err) =>
            console.error("Failed to send refund notice email", err)
          );
        }
      }
    }
  }

  return NextResponse.json({ received: true });
});
