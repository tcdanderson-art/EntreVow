export interface Announcement {
  id: number;
  wedding_id: number;
  message: string;
  visible_to_groups: string[];
  created_at: string;
}
