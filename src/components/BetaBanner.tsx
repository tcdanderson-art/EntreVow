"use client";

import { useBetaOffer } from "@/lib/use-beta-offer";

const MAILTO = "mailto:hello@entrevow.com?subject=Founding%20couples%20code";

// Compact one-liner for inside the dashboard.
export default function BetaBanner({ className = "" }: { className?: string }) {
  const offer = useBetaOffer();
  if (!offer || offer.remaining <= 0) return null;

  return (
    <p
      className={`text-sm font-medium text-brand bg-cream-card border border-brand/30 rounded-lg px-4 py-2 ${className}`}
    >
      Founding couples program: {offer.remaining} of {offer.total} free Full Day-Of places remaining, one per couple.{" "}
      <a href={MAILTO} className="underline">
        Request a code.
      </a>
    </p>
  );
}

// Homepage hero card: live counter plus a row of dots, one per spot.
export function BetaHeroPromo() {
  const offer = useBetaOffer();
  if (!offer || offer.remaining <= 0) return null;
  const taken = offer.total - offer.remaining;

  return (
    <div className="mx-auto max-w-lg mb-8 rounded-2xl border border-brand/40 bg-white p-1 shadow-lg shadow-brand/10">
      <div className="rounded-xl border border-dashed border-brand/40 bg-cream-card px-5 py-5">
        <p className="text-xs font-medium tracking-[0.2em] uppercase text-brand mb-2">
          Founding couples
        </p>
        <p className="font-display text-2xl sm:text-3xl text-foreground leading-snug mb-1">
          Full Day-Of, <span className="text-brand">complimentary</span> for our first {offer.total} couples
        </p>
        <p className="text-sm text-foreground/75 mb-4">
          Normally <s>$249 AUD</s>. We&apos;re refining Entrevow alongside real weddings, and ask
          only for honest feedback in return.
        </p>
        <div
          className="flex flex-wrap justify-center gap-1 mb-2"
          role="img"
          aria-label={`${taken} of ${offer.total} spots taken`}
        >
          {Array.from({ length: offer.total }, (_, i) => (
            <span
              key={i}
              className={`h-2 w-2 rounded-full ${i < taken ? "bg-brand" : "border border-brand/50"}`}
            />
          ))}
        </div>
        <p className="text-sm font-medium text-brand mb-4">
          {offer.remaining} of {offer.total} places remaining
        </p>
        <a
          href={MAILTO}
          className="inline-block bg-brand text-white px-6 py-2.5 rounded-md text-sm font-medium hover:bg-brand-hover transition-colors"
        >
          Request your code
        </a>
      </div>
    </div>
  );
}
