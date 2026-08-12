import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireCoupleId } from "@/lib/require-auth";
import { withErrorHandling } from "@/lib/route-handler";
import { stripe, PLAN_PRICES } from "@/lib/stripe";
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

  const plan = PLAN_PRICES[tier];
  const origin = req.nextUrl.origin;

  const session = await stripe().checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "aud",
          product_data: { name: `${plan.label} — ${wedding.title}` },
          unit_amount: plan.amount,
        },
        quantity: 1,
      },
    ],
    metadata: { weddingId: String(weddingId), tier },
    success_url: `${origin}/dashboard/${weddingId}?checkout=success`,
    cancel_url: `${origin}/dashboard/${weddingId}?checkout=cancelled`,
  });

  return NextResponse.json({ url: session.url });
});
