export type RsvpStatus = "pending" | "attending" | "declined";

export interface Guest {
  id: number;
  wedding_id: number;
  name: string;
  guest_group: string;
  access_code: string;
  created_at: string;
  rsvp_status: RsvpStatus;
  rsvp_note: string | null;
  rsvp_responded_at: string | null;
  table_label: string | null;
  checked_in_at: string | null;
  email: string | null;
  invite_sent_at: string | null;
  plus_one_allowed: boolean;
  plus_one_name: string | null;
}
