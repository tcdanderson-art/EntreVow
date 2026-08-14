export interface Photo {
  id: number;
  wedding_id: number;
  guest_id: number;
  blob_key: string;
  caption: string | null;
  hidden: boolean;
  created_at: string;
  guest_name?: string;
}
