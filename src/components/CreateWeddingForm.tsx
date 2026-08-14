"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateWeddingForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [weddingDate, setWeddingDate] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/weddings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, weddingDate: weddingDate || null, emergencyPhone: emergencyPhone || null }),
    });
    const data = await res.json();

    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      return;
    }
    router.push(`/dashboard/${data.wedding.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <label htmlFor="new-wedding-title" className="sr-only">Wedding title</label>
      <input
        id="new-wedding-title"
        type="text"
        placeholder="Wedding title (e.g. Alex & Priya's Wedding Weekend)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        className="border border-border-warm rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
      />
      <label htmlFor="new-wedding-date" className="sr-only">Wedding date</label>
      <input
        id="new-wedding-date"
        type="date"
        value={weddingDate}
        onChange={(e) => setWeddingDate(e.target.value)}
        className="border border-border-warm rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
      />
      <label htmlFor="new-emergency-phone" className="sr-only">Emergency / day-of phone number</label>
      <input
        id="new-emergency-phone"
        type="tel"
        placeholder="Emergency / day-of phone number"
        value={emergencyPhone}
        onChange={(e) => setEmergencyPhone(e.target.value)}
        className="border border-border-warm rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
      />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="self-start bg-brand text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-brand-hover transition-colors disabled:opacity-60"
      >
        {loading ? "Creating…" : "Create wedding"}
      </button>
    </form>
  );
}
