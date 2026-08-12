import { ItineraryItem } from "@/types/itinerary";

// Itinerary times are naive wall-clock strings (see wall-clock.ts) — no timezone is
// known for the venue, so events are emitted as RFC 5545 "floating" times (no Z, no
// TZID). Calendar apps render floating times in the viewer's own local timezone,
// which is an approximation, but it's the same trade-off this app already makes
// everywhere else it displays these times.
const DEFAULT_DURATION_MS = 60 * 60 * 1000;

function escapeIcsText(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function toFloatingIcsTime(wallClock: string): string {
  const [datePart, timePart = "00:00"] = wallClock.split("T");
  return `${datePart.replace(/-/g, "")}T${timePart.replace(":", "")}00`;
}

// Adds a duration to a wall-clock string using a component-based Date (safe per
// wall-clock.ts — never parses the string as an instant, so no timezone shift risk).
function addDefaultDuration(wallClock: string): string {
  const [datePart, timePart = "00:00"] = wallClock.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute] = timePart.split(":").map(Number);
  const date = new Date(year, month - 1, day, hour, minute);
  date.setMinutes(date.getMinutes() + DEFAULT_DURATION_MS / 60_000);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function toUtcIcsTimestamp(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

export function buildItineraryIcs(weddingTitle: string, items: ItineraryItem[]): string {
  const now = toUtcIcsTimestamp(new Date());

  const events = items.map((item) => {
    const dtStart = toFloatingIcsTime(item.start_time);
    const dtEnd = toFloatingIcsTime(item.end_time || addDefaultDuration(item.start_time));

    const lines = [
      "BEGIN:VEVENT",
      `UID:entrevow-item-${item.id}@entrevow.com`,
      `DTSTAMP:${now}`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:${escapeIcsText(item.title)}`,
    ];
    if (item.location) lines.push(`LOCATION:${escapeIcsText(item.location)}`);
    if (item.transport_info) lines.push(`DESCRIPTION:${escapeIcsText(item.transport_info)}`);
    lines.push("END:VEVENT");
    return lines.join("\r\n");
  });

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Entrevow//Itinerary//EN",
    "CALSCALE:GREGORIAN",
    `X-WR-CALNAME:${escapeIcsText(weddingTitle)}`,
    ...events,
    "END:VCALENDAR",
  ].join("\r\n");
}
