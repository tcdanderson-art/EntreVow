import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "entrevow_preview";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 180; // ~6 months

// Scope the cookie to .entrevow.com so it covers per-couple subdomains too
// (alexandpriya.entrevow.com etc). Never do this for the underlying
// netlify.app host — that's a shared public suffix, and browsers reject (or
// worse, could leak across unrelated sites on) a cookie scoped that broadly.
// On the apex itself, stay host-only (no Domain attribute) rather than
// setting Domain=.entrevow.com — iOS Safari has been unreliable honoring an
// explicit cross-subdomain Domain attribute on a cookie set via a redirect
// response, even when the request never leaves entrevow.com.
function cookieDomainFor(hostname: string): string | undefined {
  return hostname.endsWith(".entrevow.com") ? ".entrevow.com" : undefined;
}

// Pre-launch gate: the whole site rewrites to /coming-soon for everyone except
// whoever has the preview cookie. Visiting with ?preview=<PREVIEW_ACCESS_CODE>
// once sets that cookie. No-op entirely if the env var isn't set (local dev).
export function proxy(req: NextRequest) {
  const accessCode = process.env.PREVIEW_ACCESS_CODE;
  if (!accessCode) return NextResponse.next();

  const { pathname, searchParams } = req.nextUrl;
  if (pathname === "/coming-soon") return NextResponse.next();

  // Stripe's servers call this with no preview cookie — never gate it.
  if (pathname === "/api/stripe/webhook") return NextResponse.next();

  const queryCode = searchParams.get("preview");
  const cookieCode = req.cookies.get(COOKIE_NAME)?.value;

  if (queryCode === accessCode && cookieCode !== accessCode) {
    const url = req.nextUrl.clone();
    url.searchParams.delete("preview");
    const res = NextResponse.redirect(url);
    res.cookies.set(COOKIE_NAME, accessCode, {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      maxAge: COOKIE_MAX_AGE,
      path: "/",
      domain: cookieDomainFor(req.nextUrl.hostname),
    });
    return res;
  }

  if (cookieCode === accessCode || queryCode === accessCode) {
    return NextResponse.next();
  }

  const comingSoon = req.nextUrl.clone();
  comingSoon.pathname = "/coming-soon";
  comingSoon.search = "";
  const res = NextResponse.rewrite(comingSoon);
  // Without this, the rewritten response inherits /coming-soon's own
  // (long-lived, publicly cacheable) headers, and Netlify's edge caches
  // that "not unlocked yet" response against the ORIGINAL url for up to a
  // year. Since the cache doesn't vary on our custom cookie, that then
  // gets served to everyone hitting that url afterwards — including
  // visitors who do have a valid unlock cookie. Every gate decision must
  // be revalidated at the origin on every request.
  res.headers.set("Cache-Control", "private, no-store, must-revalidate");
  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|icon\\.png|apple-icon\\.png|og-image\\.png|manifest\\.json|sw\\.js|robots\\.txt|sitemap\\.xml).*)",
  ],
};
