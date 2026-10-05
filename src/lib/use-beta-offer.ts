"use client";

import { useEffect, useState } from "react";

export interface BetaOffer {
  total: number;
  remaining: number;
}

// null until the live counter loads (or if it fails), so callers can fall back
// to their non-promo rendering rather than advertising spots that may not exist.
export function useBetaOffer(): BetaOffer | null {
  const [offer, setOffer] = useState<BetaOffer | null>(null);
  useEffect(() => {
    fetch("/api/beta-offer")
      .then((r) => (r.ok ? r.json() : null))
      .then(setOffer)
      .catch(() => {});
  }, []);
  return offer;
}
