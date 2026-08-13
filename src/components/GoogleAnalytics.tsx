"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";

const MEASUREMENT_ID = "G-3GS4N954JH";

// Guest/staff/driver links carry an access code in the URL path itself, and
// GA logs the full path — so analytics deliberately never loads there to
// avoid sending those codes to Google. Marketing pages, auth, and the
// couple's dashboard are unaffected.
const EXCLUDED_PREFIXES = ["/g/", "/staff/", "/driver/"];

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
