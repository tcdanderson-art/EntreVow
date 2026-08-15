// Shared between the couple's full checklist and the guest's lighter prompt,
// and between the client forms and the API routes' validation, so the two
// never drift out of sync with each other.
export const COUPLE_FEEDBACK_ITEMS: { key: string; label: string }[] = [
  { key: "signup_payment", label: "Signing up & payment" },
  { key: "rsvp_guests", label: "RSVP & guest list" },
  { key: "itinerary", label: "Itinerary / schedule" },
  { key: "seating_chart", label: "Seating chart" },
  { key: "photos", label: "Photo gallery" },
  { key: "video_guestbook", label: "Video & voice guestbook" },
  { key: "shuttle", label: "Live shuttle tracking" },
  { key: "weather", label: "Weather alerts" },
  { key: "checkin", label: "QR check-in (door staff)" },
  { key: "push_notifications", label: "Push notifications" },
];

export const GUEST_FEEDBACK_ITEMS: { key: string; label: string }[] = [
  { key: "rsvp", label: "RSVPing" },
  { key: "itinerary", label: "Viewing the schedule" },
  { key: "photos", label: "Sharing a photo" },
  { key: "mobile", label: "Using it on my phone" },
];

export const ALL_FEEDBACK_ITEM_KEYS = new Set([
  ...COUPLE_FEEDBACK_ITEMS.map((i) => i.key),
  ...GUEST_FEEDBACK_ITEMS.map((i) => i.key),
]);
