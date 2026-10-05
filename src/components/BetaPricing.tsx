"use client";

import Link from "next/link";
import { useBetaOffer } from "@/lib/use-beta-offer";
import { PAID_CHECKOUT_ENABLED } from "@/lib/plan";

const MAILTO = "mailto:hello@entrevow.com?subject=Founding%20couples%20code";
const WAITLIST = "mailto:hello@entrevow.com?subject=Tell%20me%20when%20plans%20open";

const ESSENTIALS_COPY =
  "Itinerary, RSVPs with meal choice and plus-ones, guest groups, the digital pass, video & voice guestbook, welcome video, and photo gallery. For up to 150 guests.";
const FULL_COPY =
  "Everything in Essentials, plus live shuttle tracking, weather alerts, QR usher check-in, push notifications, vendor check-in & crew broadcasts, the day-of command card, a personalised wedding URL, and unlimited guests.";

export default function BetaPricing() {
  const offer = useBetaOffer();
  const loading = offer == null;
  const promo = offer != null && offer.remaining > 0;
  // Beta full and paid checkout still off while the results are reviewed: no buy buttons.
  const closed = !loading && !promo && !PAID_CHECKOUT_ENABLED;

  return (
    <div className="grid sm:grid-cols-2 gap-6">
      <div
        className={`bg-white border border-border-warm rounded-xl p-6 flex flex-col gap-3 ${
          promo ? "opacity-70" : ""
        }`}
      >
        <div className="font-semibold text-lg">Essentials</div>
        <div className="text-3xl font-display text-foreground">
          <span className={promo ? "line-through decoration-foreground/40" : ""}>$69</span>{" "}
          <span className="text-sm font-sans text-foreground/75">AUD, one-time</span>
        </div>
        <p className="text-foreground/70 text-sm leading-relaxed flex-1">{ESSENTIALS_COPY}</p>
        {promo ? (
          <p className="text-sm text-foreground/70 text-center py-2">
            Full Day-Of is complimentary during the founding program.
          </p>
        ) : closed ? (
          <p className="text-sm text-foreground/70 text-center py-2">Opening after the beta.</p>
        ) : loading && !PAID_CHECKOUT_ENABLED ? null : (
          <Link
            href="/signup"
            className="text-sm font-medium bg-cream-card border border-border-warm rounded-md py-2 text-center hover:bg-white transition-colors"
          >
            Get Started
          </Link>
        )}
      </div>

      <div
        className={`relative bg-white border-2 border-brand rounded-xl p-6 flex flex-col gap-3 ${
          promo ? "shadow-xl shadow-brand/15" : ""
        }`}
      >
        {promo && (
          <span className="absolute -top-3 left-6 bg-brand text-white text-xs font-medium tracking-wide uppercase rounded-full px-3 py-1">
            Founding couples · {offer.remaining} of {offer.total} remaining
          </span>
        )}
        <div className="font-semibold text-lg text-brand">Full Day-Of</div>
        <div className="text-3xl font-display text-foreground">
          {promo ? (
            <>
              <span className="text-brand">Complimentary</span>{" "}
              <span className="text-lg text-foreground/60 line-through decoration-foreground/40">
                $249
              </span>{" "}
            </>
          ) : (
            <>$249 </>
          )}
          <span className="text-sm font-sans text-foreground/75">
            {promo ? "founding program, one per couple" : "AUD, one-time"}
          </span>
        </div>
        <p className="text-foreground/70 text-sm leading-relaxed flex-1">{FULL_COPY}</p>
        {promo ? (
          <a
            href={MAILTO}
            className="text-sm font-medium bg-brand text-white rounded-md py-2 text-center hover:bg-brand-hover transition-colors"
          >
            Request your code
          </a>
        ) : closed ? (
          <a
            href={WAITLIST}
            className="text-sm font-medium bg-brand text-white rounded-md py-2 text-center hover:bg-brand-hover transition-colors"
          >
            The founding program is full. Email us to hear when plans open
          </a>
        ) : loading && !PAID_CHECKOUT_ENABLED ? (
          <a
            href={MAILTO}
            className="text-sm font-medium bg-brand text-white rounded-md py-2 text-center hover:bg-brand-hover transition-colors"
          >
            Enquire about early access
          </a>
        ) : (
          <Link
            href="/signup"
            className="text-sm font-medium bg-brand text-white rounded-md py-2 text-center hover:bg-brand-hover transition-colors"
          >
            Get Started
          </Link>
        )}
      </div>
    </div>
  );
}
