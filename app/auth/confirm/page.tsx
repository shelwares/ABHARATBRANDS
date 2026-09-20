"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function ConfirmPage() {
  const [status, setStatus] = useState<"loading" | "error">("loading");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const verify = async () => {
      const token_hash = searchParams.get("token_hash");
      const type = searchParams.get("type") as "recovery" | null;
      const next = searchParams.get("next") || "/auth/reset-password";

      // If no token_hash is present, immediately show an error.
      // This prevents the page from redirecting if a session already exists.
      if (!token_hash || !type) {
        setError("Invalid or missing reset token. Please request a new link.");
        setStatus("error");
        return;
      }

      const supabase = getSupabaseClient();
      const { error: verifyError } = await supabase.auth.verifyOtp({
        token_hash,
        type,
      });

      if (verifyError) {
        setError(verifyError.message);
        setStatus("error");
        return;
      }

      // On successful verification, redirect to the password reset page.
      router.replace(next);
    };

    verify();
  }, [router, searchParams]);

  if (status === "error") {
    return (
      <div className="max-w-md mx-auto p-6 mt-10 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h1 className="text-xl font-bold text-red-800 mb-2">⚠️ Link Invalid or Expired</h1>
          <p className="text-red-700 text-sm mb-4">{error}</p>
          <Link
            href="/auth/forgot-password"
            className="inline-block bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700"
          >
            Request a New Link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 mt-10 text-center">
      <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
      <p className="text-slate-500">Verifying your reset link...</p>
    </div>
  );
}
