import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard", "/g/", "/reset-password"],
      },
    ],
    sitemap: "https://entrevow.netlify.app/sitemap.xml",
  };
}
