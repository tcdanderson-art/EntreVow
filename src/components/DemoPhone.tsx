"use client";

import { useState } from "react";

// Static, read-only replica of the guest page using made-up sample data. It
// makes no network calls, so a public visitor can't write anything to a real
// wedding. Layout mirrors src/app/g/[code]/page.tsx.

const ITINERARY = [
  { time: "2:15 PM", title: "Guests arrive and are seated", place: "Garden Terrace" },
  { time: "3:00 PM", title: "Ceremony", place: "Garden Terrace" },
  { time: "4:00 PM", title: "Canapés and drinks", place: "Lawn" },
  { time: "6:00 PM", title: "Reception dinner", place: "Main Marquee" },
  { time: "9:30 PM", title: "Shuttles depart", place: "Front gate" },
];

const TABS = ["Today", "RSVP", "Shuttle", "Guestbook"] as const;
type Tab = (typeof TABS)[number];

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-foreground/80">{label}: </span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

function TodayTab() {
  return (
    <>
      <div className="flex flex-col gap-2 mx-5 mt-4 p-3 bg-brand/10 border border-brand/30 rounded-lg text-sm">
        <Row label="Next up" value="Ceremony at 3:00 PM" />
        <Row label="Your shuttle" value="Shuttle A, arriving in 6 min" />
        <Row label="Weather" value="Sunny, 24°C" />
      </div>
      <div className="px-5 py-3">
        <div className="text-xs font-semibold uppercase tracking-wide text-foreground/80 mb-3">
          Itinerary
        </div>
        <ol className="flex flex-col gap-3">
          {ITINERARY.map((item) => (
            <li key={item.title} className="flex gap-3">
              <span className="w-16 shrink-0 text-xs font-semibold text-brand pt-0.5">
                {item.time}
              </span>
              <span className="text-sm">
                <span className="block font-medium">{item.title}</span>
                <span className="block text-xs text-foreground/80">{item.place}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>
    </>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border-warm bg-cream-card px-3 py-2">
      <div className="text-xs text-foreground/80">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}

function RsvpTab() {
  return (
    <div className="px-5 py-4 flex flex-col gap-3 text-sm">
      <div className="text-xs font-semibold uppercase tracking-wide text-foreground/80">
        Your RSVP
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-md bg-brand text-white text-center py-2 font-medium">Attending</div>
        <div className="rounded-md border border-border-warm text-center py-2 text-foreground/80">
          Can&apos;t make it
        </div>
      </div>
      <Field label="Meal choice" value="Slow-roasted lamb" />
      <Field label="Song request" value="September, Earth Wind & Fire" />
      <Field label="Dietary note" value="No shellfish" />
    </div>
  );
}

function ShuttleTab() {
  return (
    <div className="px-5 py-4 flex flex-col gap-3 text-sm">
      <div className="text-xs font-semibold uppercase tracking-wide text-foreground/80">
        Shuttle tracker
      </div>
      <div
        className="relative h-36 rounded-lg border border-border-warm bg-cream-card overflow-hidden"
        role="img"
        aria-label="Sample map showing a shuttle approaching the pickup point"
      >
        <svg viewBox="0 0 300 144" className="absolute inset-0 h-full w-full" aria-hidden="true">
          <path d="M-10 110 C 60 90, 100 40, 170 60 S 260 70, 320 20" fill="none" stroke="#e3decb" strokeWidth="14" strokeLinecap="round" />
          <path d="M-10 110 C 60 90, 100 40, 170 60 S 260 70, 320 20" fill="none" stroke="#935f42" strokeWidth="2" strokeDasharray="5 5" />
          <circle cx="250" cy="55" r="7" fill="#2c3a46" />
          <circle cx="92" cy="62" r="15" fill="#935f42" opacity="0.2" />
          <circle cx="92" cy="62" r="9" fill="#935f42" />
        </svg>
        <span className="absolute left-2 bottom-2 rounded bg-white/90 px-2 py-0.5 text-[10px] font-medium">
          Pickup point
        </span>
        <span className="absolute right-2 top-2 rounded bg-white/90 px-2 py-0.5 text-[10px] font-medium">
          Shuttle A
        </span>
      </div>
      <div className="rounded-md bg-brand/10 border border-brand/30 px-3 py-2">
        <span className="font-semibold">Arriving in 6 minutes.</span>{" "}
        <span className="text-foreground/80">
          Matched to your 1:40 PM flight, so you won&apos;t wait at the gate.
        </span>
      </div>
    </div>
  );
}

function GuestbookTab() {
  return (
    <div className="px-5 py-4 flex flex-col gap-3 text-sm">
      <div className="text-xs font-semibold uppercase tracking-wide text-foreground/80">
        Guestbook
      </div>
      {[
        { who: "Mei L.", kind: "Voice message", len: "0:24" },
        { who: "Daniel O.", kind: "Video message", len: "0:30" },
      ].map((m) => (
        <div
          key={m.who}
          className="flex items-center gap-3 rounded-md border border-border-warm bg-cream-card px-3 py-2"
        >
          <span
            aria-hidden="true"
            className="h-8 w-8 rounded-full bg-brand text-white flex items-center justify-center text-xs"
          >
            ▶
          </span>
          <span className="flex-1">
            <span className="block font-medium">{m.who}</span>
            <span className="block text-xs text-foreground/80">{m.kind}</span>
          </span>
          <span className="text-xs text-foreground/80">{m.len}</span>
        </div>
      ))}
      <div className="rounded-md border border-dashed border-brand/50 text-center py-3 text-brand font-medium">
        Record a 30-second message
      </div>
      <p className="text-xs text-foreground/80">Messages go live after the couple approves them.</p>
    </div>
  );
}

export default function DemoPhone({ interactive = false }: { interactive?: boolean }) {
  const [tab, setTab] = useState<Tab>("Today");

  return (
    <figure className="mx-auto w-full max-w-[19rem]">
      <div className="rounded-[2.25rem] border-[10px] border-foreground bg-foreground shadow-2xl shadow-foreground/20">
        <div className="rounded-[1.6rem] bg-white overflow-hidden min-h-[34rem] flex flex-col">
          <div className="text-center px-6 py-4 border-b border-border-warm">
            <div className="font-display text-lg leading-tight">Alex &amp; Priya&apos;s Wedding</div>
            <div className="text-[10px] uppercase tracking-wide text-foreground/80 mt-1">
              Sample wedding
            </div>
          </div>
          <div className="flex items-center gap-3 mx-5 mt-4 p-3 bg-cream border border-border-warm rounded-lg">
            <div className="w-9 h-9 rounded-full bg-border-warm flex items-center justify-center font-semibold text-sm">
              SJ
            </div>
            <div className="flex-1">
              <div className="font-semibold text-sm">Sarah Jenkins</div>
              <div className="text-xs text-foreground/80">Family guest</div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-[10px] uppercase tracking-wide text-foreground/80">Seated at</div>
              <div className="text-sm font-semibold text-brand">Table 4</div>
            </div>
          </div>

          {interactive ? (
            <>
              <div
                role="tablist"
                aria-label="Sample guest page sections"
                className="flex gap-1 mx-5 mt-3 text-xs"
              >
                {TABS.map((t) => (
                  <button
                    key={t}
                    role="tab"
                    type="button"
                    aria-selected={tab === t}
                    onClick={() => setTab(t)}
                    className={`flex-1 rounded-md py-1.5 font-medium transition-colors ${
                      tab === t ? "bg-brand text-white" : "text-foreground/80 hover:bg-cream"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <div role="tabpanel">
                {tab === "Today" && <TodayTab />}
                {tab === "RSVP" && <RsvpTab />}
                {tab === "Shuttle" && <ShuttleTab />}
                {tab === "Guestbook" && <GuestbookTab />}
              </div>
            </>
          ) : (
            <TodayTab />
          )}
        </div>
      </div>
      <figcaption className="mt-3 text-center text-xs text-foreground/80">
        A sample guest page. Names and times are made up.
      </figcaption>
    </figure>
  );
}
