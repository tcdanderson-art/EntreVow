export interface Shuttle {
  id: number;
  wedding_id: number;
  label: string;
  driver_code: string;
  lat: number | null;
  lng: number | null;
  location_updated_at: string | null;
  pickup_time: string | null;
  created_at: string;
}
