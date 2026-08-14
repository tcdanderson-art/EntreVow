"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import jsQR from "jsqr";
import { Guest } from "@/types/guest";

type Feedback = {
  kind: "success" | "already" | "error";
  message: string;
};

const RESCAN_COOLDOWN_MS = 3000;

export default function StaffScanner({
  staffCode,
  weddingTitle,
  initialGuests,
}: {
  staffCode: string;
  weddingTitle: string;
  initialGuests: Guest[];
}) {
  const [guests, setGuests] = useState(initialGuests);
  const [mode, setMode] = useState<"scan" | "search">("scan");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [query, setQuery] = useState("");
  const [pendingCode, setPendingCode] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastScanRef = useRef<{ code: string; at: number } | null>(null);

  const checkedInCount = guests.filter((g) => g.checked_in_at).length;

  const submitCheckin = useCallback(
    async (guestCode: string) => {
      setPendingCode(guestCode);
      try {
        const res = await fetch(`/api/staff/${staffCode}/checkin`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ guestCode }),
        });
        const data = await res.json();

        if (!res.ok) {
          setFeedback({ kind: "error", message: data.error ?? "Not on this guest list" });
          return;
        }

        setGuests((prev) => prev.map((g) => (g.id === data.guest.id ? data.guest : g)));
        setFeedback(
          data.alreadyCheckedIn
            ? { kind: "already", message: `${data.guest.name} already checked in` }
            : { kind: "success", message: `${data.guest.name} checked in${data.guest.table_label ? ` — ${data.guest.table_label}` : ""}` }
        );
      } catch {
        setFeedback({ kind: "error", message: "Network error — try again" });
      } finally {
        setPendingCode(null);
      }
    },
    [staffCode]
  );

  useEffect(() => {
    if (!feedback) return;
    const t = setTimeout(() => setFeedback(null), 3000);
    return () => clearTimeout(t);
  }, [feedback]);

  useEffect(() => {
    if (mode !== "scan") return;

    let cancelled = false;

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setCameraError(null);
        tick();
      } catch {
        setCameraError("Camera access denied. Use search instead.");
        setMode("search");
      }
    }

    function tick() {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
        const scale = Math.min(1, 480 / video.videoWidth);
        canvas.width = video.videoWidth * scale;
        canvas.height = video.videoHeight * scale;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code?.data) {
            const match = code.data.match(/\/g\/([^/?#]+)/);
            const guestCode = match?.[1];
            const now = Date.now();
            const last = lastScanRef.current;
            if (guestCode && (!last || last.code !== guestCode || now - last.at > RESCAN_COOLDOWN_MS)) {
              lastScanRef.current = { code: guestCode, at: now };
              submitCheckin(guestCode);
            }
          }
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    }

    start();

    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [mode, submitCheckin]);

  const filteredGuests = guests.filter((g) =>
    g.name.toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col bg-foreground text-white min-h-dvh pb-[env(safe-area-inset-bottom)]">
      <div className="px-4 pt-5 pb-3 text-center border-b border-white/10">
        <h1 className="font-display text-lg">{weddingTitle}</h1>
        <p className="text-sm text-white/60 mt-0.5">
          {checkedInCount} / {guests.length} checked in
        </p>
      </div>

      <div className="flex border-b border-white/10">
        <button
          onClick={() => setMode("scan")}
          className={`flex-1 py-3 text-sm font-medium touch-manipulation ${mode === "scan" ? "text-brand border-b-2 border-brand" : "text-white/75"}`}
        >
          Scan pass
        </button>
        <button
          onClick={() => setMode("search")}
          className={`flex-1 py-3 text-sm font-medium touch-manipulation ${mode === "search" ? "text-brand border-b-2 border-brand" : "text-white/75"}`}
        >
          Search list
        </button>
      </div>

      {mode === "scan" ? (
        <div className="relative flex-1 flex items-center justify-center bg-black [-webkit-touch-callout:none] select-none">
          <video ref={videoRef} playsInline muted className="w-full max-h-[70vh] object-cover pointer-events-none" />
          <canvas ref={canvasRef} className="hidden" />
          <div className="absolute inset-6 border-2 border-white/40 rounded-2xl pointer-events-none" />
          {cameraError && (
            <p className="absolute bottom-4 left-4 right-4 text-center text-sm text-white/70">
              {cameraError}
            </p>
          )}
        </div>
      ) : (
        <div className="flex-1 flex flex-col px-4 py-4 gap-3 overflow-y-auto">
          <label htmlFor="staff-guest-search" className="sr-only">Search guest name</label>
          <input
            id="staff-guest-search"
            type="text"
            placeholder="Search guest name…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="border border-white/20 bg-white/5 rounded-lg px-4 py-3 text-base text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-brand/50"
          />
          <ul className="flex flex-col gap-2">
            {filteredGuests.map((g) => (
              <li
                key={g.id}
                className="flex items-center justify-between gap-3 border border-white/10 rounded-lg px-4 py-3"
              >
                <div>
                  <div className="font-medium text-sm">{g.name}</div>
                  <div className="text-xs text-white/75">
                    {g.guest_group}
                    {g.table_label ? ` · ${g.table_label}` : ""}
                  </div>
                </div>
                {g.checked_in_at ? (
                  <span className="text-xs font-semibold text-brand shrink-0">✓ Checked in</span>
                ) : (
                  <button
                    onClick={() => submitCheckin(g.access_code)}
                    disabled={pendingCode === g.access_code}
                    className="bg-brand text-white text-sm font-medium rounded-md px-4 py-2 shrink-0 touch-manipulation disabled:opacity-60"
                  >
                    {pendingCode === g.access_code ? "…" : "Check in"}
                  </button>
                )}
              </li>
            ))}
            {filteredGuests.length === 0 && (
              <li className="text-sm text-white/70 text-center py-6">No guests match.</li>
            )}
          </ul>
        </div>
      )}

      {feedback && (
        <div
          className={`px-4 py-4 text-center font-medium text-sm ${
            feedback.kind === "success"
              ? "bg-brand text-white"
              : feedback.kind === "already"
                ? "bg-amber-600 text-white"
                : "bg-red-600 text-white"
          }`}
        >
          {feedback.kind === "success" ? "✓ " : feedback.kind === "already" ? "· " : "✕ "}
          {feedback.message}
        </div>
      )}
    </div>
  );
}
