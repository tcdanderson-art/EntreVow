"use client";

import { useEffect, useState } from "react";
import { Vendor } from "@/types/vendor";

export default function VendorManager({
  weddingId,
  initialVendors,
}: {
  weddingId: number;
  initialVendors: Vendor[];
}) {
  const [vendors, setVendors] = useState(initialVendors);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [creating, setCreating] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  // Must start "" on both server and client so hydration matches, then fill in after
  // mount — reading window.location.origin during render throws on the server (this
  // exact class of bug was already fixed once elsewhere, see StaffCodeManager).
  const [origin, setOrigin] = useState("");
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOrigin(window.location.origin);
  }, []);

  function vendorLinkFor(code: string) {
    return `${origin}/vendor/${code}`;
  }

  async function addVendor(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !category.trim()) return;
    setCreating(true);
    try {
      const res = await fetch(`/api/weddings/${weddingId}/vendors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), category: category.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setVendors((prev) => [...prev, data.vendor]);
        setName("");
        setCategory("");
      }
    } finally {
      setCreating(false);
    }
  }

  async function removeVendor(vendorId: number) {
    if (!confirm("Remove this vendor? Their check-in link will stop working immediately.")) return;
    setVendors((prev) => prev.filter((v) => v.id !== vendorId));
    await fetch(`/api/weddings/${weddingId}/vendors/${vendorId}`, { method: "DELETE" });
  }

  async function copyLink(vendor: Vendor) {
    await navigator.clipboard.writeText(vendorLinkFor(vendor.vendor_code));
    setCopiedId(vendor.id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-1.5">
        <p className="text-sm text-foreground/80">
          Add each vendor or supplier and send them their own link. They tap &ldquo;I&rsquo;ve
          arrived&rdquo; when they&rsquo;re on site — no app or account needed, and you&rsquo;ll see
          it here instantly.
        </p>
        <button
          onClick={() => setShowHelp((v) => !v)}
          aria-label="How to use this"
          aria-expanded={showHelp}
          className="shrink-0 mt-0.5 w-4 h-4 rounded-full bg-cream border border-border-warm text-[10px] font-bold text-foreground/70 leading-none flex items-center justify-center hover:bg-white"
        >
          ?
        </button>
      </div>

      {showHelp && (
        <ol className="text-sm text-foreground/80 bg-cream border border-border-warm rounded-md px-4 py-3 list-decimal list-inside flex flex-col gap-1">
          <li>Add the vendor&apos;s name and category below, then tap &ldquo;Copy link&rdquo; next to their row.</li>
          <li>Send that link to the vendor ahead of time — text or email works.</li>
          <li>When they arrive on site, they open the link and tap &ldquo;I&rsquo;ve arrived&rdquo; — nothing to install.</li>
          <li>You&apos;ll see their check-in appear here instantly.</li>
        </ol>
      )}

      {vendors.length > 0 && (
        <ul className="flex flex-col gap-2">
          {vendors.map((v) => (
            <li
              key={v.id}
              className="flex items-center justify-between gap-3 flex-wrap border border-border-warm rounded-lg px-4 py-3"
            >
              <div className="min-w-[120px]">
                <div className="font-medium text-sm">{v.name}</div>
                <div className="text-xs text-foreground/75">
                  {v.category} · {v.checked_in_at ? "Checked in" : "Not arrived yet"}
                </div>
              </div>
              <code className="text-xs bg-cream border border-border-warm rounded-md px-3 py-2 flex-1 min-w-[160px] truncate">
                {vendorLinkFor(v.vendor_code)}
              </code>
              <button onClick={() => copyLink(v)} className="text-brand text-sm font-medium whitespace-nowrap">
                {copiedId === v.id ? "Copied!" : "Copy link"}
              </button>
              <button
                onClick={() => removeVendor(v.id)}
                className="text-red-600 text-sm font-medium whitespace-nowrap"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={addVendor} className="flex items-center gap-2 flex-wrap">
        <label htmlFor="vendor-name" className="sr-only">Vendor name</label>
        <input
          id="vendor-name"
          type="text"
          placeholder="Vendor name, e.g. Garden Room Catering"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 min-w-[180px] border border-border-warm rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
        />
        <label htmlFor="vendor-category" className="sr-only">Category</label>
        <input
          id="vendor-category"
          type="text"
          placeholder="Category, e.g. Caterer"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="flex-1 min-w-[140px] border border-border-warm rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
        />
        <button
          type="submit"
          disabled={creating || !name.trim() || !category.trim()}
          className="bg-brand text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-brand-hover transition-colors disabled:opacity-60"
        >
          {creating ? "Adding…" : "Add vendor"}
        </button>
      </form>
    </div>
  );
}
