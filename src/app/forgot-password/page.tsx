"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    setLoading(false);
    setSent(true);
  }

  return (
    <div className="flex-1 flex items-center justify-center bg-cream px-6 py-12">
      <div className="w-full max-w-sm bg-white border border-border-warm rounded-xl p-8 shadow-sm">
        <h1 className="font-display text-2xl mb-1 text-center">Reset your password</h1>
        <p className="text-sm text-foreground/80 text-center mb-6">
          Enter your email and we&apos;ll send you a reset link.
        </p>

        {sent ? (
          <p className="text-sm text-foreground/70 text-center">
            If an account exists for {email}, a reset link is on its way. Check your inbox.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label htmlFor="email" className="sr-only">Email</label>
            <input
              id="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border border-border-warm rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-brand text-white rounded-md py-2 text-sm font-medium hover:bg-brand-hover transition-colors disabled:opacity-60"
            >
              {loading ? "Sending…" : "Send reset link"}
            </button>
          </form>
        )}

        <p className="text-sm text-foreground/80 text-center mt-6">
          <Link href="/login" className="text-brand font-medium">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
