import { createHash, randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withErrorHandling } from "@/lib/route-handler";
import { sendPasswordResetEmail } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";

const TOKEN_TTL_MS = 60 * 60 * 1000;

export const POST = withErrorHandling(async (req: NextRequest) => {
  const limited = rateLimit(req, "forgot-password", 5, 60 * 60_000);
  if (limited) return limited;

  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });

  const database = db();
  const rows = (await database.sql`SELECT id FROM couples WHERE email = ${email}`) as { id: number }[];
  const couple = rows[0];

  // Always respond the same way whether or not the account exists, so this
  // endpoint can't be used to find out which emails have an Entrevow account.
  if (couple) {
    const token = randomBytes(32).toString("base64url");
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);

    await database.sql`
      UPDATE couples
      SET reset_token_hash = ${tokenHash}, reset_token_expires_at = ${expiresAt.toISOString()}
      WHERE id = ${couple.id}
    `;

    const resetUrl = `${req.nextUrl.origin}/reset-password?token=${token}`;
    await sendPasswordResetEmail(email, resetUrl);
  }

  return NextResponse.json({ ok: true });
});
