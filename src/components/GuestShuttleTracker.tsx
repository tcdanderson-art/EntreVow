"use client";

import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap, Marker } from "leaflet";
import "leaflet/dist/leaflet.css";
import { Shuttle } from "@/types/shuttle";

const POLL_INTERVAL_MS = 20000;
const LIVE_THRESHOLD_MS = 3 * 60 * 1000;

function isLive(shuttle: Shuttle) {
  if (!shuttle.location_updated_at) return false;
  return Date.now() - new Date(shuttle.location_updated_at).getTime() < LIVE_THRESHOLD_MS;
}

function timeAgo(iso: string) {
  const seconds = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  return `${hours}h ago`;
}

export default function GuestShuttleTracker({
  code,
  initialShuttles,
}: {
  code: string;
  initialShuttles: Shuttle[];
}) {
  const [shuttles, setShuttles] = useState(initialShuttles);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<Map<number, Marker>>(new Map());
  const hasFitBoundsRef = useRef(false);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/guest/${code}`, { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        setShuttles(data.shuttles ?? []);
      } catch {
        // silently skip — will retry next interval
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [code]);

  const located = shuttles.filter((s) => s.lat != null && s.lng != null);

  useEffect(() => {
    if (located.length === 0 || !mapContainerRef.current) return;

    let cancelled = false;

    import("leaflet").then((L) => {
      if (cancelled || !mapContainerRef.current) return;

      if (!mapRef.current) {
        mapRef.current = L.map(mapContainerRef.current, {
          zoomControl: false,
          attributionControl: false,
        });
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
        }).addTo(mapRef.current);
      }
      const map = mapRef.current;

      const seenIds = new Set<number>();
      located.forEach((shuttle) => {
        seenIds.add(shuttle.id);
        const live = isLive(shuttle);
        const icon = L.divIcon({
          className: "",
          html: `<div style="display:flex;align-items:center;gap:4px;background:${live ? "#b07d5c" : "#94a3b8"};color:white;padding:4px 8px;border-radius:999px;font-size:11px;font-weight:600;white-space:nowrap;box-shadow:0 1px 4px rgba(0,0,0,0.3);">🚐 ${shuttle.label}</div>`,
          iconSize: undefined,
          iconAnchor: [20, 12],
        });

        const existing = markersRef.current.get(shuttle.id);
        if (existing) {
          existing.setLatLng([shuttle.lat as number, shuttle.lng as number]);
          existing.setIcon(icon);
        } else {
          const marker = L.marker([shuttle.lat as number, shuttle.lng as number], { icon }).addTo(map);
          markersRef.current.set(shuttle.id, marker);
        }
      });

      markersRef.current.forEach((marker, id) => {
        if (!seenIds.has(id)) {
          marker.remove();
          markersRef.current.delete(id);
        }
      });

      if (!hasFitBoundsRef.current) {
        const bounds = L.latLngBounds(located.map((s) => [s.lat as number, s.lng as number]));
        map.fitBounds(bounds, { padding: [30, 30], maxZoom: 15 });
        hasFitBoundsRef.current = true;
      }

      setTimeout(() => map.invalidateSize(), 0);
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(located.map((s) => [s.id, s.lat, s.lng]))]);

  useEffect(() => {
    const map = mapRef;
    const markers = markersRef;
    return () => {
      map.current?.remove();
      map.current = null;
      markers.current.clear();
      hasFitBoundsRef.current = false;
    };
  }, []);

  if (shuttles.length === 0) return null;

  return (
    <div className="px-5 py-3 border-t border-border-warm">
      <div className="text-xs font-semibold uppercase tracking-wide text-foreground/50 mb-3">
        Shuttle tracking
      </div>

      {located.length > 0 && (
        <div ref={mapContainerRef} className="w-full h-48 rounded-lg overflow-hidden bg-cream mb-2" />
      )}

      <ul className="flex flex-col gap-1.5">
        {shuttles.map((s) => {
          const live = isLive(s);
          return (
            <li key={s.id} className="flex items-center gap-2 text-sm">
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${live ? "bg-green-500" : "bg-foreground/20"}`}
              />
              <span className="font-medium">{s.label}</span>
              <span className="text-foreground/50 text-xs">
                {s.location_updated_at
                  ? live
                    ? "live"
                    : `last seen ${timeAgo(s.location_updated_at)}`
                  : "not sharing yet"}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
