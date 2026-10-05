import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://entrevow.com";
  const routes = ["", "/faq", "/guide", "/signup", "/login", "/privacy", "/terms", "/accessibility"];

  return routes.map((route) => ({
    url: `${base}${route}`,
    lastModified: new Date(),
  }));
}
