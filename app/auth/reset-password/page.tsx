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
  const [sessionValid, setSessionValid] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Verify user has a valid session (from email link)
    const checkSession = async () => {
      const supabase = getSupabaseClient();
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        setSessionValid(false);
      } else {
        setSessionValid(true);
      }
    };
    checkSession();
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
    const { error: updateError } = await supabase.auth.updateUser({
      password: password,
    });
    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    // Sign out so user must log in with new password
    await supabase.auth.signOut();

    setSuccess(true);
    setTimeout(() => {
      router.push("/auth/login?message=Password updated! Please login with your new password.");
    }, 2000);
  };

  if (sessionValid === null) {
    return (
      <div className="max-w-md mx-auto p-6 mt-10 text-center">
        <p className="text-slate-500">Verifying session...</p>
      </div>
    );
  }

  if (sessionValid === false) {
    return (
      <div className="max-w-md mx-auto p-6 mt-10">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h1 className="text-xl font-bold text-red-800 mb-2">
            ❌ Invalid or expired link
          </h1>
          <p className="text-red-700 text-sm mb-4">
            This password reset link is invalid or has expired. Please request a new one.
          </p>
          <Link
            href="/auth/forgot-password"
            className="inline-block bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            Request New Link
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto p-6 mt-10 text-center">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h1 className="text-xl font-bold text-green-800 mb-2">
            ✅ Password updated!
          </h1>
          <p className="text-green-700 text-sm">
            Redirecting to login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 mt-10">
      <h1 className="text-2xl font-bold mb-2">Set New Password</h1>
      <p className="text-slate-500 text-sm mb-6">
        Enter a strong password for your account.
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
            placeholder="At least 8 chars, 1 uppercase, 1 number"
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
            placeholder="Re-enter password"
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
