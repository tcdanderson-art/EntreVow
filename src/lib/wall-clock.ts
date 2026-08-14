// Itinerary times are stored as naive "YYYY-MM-DDTHH:MM" wall-clock strings —
// the time at the venue, not an instant tied to any timezone. Never parse
// these with `new Date(str)`: engines treat date-time strings without an
// offset as UTC (or local, depending on format), which reintroduces the
// shift this module exists to avoid. Always go through the component-based
// Date constructor below instead.

function parseComponents(value: string) {
  const [datePart, timePart = "00:00"] = value.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute] = timePart.split(":").map(Number);
  return { year, month, day, hour, minute };
}

// A Date built purely from numeric components is never subject to timezone
// parsing ambiguity — safe to hand to toLocaleString/toLocaleDateString.
function toLocalDate(value: string) {
  const { year, month, day, hour, minute } = parseComponents(value);
  return new Date(year, month - 1, day, hour, minute);
}

// Locale is fixed (not `undefined`) so formatting is identical on the server's render
// pass and the browser's hydration pass — `undefined` defers to the runtime's default
// locale, which differs between Node's OS locale and the browser's `navigator.language`
// and causes a hydration mismatch.
export function formatWallClockTime(value: string, options: Intl.DateTimeFormatOptions) {
  return toLocalDate(value).toLocaleString("en-AU", options);
}

// Truncates/pads a stored value to exactly what <input type="datetime-local"> expects.
export function toDatetimeLocalValue(value: string) {
  return value.slice(0, 16);
}

// Shifts a wall-clock value by a number of minutes (may be negative), staying
// entirely in local component math — never touches UTC/ISO, so the result is
// still the same kind of naive "place time" string the rest of the app expects.
export function addMinutesToWallClock(value: string, minutes: number): string {
  const date = toLocalDate(value);
  date.setMinutes(date.getMinutes() + minutes);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

// Same UTC-parsing pitfall applies to date-only "YYYY-MM-DD" values (e.g. wedding_date)
// when formatted client-side: `new Date("YYYY-MM-DD")` is UTC midnight per spec, which
// a browser behind UTC renders as the previous day. Build from components instead.
// The pg driver may hand this to a Client Component as a real Date (already UTC
// midnight) rather than the string the type declares, so accept either.
export function formatWallClockDate(value: string | Date, options?: Intl.DateTimeFormatOptions) {
  let year: number, month: number, day: number;
  if (value instanceof Date) {
    year = value.getUTCFullYear();
    month = value.getUTCMonth() + 1;
    day = value.getUTCDate();
  } else {
    [year, month, day] = value.slice(0, 10).split("-").map(Number);
  }
  return new Date(year, month - 1, day).toLocaleDateString("en-AU", options);
}
