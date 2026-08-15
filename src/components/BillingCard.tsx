"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { PlanTier } from "@/types/wedding";
import { TIER_LABELS } from "@/lib/plan";

export default function BillingCard({
  weddingId,
  planTier,
}: {
  weddingId: number;
  planTier: PlanTier | null;
}) {
  const [loadingTier, setLoadingTier] = useState<PlanTier | null>(null);
  const checkoutStatus = useSearchParams().get("checkout");

  async function startCheckout(tier: PlanTier) {
    setLoadingTier(tier);
    const res = await fetch(`/api/weddings/${weddingId}/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tier }),
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      setLoadingTier(null);
    }
  }

  if (planTier === "full") {
    return (
      <section className="bg-white border border-border-warm rounded-xl p-6">
        <h2 className="font-semibold mb-2">Plan</h2>
        <p className="text-sm text-foreground/70">
          ✓ <span className="font-medium text-brand">{TIER_LABELS.full}</span> plan active — guest
          access is live.
        </p>
      </section>
    );
  }

  if (planTier === "essentials") {
    return (
      <section className="bg-white border border-border-warm rounded-xl p-6">
        <h2 className="font-semibold mb-2">Plan</h2>
        <p className="text-sm text-foreground/70 mb-4">
          ✓ <span className="font-medium text-brand">{TIER_LABELS.essentials}</span> plan active —
          guest access is live.
        </p>

        {checkoutStatus === "cancelled" && (
          <p className="text-sm text-red-600 mb-4">Checkout was cancelled — no charge was made.</p>
        )}
        {checkoutStatus === "success" && (
          <p className="text-sm text-brand mb-4">
            Payment received — activating Full Day-Of now (refresh in a few seconds if it
            doesn&apos;t update automatically).
          </p>
        )}

        <div className="border border-brand rounded-lg p-4 flex items-center justify-between gap-4">
          <div>
            <div className="font-semibold text-brand">Upgrade to Full Day-Of — $180</div>
            <p className="text-xs text-foreground/80">
              Adds live shuttle tracking, weather alerts, QR usher check-in, vendor check-in &amp;
              crew broadcasts, the day-of command card, a personalised wedding URL, push
              notifications, and unlimited guests.
            </p>
          </div>
          <button
            onClick={() => startCheckout("full")}
            disabled={loadingTier !== null}
            className="shrink-0 text-sm font-medium bg-brand text-white rounded-md px-4 py-2 disabled:opacity-60"
          >
            {loadingTier === "full" ? "Redirecting…" : "Upgrade"}
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white border border-border-warm rounded-xl p-6">
      <h2 className="font-semibold mb-1">Unlock guest access</h2>
      <p className="text-sm text-foreground/80 mb-4">
        Build your wedding for free. Pay once to turn on guest links, RSVPs, and day-of tools —
        no subscription.
      </p>

      {checkoutStatus === "cancelled" && (
        <p className="text-sm text-red-600 mb-4">Checkout was cancelled — no charge was made.</p>
      )}
      {checkoutStatus === "success" && (
        <p className="text-sm text-brand mb-4">
          Payment received — activating your plan now (refresh in a few seconds if it doesn&apos;t
          update automatically).
        </p>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="border border-border-warm rounded-lg p-4 flex flex-col gap-2">
          <div className="font-semibold">Essentials — $69</div>
          <p className="text-xs text-foreground/80 flex-1">
            Itinerary, RSVP + plus-ones, guest groups, digital pass, up to 150 guests.
          </p>
          <button
            onClick={() => startCheckout("essentials")}
            disabled={loadingTier !== null}
            className="text-sm font-medium bg-cream-card border border-border-warm rounded-md py-2 disabled:opacity-60"
          >
            {loadingTier === "essentials" ? "Redirecting…" : "Choose Essentials"}
          </button>
        </div>

        <div className="border border-brand rounded-lg p-4 flex flex-col gap-2">
          <div className="font-semibold text-brand">Full Day-Of — $249</div>
          <p className="text-xs text-foreground/80 flex-1">
            Everything in Essentials, plus live shuttle tracking, weather alerts, QR usher
            check-in, vendor check-in &amp; crew broadcasts, the day-of command card, a
            personalised wedding URL, push notifications, and unlimited guests.
          </p>
          <button
            onClick={() => startCheckout("full")}
            disabled={loadingTier !== null}
            className="text-sm font-medium bg-brand text-white rounded-md py-2 disabled:opacity-60"
          >
            {loadingTier === "full" ? "Redirecting…" : "Choose Full Day-Of"}
          </button>
        </div>
      </div>
    </section>
  );
}
