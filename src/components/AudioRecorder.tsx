"use client";

import { useEffect, useRef, useState } from "react";

const MAX_SECONDS = 30;

// Mirrors VideoRecorder's mime-type reasoning: prefer audio/mp4 first since
// that's what Safari/iOS records, falling back to webm/opus for Chrome/Android.
const CANDIDATE_MIME_TYPES = ["audio/mp4", "audio/webm;codecs=opus", "audio/webm"];

function pickMimeType(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  return CANDIDATE_MIME_TYPES.find((type) => MediaRecorder.isTypeSupported(type));
}

type Phase = "requesting" | "recording" | "preview" | "error";

export default function AudioRecorder({
  onSubmit,
  onRetake,
  onCancel,
  submitting,
}: {
  onSubmit: (blob: Blob, durationSeconds: number) => void;
  onRetake: () => void;
  onCancel: () => void;
  submitting: boolean;
}) {
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const stopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startedAtRef = useRef(0);

  const [phase, setPhase] = useState<Phase>("requesting");
  const [secondsLeft, setSecondsLeft] = useState(MAX_SECONDS);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;

        const mimeType = pickMimeType();
        const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
        recorderRef.current = recorder;
        chunksRef.current = [];

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunksRef.current.push(e.data);
        };
        recorder.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
          const elapsed = Math.min(MAX_SECONDS, Math.round((Date.now() - startedAtRef.current) / 1000));
          setRecordedBlob(blob);
          setDuration(elapsed);
          setPreviewUrl(URL.createObjectURL(blob));
          setPhase("preview");
          stream.getTracks().forEach((t) => t.stop());
        };

        startedAtRef.current = Date.now();
        recorder.start();
        setPhase("recording");
        setSecondsLeft(MAX_SECONDS);

        stopTimerRef.current = setTimeout(() => {
          if (recorder.state === "recording") recorder.stop();
        }, MAX_SECONDS * 1000);
      } catch {
        if (!cancelled) setPhase("error");
      }
    }

    start();

    return () => {
      cancelled = true;
      if (stopTimerRef.current) clearTimeout(stopTimerRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  useEffect(() => {
    if (phase !== "recording") return;
    const interval = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(interval);
  }, [phase]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function handleStopEarly() {
    if (stopTimerRef.current) clearTimeout(stopTimerRef.current);
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
  }

  if (phase === "error") {
    return (
      <div className="rounded-md bg-cream border border-border-warm p-4 text-center">
        <p className="text-sm text-foreground/80 mb-2">Microphone access is needed to record a message.</p>
        <button onClick={onCancel} className="text-sm font-medium text-brand">
          Cancel
        </button>
      </div>
    );
  }

  if (phase === "preview" && previewUrl) {
    return (
      <div className="rounded-md overflow-hidden bg-cream border border-border-warm">
        <div className="p-4">
          <audio src={previewUrl} controls className="w-full" />
        </div>
        <div className="flex items-center justify-between gap-2 p-2 border-t border-border-warm">
          <button onClick={onRetake} disabled={submitting} className="text-sm font-medium text-foreground/80">
            Retake
          </button>
          <button
            onClick={() => recordedBlob && onSubmit(recordedBlob, duration)}
            disabled={submitting}
            className="text-sm font-semibold text-brand"
          >
            {submitting ? "Sending…" : "Send"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md overflow-hidden bg-cream border border-border-warm">
      <div className="flex flex-col items-center justify-center gap-3 py-8">
        {phase === "recording" ? (
          <div className="flex items-center gap-1.5 bg-black/80 text-white text-xs font-semibold rounded-full px-2.5 py-1">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            {secondsLeft}s
          </div>
        ) : (
          <p className="text-sm text-foreground/70">Getting ready…</p>
        )}
      </div>
      <div className="flex items-center justify-between gap-2 p-2 border-t border-border-warm">
        <button onClick={onCancel} className="text-sm font-medium text-foreground/80">
          Cancel
        </button>
        {phase === "recording" && (
          <button onClick={handleStopEarly} className="text-sm font-semibold text-brand">
            Stop
          </button>
        )}
      </div>
    </div>
  );
}
