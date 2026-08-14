"use client";

import { useEffect, useState } from "react";
import { ItineraryItem } from "@/types/itinerary";
import { formatWallClockTime } from "@/lib/wall-clock";
import { buildItineraryIcs } from "@/lib/ics";

const POLL_INTERVAL_MS = 20000;

function directionsUrl(location: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
}

export default function GuestItineraryList({
  code,
  weddingTitle,
  initialItems,
}: {
  code: string;
  weddingTitle: string;
  initialItems: ItineraryItem[];
}) {
  const [items, setItems] = useState(initialItems);

  function handleAddToCalendar() {
    const ics = buildItineraryIcs(weddingTitle, items);
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${weddingTitle.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-itinerary.ics`;
    link.click();
    URL.revokeObjectURL(url);
  }

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/guest/${code}`, { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        setItems(data.items);
      } catch {
        // silently skip — will retry next interval
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [code]);

  if (items.length === 0) {
    return (
      <p className="text-sm text-foreground/75">No itinerary items yet — check back soon.</p>
    );
  }

  return (
    <>
      <button
        onClick={handleAddToCalendar}
        className="text-xs font-medium text-brand mb-3 block"
      >
        Add to calendar
      </button>
      <ol className="border-l-2 border-border-warm pl-4 flex flex-col gap-4">
      {items.map((item) => (
        <li key={item.id}>
          <time className="text-xs font-semibold text-foreground/75">
            {formatWallClockTime(item.start_time, {
              weekday: "short",
              hour: "numeric",
              minute: "2-digit",
            })}
          </time>
          <h5 className="font-semibold text-sm">{item.title}</h5>
          {item.location && (
            <p className="text-sm text-foreground/80">
              {item.location}{" "}
              <a
                href={directionsUrl(item.location)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand font-medium"
              >
                Get directions
              </a>
            </p>
          )}
          {item.transport_info && (
            <p className="text-xs text-brand mt-0.5">{item.transport_info}</p>
          )}
        </li>
      ))}
      </ol>
    </>
  );
}
