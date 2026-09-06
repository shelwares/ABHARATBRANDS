import Link from "next/link";
import { login } from "@/lib/actions/auth";
import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const supabase = await getSupabaseServerClient();
  const { data } = await supabase.auth.getUser();

  if (data.user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single();
    if (profile?.role === 'admin') {
      redirect("/admin");
    } else {
      redirect("/dashboard");
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 mt-10">
      <h1 className="text-2xl font-bold mb-4">Sign In</h1>
      {resolvedSearchParams.message && (
        <div className="bg-green-100 text-green-700 p-3 rounded mb-4">
          {resolvedSearchParams.message}
        </div>
      )}
      <form action={login} className="space-y-4">
        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          className="w-full border rounded-lg px-4 py-2"
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          required
          className="w-full border rounded-lg px-4 py-2"
        />
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 rounded-lg"
        >
          Sign In
        </button>
      </form>
      <div className="mt-4 text-sm text-center space-y-2">
        <Link href="/auth/forgot-password" className="text-indigo-600">
          Forgot password?
        </Link>
        <br />
        <Link href="/auth/signup" className="text-indigo-600">
          Don't have an account? Sign up
        </Link>
      </div>
    </div>
  );
}
