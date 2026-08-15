import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireCoupleId } from "@/lib/require-auth";
import { coupleOwnsWedding } from "@/lib/wedding-ownership";
import { withErrorHandling } from "@/lib/route-handler";
import { rateLimit } from "@/lib/rate-limit";
import { sendBetaFeedbackNotification } from "@/lib/email";
import { COUPLE_FEEDBACK_ITEMS } from "@/lib/beta-feedback-items";
import { Wedding } from "@/types/wedding";

const VALID_KEYS = new Set(COUPLE_FEEDBACK_ITEMS.map((i) => i.key));

export const POST = withErrorHandling(async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const coupleId = await requireCoupleId();
  if (!coupleId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const weddingId = Number((await params).id);
  if (!(await coupleOwnsWedding(coupleId, weddingId))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const limited = rateLimit(req, "beta-feedback-couple", 10, 60_000, String(coupleId));
  if (limited) return limited;

  const { troubleItems, comments, email } = await req.json();

  const cleanTroubleItems: string[] = Array.isArray(troubleItems)
    ? troubleItems.filter((k) => typeof k === "string" && VALID_KEYS.has(k))
    : [];
  const cleanComments = typeof comments === "string" && comments.trim() ? comments.trim().slice(0, 2000) : null;
  const cleanEmail = typeof email === "string" && email.trim() ? email.trim().slice(0, 320) : null;

  const database = db();

  const [feedback] = await database.sql`
    INSERT INTO beta_feedback (wedding_id, role, trouble_items, comments, email)
    VALUES (${weddingId}, 'couple', ${cleanTroubleItems}, ${cleanComments}, ${cleanEmail})
    RETURNING *
  `;

  const [wedding] = (await database.sql`SELECT title FROM weddings WHERE id = ${weddingId}`) as Pick<Wedding, "title">[];
  const troubleLabels = COUPLE_FEEDBACK_ITEMS.filter((i) => cleanTroubleItems.includes(i.key)).map((i) => i.label);

  try {
    await sendBetaFeedbackNotification(wedding?.title ?? "Unknown wedding", "couple", troubleLabels, cleanComments, cleanEmail);
  } catch {
    // Feedback is already saved -- don't fail the request over a notification email hiccup.
  }

  return NextResponse.json({ feedback });
});
