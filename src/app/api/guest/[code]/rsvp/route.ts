import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withErrorHandling } from "@/lib/route-handler";
import { rateLimit } from "@/lib/rate-limit";
import { Guest, RsvpStatus } from "@/types/guest";

const VALID_STATUSES: RsvpStatus[] = ["attending", "declined"];

export const PATCH = withErrorHandling(async (
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) => {
  const { code } = await params;

  const limited = rateLimit(req, "guest-rsvp", 20, 10 * 60_000, code);
  if (limited) return limited;

  const { status, note } = await req.json();

  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid RSVP status" }, { status: 400 });
  }

  const [guest] = (await db().sql`
    UPDATE guests
    SET rsvp_status = ${status}, rsvp_note = ${note || null}, rsvp_responded_at = NOW()
    WHERE access_code = ${code}
    RETURNING *
  `) as Guest[];

  if (!guest) return NextResponse.json({ error: "Guest link not found" }, { status: 404 });

  return NextResponse.json({ guest });
});
