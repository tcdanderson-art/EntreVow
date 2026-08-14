"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { WeatherForecast, FORECAST_HORIZON_DAYS } from "@/lib/weather";

type WeatherResponse =
  | { available: true; forecast: WeatherForecast; suggestion: string | null }
  | { available: false; reason: "no_location" | "no_date" | "past" | "fetch_failed" | "requires_full_tier" }
  | { available: false; reason: "too_far"; daysUntil: number };

export default function WeatherWidget({
  weddingId,
  knownGroups,
}: {
  weddingId: number;
  knownGroups: string[];
}) {
  const router = useRouter();
  const [data, setData] = useState<WeatherResponse | null>(null);
  const [posting, setPosting] = useState(false);
  const [posted, setPosted] = useState(false);

  useEffect(() => {
    fetch(`/api/weddings/${weddingId}/weather`)
      .then((res) => res.json())
      .then(setData)
      .catch(() => setData({ available: false, reason: "fetch_failed" }));
  }, [weddingId]);

  async function postSuggestion(message: string) {
    setPosting(true);
    const res = await fetch(`/api/weddings/${weddingId}/announcements`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, visibleToGroups: knownGroups }),
    });
    setPosting(false);
    if (res.ok) {
      setPosted(true);
      router.refresh();
    }
  }

  if (!data) {
    return <p className="text-sm text-foreground/75">Checking the forecast…</p>;
  }

  if (!data.available) {
    const message =
      data.reason === "too_far"
        ? `Forecasts only go out ${FORECAST_HORIZON_DAYS} days — check back in ${data.daysUntil - FORECAST_HORIZON_DAYS} day(s).`
        : {
            no_location: "Add a venue address above to see the day-of weather forecast.",
            no_date: "Set a wedding date above to see the day-of weather forecast.",
            past: "The wedding date has passed.",
            fetch_failed: "Couldn't reach the weather service — try again shortly.",
            requires_full_tier: "Weather contingency alerts are part of the Full Day-Of plan.",
          }[data.reason];

    return <p className="text-sm text-foreground/75">{message}</p>;
  }

  const { forecast, suggestion } = data;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-4">
        <div>
          <p className="font-medium">{forecast.description}</p>
          <p className="text-sm text-foreground/80">
            {Math.round(forecast.minTempC)}° – {Math.round(forecast.maxTempC)}°C ·{" "}
            {forecast.precipitationProbability}% chance of rain
          </p>
        </div>
      </div>

      {suggestion && !posted && (
        <div className="border border-amber-300 bg-amber-50 rounded-md p-3 flex flex-col gap-2">
          <p className="text-sm text-amber-900">{suggestion}</p>
          <button
            onClick={() => postSuggestion(suggestion)}
            disabled={posting}
            className="self-start bg-brand text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-brand-hover transition-colors disabled:opacity-60"
          >
            {posting ? "Posting…" : "Post as announcement to guests"}
          </button>
        </div>
      )}

      {posted && <p className="text-sm text-green-700">Posted to guests.</p>}
    </div>
  );
}
