import { NextRequest, NextResponse } from "next/server";

// Report-only CSP violations land here (see the report-uri directive in
// next.config.ts). Just logs to the Netlify function log for now — the plan
// is to review real traffic for gaps before ever switching to enforcing.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.warn("CSP violation report:", JSON.stringify(body));
  } catch {
    // Malformed report body — nothing to log, don't fail the request over it.
  }
  return new NextResponse(null, { status: 204 });
}
