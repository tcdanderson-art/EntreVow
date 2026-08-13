"use client";

import { useEffect, useRef, useState } from "react";

const MAX_SECONDS = 30;

// iOS Safari can't play back video/webm, and Chrome/Android mostly won't record
// video/mp4 — preferring mp4 first means the common "recorded on iPhone" path
// plays everywhere, even though there's no way to guarantee playback both ways
// without a transcoding pipeline (out of scope here).
const CANDIDATE_MIME_TYPES = ["video/mp4", "video/webm;codecs=vp9,opus", "video/webm"];

function pickMimeType(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  return CANDIDATE_MIME_TYPES.find((type) => MediaRecorder.isTypeSupported(type));
}

type Phase = "requesting" | "recording" | "preview" | "error";

export default function VideoRecorder({
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
  const liveVideoRef = useRef<HTMLVideoElement>(null);
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
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (liveVideoRef.current) liveVideoRef.current.srcObject = stream;

        const mimeType = pickMimeType();
        const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
        recorderRef.current = recorder;
        chunksRef.current = [];

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunksRef.current.push(e.data);
        };
        recorder.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "video/webm" });
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
        <p className="text-sm text-foreground/60 mb-2">
          Camera and microphone access is needed to record a message.
        </p>
        <button onClick={onCancel} className="text-sm font-medium text-brand">
          Cancel
        </button>
      </div>
    );
  }

  if (phase === "preview" && previewUrl) {
    return (
      <div className="rounded-md overflow-hidden bg-black">
        <video src={previewUrl} controls playsInline className="w-full aspect-video" />
        <div className="flex items-center justify-between gap-2 p-2 bg-cream">
          <button onClick={onRetake} disabled={submitting} className="text-sm font-medium text-foreground/60">
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
    <div className="rounded-md overflow-hidden bg-black relative">
      <video ref={liveVideoRef} autoPlay muted playsInline className="w-full aspect-video object-cover" />
      {phase === "recording" && (
        <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-black/60 text-white text-xs font-semibold rounded-full px-2.5 py-1">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          {secondsLeft}s
        </div>
      )}
      <div className="flex items-center justify-between gap-2 p-2 bg-cream">
        <button onClick={onCancel} className="text-sm font-medium text-foreground/60">
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
