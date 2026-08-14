import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withErrorHandling } from "@/lib/route-handler";
import { rateLimit } from "@/lib/rate-limit";
import { isPaid } from "@/lib/plan";
import { mealOptionsFor } from "@/lib/meal-options";
import { Guest, RsvpStatus } from "@/types/guest";
import { Wedding } from "@/types/wedding";

const VALID_STATUSES: RsvpStatus[] = ["attending", "declined"];

export const PATCH = withErrorHandling(async (
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) => {
  const { code } = await params;

  const limited = rateLimit(req, "guest-rsvp", 20, 10 * 60_000, code);
  if (limited) return limited;

  const { status, note, plusOneName, mealChoice, songRequest, flightNumber, arrivalTime } = await req.json();

  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid RSVP status" }, { status: 400 });
  }

  const database = db();

  const existingGuests = (await database.sql`SELECT wedding_id FROM guests WHERE access_code = ${code}`) as Pick<Guest, "wedding_id">[];
  if (!existingGuests[0]) return NextResponse.json({ error: "Guest link not found" }, { status: 404 });

  const weddings = (await database.sql`
    SELECT paid_at, meal_options FROM weddings WHERE id = ${existingGuests[0].wedding_id}
  `) as Pick<Wedding, "paid_at" | "meal_options">[];
  if (!weddings[0] || !isPaid(weddings[0])) {
    return NextResponse.json({ error: "Guest access isn't active yet" }, { status: 402 });
  }

  const validMealChoice = mealOptionsFor(weddings[0]).includes(mealChoice) ? mealChoice : null;

  const [guest] = (await db().sql`
    UPDATE guests
    SET rsvp_status = ${status}, rsvp_note = ${note || null}, rsvp_responded_at = NOW(),
        plus_one_name = CASE
          WHEN plus_one_allowed AND ${status} = 'attending' THEN ${plusOneName || null}
          ELSE NULL
        END,
        meal_choice = CASE WHEN ${status} = 'attending' THEN ${validMealChoice} ELSE NULL END,
        song_request = CASE WHEN ${status} = 'attending' THEN ${songRequest || null} ELSE NULL END,
        flight_number = CASE WHEN ${status} = 'attending' THEN ${flightNumber || null} ELSE NULL END,
        arrival_time = CASE WHEN ${status} = 'attending' THEN ${arrivalTime || null} ELSE NULL END
    WHERE access_code = ${code}
    RETURNING *
  `) as Guest[];

  if (!guest) return NextResponse.json({ error: "Guest link not found" }, { status: 404 });

  return NextResponse.json({ guest });
});
