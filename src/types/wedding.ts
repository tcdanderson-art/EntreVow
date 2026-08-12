export interface Wedding {
  id: number;
  couple_id: number;
  title: string;
  wedding_date: string | null;
  emergency_phone: string | null;
  staff_code: string | null;
  slug: string | null;
  venue_address: string | null;
  venue_lat: number | null;
  venue_lng: number | null;
  plan_tier: PlanTier | null;
  paid_at: string | null;
  stripe_checkout_session_id: string | null;
  meal_options: string[] | null;
  created_at: string;
}

export type PlanTier = "essentials" | "full";
