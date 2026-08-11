import { NextRequest, NextResponse } from "next/server";

interface Bucket {
  count: number;
  resetAt: number;
}

// Per-function-instance, in-memory limiter: resets on cold start and isn't shared
// across concurrent instances. A deliberate stopgap for the public unauthenticated
// endpoints until real traffic/pricing decisions justify a durable store (e.g. Upstash).
const buckets = new Map<string, Bucket>();

function hit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();

  if (Math.random() < 0.01) {
    for (const [k, b] of buckets) {
      if (now > b.resetAt) buckets.delete(k);
    }
  }

  const bucket = buckets.get(key);
  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= limit) return false;
  bucket.count++;
  return true;
}

export function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-nf-client-connection-ip") ??
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}

// Returns a 429 response if the caller is over the limit, or null to proceed.
// `suffix` scopes the bucket to a resource (e.g. a guest/driver/staff code) on top
// of IP, so guests sharing a venue's WiFi don't rate-limit each other.
export function rateLimit(
  req: NextRequest,
  scope: string,
  limit: number,
  windowMs: number,
  suffix?: string
): NextResponse | null {
  const key = `${scope}:${getClientIp(req)}${suffix ? `:${suffix}` : ""}`;
  if (hit(key, limit, windowMs)) return null;

  return NextResponse.json(
    { error: "Too many requests — please try again shortly" },
    { status: 429 }
  );
}
