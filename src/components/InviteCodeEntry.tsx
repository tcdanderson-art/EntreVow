"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Lets someone who was emailed a code type it in instead of needing the exact link.
export default function InviteCodeEntry() {
  const router = useRouter();
  const [code, setCode] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const trimmed = code.trim();
        if (trimmed) router.push(`/signup?invite=${encodeURIComponent(trimmed)}`);
      }}
      className="flex gap-2 mt-5"
    >
      <label htmlFor="inviteCode" className="sr-only">Founding couples code</label>
      <input
        id="inviteCode"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Your code"
        autoCapitalize="characters"
        autoComplete="off"
        className="flex-1 min-w-0 border border-border-warm rounded-md px-3 py-2 text-base uppercase focus:outline-none focus:ring-2 focus:ring-brand/30"
      />
      <button
        type="submit"
        disabled={!code.trim()}
        className="shrink-0 text-sm font-medium bg-brand text-white rounded-md px-4 py-2 disabled:opacity-60"
      >
        Continue
      </button>
    </form>
  );
}
