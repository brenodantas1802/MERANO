import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

// Supabase on the server (pages, route handlers, server actions), reading the session from the request cookies.
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Pages can't set cookies; the proxy refreshes the session on the routes that read it.
        }
      },
    },
  });
}
