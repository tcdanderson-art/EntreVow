"use client";

import { useState } from "react";
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

  function linkFor(code: string) {
    return `${window.location.origin}/staff/${code}`;
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
      <p className="text-sm text-foreground/60">
        Give this link to ushers at the door. It opens a camera scanner on their phone that checks
        guests in against digital passes — no app or account needed.
      </p>

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
            className="text-foreground/50 text-sm font-medium whitespace-nowrap disabled:opacity-60"
          >
            Regenerate
          </button>
          <span className="text-xs text-foreground/40 ml-auto">{guestCount} guests on the list</span>
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
