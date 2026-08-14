"use client";

import { useEffect, useState } from "react";
import { ItineraryItem } from "@/types/itinerary";
import { Shuttle } from "@/types/shuttle";
import { WeddingWeatherResult } from "@/lib/weather";
import { formatWallClockTime, getCurrentWallClockString } from "@/lib/wall-clock";
import { suggestShuttle } from "@/lib/shuttle-match";

const POLL_INTERVAL_MS = 20000;

export default function GuestCommandCard({
  code,
  initialItems,
  initialShuttles,
  initialArrivalTime,
  showShuttleAndWeather,
}: {
  code: string;
  initialItems: ItineraryItem[];
  initialShuttles: Shuttle[];
  initialArrivalTime: string | null;
  showShuttleAndWeather: boolean;
}) {
  const [items, setItems] = useState(initialItems);
  const [shuttles, setShuttles] = useState(initialShuttles);
  const [arrivalTime, setArrivalTime] = useState(initialArrivalTime);
  const [weather, setWeather] = useState<WeddingWeatherResult | null>(null);
  // Starts null so the server render and the first client render agree (both
  // show nothing "next") — filled in by the effect below right after mount,
  // never computed during SSR, since "now" would differ between the two passes.
  const [now, setNow] = useState<string | null>(null);

  useEffect(() => {
    if (!showShuttleAndWeather) return;
    fetch(`/api/guest/${code}/weather`)
      .then((res) => res.json())
      .then(setWeather)
      .catch(() => setWeather({ available: false, reason: "fetch_failed" }));
  }, [code, showShuttleAndWeather]);

  useEffect(() => {
    async function refresh() {
      setNow(getCurrentWallClockString());
      try {
        const res = await fetch(`/api/guest/${code}`, { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        setItems(data.items ?? []);
        setShuttles(data.shuttles ?? []);
        setArrivalTime(data.guest?.arrival_time ?? null);
      } catch {
        // silently skip — will retry next interval
      }
    }
    refresh();
    const interval = setInterval(refresh, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [code]);

  const nextItem = now ? (items.find((item) => item.start_time >= now) ?? null) : null;
  const suggestedShuttle = showShuttleAndWeather && arrivalTime ? suggestShuttle(arrivalTime, shuttles) : null;
  const forecast = showShuttleAndWeather && weather?.available ? weather.forecast : null;

  if (!nextItem && !suggestedShuttle && !forecast) return null;

  return (
    <div className="flex flex-col gap-2 mx-5 mt-4 p-3 bg-brand/10 border border-brand/30 rounded-lg text-sm">
      {nextItem && (
        <div>
          <span className="text-foreground/75">Next up: </span>
          <span className="font-semibold">{nextItem.title}</span>{" "}
          at {formatWallClockTime(nextItem.start_time, { timeStyle: "short" })}
        </div>
      )}
      {suggestedShuttle && (
        <div>
          <span className="text-foreground/75">Your shuttle: </span>
          <span className="font-semibold">{suggestedShuttle.label}</span> departs{" "}
          {formatWallClockTime(suggestedShuttle.pickup_time as string, { timeStyle: "short" })}
        </div>
      )}
      {forecast && (
        <div>
          <span className="text-foreground/75">Weather: </span>
          {forecast.description}, {Math.round(forecast.minTempC)}°–{Math.round(forecast.maxTempC)}°C
        </div>
      )}
    </div>
  );
}
