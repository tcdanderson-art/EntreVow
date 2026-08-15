import Link from "next/link";

export const metadata = { title: "FAQ — Entrevow" };

const GUEST_FAQS = [
  {
    q: "Do I need to create an account?",
    a: "No. Your itinerary link is personal to you — just open it and everything you need is right there. No sign-up, no password.",
  },
  {
    q: "How do I RSVP?",
    a: "Open your link and use the RSVP card near the top. You can confirm or decline, pick a meal if the couple has set up meal options, add a plus-one if they've allowed it, and leave a song request.",
  },
  {
    q: "Can I bring a plus-one?",
    a: "Only if the couple has enabled it for your invite — if you don't see a plus-one option when you RSVP, it means they haven't. Reach out to the couple directly if you need to double-check.",
  },
  {
    q: "Where do I find my table?",
    a: "If the couple has finalised seating, your table shows right at the top of your itinerary, next to your name. If it's not there yet, seating just hasn't been assigned — check back closer to the day.",
  },
  {
    q: "How do I track the shuttle?",
    a: "If the couple's added shuttle tracking, you'll see a live map on your itinerary page showing exactly where it is. This is only available on some weddings, depending on what the couple has set up.",
  },
  {
    q: "Will I be notified if something changes?",
    a: "If the couple's wedding includes notifications, you'll see a \"turn on notifications\" prompt on your itinerary page. On iPhone, add the page to your home screen first (Share → Add to Home Screen), then enable notifications from there — iOS requires that step before it'll allow push alerts.",
  },
  {
    q: "Can I upload photos or a video/voice message?",
    a: "If the couple's enabled it, you'll see a photo gallery and a guestbook on your itinerary page where you can record a video or a voice-only message. Video and voice messages are reviewed by the couple (or someone they've delegated) before other guests can see them — photos appear right away.",
  },
  {
    q: "My page looks out of date after the couple made a change — what do I do?",
    a: "Scroll to the very bottom of your itinerary and tap \"Not seeing the latest updates? Refresh.\" That clears out anything cached on your device and reloads the newest version.",
  },
  {
    q: "I lost my link — what do I do?",
    a: "Reach out to the couple directly — they can resend it to you from their dashboard in a couple of taps.",
  },
];

const COUPLE_FAQS = [
  {
    q: "How do I get started?",
    a: "Create a free account and build out your itinerary and guest list — that part costs nothing. You only pay once you're ready to actually send guests their links.",
  },
  {
    q: "What's the difference between Essentials and Full Day-Of?",
    a: "Essentials ($69 AUD, one-time, up to 150 guests) covers your itinerary, RSVPs, guest groups, the digital pass, video & voice guestbook, welcome video, and a photo gallery you can cast to a TV or laptop as a live kiosk slideshow at the venue. Full Day-Of ($249 AUD, one-time, unlimited guests) adds live shuttle tracking, weather alerts, QR usher check-in, vendor check-in, crew broadcasts, the day-of command card, and push notifications.",
  },
  {
    q: "Can I upgrade from Essentials to Full Day-Of later?",
    a: "Yes — from your dashboard's billing section. You'll only be charged the difference between the two tiers, not the full Full Day-Of price again.",
  },
  {
    q: "How do guests get their link?",
    a: "Send it directly from your dashboard (one at a time or in bulk) — Entrevow emails each guest their personal link. You can also copy a guest's link yourself and share it however you'd like.",
  },
  {
    q: "How does guest grouping work?",
    a: "Each guest belongs to a group (like \"bridal party\" or \"general\") that you set when adding them. When you create an itinerary item or announcement, you choose which groups can see it — so your bridal party can see the rehearsal call time while general guests only see the ceremony and reception.",
  },
  {
    q: "Can someone else handle video guestbook approvals or door check-in for me?",
    a: "Yes. Generate a moderator link from your dashboard's Videos section to let someone else approve or reject guestbook submissions, and a staff link to let ushers scan guest passes at the door — neither requires them to log in or create an account.",
  },
  {
    q: "Can I track when my caterer, photographer, or other vendors arrive?",
    a: "Yes, on Full Day-Of. Add each vendor — caterer, photographer, florist, band, anyone you want to confirm arrived — with a name and category, and Entrevow gives you a link to send them. They open it and tap \"I've arrived\" when they're on site, no app or account needed, and you'll see it on your dashboard instantly.",
  },
  {
    q: "Is my data backed up, or can I get it out if I want to?",
    a: "You can export your full wedding data as a JSON file any time from your dashboard — useful as a personal backup or if you just want a copy for yourself.",
  },
  {
    q: "How do refunds work?",
    a: "Refunds are available within 7 days of purchase, provided no guest has RSVP'd yet. After that they're discretionary. See our Terms of Service for the full policy.",
  },
  {
    q: "Who do I contact if I need help?",
    a: (
      <>
        Email us any time at{" "}
        <a href="mailto:hello@entrevow.com" className="text-brand hover:underline">
          hello@entrevow.com
        </a>
        .
      </>
    ),
  },
];

function FaqSection({
  title,
  items,
}: {
  title: string;
  items: { q: string; a: React.ReactNode }[];
}) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="font-display text-xl text-brand mb-1">{title}</h2>
      <div className="flex flex-col divide-y divide-border-warm border-t border-b border-border-warm">
        {items.map((item) => (
          <details key={item.q} className="group py-3">
            <summary className="flex items-center justify-between gap-4 cursor-pointer list-none font-medium text-foreground">
              {item.q}
              <span className="shrink-0 text-foreground/70 transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="text-foreground/70 leading-relaxed text-sm mt-2 pr-8">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

export default function FaqPage() {
  return (
    <div className="flex-1 bg-cream px-6 py-12">
      <div className="max-w-2xl mx-auto bg-white border border-border-warm rounded-xl p-8 sm:p-10 flex flex-col gap-8">
        <div>
          <h1 className="font-display text-3xl mb-2">Frequently Asked Questions</h1>
          <p className="text-foreground/80 text-sm">
            Answers for guests using their itinerary link, and for couples setting up a wedding.
            Can&apos;t find what you need?{" "}
            <a href="mailto:hello@entrevow.com" className="text-brand hover:underline">
              Email us
            </a>
            .
          </p>
        </div>

        <FaqSection title="For guests" items={GUEST_FAQS} />
        <FaqSection title="For couples" items={COUPLE_FAQS} />

        <Link href="/" className="text-sm text-brand hover:underline">
          ← Back to Entrevow
        </Link>
      </div>
    </div>
  );
}
