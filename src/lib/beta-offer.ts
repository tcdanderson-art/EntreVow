import { createHash, randomUUID } from "crypto";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { db, transaction } from "@/lib/db";
import { getClientIp } from "@/lib/rate-limit";
import { HttpError } from "@/lib/route-handler";

// The first N couples who reach checkout get Full Day-Of free, once each.
export const BETA_FREE_SPOTS = 35;

const DEVICE_COOKIE = "entrevow_did";
const GRANT_LOCK_KEY = 35_001;

export async function getBetaSpotsLeft(): Promise<number> {
  const [{ count }] = (await db().sql`SELECT COUNT(*)::int AS count FROM beta_grants`) as {
    count: number;
  }[];
  return Math.max(0, BETA_FREE_SPOTS - count);
}

// Gmail ignores dots and +tags, so a.b+2@gmail.com is the same inbox as ab@gmail.com.
export function normalizeEmail(email: string): string {
  const [rawLocal, rawDomain = ""] = email.trim().toLowerCase().split("@");
  const domain = rawDomain === "googlemail.com" ? "gmail.com" : rawDomain;
  let local = rawLocal.split("+")[0];
  if (domain === "gmail.com") local = local.replace(/\./g, "");
  return `${local}@${domain}`;
}

function sha256(value: string): string {
  return createHash("sha256")
    .update(`${process.env.SESSION_SECRET ?? ""}:${value}`)
    .digest("hex");
}

// A long-lived random id in an HTTP-only cookie, set the first time we see a
// browser. Clearing cookies defeats it on its own, which is why the grant also
// checks the email and the fingerprint+network pair.
export async function getOrCreateDeviceId(): Promise<string> {
  const store = await cookies();
  const existing = store.get(DEVICE_COOKIE)?.value;
  if (existing) return existing;
  const id = randomUUID();
  store.set(DEVICE_COOKIE, id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 730,
  });
  return id;
}

// While signup is invite-only, an unspent beta code doubles as a signup invite,
// so one emailed code lets someone register and later claim their spot.
export async function isUnspentBetaCode(code: string | null | undefined): Promise<boolean> {
  if (!code) return false;
  const rows = await db().sql`
    SELECT 1 FROM beta_codes WHERE code = ${code.trim().toUpperCase()} AND used_at IS NULL LIMIT 1
  `;
  return rows.length > 0;
}

export type BetaClaimResult = "granted" | "sold_out" | "duplicate" | "bad_code";

export async function tryClaimBetaGrant(args: {
  req: NextRequest;
  coupleId: number;
  email: string;
  weddingId: number;
  fingerprint: unknown;
  code: string;
}): Promise<BetaClaimResult> {
  const deviceHash = sha256(`device:${await getOrCreateDeviceId()}`);
  const clientIp = getClientIp(args.req);
  // With no usable address, every caller would share one hash, so skip the network signal.
  const ipHash = clientIp === "unknown" ? null : sha256(`ip:${clientIp}`);
  const fingerprintHash =
    typeof args.fingerprint === "string" && /^[0-9a-f]{64}$/.test(args.fingerprint)
      ? sha256(`fp:${args.fingerprint}`)
      : null;
  const normalizedEmail = normalizeEmail(args.email);

  // The advisory lock serializes concurrent claims so two requests can't both
  // read "34 used" and both take spot 35; it auto-releases on commit/rollback.
  return transaction(async (sql) => {
    await sql`SELECT pg_advisory_xact_lock(${GRANT_LOCK_KEY})`;

    const [{ count }] = (await sql`SELECT COUNT(*)::int AS count FROM beta_grants`) as {
      count: number;
    }[];
    if (count >= BETA_FREE_SPOTS) return "sold_out";

    // Lock the code row so two simultaneous claims can't both spend it.
    const codes = await sql`
      SELECT code FROM beta_codes
      WHERE code = ${args.code.trim().toUpperCase()} AND used_at IS NULL
      FOR UPDATE
    `;
    if (codes.length === 0) return "bad_code";

    // Fingerprint alone collides across identical phones, so it only counts
    // when the network matches too. A legit couple wrongly caught by this can
    // email for a fresh code, which is why the hand-issued code is the main gate.
    const dupes = await sql`
      SELECT 1 FROM beta_grants
      WHERE couple_id = ${args.coupleId}
         OR normalized_email = ${normalizedEmail}
         OR device_hash = ${deviceHash}
         OR (${fingerprintHash}::text IS NOT NULL AND ${ipHash}::text IS NOT NULL
             AND fingerprint_hash = ${fingerprintHash}
             AND ip_hash = ${ipHash})
      LIMIT 1
    `;
    if (dupes.length > 0) return "duplicate";

    await sql`
      INSERT INTO beta_grants (couple_id, wedding_id, normalized_email, device_hash, fingerprint_hash, ip_hash)
      VALUES (${args.coupleId}, ${args.weddingId}, ${normalizedEmail}, ${deviceHash}, ${fingerprintHash}, ${ipHash})
    `;
    const unlocked = await sql`
      UPDATE weddings SET plan_tier = 'full', paid_at = NOW()
      WHERE id = ${args.weddingId} AND couple_id = ${args.coupleId} AND plan_tier IS NULL
      RETURNING id
    `;
    // The wedding got a plan between the route's read and here (e.g. a webhook).
    // Throwing rolls back the grant row too, so the code and spot aren't burned.
    if (unlocked.length === 0) {
      throw new HttpError(409, "This wedding already has a plan, so no free spot was used.");
    }
    await sql`UPDATE beta_codes SET used_at = NOW() WHERE code = ${codes[0].code}`;
    return "granted";
  });
}
