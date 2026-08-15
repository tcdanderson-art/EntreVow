import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

// Same secret-bearing routes GoogleAnalytics.tsx's EXCLUDED_PREFIXES guards
// against — a routine CSP violation on any of these pages otherwise logs its
// document-uri/referrer, including the access_code or token, straight to the
// server log.
const SECRET_PATH_PREFIXES = ["/g/", "/staff/", "/driver/", "/vendor/", "/moderator/", "/gallery/"];

function redactUrlLike(value: string): string {
  const queryIndex = value.indexOf("?");
  let result = queryIndex === -1 ? value : `${value.slice(0, queryIndex)}?[redacted]`;

  for (const prefix of SECRET_PATH_PREFIXES) {
    const idx = result.indexOf(prefix);
    if (idx !== -1) {
      const afterPrefix = idx + prefix.length;
      const nextSlash = result.indexOf("/", afterPrefix);
      const end = nextSlash === -1 ? result.length : nextSlash;
      result = `${result.slice(0, afterPrefix)}[redacted]${result.slice(end)}`;
      break;
    }
  }

  return result;
}

function redactDeep(value: unknown): unknown {
  if (typeof value === "string") return redactUrlLike(value);
  if (Array.isArray(value)) return value.map(redactDeep);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, redactDeep(v)]));
  }
  return value;
}

// Report-only CSP violations land here (see the report-uri directive in
// next.config.ts). Just logs to the Netlify function log for now — the plan
// is to review real traffic for gaps before ever switching to enforcing.
export async function POST(req: NextRequest) {
  const limited = rateLimit(req, "csp-report", 30, 60_000);
  if (limited) return limited;

  try {
    const body = await req.json();
    console.warn("CSP violation report:", JSON.stringify(redactDeep(body)));
  } catch {
    // Malformed report body — nothing to log, don't fail the request over it.
  }
  return new NextResponse(null, { status: 204 });
}
