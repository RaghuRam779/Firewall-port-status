"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldCheckIcon } from "@heroicons/react/24/outline";
import { api } from "@/services/api";

export default function ResetPasswordPage() {
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setToken(new URLSearchParams(window.location.search).get("token") ?? "");
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setSubmitting(true);
    try {
      const { data } = await api.post("/auth/reset-password", { token, password });
      setMessage(data.message ?? "Password updated. You can now log in.");
      setPassword("");
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Unable to reset password. Please request a new link.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-primary px-6">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center">
          <ShieldCheckIcon className="mb-3 h-10 w-10 text-accent" />
          <h1 className="text-2xl font-bold text-white">Choose a new password</h1>
          <p className="mt-1 text-center text-sm text-slate-400">Use the reset token from your email.</p>
        </div>
        <form onSubmit={handleSubmit} className="glass-card space-y-4 p-8">
          {error && <div className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">{error}</div>}
          {message && <div className="rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">{message}</div>}
          <div>
            <label className="label">Reset token</label>
            <input required className="input-field" value={token} onChange={(e) => setToken(e.target.value)} />
          </div>
          <div>
            <label className="label">New password</label>
            <input
              type="password"
              required
              minLength={8}
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
            />
          </div>
          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? "Updating..." : "Update Password"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-400">
          <Link href="/login" className="text-accent hover:underline">Back to login</Link>
        </p>
      </div>
    </main>
  );
}