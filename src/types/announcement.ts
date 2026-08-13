export interface Announcement {
  id: number;
  wedding_id: number;
  message: string;
  visible_to_groups: string[];
  video_key: string | null;
  created_at: string;
}
