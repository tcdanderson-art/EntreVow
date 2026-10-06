import Link from "next/link";
import DemoPhone from "@/components/DemoPhone";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "See a guest page — Entrevow",
  description:
    "Try a sample Entrevow guest page: itinerary, RSVP, live shuttle tracking and video guestbook, on one personal link with no app to install.",
  path: "/demo",
});

export default function DemoPage() {
  return (
    <main className="flex-1 bg-cream px-6 py-12">
      <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        <div className="flex flex-col gap-5 text-center lg:text-left">
          <p className="text-xs font-medium tracking-[0.2em] uppercase text-brand">
            Sample guest page
          </p>
          <h1 className="font-display text-3xl sm:text-4xl text-foreground leading-tight">
            This is what every guest gets
          </h1>
          <p className="text-foreground/80 leading-relaxed">
            One personal link, opened from a text or a QR code. No app to install and no login. Tap
            through the tabs to see the itinerary, an RSVP, the shuttle tracker and the video
            guestbook.
          </p>
          <p className="text-sm text-foreground/80">
            This is a demonstration with made-up names and times. Nothing you tap here is saved.
          </p>
          <div className="flex flex-wrap justify-center lg:justify-start gap-3">
            <Link
              href="/signup"
              className="bg-brand text-white px-6 py-3 rounded-md font-medium hover:bg-brand-hover transition-colors"
            >
              Start building free
            </Link>
            <Link
              href="/guide"
              className="px-6 py-3 rounded-md font-medium border border-border-warm bg-white hover:bg-cream-card transition-colors"
            >
              Read the guide
            </Link>
          </div>
        </div>
        <DemoPhone interactive />
      </div>
    </main>
  );
}
