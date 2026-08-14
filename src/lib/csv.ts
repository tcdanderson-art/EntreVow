import { Guest } from "@/types/guest";

export interface ParsedGuestRow {
  name: string;
  guestGroup: string;
  email?: string;
}

function splitCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        current += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      fields.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  fields.push(current.trim());
  return fields;
}

// Accepts "name,group,email" per line, with or without a header row. Email is optional.
export function parseGuestCsv(text: string): ParsedGuestRow[] {
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length === 0) return [];

  const firstFields = splitCsvLine(lines[0]).map((f) => f.toLowerCase());
  const hasHeader = firstFields[0] === "name";
  const dataLines = hasHeader ? lines.slice(1) : lines;

  return dataLines
    .map(splitCsvLine)
    .filter((fields) => fields[0])
    .map((fields) => ({
      name: fields[0],
      guestGroup: fields[1] || "general",
      email: fields[2] || undefined,
    }));
}

function csvField(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export function guestsToCsv(guests: Guest[]): string {
  const header = [
    "name",
    "group",
    "email",
    "table",
    "rsvp_status",
    "rsvp_note",
    "plus_one_allowed",
    "plus_one_name",
    "meal_choice",
    "song_request",
    "flight_number",
    "arrival_time",
  ];
  const rows = guests.map((g) =>
    [
      g.name,
      g.guest_group,
      g.email ?? "",
      g.table_label ?? "",
      g.rsvp_status,
      g.rsvp_note ?? "",
      g.plus_one_allowed ? "yes" : "no",
      g.plus_one_name ?? "",
      g.meal_choice ?? "",
      g.song_request ?? "",
      g.flight_number ?? "",
      g.arrival_time ?? "",
    ].map(csvField)
  );

  return [header, ...rows].map((row) => row.join(",")).join("\r\n");
}
