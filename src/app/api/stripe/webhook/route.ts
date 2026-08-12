import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { withErrorHandling } from "@/lib/route-handler";
import { sendPaymentReceiptEmail, sendRefundNoticeEmail } from "@/lib/email";
import { TIER_LABELS } from "@/lib/plan";
import { Wedding } from "@/types/wedding";
import { Couple } from "@/types/couple";
import Stripe from "stripe";

async function notifyCouple(coupleId: number, send: (email: string) => Promise<unknown>) {
  const [couple] = (await db().sql`
    SELECT email FROM couples WHERE id = ${coupleId}
  `) as Pick<Couple, "email">[];

  if (couple?.email) {
    await send(couple.email).catch((err) => console.error("Failed to send billing email", err));
  }
}

async function fulfillCheckout(session: Stripe.Checkout.Session, dashboardOrigin: string) {
  const weddingId = Number(session.metadata?.weddingId);
  const tier = session.metadata?.tier;
  if (!weddingId || (tier !== "essentials" && tier !== "full")) return;

  const [wedding] = (await db().sql`
    UPDATE weddings
    SET plan_tier = ${tier}, paid_at = NOW(), stripe_checkout_session_id = ${session.id}
    WHERE id = ${weddingId}
    RETURNING *
  `) as Wedding[];

  if (!wedding || session.amount_total == null) return;

  const amount = (session.amount_total / 100).toLocaleString("en-AU", {
    style: "currency",
    currency: (session.currency ?? "aud").toUpperCase(),
  });

  await notifyCouple(wedding.couple_id, (email) =>
    sendPaymentReceiptEmail(
      email,
      wedding.title,
      TIER_LABELS[tier],
      amount,
      `${dashboardOrigin}/dashboard/${weddingId}`
    )
  );
}

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

  // Dedupe by Stripe's own event id, not by comparing session ids against a
  // wedding's single "last session" column — that comparison broke once a
  // wedding could have more than one checkout session (essentials, then an
  // upgrade), since a redelivered *older* event would no longer match the
  // *newer* stored session id and would re-apply as if it were new. An
  // atomic INSERT ... ON CONFLICT is also race-free, unlike a SELECT-then-
  // UPDATE check, so concurrent redeliveries of the same event can't both
  // slip through and double-send an email.
  const [claimed] = (await db().sql`
    INSERT INTO stripe_webhook_events (event_id) VALUES (${event.id})
    ON CONFLICT DO NOTHING
    RETURNING event_id
  `) as { event_id: string }[];
  if (!claimed) {
    return NextResponse.json({ received: true });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    // Delayed-confirmation payment methods (e.g. BECS Direct Debit) fire this
    // event immediately with payment_status "unpaid" — fulfillment happens
    // later via checkout.session.async_payment_succeeded instead.
    if (session.payment_status === "paid") {
      await fulfillCheckout(session, req.nextUrl.origin);
    }
  }

  if (event.type === "checkout.session.async_payment_succeeded") {
    const session = event.data.object as Stripe.Checkout.Session;
    await fulfillCheckout(session, req.nextUrl.origin);
  }

  if (event.type === "charge.refunded") {
    const charge = event.data.object as Stripe.Charge;
    const weddingId = Number(charge.metadata?.weddingId);
    const isUpgrade = charge.metadata?.isUpgrade === "true";

    if (weddingId && charge.refunded) {
      // A refund of the essentials->full upgrade differential downgrades the
      // wedding back to Essentials rather than revoking access entirely —
      // the couple's original Essentials purchase wasn't refunded, so they
      // keep what they paid for.
      const [wedding] = isUpgrade
        ? ((await db().sql`
            UPDATE weddings SET plan_tier = 'essentials'
            WHERE id = ${weddingId}
            RETURNING *
          `) as Wedding[])
        : ((await db().sql`
            UPDATE weddings
            SET plan_tier = NULL, paid_at = NULL, stripe_checkout_session_id = NULL
            WHERE id = ${weddingId}
            RETURNING *
          `) as Wedding[]);

      if (wedding) {
        await notifyCouple(wedding.couple_id, (email) =>
          sendRefundNoticeEmail(email, wedding.title, isUpgrade ? TIER_LABELS.essentials : undefined)
        );
      }
    }
  }

  return NextResponse.json({ received: true });
});
