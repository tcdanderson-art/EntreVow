"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, displayName }),
    });
    const data = await res.json();

    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      return;
    }
    router.push("/dashboard");
  }

  return (
    <div className="flex-1 flex items-center justify-center bg-cream px-6 py-12">
      <div className="w-full max-w-sm bg-white border border-border-warm rounded-xl p-8 shadow-sm">
        <h1 className="font-display text-2xl mb-1 text-center">Create your Entrevow</h1>
        <p className="text-sm text-foreground/80 text-center mb-6">
          Set up your wedding weekend hub
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label htmlFor="displayName" className="sr-only">Your names</label>
          <input
            id="displayName"
            type="text"
            placeholder="Your names (e.g. Alex & Priya)"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            className="border border-border-warm rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
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
          <label htmlFor="password" className="sr-only">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Password (min. 8 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="border border-border-warm rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="bg-brand text-white rounded-md py-2 text-sm font-medium hover:bg-brand-hover transition-colors disabled:opacity-60"
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="text-xs text-foreground/75 text-center mt-4">
          By creating an account you agree to our{" "}
          <Link href="/terms" className="text-brand font-medium">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-brand font-medium">
            Privacy Policy
          </Link>
          .
        </p>

        <p className="text-sm text-foreground/80 text-center mt-4">
          Already have an account?{" "}
          <Link href="/login" className="text-brand font-medium">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
