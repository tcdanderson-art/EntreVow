"use client";

import { useState } from "react";

export default function ExportDataButton({
  weddingId,
  weddingTitle,
}: {
  weddingId: number;
  weddingTitle: string;
}) {
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    setExporting(true);
    const res = await fetch(`/api/weddings/${weddingId}/export`);
    setExporting(false);
    if (!res.ok) return;

    const data = await res.json();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${weddingTitle.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-export.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      onClick={handleExport}
      disabled={exporting}
      className="text-sm font-medium text-brand disabled:opacity-60"
    >
      {exporting ? "Exporting…" : "Export all wedding data (JSON)"}
    </button>
  );
}
