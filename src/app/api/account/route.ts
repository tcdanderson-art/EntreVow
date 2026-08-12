import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireCoupleId } from "@/lib/require-auth";
import { withErrorHandling } from "@/lib/route-handler";
import { Couple } from "@/types/couple";

export const PATCH = withErrorHandling(async (req: NextRequest) => {
  const coupleId = await requireCoupleId();
  if (!coupleId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { displayName, email } = await req.json();
  if (!displayName || !email) {
    return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
  }

  const database = db();
  const existing = await database.sql`
    SELECT id FROM couples WHERE email = ${email} AND id != ${coupleId}
  `;
  if (existing.length > 0) {
    return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
  }

  const [couple] = (await database.sql`
    UPDATE couples SET display_name = ${displayName}, email = ${email}
    WHERE id = ${coupleId}
    RETURNING id, email, display_name, created_at
  `) as Couple[];

  return NextResponse.json({ couple });
});
