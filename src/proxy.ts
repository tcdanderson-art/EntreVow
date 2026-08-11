import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "entrevow_preview";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 180; // ~6 months

// Pre-launch gate: the whole site rewrites to /coming-soon for everyone except
// whoever has the preview cookie. Visiting with ?preview=<PREVIEW_ACCESS_CODE>
// once sets that cookie. No-op entirely if the env var isn't set (local dev).
export function proxy(req: NextRequest) {
  const accessCode = process.env.PREVIEW_ACCESS_CODE;
  if (!accessCode) return NextResponse.next();

  const { pathname, searchParams } = req.nextUrl;
  if (pathname === "/coming-soon") return NextResponse.next();

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
    });
    return res;
  }

  if (cookieCode === accessCode || queryCode === accessCode) {
    return NextResponse.next();
  }

  const comingSoon = req.nextUrl.clone();
  comingSoon.pathname = "/coming-soon";
  comingSoon.search = "";
  return NextResponse.rewrite(comingSoon);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|icon\\.png|apple-icon\\.png|og-image\\.png|manifest\\.json|sw\\.js|robots\\.txt|sitemap\\.xml).*)",
  ],
};
