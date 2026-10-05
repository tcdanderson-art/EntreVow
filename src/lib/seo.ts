import type { Metadata } from "next";

const SITE = "https://entrevow.com";
const OG_IMAGE = {
  url: "/og-image.png",
  width: 1200,
  height: 630,
  alt: "Entrevow: wedding-day itinerary, RSVPs and guest list on one link",
};

// A page that sets its own `openGraph` replaces the layout's wholesale (Next
// merges metadata one key deep), which would drop the image and site name and
// leave og:url pointing at the homepage. This keeps every inner page complete.
export function pageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: `${SITE}${path}`,
      siteName: "Entrevow",
      images: [OG_IMAGE],
      locale: "en_AU",
      type: "website",
    },
    twitter: { card: "summary_large_image", title, description, images: [OG_IMAGE.url] },
  };
}
