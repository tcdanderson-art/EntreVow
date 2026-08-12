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

// Real Stripe Price objects, not ad-hoc price_data — this account has Managed
// Payments enabled, which requires a product tax_code for Checkout Sessions
// and rejects inline price_data even when the tax_code is set on it directly.
// These are test-mode IDs; a live-mode pair must be created (same amounts,
// AUD, tax_code txcd_10103000) before switching STRIPE_SECRET_KEY to a live key.
export const PLAN_PRICES: Record<"essentials" | "full", { amount: number; label: string; priceId: string }> = {
  essentials: { amount: 6900, label: "Entrevow Essentials", priceId: "price_1U3aWC4Aa8t6g1kPt3cuYmTh" },
  full: { amount: 24900, label: "Entrevow Full Day-Of", priceId: "price_1U3aWD4Aa8t6g1kPwzbHZ0c2" },
};
