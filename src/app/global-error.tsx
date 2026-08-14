"use client";

import { useEffect } from "react";
import "./globals.css";

// Only fires if the root layout itself throws — must render its own <html>/<body>
// since it replaces the whole tree. Deliberately minimal (no next/font, no Link)
// since this is the last-resort fallback when something more basic has broken.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-full flex items-center justify-center bg-cream px-6 py-12">
        <div className="w-full max-w-sm text-center bg-white border border-border-warm rounded-xl p-8 shadow-sm">
          <h1 className="text-3xl mb-2 font-semibold">Something went wrong</h1>
          <p className="text-sm text-foreground/80 mb-6">
            That&apos;s on us, not you — try again in a moment.
          </p>
          <button
            onClick={reset}
            className="bg-brand text-white px-6 py-2.5 rounded-md text-sm font-medium hover:bg-brand-hover transition-colors"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
