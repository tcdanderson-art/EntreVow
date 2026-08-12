import Stripe from "stripe";

let client: Stripe | null = null;

export function stripe(): Stripe {
  if (!client) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
    client = new Stripe(key);
  }
  return client;
}

export const PLAN_PRICES: Record<"essentials" | "full", { amount: number; label: string }> = {
  essentials: { amount: 6900, label: "Entrevow Essentials" },
  full: { amount: 24900, label: "Entrevow Full Day-Of" },
};
