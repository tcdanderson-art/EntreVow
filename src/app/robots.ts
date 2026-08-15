import type { MetadataRoute } from "next";

// Pre-launch: disallow everything until real launch, independent of the
// invite-only signup gate (see src/lib/invite-codes.ts) -- the rest of the
// site (marketing pages, login, guest links) is reachable pre-launch, just
// not meant to be indexed yet. Revert to the allow/disallow rules below once
// ready to launch for real.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        disallow: "/",
      },
    ],
    sitemap: "https://entrevow.com/sitemap.xml",
  };
}

// Post-launch rules to restore:
// rules: [{ userAgent: "*", allow: "/", disallow: ["/dashboard", "/g/", "/staff/", "/reset-password"] }]
