import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { withErrorHandling } from "@/lib/route-handler";
import Stripe from "stripe";

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
      await db().sql`
        UPDATE weddings
        SET plan_tier = ${tier}, paid_at = NOW(), stripe_checkout_session_id = ${session.id}
        WHERE id = ${weddingId}
      `;
    }
  }

  return NextResponse.json({ received: true });
});
