export interface RunsheetAnswers {
  ceremonyVenue: string;
  sameVenue: boolean;
  receptionVenue: string;
  cocktailMinutes: number;
  receptionHours: number;
  includeSpeeches: boolean;
  includeCakeCutting: boolean;
  includeFirstDance: boolean;
}

export interface DraftItem {
  title: string;
  offsetMinutes: number;
  location: string;
  transportInfo: string | null;
}

const CEREMONY_DURATION_MINUTES = 30;

// A sensible default day-of running order, timed relative to the ceremony start —
// not a real timing standard, just a reasonable AU wedding-day shape a couple can
// then edit item-by-item once it's in their itinerary.
export function generateRunsheet(answers: RunsheetAnswers): DraftItem[] {
  const ceremonyVenue = answers.ceremonyVenue.trim() || "Ceremony venue";
  const receptionVenue = answers.sameVenue
    ? ceremonyVenue
    : answers.receptionVenue.trim() || "Reception venue";

  const items: DraftItem[] = [
    { title: "Guest Arrival & Seating", offsetMinutes: -30, location: ceremonyVenue, transportInfo: null },
    { title: "Ceremony", offsetMinutes: 0, location: ceremonyVenue, transportInfo: null },
  ];

  const cocktailStart = CEREMONY_DURATION_MINUTES;
  items.push({
    title: "Cocktail Hour",
    offsetMinutes: cocktailStart,
    location: receptionVenue,
    transportInfo: answers.sameVenue ? null : `Please make your way to ${receptionVenue}`,
  });

  let t = cocktailStart + answers.cocktailMinutes;
  items.push({ title: "Reception — Doors Open", offsetMinutes: t, location: receptionVenue, transportInfo: null });

  t += 10;
  items.push({ title: "Bridal Party Entrance", offsetMinutes: t, location: receptionVenue, transportInfo: null });

  t += 10;
  items.push({ title: "Dinner Served", offsetMinutes: t, location: receptionVenue, transportInfo: null });

  if (answers.includeSpeeches) {
    t += 45;
    items.push({ title: "Speeches", offsetMinutes: t, location: receptionVenue, transportInfo: null });
  }

  if (answers.includeCakeCutting) {
    t += 20;
    items.push({ title: "Cake Cutting", offsetMinutes: t, location: receptionVenue, transportInfo: null });
  }

  if (answers.includeFirstDance) {
    t += 10;
    items.push({ title: "First Dance", offsetMinutes: t, location: receptionVenue, transportInfo: null });
  }

  t += 10;
  items.push({ title: "Dancing & Party", offsetMinutes: t, location: receptionVenue, transportInfo: null });

  const sendOffOffset = cocktailStart + answers.receptionHours * 60;
  items.push({
    title: "Send-Off",
    offsetMinutes: Math.max(sendOffOffset, t + 30),
    location: receptionVenue,
    transportInfo: null,
  });

  return items;
}
