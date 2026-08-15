import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireCoupleId } from "@/lib/require-auth";
import { coupleOwnsWedding } from "@/lib/wedding-ownership";
import { withErrorHandling } from "@/lib/route-handler";
import { Guest } from "@/types/guest";

export const PATCH = withErrorHandling(async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string; guestId: string }> }
) => {
  const coupleId = await requireCoupleId();
  if (!coupleId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id, guestId } = await params;
  const weddingId = Number(id);
  if (!(await coupleOwnsWedding(coupleId, weddingId))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const { name, guestGroup, rsvpStatus, tableLabel, email, plusOneAllowed, mealChoice, songRequest } = body;

  // Partial update: a field the caller omits keeps its current DB value
  // instead of being overwritten from (possibly stale) client-cached state —
  // e.g. the seating chart's drag-and-drop only ever sends { tableLabel }, so
  // it must not clobber a meal choice or email the guest updated elsewhere
  // since this client last fetched the guest list.
  const [current] = (await db().sql`
    SELECT * FROM guests WHERE id = ${Number(guestId)} AND wedding_id = ${weddingId}
  `) as Guest[];
  if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const nextName = name !== undefined ? name : current.name;
  if (!nextName) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  const nextGuestGroup = guestGroup !== undefined ? (guestGroup ?? "general") : current.guest_group;
  const nextTableLabel = tableLabel !== undefined ? tableLabel || null : current.table_label;
  const nextEmail = email !== undefined ? email || null : current.email;
  const nextPlusOneAllowed = plusOneAllowed !== undefined ? !!plusOneAllowed : current.plus_one_allowed;
  const nextMealChoice = mealChoice !== undefined ? mealChoice || null : current.meal_choice;
  const nextSongRequest = songRequest !== undefined ? songRequest || null : current.song_request;

  const validStatus = ["pending", "attending", "declined"].includes(rsvpStatus)
    ? rsvpStatus
    : null;

  const [guest] = validStatus
    ? ((await db().sql`
        UPDATE guests
        SET name = ${nextName}, guest_group = ${nextGuestGroup},
            rsvp_status = ${validStatus},
            rsvp_responded_at = CASE WHEN ${validStatus} = 'pending' THEN NULL ELSE NOW() END,
            table_label = ${nextTableLabel}, email = ${nextEmail},
            plus_one_allowed = ${nextPlusOneAllowed},
            plus_one_name = CASE WHEN ${nextPlusOneAllowed} THEN plus_one_name ELSE NULL END,
            meal_choice = ${nextMealChoice}, song_request = ${nextSongRequest}
        WHERE id = ${Number(guestId)} AND wedding_id = ${weddingId}
        RETURNING *
      `) as Guest[])
    : ((await db().sql`
        UPDATE guests
        SET name = ${nextName}, guest_group = ${nextGuestGroup}, table_label = ${nextTableLabel},
            email = ${nextEmail},
            plus_one_allowed = ${nextPlusOneAllowed},
            plus_one_name = CASE WHEN ${nextPlusOneAllowed} THEN plus_one_name ELSE NULL END,
            meal_choice = ${nextMealChoice}, song_request = ${nextSongRequest}
        WHERE id = ${Number(guestId)} AND wedding_id = ${weddingId}
        RETURNING *
      `) as Guest[]);

  if (!guest) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ guest });
});

export const DELETE = withErrorHandling(async (
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; guestId: string }> }
) => {
  const coupleId = await requireCoupleId();
  if (!coupleId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id, guestId } = await params;
  const weddingId = Number(id);
  if (!(await coupleOwnsWedding(coupleId, weddingId))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db().sql`DELETE FROM guests WHERE id = ${Number(guestId)} AND wedding_id = ${weddingId}`;

  return NextResponse.json({ ok: true });
});
