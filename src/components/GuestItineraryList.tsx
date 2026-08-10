"use client";

import { useEffect, useState } from "react";
import { ItineraryItem } from "@/types/itinerary";

const POLL_INTERVAL_MS = 20000;

function directionsUrl(location: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
}

export default function GuestItineraryList({
  code,
  initialItems,
}: {
  code: string;
  initialItems: ItineraryItem[];
}) {
  const [items, setItems] = useState(initialItems);

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
      <p className="text-sm text-foreground/50">No itinerary items yet — check back soon.</p>
    );
  }

  return (
    <ol className="border-l-2 border-border-warm pl-4 flex flex-col gap-4">
      {items.map((item) => (
        <li key={item.id}>
          <time className="text-xs font-semibold text-foreground/50">
            {new Date(item.start_time).toLocaleString(undefined, {
              weekday: "short",
              hour: "numeric",
              minute: "2-digit",
            })}
          </time>
          <h5 className="font-semibold text-sm">{item.title}</h5>
          {item.location && (
            <p className="text-sm text-foreground/60">
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
  );
}
