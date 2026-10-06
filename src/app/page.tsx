import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { BetaHeroPromo } from "@/components/BetaBanner";
import BetaPricing from "@/components/BetaPricing";
import DemoPhone from "@/components/DemoPhone";

// Only the homepage links the manifest — guests reach the app via their own
// personal /g/[code] link, and a manifest's fixed start_url would redirect
// an installed shortcut away from that link back to this marketing page.
export const metadata: Metadata = {
  manifest: "/manifest.json",
  alternates: { canonical: "/" },
};

const HOW_IT_WORKS = [
  {
    title: "Build your wedding",
    description:
      "Add your guests, itinerary, meal options and shuttles. It's free to build, and nothing is shared until you choose.",
  },
  {
    title: "Share one link",
    description:
      "Every guest gets their own personal link by text or QR code. They see only what applies to them, with nothing to download.",
  },
  {
    title: "Enjoy the day",
    description:
      "Change a time once and every guest sees it. Track shuttles, check guests in and collect the messages and photos.",
  },
];

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

// Only facts already visible on the site: name, URL, contact address, logo.
const SITE_SCHEMA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://entrevow.com/#organization",
      name: "Entrevow",
      url: "https://entrevow.com",
      logo: "https://entrevow.com/brand/icon-mark.png",
      email: "hello@entrevow.com",
      sameAs: ["https://www.facebook.com/entrevow"],
    },
    {
      "@type": "WebSite",
      "@id": "https://entrevow.com/#website",
      name: "Entrevow",
      url: "https://entrevow.com",
      description:
        "Wedding-day logistics: a live itinerary, RSVPs and guest list, shuttle tracking and a photo and video guestbook, shared with guests on one personal link.",
      publisher: { "@id": "https://entrevow.com/#organization" },
      inLanguage: "en-AU",
    },
  ],
};

export default function Home() {
  return (
    <div className="flex flex-col min-h-full bg-cream">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(SITE_SCHEMA) }}
      />
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
            href="/demo"
            className="hidden md:inline text-sm font-medium text-foreground/80 hover:text-foreground transition-colors whitespace-nowrap"
          >
            Demo
          </Link>
          <Link
            href="/guide"
            className="hidden md:inline text-sm font-medium text-foreground/80 hover:text-foreground transition-colors whitespace-nowrap"
          >
            Guide
          </Link>
          <Link
            href="/faq"
            className="hidden md:inline text-sm font-medium text-foreground/80 hover:text-foreground transition-colors whitespace-nowrap"
          >
            FAQ
          </Link>
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
        <section className="px-6 pt-12 sm:pt-16 pb-12 max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <h1 className="font-display text-4xl sm:text-5xl leading-tight text-foreground mb-6">
              The guest list, the timeline, the whole day — all in one tap.
            </h1>
            <p className="text-lg text-foreground/80 mb-8 max-w-xl mx-auto lg:mx-0">
              Don&apos;t hand out paper itineraries that get lost. Give your guests Entrevow —
              one tap and they know exactly where to be, what&apos;s happening next, and how to
              get there.
            </p>
            <div className="flex flex-wrap justify-center lg:justify-start items-center gap-3">
              <Link
                href="/signup"
                className="inline-block bg-brand text-white px-8 py-3 rounded-md font-medium shadow-lg shadow-brand/20 hover:bg-brand-hover transition-colors"
              >
                Start building free
              </Link>
              <Link
                href="/demo"
                className="inline-block px-8 py-3 rounded-md font-medium border border-border-warm bg-white text-foreground hover:bg-cream-card transition-colors"
              >
                See a demo
              </Link>
            </div>
            <p className="text-sm text-foreground/80 mt-4">
              No app for guests to install. Build your whole wedding before you pay anything.
            </p>
          </div>
          <DemoPhone />
        </section>

        <section className="px-6 pb-4 max-w-6xl mx-auto">
          <BetaHeroPromo />
        </section>

        <section className="px-6 sm:px-10 py-14 max-w-6xl mx-auto">
          <h2 className="font-display text-2xl sm:text-3xl text-center text-foreground mb-10">
            How it works
          </h2>
          <ol className="grid sm:grid-cols-3 gap-6">
            {HOW_IT_WORKS.map((step, i) => (
              <li
                key={step.title}
                className="bg-white border border-border-warm rounded-xl p-6 shadow-sm"
              >
                <span className="text-xs font-medium tracking-[0.2em] uppercase text-brand">
                  Step {i + 1}
                </span>
                <h3 className="font-semibold text-lg mt-2 mb-2">{step.title}</h3>
                <p className="text-foreground/70 text-sm leading-relaxed">{step.description}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 px-6 sm:px-10 py-14 max-w-6xl mx-auto">
          <h2 className="sr-only">What Entrevow does</h2>
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

        <section className="px-6 sm:px-10 py-14 max-w-3xl mx-auto text-center">
          <h2 className="font-display text-2xl sm:text-3xl text-foreground mb-4">
            Built in Australia, run personally
          </h2>
          <p className="text-foreground/80 leading-relaxed">
            Entrevow is an independent Australian product, not a division of a large wedding
            company. For the first 35 couples, the founder reads every code request and every piece
            of feedback and replies personally. You can reach the founder directly at{" "}
            <a href="mailto:hello@entrevow.com" className="text-brand font-medium underline">
              hello@entrevow.com
            </a>
            .
          </p>
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
          <BetaPricing />
          <p className="text-center text-foreground/80 text-sm mt-8">
            Proudly Australian-made, priced in AUD — and nothing to remember to cancel.
          </p>
        </section>
      </main>

      <footer className="text-center text-sm text-foreground/75 py-8 border-t border-border-warm flex flex-col items-center gap-2">
        <p>Entrevow — from &ldquo;I do&rdquo; to the last dance.</p>
        <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4">
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
          <span aria-hidden="true">·</span>
          <a
            href="https://www.facebook.com/entrevow"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            Facebook
          </a>
        </p>
      </footer>
    </div>
  );
}
