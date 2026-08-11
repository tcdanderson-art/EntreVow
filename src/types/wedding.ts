export interface Wedding {
  id: number;
  couple_id: number;
  title: string;
  wedding_date: string | null;
  emergency_phone: string | null;
  staff_code: string | null;
  slug: string | null;
  created_at: string;
}
