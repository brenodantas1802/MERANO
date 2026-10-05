import { createBrowserClient } from "@supabase/ssr";

// Supabase in the browser: starts the Google sign-in and signs out. The session lives in cookies the server reads too.
export const createClient = () => createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!);
