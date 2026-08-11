"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Wedding } from "@/types/wedding";

function toDateInputValue(value: string | Date | null) {
  if (!value) return "";
  if (value instanceof Date) {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${value.getUTCFullYear()}-${pad(value.getUTCMonth() + 1)}-${pad(value.getUTCDate())}`;
  }
  return value.slice(0, 10);
}

export default function WeddingHeader({ wedding }: { wedding: Wedding }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(wedding.title);
  const [weddingDate, setWeddingDate] = useState(toDateInputValue(wedding.wedding_date));
  const [emergencyPhone, setEmergencyPhone] = useState(wedding.emergency_phone ?? "");
  const [slug, setSlug] = useState(wedding.slug ?? "");
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  async function copyBrandedLink() {
    if (!wedding.slug) return;
    await navigator.clipboard.writeText(`https://${wedding.slug}.entrevow.com`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const res = await fetch(`/api/weddings/${wedding.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        weddingDate: weddingDate || null,
        emergencyPhone: emergencyPhone || null,
        slug: slug || null,
      }),
    });

    setSaving(false);
    if (res.ok) {
      setEditing(false);
      router.refresh();
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete "${wedding.title}"? This removes all its guests and itinerary too.`)) return;

    const res = await fetch(`/api/weddings/${wedding.id}`, { method: "DELETE" });
    if (res.ok) router.push("/dashboard");
  }

  if (editing) {
    return (
      <form
        onSubmit={handleSave}
        className="bg-white border border-border-warm rounded-xl p-6 flex flex-col gap-3"
      >
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="border border-border-warm rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
        />
        <input
          type="date"
          value={weddingDate}
          onChange={(e) => setWeddingDate(e.target.value)}
          className="border border-border-warm rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
        />
        <input
          type="tel"
          placeholder="Emergency / day-of phone number"
          value={emergencyPhone}
          onChange={(e) => setEmergencyPhone(e.target.value)}
          className="border border-border-warm rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
        />
        <div>
          <label className="flex items-center border border-border-warm rounded-md overflow-hidden text-sm focus-within:ring-2 focus-within:ring-brand/30">
            <span className="pl-3 text-foreground/40 whitespace-nowrap">https://</span>
            <input
              type="text"
              placeholder="alexandpriya"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="flex-1 min-w-0 px-1 py-2 focus:outline-none"
            />
            <span className="pr-3 text-foreground/40 whitespace-nowrap">.entrevow.com</span>
          </label>
          <p className="text-xs text-foreground/40 mt-1">
            A memorable link for your guests. Leave blank to skip.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="bg-brand text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-brand-hover transition-colors disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save"}
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="text-foreground/60 text-sm font-medium"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="text-red-600 text-sm font-medium ml-auto"
          >
            Delete wedding
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <h1 className="font-display text-3xl">{wedding.title}</h1>
        {wedding.slug && (
          <button
            onClick={copyBrandedLink}
            className="text-sm text-brand font-medium mt-1"
          >
            {copied ? "Copied!" : `${wedding.slug}.entrevow.com`}
          </button>
        )}
      </div>
      <button
        onClick={() => setEditing(true)}
        className="text-brand text-sm font-medium whitespace-nowrap"
      >
        Edit details
      </button>
    </div>
  );
}
