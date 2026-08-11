import type { MetadataRoute } from "next";

// Pre-launch: disallow everything while the site is behind the coming-soon
// gate (see middleware.ts). Revert to the allow/disallow rules below once
// the gate comes down.
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
