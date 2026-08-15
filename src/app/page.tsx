import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

// Only the homepage links the manifest — guests reach the app via their own
// personal /g/[code] link, and a manifest's fixed start_url would redirect
// an installed shortcut away from that link back to this marketing page.
export const metadata: Metadata = {
  manifest: "/manifest.json",
};

const FEATURES = [
  {
    title: "The Entrevow Pass",
    description:
      "One digital pass replaces the paper itinerary. A QR code, a calendar file, and their table assignment — all on one link guests can add to their home screen.",
  },
  {
    title: "Entrevow Sync",
    description:
      "Shuttle running late? Ceremony moved up? Update it once and every guest's schedule updates in real time — no group texts required.",
  },
  {
    title: "Conditional Logistics",
    description:
      "Bridal party sees the rehearsal call time. General guests see the ceremony and reception. Everyone sees only what's relevant to them.",
  },
  {
    title: "Guest RSVPs",
    description:
      "Guests confirm or decline, pick a meal, add a plus-one (if you allow it), and leave a song request — all from their itinerary link. You'll always know your final headcount.",
  },
];

const DAY_OF_FEATURES = [
  {
    title: "Live Shuttle Tracking",
    description:
      "Guests see exactly where the shuttle is and when it'll arrive, with a personal pickup recommendation matched to their flight.",
  },
  {
    title: "Weather Alerts",
    description:
      "Automatic contingency alerts if rain or heat could affect an outdoor ceremony or reception, checked against your actual venue.",
  },
  {
    title: "QR Usher Check-In",
    description:
      "Ushers scan each guest's pass on arrival with a phone camera — no clipboard, no app to install.",
  },
  {
    title: "Push Notifications",
    description:
      "If the time or venue changes, guests who've added Entrevow to their home screen get notified instantly, even with the app closed.",
  },
  {
    title: "Vendor Check-In & Crew Broadcasts",
    description:
      "Vendors get their own no-login check-in link, and you can message staff, drivers, and vendors directly — a dedicated crew channel.",
  },
  {
    title: "Day-Of Command Card",
    description:
      "Every guest sees one glance: what's next on the itinerary, their shuttle's ETA, and today's forecast — refreshed automatically.",
  },
];

const MEMORY_FEATURES = [
  {
    title: "Video & Voice Guestbook",
    description:
      "Guests record a 30-second video or voice message right from their phone — no app, no account. You approve each one before it goes live.",
  },
  {
    title: "Welcome Video",
    description:
      "Greet your guests with a short video message the moment they open their itinerary.",
  },
  {
    title: "Shared Photo Gallery",
    description:
      "Guests upload photos throughout the day into one shared gallery everyone can see.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-full bg-cream">
      <header className="flex items-center justify-between gap-3 px-4 sm:px-10 py-6 max-w-6xl mx-auto w-full">
        <Image
          src="/brand/wordmark.png"
          alt="Entrevow"
          width={663}
          height={82}
          className="h-4 sm:h-6 w-auto shrink-0"
          priority
          unoptimized
        />
        <nav className="flex items-center gap-2 sm:gap-4 shrink-0">
          <Link
            href="#pricing"
            className="hidden sm:inline text-sm font-medium text-foreground/80 hover:text-foreground transition-colors whitespace-nowrap"
          >
            Pricing
          </Link>
          <Link
            href="/login"
            className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors whitespace-nowrap"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="text-sm font-medium bg-brand text-white px-3 sm:px-4 py-2 rounded-md hover:bg-brand-hover transition-colors whitespace-nowrap"
          >
            Get Started
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        <section className="text-center px-6 pt-16 pb-12 max-w-3xl mx-auto">
          <h1 className="font-display text-4xl sm:text-5xl leading-tight text-foreground mb-6">
            The guest list, the timeline, the whole day — all in one tap.
          </h1>
          <p className="text-lg text-foreground/70 mb-8 max-w-xl mx-auto">
            Don&apos;t hand out paper itineraries that get lost. Give your guests Entrevow —
            one tap and they know exactly where to be, what&apos;s happening next, and how to
            get there.
          </p>
          <Link
            href="/signup"
            className="inline-block bg-brand text-white px-8 py-3 rounded-md font-medium shadow-lg shadow-brand/20 hover:bg-brand-hover transition-colors"
          >
            Get Started
          </Link>
        </section>

        <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 px-6 sm:px-10 py-14 max-w-6xl mx-auto">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="bg-white border border-border-warm rounded-xl p-6 shadow-sm"
            >
              <h3 className="font-semibold text-lg mb-2 text-brand">{feature.title}</h3>
              <p className="text-foreground/70 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </section>

        <section className="px-6 sm:px-10 py-14 max-w-6xl mx-auto">
          <h2 className="font-display text-2xl sm:text-3xl text-center text-foreground mb-2">
            Day-of, handled
          </h2>
          <p className="text-center text-foreground/80 mb-10 max-w-xl mx-auto">
            Included with Full Day-Of, for the logistics that only matter on the day itself.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {DAY_OF_FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="bg-white border border-border-warm rounded-xl p-6 shadow-sm"
              >
                <h3 className="font-semibold text-lg mb-2 text-brand">{feature.title}</h3>
                <p className="text-foreground/70 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="px-6 sm:px-10 py-14 max-w-6xl mx-auto">
          <h2 className="font-display text-2xl sm:text-3xl text-center text-foreground mb-2">
            Keep the memories, not just the logistics
          </h2>
          <p className="text-center text-foreground/80 mb-10 max-w-xl mx-auto">
            Entrevow isn&apos;t just for getting guests where they need to be.
          </p>
          <div className="grid sm:grid-cols-3 gap-6">
            {MEMORY_FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="bg-white border border-border-warm rounded-xl p-6 shadow-sm"
              >
                <h3 className="font-semibold text-lg mb-2 text-brand">{feature.title}</h3>
                <p className="text-foreground/70 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section id="pricing" className="px-6 sm:px-10 py-14 max-w-4xl mx-auto scroll-mt-8">
          <h2 className="font-display text-2xl sm:text-3xl text-center text-foreground mb-2">
            Simple, one-time pricing
          </h2>
          <p className="text-center text-foreground/80 mb-10 max-w-xl mx-auto">
            Build your wedding for free. Pay once, per wedding, when you&apos;re ready to invite
            guests — no subscription. Priced in AUD, so Australian couples pay no currency
            conversion fees.
          </p>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-white border border-border-warm rounded-xl p-6 flex flex-col gap-3">
              <div className="font-semibold text-lg">Essentials</div>
              <div className="text-3xl font-display text-foreground">
                $69 <span className="text-sm font-sans text-foreground/75">AUD, one-time</span>
              </div>
              <p className="text-foreground/70 text-sm leading-relaxed flex-1">
                Itinerary, RSVPs with meal choice and plus-ones, guest groups, the digital pass,
                video &amp; voice guestbook, welcome video, and photo gallery — for up to 150 guests.
              </p>
              <Link
                href="/signup"
                className="text-sm font-medium bg-cream-card border border-border-warm rounded-md py-2 text-center hover:bg-white transition-colors"
              >
                Get Started
              </Link>
            </div>
            <div className="bg-white border border-brand rounded-xl p-6 flex flex-col gap-3">
              <div className="font-semibold text-lg text-brand">Full Day-Of</div>
              <div className="text-3xl font-display text-foreground">
                $249 <span className="text-sm font-sans text-foreground/75">AUD, one-time</span>
              </div>
              <p className="text-foreground/70 text-sm leading-relaxed flex-1">
                Everything in Essentials, plus live shuttle tracking, weather alerts, QR usher
                check-in, push notifications, vendor check-in &amp; crew broadcasts, the day-of
                command card, a personalised wedding URL, and unlimited guests.
              </p>
              <Link
                href="/signup"
                className="text-sm font-medium bg-brand text-white rounded-md py-2 text-center hover:bg-brand-hover transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
          <p className="text-center text-foreground/70 text-sm mt-8">
            Proudly Australian-made, priced in AUD — and nothing to remember to cancel.
          </p>
        </section>
      </main>

      <footer className="text-center text-sm text-foreground/75 py-8 border-t border-border-warm flex flex-col items-center gap-2">
        <p>Entrevow — from &ldquo;I do&rdquo; to the last dance.</p>
        <p className="flex items-center gap-3">
          <Link href="/faq" className="hover:text-foreground transition-colors">
            FAQ
          </Link>
          <span aria-hidden="true">·</span>
          <Link href="/privacy" className="hover:text-foreground transition-colors">
            Privacy Policy
          </Link>
          <span aria-hidden="true">·</span>
          <Link href="/terms" className="hover:text-foreground transition-colors">
            Terms of Service
          </Link>
          <span aria-hidden="true">·</span>
          <Link href="/accessibility" className="hover:text-foreground transition-colors">
            Accessibility
          </Link>
        </p>
      </footer>
    </div>
  );
}
