"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const check = async () => {
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setSessionReady(true);
      } else {
        setTimeout(async () => {
          const { data: { session: s2 } } = await supabase.auth.getSession();
          if (s2) {
            setSessionReady(true);
          } else {
            setSessionError("Invalid or expired reset link. Please request a new one.");
          }
        }, 1500);
      }
    };
    check();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (!/[A-Z]/.test(password)) {
      setError("Password must contain at least 1 uppercase letter");
      return;
    }
    if (!/[0-9]/.test(password)) {
      setError("Password must contain at least 1 number");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    const supabase = getSupabaseClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    await supabase.auth.signOut();
    setSuccess(true);
    setLoading(false);

    setTimeout(() => {
      router.push(
        "/auth/login?message=Password updated! Please sign in with your new password."
      );
    }, 2000);
  };

  if (sessionError) {
    return (
      <div className="max-w-md mx-auto p-6 mt-10">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h1 className="text-xl font-bold text-red-800 mb-2">⚠️ Reset Link Invalid</h1>
          <p className="text-red-700 text-sm mb-4">{sessionError}</p>
          <Link
            href="/auth/forgot-password"
            className="inline-block bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700"
          >
            Request New Reset Link
          </Link>
        </div>
      </div>
    );
  }

  if (!sessionReady) {
    return (
      <div className="max-w-md mx-auto p-6 mt-10 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-slate-500">Verifying reset link...</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto p-6 mt-10 text-center">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h1 className="text-xl font-bold text-green-800 mb-2">✅ Password Updated!</h1>
          <p className="text-green-700 text-sm">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 mt-10">
      <h1 className="text-2xl font-bold mb-2">Set New Password</h1>
      <p className="text-slate-500 text-sm mb-6">
        Choose a strong password for your account.
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            New Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="w-full border border-slate-300 rounded-lg px-4 py-2"
            placeholder="Min 8 chars, 1 uppercase, 1 number"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Confirm New Password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
            className="w-full border border-slate-300 rounded-lg px-4 py-2"
            placeholder="Re-enter your new password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "Updating..." : "Update Password"}
        </button>
      </form>

      <div className="mt-4 text-sm text-center">
        <Link href="/auth/login" className="text-indigo-600">
          Back to login
        </Link>
      </div>
    </div>
  );
}
