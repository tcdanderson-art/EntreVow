export interface Video {
  id: number;
  wedding_id: number;
  guest_id: number;
  storage_key: string;
  duration_seconds: number | null;
  caption: string | null;
  status: "pending" | "approved" | "rejected";
  kind: "video" | "audio";
  created_at: string;
  guest_name?: string;
}
