import Link from "next/link";

export const metadata = { title: "Terms of Service — Entrevow" };

export default function TermsPage() {
  return (
    <div className="flex-1 bg-cream px-6 py-12">
      <div className="max-w-2xl mx-auto bg-white border border-border-warm rounded-xl p-8 sm:p-10 flex flex-col gap-6">
        <div>
          <h1 className="font-display text-3xl mb-2">Terms of Service</h1>
          <p className="text-sm text-foreground/50">Last updated August 13, 2026</p>
        </div>

        <p className="text-foreground/70 leading-relaxed">
          These terms govern your use of Entrevow (&ldquo;the Service&rdquo;), operated by
          Timothy D Anderson, ABN 24 461 519 751 (&ldquo;we&rdquo;, &ldquo;us&rdquo;). By creating
          an account or otherwise using the Service, you agree to them. If you don&apos;t agree,
          please don&apos;t use the Service.
        </p>

        <section className="flex flex-col gap-2">
          <h2 className="font-semibold text-lg text-brand">The Service</h2>
          <p className="text-foreground/70 leading-relaxed">
            Entrevow lets couples build a wedding guest list and itinerary and share it with
            guests via a private link, so guests can view their schedule and RSVP without
            creating an account.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-semibold text-lg text-brand">Accounts</h2>
          <p className="text-foreground/70 leading-relaxed">
            You must provide accurate information when creating an account and are responsible
            for keeping your login credentials confidential and for all activity under your
            account. Tell us right away if you suspect unauthorized access.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-semibold text-lg text-brand">Acceptable use</h2>
          <p className="text-foreground/70 leading-relaxed">
            You agree not to use the Service to: violate any law; harass, deceive, or harm
            others; upload content you don&apos;t have the right to share; attempt to access
            another couple&apos;s account or guest data; or interfere with or disrupt the
            Service&apos;s operation (including scraping, overloading, or probing it for
            vulnerabilities without authorization).
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-semibold text-lg text-brand">Your content</h2>
          <p className="text-foreground/70 leading-relaxed">
            You own the wedding and guest information you enter into Entrevow. By entering it,
            you grant us a limited license to store, process, and display it back to you and to
            the guests you invite, solely to provide the Service. You&apos;re responsible for
            having the right to share any guest information (such as names and contact details)
            that you enter.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-semibold text-lg text-brand">Paid features</h2>
          <p className="text-foreground/70 leading-relaxed">
            Guest-facing access for a wedding (guest links, RSVPs, and other live features) requires
            a one-time, per-wedding payment rather than a recurring subscription — see the pricing
            shown on your dashboard for current tiers and amounts. You can build your wedding for
            free before paying. Payment unlocks guest access for that wedding immediately.
          </p>
          <p className="text-foreground/70 leading-relaxed">
            Because access unlocks immediately, purchases are refundable within 7 days of payment,
            provided no guests have RSVP&apos;d yet. Outside that window, or once a guest has
            RSVP&apos;d, refunds are at our discretion. If your purchase is refunded in full, guest
            access for that wedding is turned off — unless it was an upgrade from Essentials to Full
            Day-Of, in which case the wedding reverts to Essentials access rather than losing access
            entirely. A partial or goodwill refund may be issued without affecting access. To request
            a refund, contact{" "}
            <a href="mailto:hello@entrevow.com" className="text-brand font-medium">
              hello@entrevow.com
            </a>
            .
          </p>
          <p className="text-foreground/70 leading-relaxed">
            This policy is in addition to, and doesn&apos;t limit, your rights under the Australian
            Consumer Law. If the Service has a major failure, you&apos;re entitled to a refund (or
            other remedy of your choice) regardless of the 7-day window, whether a guest has
            RSVP&apos;d, or anything else in this policy.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-semibold text-lg text-brand">Termination</h2>
          <p className="text-foreground/70 leading-relaxed">
            You may stop using the Service and request deletion of your account at any time. If
            you breach these terms, we&apos;ll generally let you know and give you a reasonable
            opportunity to fix it before suspending or terminating your access. We may act
            immediately, without notice, for serious breaches — for example fraud, abuse of other
            users&apos; data, or attempts to compromise the Service&apos;s security. Terminating
            your access for a breach doesn&apos;t forfeit any refund you&apos;d otherwise be
            entitled to under the Paid features section above or the Australian Consumer Law.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-semibold text-lg text-brand">Disclaimer and liability</h2>
          <p className="text-foreground/70 leading-relaxed">
            The Service is provided &ldquo;as is&rdquo; without warranties of any kind, and we
            don&apos;t guarantee it will be uninterrupted or error-free. To the maximum extent
            permitted by law, Entrevow isn&apos;t liable for indirect, incidental, or
            consequential loss arising from your use of the Service. Nothing in these terms
            excludes, restricts, or modifies any right, warranty, or remedy under the Australian
            Consumer Law or any other applicable law that cannot lawfully be excluded.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-semibold text-lg text-brand">Changes to these terms</h2>
          <p className="text-foreground/70 leading-relaxed">
            We may update these terms from time to time. For material changes, we&apos;ll give at
            least 14 days&apos; notice (by email or a notice in the dashboard) before they take
            effect, and update the &ldquo;last updated&rdquo; date above. A change never applies
            retroactively to a wedding you&apos;ve already paid for — it only affects new purchases
            and continued use going forward. Continuing to use the Service after a change takes
            effect means you accept it.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-semibold text-lg text-brand">Governing law</h2>
          <p className="text-foreground/70 leading-relaxed">
            These terms are governed by the laws of New South Wales, Australia, and you submit
            to the non-exclusive jurisdiction of its courts.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-semibold text-lg text-brand">Contact us</h2>
          <p className="text-foreground/70 leading-relaxed">
            Questions about these terms can be sent to{" "}
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
