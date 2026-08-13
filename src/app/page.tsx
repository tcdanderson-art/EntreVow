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
      "One digital pass replaces the paper itinerary. Guests and bridal party get exactly what they need to know, when they need to know it.",
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
      "Guests confirm or decline right from their itinerary link, with a note for dietary needs or plus-ones. You'll always know your final headcount.",
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
      </main>

      <footer className="text-center text-sm text-foreground/50 py-8 border-t border-border-warm flex flex-col items-center gap-2">
        <p>Entrevow — from &ldquo;I do&rdquo; to the last dance.</p>
        <p className="flex items-center gap-3">
          <Link href="/privacy" className="hover:text-foreground transition-colors">
            Privacy Policy
          </Link>
          <span aria-hidden="true">·</span>
          <Link href="/terms" className="hover:text-foreground transition-colors">
            Terms of Service
          </Link>
        </p>
      </footer>
    </div>
  );
}
