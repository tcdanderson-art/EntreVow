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
  meal_choice: string | null;
  song_request: string | null;
  flight_number: string | null;
  arrival_time: string | null;
  kids_meal_count: number;
}

// Safe subset for the door-staff check-in flow — deliberately omits access_code
// (a guest's personal credential for /g/[code]) and every other field an usher
// doesn't need, so it never reaches that browser.
export type StaffGuest = Pick<
  Guest,
  "id" | "wedding_id" | "name" | "guest_group" | "table_label" | "checked_in_at"
>;
