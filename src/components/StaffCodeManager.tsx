"use client";

import { useEffect, useState } from "react";
import { Wedding } from "@/types/wedding";

export default function StaffCodeManager({
  wedding,
  guestCount,
}: {
  wedding: Wedding;
  guestCount: number;
}) {
  const [staffCode, setStaffCode] = useState(wedding.staff_code);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  // Must start "" on both server and client so hydration matches, then fill in after
  // mount — a lazy useState initializer reads `window` differently on each side and
  // causes a hydration mismatch, even though it silences the set-state-in-effect lint rule.
  const [origin, setOrigin] = useState("");
  useEffect(() => {
    // Deriving from a browser-only global unavailable at SSR time, not synchronizing external state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOrigin(window.location.origin);
  }, []);

  function linkFor(code: string) {
    return `${origin}/staff/${code}`;
  }

  async function generate() {
    setLoading(true);
    const res = await fetch(`/api/weddings/${wedding.id}/staff-code`, { method: "POST" });
    const data = await res.json();
    setLoading(false);
    if (res.ok) setStaffCode(data.wedding.staff_code);
  }

  async function regenerate() {
    if (!confirm("Generate a new check-in link? The current link will stop working immediately.")) return;
    await generate();
  }

  async function copyLink() {
    if (!staffCode) return;
    await navigator.clipboard.writeText(linkFor(staffCode));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-start gap-1.5">
        <p className="text-sm text-foreground/80">
          Give this link to ushers at the door. It opens a camera scanner on their phone that checks
          guests in against digital passes — no app or account needed.
        </p>
        <button
          onClick={() => setShowHelp((v) => !v)}
          aria-label="How to use this"
          aria-expanded={showHelp}
          className="shrink-0 mt-0.5 w-4 h-4 rounded-full bg-cream border border-border-warm text-[10px] font-bold text-foreground/70 leading-none flex items-center justify-center hover:bg-white"
        >
          ?
        </button>
      </div>

      {showHelp && (
        <ol className="text-sm text-foreground/80 bg-cream border border-border-warm rounded-md px-4 py-3 list-decimal list-inside flex flex-col gap-1">
          <li>Tap &ldquo;Generate check-in link&rdquo; below, then &ldquo;Copy link&rdquo;.</li>
          <li>Send it to each usher — text or email works.</li>
          <li>They open it on their own phone and allow camera access when asked.</li>
          <li>At the door, they hold the camera up to each guest&apos;s digital pass to check them in.</li>
        </ol>
      )}

      {staffCode ? (
        <div className="flex items-center gap-3 flex-wrap">
          <code className="text-xs bg-cream border border-border-warm rounded-md px-3 py-2 flex-1 min-w-[200px] truncate">
            {linkFor(staffCode)}
          </code>
          <button onClick={copyLink} className="text-brand text-sm font-medium whitespace-nowrap">
            {copied ? "Copied!" : "Copy link"}
          </button>
          <button
            onClick={regenerate}
            disabled={loading}
            className="text-foreground/75 text-sm font-medium whitespace-nowrap disabled:opacity-60"
          >
            Regenerate
          </button>
          <span className="text-xs text-foreground/70 ml-auto">{guestCount} guests on the list</span>
        </div>
      ) : (
        <button
          onClick={generate}
          disabled={loading}
          className="self-start bg-brand text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-brand-hover transition-colors disabled:opacity-60"
        >
          {loading ? "Generating…" : "Generate check-in link"}
        </button>
      )}
    </div>
  );
}
