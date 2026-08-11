import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { createSession } from "@/lib/session";
import { withErrorHandling } from "@/lib/route-handler";
import { rateLimit } from "@/lib/rate-limit";

interface CoupleRow {
  id: number;
  email: string;
  display_name: string;
  password_hash: string;
}

export const POST = withErrorHandling(async (req: NextRequest) => {
  const limited = rateLimit(req, "login", 10, 5 * 60_000);
  if (limited) return limited;

  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Missing email or password" }, { status: 400 });
  }

  const database = db();
  const rows = (await database.sql`
    SELECT id, email, display_name, password_hash FROM couples WHERE email = ${email}
  `) as CoupleRow[];
  const couple = rows[0];

  if (!couple || !(await verifyPassword(password, couple.password_hash))) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  await createSession(couple.id);

  return NextResponse.json({
    couple: { id: couple.id, email: couple.email, display_name: couple.display_name },
  });
});
