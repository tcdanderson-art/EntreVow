"use client";

import { useState } from "react";
import { COUPLE_FEEDBACK_ITEMS } from "@/lib/beta-feedback-items";

export default function BetaFeedback({ weddingId }: { weddingId: number }) {
  const [open, setOpen] = useState(false);
  const [troubleItems, setTroubleItems] = useState<Set<string>>(new Set());
  const [comments, setComments] = useState("");
  const [email, setEmail] = useState("");
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
    const res = await fetch(`/api/weddings/${weddingId}/beta-feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ troubleItems: Array.from(troubleItems), comments, email }),
    });
    setSubmitting(false);
    if (res.ok) {
      setSubmitted(true);
      setTroubleItems(new Set());
      setComments("");
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => {
          setOpen(true);
          setSubmitted(false);
        }}
        className="self-start text-sm font-medium text-brand"
      >
        Give beta feedback
      </button>
    );
  }

  if (submitted) {
    return (
      <div className="flex flex-col gap-2 border border-border-warm rounded-md p-4 bg-cream">
        <p className="text-sm text-foreground/80">Thanks — that&apos;s been sent through.</p>
        <button onClick={() => setOpen(false)} className="self-start text-sm font-medium text-brand">
          Close
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 border border-border-warm rounded-md p-4 bg-cream"
    >
      <p className="text-sm text-foreground/80">
        Tick anything that gave you trouble — leave the rest unchecked if it worked fine.
      </p>
      <div className="flex flex-col gap-1.5">
        {COUPLE_FEEDBACK_ITEMS.map((item) => (
          <label key={item.key} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={troubleItems.has(item.key)}
              onChange={() => toggleItem(item.key)}
            />
            {item.label}
          </label>
        ))}
      </div>
      <label htmlFor="beta-comments" className="sr-only">Comments</label>
      <textarea
        id="beta-comments"
        placeholder="Anything else? (optional)"
        value={comments}
        onChange={(e) => setComments(e.target.value)}
        rows={3}
        className="border border-border-warm rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
      />
      <label htmlFor="beta-email" className="sr-only">Email</label>
      <input
        id="beta-email"
        type="email"
        placeholder="Your email, if you'd like a reply (optional)"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border border-border-warm rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
      />
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="bg-brand text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-brand-hover transition-colors disabled:opacity-60"
        >
          {submitting ? "Sending…" : "Send feedback"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="text-foreground/80 text-sm font-medium">
          Cancel
        </button>
      </div>
    </form>
  );
}
