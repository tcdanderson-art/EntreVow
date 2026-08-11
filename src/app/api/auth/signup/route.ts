import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { createSession } from "@/lib/session";
import { withErrorHandling } from "@/lib/route-handler";
import { rateLimit } from "@/lib/rate-limit";
import { Couple } from "@/types/couple";

export const POST = withErrorHandling(async (req: NextRequest) => {
  const limited = rateLimit(req, "signup", 5, 60 * 60_000);
  if (limited) return limited;

  const { email, password, displayName } = await req.json();

  if (!email || !password || !displayName) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  const database = db();
  const existing = await database.sql`SELECT id FROM couples WHERE email = ${email}`;
  if (existing.length > 0) {
    return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const [couple] = (await database.sql`
    INSERT INTO couples (email, password_hash, display_name)
    VALUES (${email}, ${passwordHash}, ${displayName})
    RETURNING id, email, display_name, created_at
  `) as Couple[];

  await createSession(couple.id);

  return NextResponse.json({ couple });
});
