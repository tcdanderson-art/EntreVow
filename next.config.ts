import type { NextConfig } from "next";

// Report-only for now: logs violations to /api/csp-report without blocking
// anything. Policy below reflects the app's actual external-origin surface —
// next/font self-hosts fonts, weather/photos proxy server-side, Stripe
// Checkout is a full-page redirect (no Stripe.js) — so the only external
// origin needed is the Leaflet/OSM tile server for the shuttle map. Review
// real violations before ever switching this to an enforcing CSP.
const cspDirectives = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.tile.openstreetmap.org",
  "font-src 'self'",
  "connect-src 'self'",
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
