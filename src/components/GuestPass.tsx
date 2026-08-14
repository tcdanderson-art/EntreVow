"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";

export default function GuestPass({ guestName }: { guestName: string }) {
  const [open, setOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!open || !canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, window.location.href, {
      width: 160,
      margin: 1,
      color: { dark: "#2c3a46", light: "#00000000" },
    });
  }, [open]);

  return (
    <div className="mx-5 mt-4">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full text-sm font-medium text-brand border border-dashed border-brand/40 rounded-lg py-2"
      >
        {open ? "Hide digital pass" : "Show my digital pass"}
      </button>

      {open && (
        <div className="mt-2 bg-white border border-border-warm rounded-lg p-4 flex flex-col items-center gap-2">
          <canvas ref={canvasRef} />
          <p className="font-semibold text-sm">{guestName}</p>
          <p className="text-xs text-foreground/75">Show this at the venue if asked</p>
        </div>
      )}
    </div>
  );
}
