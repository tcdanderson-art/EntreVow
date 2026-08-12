import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireCoupleId } from "@/lib/require-auth";
import { withErrorHandling } from "@/lib/route-handler";
import { hashPassword, verifyPassword } from "@/lib/password";

export const POST = withErrorHandling(async (req: NextRequest) => {
  const coupleId = await requireCoupleId();
  if (!coupleId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { currentPassword, newPassword } = await req.json();
  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: "Current and new password are required" }, { status: 400 });
  }
  if (newPassword.length < 8) {
    return NextResponse.json({ error: "New password must be at least 8 characters" }, { status: 400 });
  }

  const database = db();
  const rows = (await database.sql`
    SELECT password_hash FROM couples WHERE id = ${coupleId}
  `) as { password_hash: string }[];
  const couple = rows[0];

  if (!couple || !(await verifyPassword(currentPassword, couple.password_hash))) {
    return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 });
  }

  const passwordHash = await hashPassword(newPassword);
  await database.sql`UPDATE couples SET password_hash = ${passwordHash} WHERE id = ${coupleId}`;

  return NextResponse.json({ ok: true });
});
