"use client";

import { useEffect } from "react";

export default function OfflineSupport() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js", { scope: "/g/" }).catch(() => {
        // offline caching is a nice-to-have — never block the page on this
      });
    }
  }, []);

  return null;
}
