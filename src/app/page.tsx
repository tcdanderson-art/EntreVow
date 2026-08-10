import Link from "next/link";

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
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-full bg-cream">
      <header className="flex items-center justify-between px-6 sm:px-10 py-6 max-w-6xl mx-auto w-full">
        <span className="font-display text-xl tracking-tight text-foreground">Entrevow</span>
        <nav className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="text-sm font-medium bg-brand text-white px-4 py-2 rounded-md hover:bg-brand-hover transition-colors"
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
            Get Early Access
          </Link>
        </section>

        <section className="grid sm:grid-cols-3 gap-6 px-6 sm:px-10 py-14 max-w-6xl mx-auto">
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

        <section className="border-t border-border-warm bg-cream-card py-16 px-6 text-center">
          <h2 className="font-display text-2xl mb-4">Your wedding party, connected.</h2>
          <blockquote className="max-w-xl mx-auto italic text-foreground/70 text-lg leading-relaxed">
            &ldquo;Our guests raved about the live shuttle updates. It saved us so much stress
            and kept everything running on time!&rdquo;
            <footer className="mt-3 not-italic font-semibold text-foreground text-base">
              — Sarah &amp; Mike
            </footer>
          </blockquote>
        </section>
      </main>

      <footer className="text-center text-sm text-foreground/50 py-8 border-t border-border-warm">
        Entrevow — from &ldquo;I do&rdquo; to the last dance.
      </footer>
    </div>
  );
}
