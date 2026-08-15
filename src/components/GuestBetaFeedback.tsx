"use client";

import { useState } from "react";
import { GUEST_FEEDBACK_ITEMS } from "@/lib/beta-feedback-items";

export default function GuestBetaFeedback({ code }: { code: string }) {
  const [open, setOpen] = useState(false);
  const [troubleItems, setTroubleItems] = useState<Set<string>>(new Set());
  const [comments, setComments] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function toggleItem(key: string) {
    setTroubleItems((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const res = await fetch(`/api/guest/${code}/beta-feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ troubleItems: Array.from(troubleItems), comments }),
    });
    setSubmitting(false);
    if (res.ok) setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="text-center py-3 border-t border-border-warm bg-cream-card">
        <p className="text-xs text-foreground/70">Thanks for the feedback!</p>
      </div>
    );
  }

  if (!open) {
    return (
      <div className="text-center py-3 border-t border-border-warm bg-cream-card">
        <button
          onClick={() => setOpen(true)}
          className="text-xs text-foreground/70 hover:text-foreground/80 transition-colors"
        >
          How&apos;s this working for you? Quick feedback
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-2 px-5 py-3 border-t border-border-warm bg-cream-card"
    >
      <p className="text-xs text-foreground/75">Tick anything that gave you trouble:</p>
      <div className="flex flex-wrap gap-x-4 gap-y-1.5">
        {GUEST_FEEDBACK_ITEMS.map((item) => (
          <label key={item.key} className="flex items-center gap-1.5 text-xs text-foreground/80">
            <input
              type="checkbox"
              checked={troubleItems.has(item.key)}
              onChange={() => toggleItem(item.key)}
            />
            {item.label}
          </label>
        ))}
      </div>
      <label htmlFor="guest-beta-comments" className="sr-only">Comments</label>
      <input
        id="guest-beta-comments"
        type="text"
        placeholder="Anything else? (optional)"
        value={comments}
        onChange={(e) => setComments(e.target.value)}
        className="border border-border-warm rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
      />
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="bg-brand text-white rounded-md px-3 py-1.5 text-xs font-medium hover:bg-brand-hover transition-colors disabled:opacity-60"
        >
          {submitting ? "Sending…" : "Send"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="text-foreground/70 text-xs font-medium">
          Cancel
        </button>
      </div>
    </form>
  );
}
