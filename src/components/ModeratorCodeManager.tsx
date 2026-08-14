"use client";

import { useEffect, useState } from "react";
import { Wedding } from "@/types/wedding";

export default function ModeratorCodeManager({
  wedding,
  pendingCount,
}: {
  wedding: Wedding;
  pendingCount: number;
}) {
  const [moderatorCode, setModeratorCode] = useState(wedding.moderator_code);
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
    return `${origin}/moderator/${code}`;
  }

  async function generate() {
    setLoading(true);
    const res = await fetch(`/api/weddings/${wedding.id}/moderator-code`, { method: "POST" });
    const data = await res.json();
    setLoading(false);
    if (res.ok) setModeratorCode(data.wedding.moderator_code);
  }

  async function regenerate() {
    if (!confirm("Generate a new moderator link? The current link will stop working immediately.")) return;
    await generate();
  }

  async function revoke() {
    if (!confirm("Revoke the moderator link? It will stop working immediately, and no one will have delegated access until you generate a new one.")) return;
    setLoading(true);
    const res = await fetch(`/api/weddings/${wedding.id}/moderator-code`, { method: "DELETE" });
    const data = await res.json();
    setLoading(false);
    if (res.ok) setModeratorCode(data.wedding.moderator_code);
  }

  async function copyLink() {
    if (!moderatorCode) return;
    await navigator.clipboard.writeText(linkFor(moderatorCode));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="flex flex-col gap-2 mb-6 pb-6 border-b border-border-warm">
      <div className="flex items-start gap-1.5">
        <p className="text-sm text-foreground/80">
          Not going to be checking your phone on the day? Share this link with someone you trust so
          they can approve or reject guestbook messages and hide inappropriate photos on your behalf —
          no account needed.
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
          <li>Tap &ldquo;Generate moderator link&rdquo; below, then &ldquo;Copy link&rdquo;.</li>
          <li>Send it to whoever you&apos;re delegating to — no account needed on their end.</li>
          <li>They open it on their phone or laptop and see the same approve/reject/hide controls you do.</li>
          <li>Anything they approve shows up in your gallery and guestbook automatically.</li>
        </ol>
      )}

      {moderatorCode ? (
        <div className="flex items-center gap-3 flex-wrap">
          <code className="text-xs bg-cream border border-border-warm rounded-md px-3 py-2 flex-1 min-w-[200px] truncate">
            {linkFor(moderatorCode)}
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
          <button
            onClick={revoke}
            disabled={loading}
            className="text-foreground/75 text-sm font-medium whitespace-nowrap disabled:opacity-60"
          >
            Revoke
          </button>
          {pendingCount > 0 && (
            <span className="text-xs text-foreground/70 ml-auto">{pendingCount} awaiting approval</span>
          )}
        </div>
      ) : (
        <button
          onClick={generate}
          disabled={loading}
          className="self-start bg-cream-card border border-border-warm rounded-md px-4 py-2 text-sm font-medium hover:bg-white transition-colors disabled:opacity-60"
        >
          {loading ? "Generating…" : "Generate moderator link"}
        </button>
      )}
    </div>
  );
}
