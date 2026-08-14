"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
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
    <div className="flex-1 flex items-center justify-center bg-cream px-6 py-12">
      <div className="w-full max-w-sm text-center bg-white border border-border-warm rounded-xl p-8 shadow-sm">
        <h1 className="font-display text-3xl mb-2">Something went wrong</h1>
        <p className="text-sm text-foreground/80 mb-6">
          That&apos;s on us, not you — try again in a moment. If it keeps happening, come back later.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="bg-brand text-white px-6 py-2.5 rounded-md text-sm font-medium hover:bg-brand-hover transition-colors"
          >
            Try again
          </button>
          <Link
            href="/"
            className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
          >
            Back to Entrevow
          </Link>
        </div>
      </div>
    </div>
  );
}
