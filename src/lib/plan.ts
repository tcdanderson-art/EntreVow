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
