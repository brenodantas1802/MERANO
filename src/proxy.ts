import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { isOwner } from "@/lib/owners";

// On the routes that read the session: keeps the Supabase session fresh (rotating its cookies, which pages can't do)
// and turns away anyone who isn't an owner before /admin renders. The admin page checks again on the server.
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
      },
    },
  });
  const { data } = await supabase.auth.getClaims();

  if (request.nextUrl.pathname.startsWith("/admin")) {
    const email = data?.claims.email;
    if (!email || !isOwner(email)) {
      const redirect = NextResponse.redirect(new URL(email ? "/conta" : "/conta?next=/admin", request.url));
      response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
      return redirect;
    }
  }
  return response;
}

export const config = { matcher: ["/admin/:path*", "/conta"] };
