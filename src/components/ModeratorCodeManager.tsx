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
  const [origin] = useState(() => (typeof window !== "undefined" ? window.location.origin : ""));

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

  async function copyLink() {
    if (!moderatorCode) return;
    await navigator.clipboard.writeText(linkFor(moderatorCode));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="flex flex-col gap-2 mb-6 pb-6 border-b border-border-warm">
      <p className="text-sm text-foreground/60">
        Not going to be checking your phone on the day? Share this link with someone you trust so
        they can approve or reject guestbook videos and hide inappropriate photos on your behalf —
        no account needed.
      </p>

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
            className="text-foreground/50 text-sm font-medium whitespace-nowrap disabled:opacity-60"
          >
            Regenerate
          </button>
          {pendingCount > 0 && (
            <span className="text-xs text-foreground/40 ml-auto">{pendingCount} awaiting approval</span>
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
