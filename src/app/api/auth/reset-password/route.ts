import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withErrorHandling } from "@/lib/route-handler";
import { hashPassword } from "@/lib/password";

export const POST = withErrorHandling(async (req: NextRequest) => {
  const { token, password } = await req.json();
  if (!token || !password) {
    return NextResponse.json({ error: "Missing token or password" }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  const tokenHash = createHash("sha256").update(token).digest("hex");
  const database = db();

  const rows = (await database.sql`
    SELECT id FROM couples
    WHERE reset_token_hash = ${tokenHash} AND reset_token_expires_at > NOW()
  `) as { id: number }[];
  const couple = rows[0];

  if (!couple) {
    return NextResponse.json({ error: "This reset link is invalid or has expired" }, { status: 400 });
  }

  const passwordHash = await hashPassword(password);
  await database.sql`
    UPDATE couples
    SET password_hash = ${passwordHash}, reset_token_hash = NULL, reset_token_expires_at = NULL
    WHERE id = ${couple.id}
  `;

  return NextResponse.json({ ok: true });
});
