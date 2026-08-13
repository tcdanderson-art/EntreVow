import type { NextConfig } from "next";

// Report-only for now: logs violations to /api/csp-report without blocking
// anything. Policy below reflects the app's actual external-origin surface —
// next/font self-hosts fonts, weather proxies server-side, Stripe Checkout is
// a full-page redirect (no Stripe.js) — so the external origins are the
// Leaflet/OSM tile server for the shuttle map, Google Analytics (gtag.js,
// loaded only on marketing/dashboard pages — see GoogleAnalytics.tsx), and
// the Supabase project (photos/video are served and uploaded directly
// client-side, not proxied). Review real violations before ever switching
// this to an enforcing CSP.
const SUPABASE_ORIGIN = "https://otnmrgfuywfexzxkwyep.supabase.co";

const cspDirectives = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com",
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: https://*.tile.openstreetmap.org ${SUPABASE_ORIGIN}`,
  `media-src 'self' ${SUPABASE_ORIGIN}`,
  "font-src 'self'",
  `connect-src 'self' https://www.googletagmanager.com https://*.google-analytics.com https://*.analytics.google.com ${SUPABASE_ORIGIN}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  "manifest-src 'self'",
  "worker-src 'self'",
  "report-uri /api/csp-report",
].join("; ");

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy-Report-Only",
            value: cspDirectives,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
