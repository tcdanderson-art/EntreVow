import Link from "next/link";

export const metadata = { title: "Getting Started Guide — Entrevow" };

const SECTIONS = [
  { id: "what-is-entrevow", label: "What Entrevow is" },
  { id: "getting-started", label: "Getting started" },
  { id: "choosing-a-plan", label: "Choosing a plan" },
  { id: "dashboard-tour", label: "Your dashboard, section by section" },
  { id: "itinerary", label: "Building your itinerary" },
  { id: "guest-list", label: "Building your guest list" },
  { id: "sending-links", label: "Sending guests their links" },
  { id: "seating-chart", label: "Seating chart" },
  { id: "photos-guestbook", label: "Photos & the video guestbook" },
  { id: "announcements-weather", label: "Announcements & weather alerts" },
  { id: "crew-tools", label: "Day-of crew tools (Full Day-Of)" },
  { id: "delegating", label: "Delegating: moderator & gallery links" },
  { id: "guest-view", label: "What your guests actually see" },
  { id: "account-data", label: "Your account & data" },
  { id: "billing", label: "Billing, upgrading & refunds" },
  { id: "troubleshooting", label: "Troubleshooting" },
];

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="flex flex-col gap-3 scroll-mt-6">
      <h2 className="font-display text-xl text-brand">{title}</h2>
      <div className="text-foreground/80 text-sm leading-relaxed flex flex-col gap-3">
        {children}
      </div>
    </section>
  );
}

function Steps({ items }: { items: React.ReactNode[] }) {
  return (
    <ol className="list-decimal list-outside pl-5 flex flex-col gap-1.5">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ol>
  );
}

export default function GuidePage() {
  return (
    <div className="flex-1 bg-cream px-6 py-12">
      <div className="max-w-2xl mx-auto bg-white border border-border-warm rounded-xl p-8 sm:p-10 flex flex-col gap-10">
        <div>
          <h1 className="font-display text-3xl mb-2">Getting Started Guide</h1>
          <p className="text-foreground/80 text-sm">
            Everything you can do in Entrevow, explained step by step — from creating your
            account to running the day itself. Bookmark this page; it&apos;s always here from the{" "}
            <span className="font-medium">Guide</span> link at the top of your dashboard whenever
            you have a question. For quick answers, the{" "}
            <Link href="/faq" className="text-brand hover:underline">
              FAQ
            </Link>{" "}
            is faster.
          </p>
        </div>

        <nav className="border border-border-warm rounded-lg p-4 bg-cream/60">
          <p className="text-xs font-medium text-foreground/60 uppercase tracking-wide mb-2">
            Contents
          </p>
          <ul className="grid sm:grid-cols-2 gap-x-4 gap-y-1 text-sm">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="text-brand hover:underline">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <Section id="what-is-entrevow" title="What Entrevow is">
          <p>
            Entrevow is a live, link-based hub for your wedding day. You build an itinerary and
            guest list on your dashboard; each guest gets a personal link (no app download, no
            account, no password) where they can see the schedule, RSVP, find their table, share
            photos, and leave video or voice messages. On the day itself, optional tools let you
            track shuttles live, check guests in at the door with a QR scan, and know when
            vendors have arrived.
          </p>
          <p>
            You can build everything for free. Guests can&apos;t access their links until you pay
            for a plan (see below) — so there&apos;s no risk in setting things up early and
            deciding later.
          </p>
        </Section>

        <Section id="getting-started" title="Getting started">
          <Steps
            items={[
              <>
                <span className="font-medium">Sign up.</span> Entrevow is currently invite-only
                during beta — you&apos;ll need an invite link from us. On the signup page, enter
                your names as you&apos;d like them to appear (e.g. &quot;Alex &amp;
                Priya&quot;), your email, and a password (8+ characters).
              </>,
              <>
                <span className="font-medium">Create your wedding.</span> From your dashboard,
                fill in the &quot;Create a wedding&quot; form: a title (required), your wedding
                date (optional, but needed for weather forecasts and the runsheet generator), and
                an emergency/day-of phone number (optional — shown to guests on their page). Click{" "}
                <span className="font-medium">Create wedding</span>.
              </>,
              <>
                <span className="font-medium">You&apos;re in.</span> You land in your wedding&apos;s
                workspace, where everything else in this guide happens. You can build your
                itinerary, guest list, and seating chart for free — guest links only go live once
                you pay.
              </>,
              <>
                One couple account can hold <span className="font-medium">more than one wedding</span>{" "}
                — just repeat the create-wedding step from your dashboard.
              </>,
            ]}
          />
        </Section>

        <Section id="choosing-a-plan" title="Choosing a plan">
          <p>
            Both plans are a <span className="font-medium">one-time payment</span>, not a
            subscription — you pay once and it covers your wedding.
          </p>
          <div className="overflow-x-auto -mx-1 px-1">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-border-warm text-left">
                  <th className="py-2 pr-3 font-medium text-foreground">Feature</th>
                  <th className="py-2 pr-3 font-medium text-foreground">Essentials — $69 AUD</th>
                  <th className="py-2 font-medium text-foreground">Full Day-Of — $249 AUD</th>
                </tr>
              </thead>
              <tbody className="[&_tr]:border-b [&_tr]:border-border-warm/60">
                {[
                  ["Itinerary with guest-group targeting", true, true],
                  ["RSVP, plus-ones, meal choices, kids' meals", true, true],
                  ["Digital guest pass", true, true],
                  ["Video & voice guestbook", true, true],
                  ["Welcome video", true, true],
                  ["Photo gallery + TV kiosk display", true, true],
                  ["Guest cap", "150 guests", "Unlimited"],
                  ["Live shuttle tracking", false, true],
                  ["Weather forecast + contingency alerts", false, true],
                  ["QR door check-in for ushers", false, true],
                  ["Vendor arrival check-in", false, true],
                  ["Crew broadcast messages", false, true],
                  ["Guest push notifications", false, true],
                  ["Personalised link (yournames.entrevow.com)", false, true],
                ].map(([label, ess, full]) => (
                  <tr key={label as string}>
                    <td className="py-1.5 pr-3">{label}</td>
                    <td className="py-1.5 pr-3">
                      {typeof ess === "string" ? ess : ess ? "✓" : "—"}
                    </td>
                    <td className="py-1.5">{typeof full === "string" ? full : full ? "✓" : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            Pay from the <span className="font-medium">Billing</span> card on your wedding&apos;s
            dashboard. Started on Essentials and want more later? Upgrading to Full Day-Of only
            charges you the difference, not the full $249 again.
          </p>
        </Section>

        <Section id="dashboard-tour" title="Your dashboard, section by section">
          <p>Open a wedding from your dashboard to reach its workspace. Top to bottom:</p>
          <ul className="list-disc list-outside pl-5 flex flex-col gap-1">
            <li>
              <span className="font-medium">Wedding details</span> — title, date, emergency
              phone, venue town/suburb (for weather), meal-choice options, and (Full Day-Of) your
              custom link.
            </li>
            <li>
              <span className="font-medium">Summary tiles</span> — live RSVP, check-in, and
              shuttle counts.
            </li>
            <li>
              <span className="font-medium">Billing</span> — your plan, upgrade button, payment.
            </li>
            <li>
              <span className="font-medium">Export data</span> — one-click JSON download of
              everything.
            </li>
            <li>
              <span className="font-medium">Beta feedback</span> — tell us what&apos;s working or
              not.
            </li>
            <li>
              <span className="font-medium">Weather</span> (Full Day-Of) — forecast and
              contingency suggestions.
            </li>
            <li>
              <span className="font-medium">Announcements</span> — post updates to some or all
              guests.
            </li>
            <li>
              <span className="font-medium">Guests</span> — your full guest list and RSVP data.
            </li>
            <li>
              <span className="font-medium">Seating chart</span> — drag guests into tables.
            </li>
            <li>
              <span className="font-medium">Door check-in</span> (Full Day-Of) — QR check-in link
              for ushers.
            </li>
            <li>
              <span className="font-medium">Shuttle tracking</span> (Full Day-Of) — live driver
              locations.
            </li>
            <li>
              <span className="font-medium">Vendor check-in</span> (Full Day-Of) — arrival
              tracking.
            </li>
            <li>
              <span className="font-medium">Crew updates</span> (Full Day-Of) — messages to
              ushers/drivers/vendors.
            </li>
            <li>
              <span className="font-medium">Photos</span> — guest-uploaded gallery + TV kiosk
              link.
            </li>
            <li>
              <span className="font-medium">Videos</span> — welcome video + guestbook moderation
              + delegate link.
            </li>
            <li>
              <span className="font-medium">Itinerary</span> — your schedule, with a draft-runsheet
              generator.
            </li>
          </ul>
          <p>
            Sections with a small <span className="font-medium">?</span> button (Door check-in,
            Shuttle tracking, Vendor check-in, Photos, Videos) have their own built-in walkthrough
            — click it any time you want the short version of that section&apos;s steps.
          </p>
        </Section>

        <Section id="itinerary" title="Building your itinerary">
          <p className="font-medium text-foreground">Fastest way — generate a draft:</p>
          <Steps
            items={[
              <>
                Click <span className="font-medium">&quot;+ Generate a draft runsheet.&quot;</span>
              </>,
              "Enter your ceremony start time and venue (pre-filled if you've already set one).",
              "Toggle on if your reception is at the same venue — otherwise enter the reception venue separately.",
              "Set cocktail-hour length and reception length, and tick which of Speeches / Cake cutting / First dance you want included.",
              "Review the generated draft — remove anything you don't need — then confirm to add it all at once. Nothing is saved until you confirm.",
            ]}
          />
          <p className="font-medium text-foreground">Adding or editing items by hand:</p>
          <Steps
            items={[
              "Use Add item (or edit an existing one) to set a title, start date/time, and location — location gets guests a \"Get directions\" link automatically.",
              "Optionally add transport info (e.g. \"shuttle departs 30 min prior\").",
              "Tick which guest groups should see this item. Leave all ticked if everyone should see it.",
            ]}
          />
          <p className="font-medium text-foreground">Running late on the day:</p>
          <p>
            Click <span className="font-medium">&quot;Running late?&quot;</span> on the item
            that&apos;s slipped, enter how many minutes, and every later item on the schedule
            shifts automatically. Full Day-Of guests who&apos;ve opted into push notifications are
            notified.
          </p>
        </Section>

        <Section id="guest-list" title="Building your guest list">
          <p className="font-medium text-foreground">Add guests one at a time:</p>
          <Steps
            items={[
              "Fill in name (required), group (any text you like — e.g. \"bridal_party\", \"vip\", \"general\"; groups are what announcements and itinerary items target), email (optional, needed to send an invite by email), and tick \"Allow a plus-one\" if applicable.",
              <>
                Click <span className="font-medium">Add guest</span>.
              </>,
            ]}
          />
          <p className="font-medium text-foreground">Import a list you already have:</p>
          <Steps
            items={[
              <>
                Click <span className="font-medium">Import guests from CSV</span>.
              </>,
              "Your file needs name, group, email columns (a header row is fine, and optional).",
              "On Essentials you're capped at 150 guests total; Full Day-Of is unlimited.",
            ]}
          />
          <p>
            <span className="font-medium">Editing a guest:</span> click Edit on their row to
            change name, group, RSVP status, table, email, plus-one permission, meal choice, or
            song request.
          </p>
          <p>
            <span className="font-medium">Exporting:</span>{" "}
            <span className="font-medium">Export guest list (CSV)</span> downloads everything,
            including RSVP status, meal choice, song requests, flight info, and kids&apos; meal
            counts.
          </p>
        </Section>

        <Section id="sending-links" title="Sending guests their links">
          <p>
            Each guest has their own private link — never share one guest&apos;s link with
            another guest.
          </p>
          <ul className="list-disc list-outside pl-5 flex flex-col gap-1">
            <li>
              <span className="font-medium">One at a time:</span> click Send invite (or Resend) on
              a guest&apos;s row to email it to them, or Copy link to send it yourself another way
              (text, WhatsApp, etc.).
            </li>
            <li>
              <span className="font-medium">In bulk:</span> click &quot;Email invites to N
              guests&quot; to send to everyone with an email address who hasn&apos;t been sent one
              yet — you&apos;ll get a summary of how many went out.
            </li>
            <li>
              On Full Day-Of with a custom subdomain set, links automatically use your branded
              address instead of the default one.
            </li>
          </ul>
        </Section>

        <Section id="seating-chart" title="Seating chart">
          <Steps
            items={[
              "Click Add table, give it a name and (optionally) a seat capacity.",
              "Drag guests from \"Unassigned\" onto a table. Guests with an approved plus-one count as 2 seats. On a touchscreen where drag-and-drop doesn't work well, use the dropdown next to each guest's name instead.",
              "Tables over capacity are highlighted in red so you can spot the problem at a glance.",
              "Declined guests are automatically excluded from seating.",
              "Deleting a table unassigns its guests — it doesn't delete them from your list.",
            ]}
          />
        </Section>

        <Section id="photos-guestbook" title="Photos & the video guestbook">
          <p className="font-medium text-foreground">Photos:</p>
          <ul className="list-disc list-outside pl-5 flex flex-col gap-1">
            <li>Guests add photos from their own page; they show up in your Photos grid automatically.</li>
            <li>
              Per photo: Download, Hide/Unhide (hidden photos disappear from the guest-facing
              gallery and TV kiosk but aren&apos;t deleted), or Remove.
            </li>
            <li>&quot;Download all photos&quot; zips the whole collection (splitting into multiple parts automatically if it&apos;s large).</li>
            <li>
              <span className="font-medium">TV / kiosk display:</span> generate a gallery link and
              open it on a laptop or smart TV at your venue — it auto-advances through approved
              photos as a slideshow. No login needed on that device.
            </li>
          </ul>
          <p className="font-medium text-foreground">Video & voice guestbook:</p>
          <Steps
            items={[
              "Upload a welcome video (MP4/WebM, under 60MB and 30 seconds) — it plays at the top of every guest's page. Replace or remove any time.",
              "Guests record a video or voice message from their own page. It lands in your \"Awaiting approval\" queue — nothing guests record is visible to others until you act on it.",
              "Approve, Reject, or Download each submission. Approved ones move to a second grid where you can Download all as zip or Remove individually.",
            ]}
          />
        </Section>

        <Section id="announcements-weather" title="Announcements & weather alerts">
          <p className="font-medium text-foreground">Announcements:</p>
          <Steps
            items={[
              "Write your update, optionally attach a short video (MP4/WebM, ≤60MB).",
              "Tick which guest groups should see it.",
              "Post — it appears on those guests' pages within about 20 seconds, and (Full Day-Of, if they've opted in) triggers a push notification.",
              "Remove any announcement from the list at any time.",
            ]}
          />
          <p className="font-medium text-foreground">Weather (Full Day-Of only):</p>
          <p>
            Once you&apos;ve set a venue town/suburb and a wedding date within the next 16 days,
            the Weather card shows a forecast automatically. If conditions look risky — 50%+ rain
            chance, 35°C+ heat, or 5°C or below — Entrevow suggests a contingency message and
            gives you a &quot;Post as announcement to guests&quot; button to send it with one
            click.
          </p>
        </Section>

        <Section id="crew-tools" title="Day-of crew tools (Full Day-Of only)">
          <p>
            These generate links for people helping you run the day — not for guests. Share each
            link only with the person doing that job.
          </p>
          <p className="font-medium text-foreground">Door check-in (ushers):</p>
          <Steps
            items={[
              "In \"Door check-in,\" click Generate check-in link and send it to whoever's on the door.",
              "They open it on their phone — no login. They can either scan a guest's QR pass (shown on the guest's own page under \"Show my digital pass\") with their camera, or search the guest list by name and check in manually.",
              "Regenerate the link any time to invalidate the old one (e.g. if it was shared with the wrong person).",
            ]}
          />
          <p className="font-medium text-foreground">Shuttle tracking:</p>
          <Steps
            items={[
              "In \"Shuttle tracking,\" click Add a shuttle, name it (e.g. \"Airport Shuttle 1\") and optionally set a pickup time. This creates a driver link.",
              "Send the driver link to that driver. They open it, tap Start sharing location, and their phone's GPS updates the map roughly every 10 seconds while it's on.",
              "Guests near their arrival time see a live map with a suggested shuttle based on their flight info.",
            ]}
          />
          <p className="font-medium text-foreground">Vendor check-in:</p>
          <Steps
            items={[
              "Add each vendor by name and category (e.g. \"Garden Room Catering\" / \"Caterer\").",
              "Send them their link — a single \"I've arrived\" button they tap on arrival, which updates your dashboard.",
            ]}
          />
          <p className="font-medium text-foreground">Crew updates:</p>
          <p>
            A separate message channel from guest announcements — post a note targeted at Ushers,
            Drivers, and/or Vendors (any combination) and it shows at the top of their respective
            pages.
          </p>
        </Section>

        <Section id="delegating" title="Delegating: moderator & gallery links">
          <p>Available on both plans:</p>
          <ul className="list-disc list-outside pl-5 flex flex-col gap-1">
            <li>
              <span className="font-medium">Moderator link</span> — generate this from the Videos
              section and hand it to a trusted friend or family member. It gives them the same
              approve/reject/hide controls you have for the video guestbook and photos, without
              giving them your account login. Regenerate or Revoke it any time.
            </li>
            <li>
              <span className="font-medium">Gallery (kiosk) link</span> — the same TV-slideshow
              link described above, safe to leave open on a shared or public screen since it only
              shows approved content.
            </li>
          </ul>
        </Section>

        <Section id="guest-view" title="What your guests actually see">
          <p>
            Understanding the guest side helps you set things up well. When a guest opens their
            personal link, they see (no login required):
          </p>
          <ul className="list-disc list-outside pl-5 flex flex-col gap-1">
            <li>A header with their name, group, and table (once seating is finalised).</li>
            <li>
              A &quot;what&apos;s next&quot; summary: the next itinerary item, and on Full
              Day-Of, a suggested shuttle and today&apos;s weather.
            </li>
            <li>Your welcome video, if you&apos;ve added one.</li>
            <li>Their digital pass (a QR code) — this is what ushers scan at the door.</li>
            <li>Announcements visible to their group.</li>
            <li>
              <span className="font-medium">RSVP:</span> &quot;I&apos;ll be there&quot; /
              &quot;Can&apos;t make it,&quot; plus (if enabled for them) a plus-one name, meal
              choice, kids&apos; meals needed, song request, flight details, and a note to you.
              They can change their response later.
            </li>
            <li>
              On Full Day-Of, an option to turn on push notifications (iOS guests need to
              &quot;Add to Home Screen&quot; first — the page explains this).
            </li>
            <li>
              Their itinerary, with an &quot;Add to calendar&quot; button that downloads an .ics
              file.
            </li>
            <li>A way to add photos and record a video or voice message.</li>
            <li>On Full Day-Of, a live shuttle map if relevant to them.</li>
            <li>Your emergency phone number, if you set one.</li>
            <li>A Refresh link if their page seems out of date (clears cached data).</li>
          </ul>
        </Section>

        <Section id="account-data" title="Your account & data">
          <ul className="list-disc list-outside pl-5 flex flex-col gap-1">
            <li>
              <span className="font-medium">Account settings</span> (top nav → Account): update
              your display name/email, or change your password.
            </li>
            <li>
              <span className="font-medium">Forgot your password?</span> Use the link on the login
              page — you&apos;ll get a reset link by email if the account exists.
            </li>
            <li>
              <span className="font-medium">Export everything:</span> the Export data button on
              your wedding&apos;s dashboard downloads a complete JSON file of your itinerary,
              guest list, RSVPs, and more — available on any plan, any time.
            </li>
            <li>
              <span className="font-medium">Deleting a wedding:</span> Delete wedding removes it
              and everything attached to it (guests, itinerary, etc.) after a confirmation
              prompt. This can&apos;t be undone.
            </li>
          </ul>
        </Section>

        <Section id="billing" title="Billing, upgrading & refunds">
          <ul className="list-disc list-outside pl-5 flex flex-col gap-1">
            <li>
              Both plans are a one-time payment through Stripe — pay from the Billing card on your
              dashboard.
            </li>
            <li>
              <span className="font-medium">Upgrading</span> Essentials → Full Day-Of charges only
              the price difference. There&apos;s no self-serve way to downgrade Full Day-Of back
              to Essentials.
            </li>
            <li>
              <span className="font-medium">Refunds:</span> available within 7 days of payment,
              provided no guest has RSVP&apos;d yet. After that, refunds are at our discretion.
              This is in addition to your rights under the Australian Consumer Law. Contact{" "}
              <a href="mailto:hello@entrevow.com" className="text-brand hover:underline">
                hello@entrevow.com
              </a>{" "}
              for anything billing-related.
            </li>
          </ul>
        </Section>

        <Section id="troubleshooting" title="Troubleshooting">
          <ul className="list-disc list-outside pl-5 flex flex-col gap-1">
            <li>
              <span className="font-medium">A guest says their page looks out of date</span> —
              have them tap the Refresh link near the bottom of their page.
            </li>
            <li>
              <span className="font-medium">A guest lost their link</span> — find them in your
              Guests list and click Copy link (or Resend if they have an email on file).
            </li>
            <li>
              <span className="font-medium">The weather card isn&apos;t showing anything</span> —
              it needs a venue town/suburb, a wedding date within 16 days, and the Full Day-Of
              plan.
            </li>
            <li>
              <span className="font-medium">
                Push notifications aren&apos;t working for an iPhone guest
              </span>{" "}
              — iOS requires the guest to add the page to their home screen first before push
              permission can be granted; this is explained inline on their page.
            </li>
            <li>
              <span className="font-medium">Seating chart drag-and-drop isn&apos;t working</span>{" "}
              — this is expected on touchscreens (iOS Safari doesn&apos;t support native
              drag-and-drop); use the per-guest dropdown instead.
            </li>
            <li>
              Still stuck? Check the{" "}
              <Link href="/faq" className="text-brand hover:underline">
                FAQ
              </Link>{" "}
              or email{" "}
              <a href="mailto:hello@entrevow.com" className="text-brand hover:underline">
                hello@entrevow.com
              </a>
              .
            </li>
          </ul>
        </Section>

        <Link href="/dashboard" className="text-sm text-brand hover:underline">
          ← Back to dashboard
        </Link>
      </div>
    </div>
  );
}
