import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex-1 flex items-center justify-center bg-cream px-6 py-12">
      <div className="w-full max-w-sm text-center bg-white border border-border-warm rounded-xl p-8 shadow-sm">
        <h1 className="font-display text-3xl mb-2">Page not found</h1>
        <p className="text-sm text-foreground/60 mb-6">
          Whatever you were looking for isn&apos;t here — check the link, or head back home.
        </p>
        <Link
          href="/"
          className="inline-block bg-brand text-white px-6 py-2.5 rounded-md text-sm font-medium hover:bg-brand-hover transition-colors"
        >
          Back to Entrevow
        </Link>
      </div>
    </div>
  );
}
