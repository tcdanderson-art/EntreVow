"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";

const MEASUREMENT_ID = "G-3GS4N954JH";

// Every no-login "delegated link" role carries an access code in the URL path
// itself, and GA logs the full path — so analytics deliberately never loads on
// any of them, to avoid sending those codes to Google. Marketing pages, auth,
// and the couple's dashboard are unaffected. Keep this in sync with whatever
// delegated-link roles exist — vendor/moderator/gallery were added after guest/
// staff/driver and were originally missed here.
const EXCLUDED_PREFIXES = ["/g/", "/staff/", "/driver/", "/vendor/", "/moderator/", "/gallery/"];

export function GoogleAnalytics() {
  const pathname = usePathname();
  if (EXCLUDED_PREFIXES.some((prefix) => pathname.startsWith(prefix))) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${MEASUREMENT_ID}');
        `}
      </Script>
    </>
  );
}
