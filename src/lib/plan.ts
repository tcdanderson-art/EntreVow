import { PlanTier, Wedding } from "@/types/wedding";

export function isPaid(wedding: Pick<Wedding, "paid_at">): boolean {
  return wedding.paid_at != null;
}

export function isFullTier(wedding: Pick<Wedding, "plan_tier">): boolean {
  return wedding.plan_tier === "full";
}

export const ESSENTIALS_GUEST_CAP = 150;

export const TIER_LABELS: Record<PlanTier, string> = {
  essentials: "Essentials",
  full: "Full Day-Of",
};

// Flip to true to re-open Stripe checkout once the free beta promo ends. While
// false, the only way to unlock a wedding is an emailed beta code (see
// beta-offer.ts); the checkout route enforces this, not just the UI.
export const PAID_CHECKOUT_ENABLED = false;
