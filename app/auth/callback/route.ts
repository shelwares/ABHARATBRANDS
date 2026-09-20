import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");
  const type = searchParams.get("type");

  if (code) {
    const supabase = await getSupabaseServerClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // For password recovery, always go to reset-password
      if (type === "recovery" || next === "/auth/reset-password") {
        return NextResponse.redirect(`${origin}/auth/reset-password`);
      }

      // If explicit next param exists, honor it
      if (next && next !== "/") {
        return NextResponse.redirect(`${origin}${next}`);
      }

      // Otherwise, redirect based on role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .maybeSingle();

      const redirectTo = profile?.role === 'admin' ? '/admin' : '/dashboard';
      return NextResponse.redirect(`${origin}${redirectTo}`);
    }
  }

  return NextResponse.redirect(
    `${origin}/auth/login?message=Unable to verify email`
  );
}
