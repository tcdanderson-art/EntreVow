import Link from "next/link";

export const metadata = { title: "Privacy Policy — Entrevow" };

export default function PrivacyPage() {
  return (
    <div className="flex-1 bg-cream px-6 py-12">
      <div className="max-w-2xl mx-auto bg-white border border-border-warm rounded-xl p-8 sm:p-10 flex flex-col gap-6">
        <div>
          <h1 className="font-display text-3xl mb-2">Privacy Policy</h1>
          <p className="text-sm text-foreground/50">Last updated August 14, 2026</p>
        </div>

        <p className="text-foreground/70 leading-relaxed">
          Entrevow (&ldquo;Entrevow&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;), operated by
          Timothy D Anderson, ABN 24 461 519 751, provides a wedding-day logistics tool that lets
          couples build a guest list and itinerary, and share it with guests via a private link.
          This policy explains what personal information we collect, how we use it, and the
          choices you have. We handle personal information in accordance with the Australian
          Privacy Principles (APPs) under the Privacy Act 1988 (Cth).
        </p>

        <section className="flex flex-col gap-2">
          <h2 className="font-semibold text-lg text-brand">Information we collect</h2>
          <p className="text-foreground/70 leading-relaxed">
            <strong>Couple accounts:</strong> when you sign up, we collect your email address, a
            display name, and a password (stored only as a salted hash — we never see or store
            your plaintext password).
          </p>
          <p className="text-foreground/70 leading-relaxed">
            <strong>Wedding and guest data:</strong> information you enter to run your event —
            wedding title, date, emergency contact number, guest names, guest group labels, and
            itinerary details (times, locations, transport notes). Guests do not create accounts;
            each guest is identified only by the name you enter and a random access link.
          </p>
          <p className="text-foreground/70 leading-relaxed">
            <strong>Guest RSVPs:</strong> if a guest responds via their link, we store their RSVP
            status (attending / declined), a meal choice if the couple has set up meal options, an
            optional song request, and any other optional note they add (e.g. dietary
            requirements).
          </p>
          <p className="text-foreground/70 leading-relaxed">
            <strong>Photos and videos:</strong> couples and guests can upload photos to a shared
            gallery, and couples can add a welcome video or a video attached to an announcement.
            Guests can also record a short video guestbook message — these are held back from
            other guests until the couple reviews and approves them. All of this is stored as
            media files, not analysed or scanned by us beyond what&apos;s needed to store and
            serve it.
          </p>
          <p className="text-foreground/70 leading-relaxed">
            <strong>Location data:</strong> on the Full Day-Of plan, a driver sharing a shuttle
            link can share live GPS location so guests can see the shuttle&apos;s progress — this
            is only collected while that link is actively open and sharing. Separately, we send
            the wedding venue&apos;s town or suburb (never a street address) to our weather
            provider to generate contingency alerts.
          </p>
          <p className="text-foreground/70 leading-relaxed">
            <strong>Push notification data:</strong> if a guest opts in on the Full Day-Of plan,
            their browser generates a push subscription (an address used only to deliver
            notifications, not personally identifying on its own) which we store against their
            guest link so we can notify them of itinerary changes or new announcements.
          </p>
          <p className="text-foreground/70 leading-relaxed">
            <strong>Payment data:</strong> if a couple pays to unlock guest access, payment is
            handled entirely by Stripe — we never see or store your card details. We keep a record
            of the payment (amount, plan tier, and Stripe&apos;s reference for it) for receipts and
            support.
          </p>
          <p className="text-foreground/70 leading-relaxed">
            <strong>Technical data:</strong> a single essential session cookie used to keep
            couples logged in, plus Google Analytics cookies on our marketing pages and couple
            dashboard (see below). We never load Google Analytics on a guest, usher, or driver
            link, so guest activity on the event itself is not tracked by it. We do not use
            advertising cookies.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-semibold text-lg text-brand">How we use this information</h2>
          <p className="text-foreground/70 leading-relaxed">
            We use the information above solely to operate the service: authenticating couples,
            displaying the itinerary and guest list, letting guests submit RSVPs and upload photos
            or videos, processing payments, generating weather contingency alerts, powering live
            shuttle tracking, sending push notifications for itinerary or announcement changes, and
            sending transactional emails you or your guests trigger (such as a password reset
            link). We do not sell personal information, and we do not use guest or wedding data for
            advertising.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-semibold text-lg text-brand">Who we share it with</h2>
          <p className="text-foreground/70 leading-relaxed">
            We use a small number of service providers to run Entrevow, each acting as a data
            processor on our behalf:
          </p>
          <ul className="list-disc pl-5 text-foreground/70 leading-relaxed flex flex-col gap-1">
            <li>Netlify — application hosting and serverless functions</li>
            <li>Supabase — our Postgres database, and storage for uploaded photos and videos</li>
            <li>
              Stripe — payment processing for paid weddings; Stripe collects and processes your
              payment details directly, we never see your full card number
            </li>
            <li>
              Open-Meteo — weather forecast data, given only your venue&apos;s town or suburb
            </li>
            <li>Resend — delivery of transactional emails (e.g. password resets)</li>
            <li>
              Google Analytics — usage analytics on our marketing pages and couple dashboard only,
              never on a guest, usher, or driver link
            </li>
          </ul>
          <p className="text-foreground/70 leading-relaxed">
            These providers may process data on infrastructure located outside Australia. We
            don&apos;t share your information with anyone else except where required by law.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-semibold text-lg text-brand">Data retention and deletion</h2>
          <p className="text-foreground/70 leading-relaxed">
            Guest and itinerary data is kept for as long as the couple keeps it in their account.
            Removing a guest or deleting a wedding removes the associated data immediately. To
            delete your couple account entirely, contact us using the details below.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-semibold text-lg text-brand">Security</h2>
          <p className="text-foreground/70 leading-relaxed">
            Passwords are hashed with bcrypt before storage. Couple sessions use a signed,
            HTTP-only cookie. Guest links use a long random access code rather than a guessable
            identifier.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-semibold text-lg text-brand">Your rights</h2>
          <p className="text-foreground/70 leading-relaxed">
            You can access or correct most of your data directly within your dashboard. For
            anything else — including access, correction, or deletion requests, or a complaint
            about how we&apos;ve handled your information — contact us below. If you&apos;re not
            satisfied with our response, you can lodge a complaint with the Office of the
            Australian Information Commissioner (OAIC) at oaic.gov.au.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-semibold text-lg text-brand">Children&apos;s privacy</h2>
          <p className="text-foreground/70 leading-relaxed">
            Entrevow is not directed at children, and we don&apos;t knowingly collect personal
            information from anyone under 16.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-semibold text-lg text-brand">Changes to this policy</h2>
          <p className="text-foreground/70 leading-relaxed">
            We may update this policy from time to time. We&apos;ll update the &ldquo;last
            updated&rdquo; date above when we do.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-semibold text-lg text-brand">Contact us</h2>
          <p className="text-foreground/70 leading-relaxed">
            Questions or requests about this policy can be sent to{" "}
            <a href="mailto:hello@entrevow.com" className="text-brand font-medium">
              hello@entrevow.com
            </a>
            .
          </p>
        </section>

        <Link href="/" className="text-sm text-brand font-medium">
          ← Back to Entrevow
        </Link>
      </div>
    </div>
  );
}
