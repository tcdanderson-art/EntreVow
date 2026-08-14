import { addMinutesToWallClock } from "@/lib/wall-clock";
import { Shuttle } from "@/types/shuttle";

// Rough buffer for immigration/baggage claim before a guest could realistically
// be at a pickup point — not a precise estimate, just enough to rule out a
// shuttle that departs before they could plausibly arrive.
const ARRIVAL_BUFFER_MINUTES = 45;

// Wall-clock values are zero-padded "YYYY-MM-DDTHH:MM" strings, so lexical
// comparison is chronological comparison — same assumption the rest of the
// app relies on (e.g. itinerary ORDER BY start_time).
export function suggestShuttle(arrivalTime: string, shuttles: Shuttle[]): Shuttle | null {
  const earliestPickup = addMinutesToWallClock(arrivalTime, ARRIVAL_BUFFER_MINUTES);

  const candidates = shuttles
    .filter((s): s is Shuttle & { pickup_time: string } => !!s.pickup_time && s.pickup_time >= earliestPickup)
    .sort((a, b) => (a.pickup_time < b.pickup_time ? -1 : 1));

  return candidates[0] ?? null;
}
