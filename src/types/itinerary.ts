export interface ItineraryItem {
  id: number;
  wedding_id: number;
  title: string;
  location: string | null;
  start_time: string;
  end_time: string | null;
  transport_info: string | null;
  sort_order: number;
  visible_to_groups: string[];
  created_at: string;
}
