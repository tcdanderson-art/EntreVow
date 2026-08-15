import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withErrorHandling } from "@/lib/route-handler";
import { rateLimit } from "@/lib/rate-limit";
import { sendBetaFeedbackNotification } from "@/lib/email";
import { GUEST_FEEDBACK_ITEMS } from "@/lib/beta-feedback-items";
import { Guest } from "@/types/guest";
import { Wedding } from "@/types/wedding";

const VALID_KEYS = new Set(GUEST_FEEDBACK_ITEMS.map((i) => i.key));

export const POST = withErrorHandling(async (
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) => {
  const { code } = await params;

  const limited = rateLimit(req, "beta-feedback-guest", 10, 60_000, code);
  if (limited) return limited;

  const { troubleItems, comments, email } = await req.json();

  const cleanTroubleItems: string[] = Array.isArray(troubleItems)
    ? troubleItems.filter((k) => typeof k === "string" && VALID_KEYS.has(k))
    : [];
  const cleanComments = typeof comments === "string" && comments.trim() ? comments.trim().slice(0, 2000) : null;
  const cleanEmail = typeof email === "string" && email.trim() ? email.trim().slice(0, 320) : null;

  const database = db();

  const guests = (await database.sql`SELECT wedding_id FROM guests WHERE access_code = ${code}`) as Pick<Guest, "wedding_id">[];
  if (!guests[0]) return NextResponse.json({ error: "Guest link not found" }, { status: 404 });
  const weddingId = guests[0].wedding_id;

  const [feedback] = await database.sql`
    INSERT INTO beta_feedback (wedding_id, role, trouble_items, comments, email)
    VALUES (${weddingId}, 'guest', ${cleanTroubleItems}, ${cleanComments}, ${cleanEmail})
    RETURNING *
  `;

  const [wedding] = (await database.sql`SELECT title FROM weddings WHERE id = ${weddingId}`) as Pick<Wedding, "title">[];
  const troubleLabels = GUEST_FEEDBACK_ITEMS.filter((i) => cleanTroubleItems.includes(i.key)).map((i) => i.label);

  try {
    await sendBetaFeedbackNotification(wedding?.title ?? "Unknown wedding", "guest", troubleLabels, cleanComments, cleanEmail);
  } catch {
    // Feedback is already saved -- don't fail the request over a notification email hiccup.
  }

  return NextResponse.json({ feedback });
});
