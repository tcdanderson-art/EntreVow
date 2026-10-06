import type { MetadataRoute } from "next";

// Marketing pages are crawlable; couple dashboards, guest/staff links and
// auth utility pages stay out of search.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/dashboard",
          "/account",
          "/g/",
          "/gallery",
          "/staff/",
          "/driver/",
          "/vendor/",
          "/moderator/",
          "/reset-password",
          "/forgot-password",
        ],
      },
    ],
    sitemap: "https://entrevow.com/sitemap.xml",
  };
}
