import Link from "next/link";

export const metadata = { title: "Accessibility Statement — Entrevow" };

export default function AccessibilityPage() {
  return (
    <div className="flex-1 bg-cream px-6 py-12">
      <div className="max-w-2xl mx-auto bg-white border border-border-warm rounded-xl p-8 sm:p-10 flex flex-col gap-6">
        <div>
          <h1 className="font-display text-3xl mb-2">Accessibility Statement</h1>
          <p className="text-sm text-foreground/75">Last updated August 14, 2026</p>
        </div>

        <p className="text-foreground/70 leading-relaxed">
          Entrevow, operated by Timothy D Anderson, ABN 24 461 519 751, is used by wedding guests
          of all ages and abilities, often on their phone in a hurry on the day itself. We want it
          to work for everyone.
        </p>

        <section className="flex flex-col gap-2">
          <h2 className="font-semibold text-lg text-brand">Our standard</h2>
          <p className="text-foreground/70 leading-relaxed">
            We aim to meet the Web Content Accessibility Guidelines (WCAG) 2.1 at Level AA, the
            standard generally recognised in Australia for web accessibility.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-semibold text-lg text-brand">What we&apos;ve done</h2>
          <ul className="list-disc pl-5 text-foreground/70 leading-relaxed flex flex-col gap-1">
            <li>
              Text and interactive colours meet AA contrast ratios (4.5:1 for normal text) across
              the site.
            </li>
            <li>
              Every form field has a proper label, not just placeholder text, so screen readers
              announce what each field is for.
            </li>
            <li>
              The seating chart can be used with a keyboard, not just drag-and-drop — each guest
              has a dropdown to assign their table.
            </li>
            <li>
              Text on mobile is large enough that iOS Safari won&apos;t force an unwanted zoom when
              you tap into a field.
            </li>
          </ul>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-semibold text-lg text-brand">Known limitations</h2>
          <p className="text-foreground/70 leading-relaxed">
            This has been a practical accessibility pass, not a full independent audit, so gaps
            remain. Photos and videos uploaded by couples and guests don&apos;t have alt text or
            captions, since that content is user-generated at the moment it&apos;s shared. We&apos;re
            continuing to improve accessibility over time.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-semibold text-lg text-brand">Feedback</h2>
          <p className="text-foreground/70 leading-relaxed">
            If you experience any difficulty using Entrevow, or have feedback on its
            accessibility, please contact us at{" "}
            <a href="mailto:hello@entrevow.com" className="text-brand font-medium">
              hello@entrevow.com
            </a>
            . If you&apos;re not satisfied with our response, you can lodge a complaint with the
            Australian Human Rights Commission at humanrights.gov.au.
          </p>
        </section>

        <Link href="/" className="text-sm text-brand font-medium">
          ← Back to Entrevow
        </Link>
      </div>
    </div>
  );
}
