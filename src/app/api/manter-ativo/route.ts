import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Called once a day by the Vercel cron in vercel.json. On the free plan Supabase pauses a project after a week of
// little database use (its docs ask for "a few requests a day"), which would take sign-in down — so three calls.
// public.manter_ativo() only returns the time:
//   create or replace function public.manter_ativo() returns timestamptz language sql stable security invoker
//     set search_path = '' as $$ select now() $$;
//   revoke all on function public.manter_ativo() from public;
//   grant execute on function public.manter_ativo() to anon, authenticated;
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    auth: { persistSession: false },
  });
  for (let call = 0; call < 3; call++) {
    const { error } = await supabase.rpc("manter_ativo");
    if (error) {
      console.error("manter-ativo:", error.message);
      return NextResponse.json({ ok: false }, { status: 500 });
    }
  }
  return NextResponse.json({ ok: true, at: new Date().toISOString() });
}
