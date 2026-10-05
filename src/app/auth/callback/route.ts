import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Google sends the customer back here with a one-time code; trading it for a session signs them in.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/conta";
  // Only paths on this site, never another domain.
  const destination = next.startsWith("/") && !next.startsWith("//") ? next : "/conta";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${destination}`);
  }
  return NextResponse.redirect(`${origin}/conta?erro=${searchParams.get("error") === "access_denied" ? "cancelado" : "login"}`);
}
