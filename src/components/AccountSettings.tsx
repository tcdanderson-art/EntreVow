"use client";

import { useState } from "react";
import { Couple } from "@/types/couple";

export default function AccountSettings({ couple }: { couple: Couple }) {
  const [displayName, setDisplayName] = useState(couple.display_name);
  const [email, setEmail] = useState(couple.email);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ text: string; error?: boolean } | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ text: string; error?: boolean } | null>(null);

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    setProfileMessage(null);
    setProfileSaving(true);

    const res = await fetch("/api/account", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName, email }),
    });
    const data = await res.json();

    setProfileSaving(false);
    setProfileMessage(
      res.ok ? { text: "Profile updated." } : { text: data.error ?? "Something went wrong", error: true }
    );
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPasswordMessage(null);

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ text: "New passwords don't match", error: true });
      return;
    }

    setPasswordSaving(true);
    const res = await fetch("/api/account/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json();

    setPasswordSaving(false);
    if (res.ok) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordMessage({ text: "Password updated." });
    } else {
      setPasswordMessage({ text: data.error ?? "Something went wrong", error: true });
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <section className="bg-white border border-border-warm rounded-xl p-6">
        <h2 className="font-semibold mb-4">Profile</h2>
        <form onSubmit={handleProfileSubmit} className="flex flex-col gap-3 max-w-sm">
          <label className="flex flex-col gap-1 text-sm">
            Name
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              className="border border-border-warm rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border border-border-warm rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
            />
          </label>
          {profileMessage && (
            <p className={`text-sm ${profileMessage.error ? "text-red-600" : "text-brand"}`}>
              {profileMessage.text}
            </p>
          )}
          <button
            type="submit"
            disabled={profileSaving}
            className="self-start bg-brand text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-brand-hover transition-colors disabled:opacity-60"
          >
            {profileSaving ? "Saving…" : "Save profile"}
          </button>
        </form>
      </section>

      <section className="bg-white border border-border-warm rounded-xl p-6">
        <h2 className="font-semibold mb-4">Change password</h2>
        <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-3 max-w-sm">
          <input
            type="password"
            placeholder="Current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            className="border border-border-warm rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
          <input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={8}
            className="border border-border-warm rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
            className="border border-border-warm rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
          {passwordMessage && (
            <p className={`text-sm ${passwordMessage.error ? "text-red-600" : "text-brand"}`}>
              {passwordMessage.text}
            </p>
          )}
          <button
            type="submit"
            disabled={passwordSaving}
            className="self-start bg-brand text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-brand-hover transition-colors disabled:opacity-60"
          >
            {passwordSaving ? "Saving…" : "Update password"}
          </button>
        </form>
      </section>
    </div>
  );
}
