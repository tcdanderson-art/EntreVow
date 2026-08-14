import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Entrevow — Launching soon",
  robots: { index: false, follow: false },
};

export default function ComingSoonPage() {
  return (
    <div className="flex-1 flex items-center justify-center bg-cream px-4 py-8">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl border border-border-warm overflow-hidden flex flex-col items-center text-center px-8 py-10 gap-4">
        <Image
          src="/brand/wordmark.png"
          alt="Entrevow"
          width={663}
          height={82}
          className="h-6 w-auto"
          priority
          unoptimized
        />
        <h1 className="font-display text-xl">Launching soon</h1>
        <p className="text-sm text-foreground/80 leading-relaxed">
          We&rsquo;re putting the finishing touches on Entrevow. Check back shortly.
        </p>
      </div>
    </div>
  );
}
