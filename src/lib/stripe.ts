import Stripe from "stripe";

let client: Stripe | null = null;

function currentKey(): string {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  return key;
}

export function stripe(): Stripe {
  if (!client) {
    client = new Stripe(currentKey());
  }
  return client;
}

// Real Stripe Price objects, not ad-hoc price_data — this account has Managed
// Payments enabled, which requires a product tax_code for Checkout Sessions
// and rejects inline price_data even when the tax_code is set on it directly.
// Test- and live-mode Price IDs are distinct Stripe objects (created
// 2026-08-12 test, 2026-08-13 live — same amounts, AUD, tax_code
// txcd_10103000) — which set applies is derived from the active key's mode
// rather than hardcoded, so swapping STRIPE_SECRET_KEY to a live key at
// go-live time is the only change needed; no code change at cutover.
const PRICE_IDS = {
  test: {
    essentials: "price_1U3aWC4Aa8t6g1kPt3cuYmTh",
    full: "price_1U3aWD4Aa8t6g1kPwzbHZ0c2",
    upgrade: "price_1U3ag94Aa8t6g1kP2OAT217J",
  },
  live: {
    essentials: "price_1U3xIp3mBdjuQkXA2gYuPi68",
    full: "price_1U3xIp3mBdjuQkXALJhlNlbl",
    upgrade: "price_1U3xIq3mBdjuQkXAHGtunhtK",
  },
};

function activePriceIds() {
  return currentKey().startsWith("sk_live_") ? PRICE_IDS.live : PRICE_IDS.test;
}

export const PLAN_PRICES: Record<"essentials" | "full", { amount: number; label: string; priceId: string }> = {
  get essentials() {
    return { amount: 6900, label: "Entrevow Essentials", priceId: activePriceIds().essentials };
  },
  get full() {
    return { amount: 24900, label: "Entrevow Full Day-Of", priceId: activePriceIds().full };
  },
};

// Price difference for upgrading an already-paid Essentials wedding straight
// to Full Day-Of, rather than charging the full $249 again.
export const UPGRADE_PRICE = {
  get amount() {
    return PLAN_PRICES.full.amount - PLAN_PRICES.essentials.amount;
  },
  get priceId() {
    return activePriceIds().upgrade;
  },
};
