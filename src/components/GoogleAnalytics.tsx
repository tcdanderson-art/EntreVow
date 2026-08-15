"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";

const MEASUREMENT_ID = "G-7GSG1Q919S";

// Every no-login "delegated link" role carries an access code in the URL path
// itself, and a couple of auth routes carry a secret token in the query string
// (password-reset token, signup invite code) — GA logs the full URL including
// query params, so analytics deliberately never loads on any of them, to avoid
// sending those secrets to Google. Marketing pages and the couple's dashboard
// are unaffected. Keep this in sync with whatever secret-bearing routes exist —
// vendor/moderator/gallery were added after guest/staff/driver and were
// originally missed here.
const EXCLUDED_PREFIXES = [
  "/g/",
  "/staff/",
  "/driver/",
  "/vendor/",
  "/moderator/",
  "/gallery/",
  "/reset-password",
  "/signup",
];

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
