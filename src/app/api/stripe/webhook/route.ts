import { NextRequest, NextResponse } from "next/server";
import { db, transaction } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { withErrorHandling } from "@/lib/route-handler";
import { sendPaymentReceiptEmail, sendRefundNoticeEmail, sendSubdomainAliasNeededNotification } from "@/lib/email";
import { TIER_LABELS } from "@/lib/plan";
import { Wedding } from "@/types/wedding";
import { Couple } from "@/types/couple";
import Stripe from "stripe";
import type { waddler } from "waddler/node-postgres";

type Sql = ReturnType<typeof waddler>;

async function notifyCouple(coupleId: number, send: (email: string) => Promise<unknown>) {
  const [couple] = (await db().sql`
    SELECT email FROM couples WHERE id = ${coupleId}
  `) as Pick<Couple, "email">[];

  if (couple?.email) {
    await send(couple.email).catch((err) => console.error("Failed to send billing email", err));
  }
}

type CheckoutFulfillment = {
  wedding: Wedding;
  wasAlreadyPaid: boolean;
  amount: string;
  tier: "essentials" | "full";
} | null;

// DB-only half of fulfillment, run inside the claim transaction so a failure
// here rolls back the event claim too (see the transaction call below).
async function applyCheckoutFulfillment(sql: Sql, session: Stripe.Checkout.Session): Promise<CheckoutFulfillment> {
  const weddingId = Number(session.metadata?.weddingId);
  const tier = session.metadata?.tier;
  if (!weddingId || (tier !== "essentials" && tier !== "full")) return null;

  // Captured before the update so the subdomain-alias notification only fires on a
  // wedding's first payment, not again on an essentials->full upgrade checkout.
  const [before] = (await sql`
    SELECT paid_at FROM weddings WHERE id = ${weddingId}
  `) as Pick<Wedding, "paid_at">[];
  const wasAlreadyPaid = before?.paid_at != null;

  const [wedding] = (await sql`
    UPDATE weddings
    SET plan_tier = ${tier}, paid_at = NOW(), stripe_checkout_session_id = ${session.id}
    WHERE id = ${weddingId}
    RETURNING *
  `) as Wedding[];

  if (!wedding || session.amount_total == null) return null;

  const amount = (session.amount_total / 100).toLocaleString("en-AU", {
    style: "currency",
    currency: (session.currency ?? "aud").toUpperCase(),
  });

  return { wedding, wasAlreadyPaid, amount, tier };
}

// Email/notification half of fulfillment, run after the transaction commits.
// These already swallow their own errors (see notifyCouple), so a failure
// here can't roll back or re-trigger the DB state change above.
async function sendCheckoutNotifications(fulfillment: CheckoutFulfillment, dashboardOrigin: string) {
  if (!fulfillment) return;
  const { wedding, wasAlreadyPaid, amount, tier } = fulfillment;

  if (!wasAlreadyPaid && wedding.slug) {
    await sendSubdomainAliasNeededNotification(wedding.title, wedding.slug).catch((err) =>
      console.error("Failed to send subdomain alias notification", err)
    );
  }

  await notifyCouple(wedding.couple_id, (email) =>
    sendPaymentReceiptEmail(
      email,
      wedding.title,
      TIER_LABELS[tier],
      amount,
      `${dashboardOrigin}/dashboard/${wedding.id}`
    )
  );
}

type RefundResult = { wedding: Wedding; isUpgrade: boolean } | null;

async function applyRefund(sql: Sql, charge: Stripe.Charge): Promise<RefundResult> {
  const weddingId = Number(charge.metadata?.weddingId);
  const isUpgrade = charge.metadata?.isUpgrade === "true";
  if (!weddingId || !charge.refunded) return null;

  // A refund of the essentials->full upgrade differential downgrades the
  // wedding back to Essentials rather than revoking access entirely —
  // the couple's original Essentials purchase wasn't refunded, so they
  // keep what they paid for.
  const [wedding] = isUpgrade
    ? ((await sql`
        UPDATE weddings SET plan_tier = 'essentials'
        WHERE id = ${weddingId}
        RETURNING *
      `) as Wedding[])
    : ((await sql`
        UPDATE weddings
        SET plan_tier = NULL, paid_at = NULL, stripe_checkout_session_id = NULL
        WHERE id = ${weddingId}
        RETURNING *
      `) as Wedding[]);

  return wedding ? { wedding, isUpgrade } : null;
}

type WebhookResult =
  | { kind: "checkout"; fulfillment: CheckoutFulfillment }
  | { kind: "refund"; refund: RefundResult }
  | { kind: "none" }
  | null;

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

  // Claim the event and apply its DB state changes in one transaction. If
  // fulfillment throws partway (e.g. a transient DB error), the claim insert
  // rolls back with it — a Stripe retry of the same event will then see it as
  // unclaimed and reprocess it from scratch, instead of finding the claim row
  // already committed and silently no-op'ing forever while the plan was never
  // actually granted. (An atomic INSERT ... ON CONFLICT is also race-free for
  // concurrent redeliveries of the *same* event, so they can't both slip
  // through and double-send an email; dedup is by Stripe's own event id, not
  // by comparing session ids against a wedding's single "last session" column
  // — that comparison broke once a wedding could have more than one checkout
  // session, essentials then an upgrade.)
  const result: WebhookResult = await transaction(async (sql) => {
    const [claimed] = (await sql`
      INSERT INTO stripe_webhook_events (event_id) VALUES (${event.id})
      ON CONFLICT DO NOTHING
      RETURNING event_id
    `) as { event_id: string }[];
    if (!claimed) return null;

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      // Delayed-confirmation payment methods (e.g. BECS Direct Debit) fire this
      // event immediately with payment_status "unpaid" — fulfillment happens
      // later via checkout.session.async_payment_succeeded instead.
      if (session.payment_status === "paid") {
        return { kind: "checkout", fulfillment: await applyCheckoutFulfillment(sql, session) };
      }
      return { kind: "none" };
    }

    if (event.type === "checkout.session.async_payment_succeeded") {
      const session = event.data.object as Stripe.Checkout.Session;
      return { kind: "checkout", fulfillment: await applyCheckoutFulfillment(sql, session) };
    }

    if (event.type === "charge.refunded") {
      const charge = event.data.object as Stripe.Charge;
      return { kind: "refund", refund: await applyRefund(sql, charge) };
    }

    return { kind: "none" };
  });

  if (!result) return NextResponse.json({ received: true });

  if (result.kind === "checkout") {
    await sendCheckoutNotifications(result.fulfillment, req.nextUrl.origin);
  }

  if (result.kind === "refund" && result.refund) {
    const { wedding, isUpgrade } = result.refund;
    await notifyCouple(wedding.couple_id, (email) =>
      sendRefundNoticeEmail(email, wedding.title, isUpgrade ? TIER_LABELS.essentials : undefined)
    );
  }

  return NextResponse.json({ received: true });
});
