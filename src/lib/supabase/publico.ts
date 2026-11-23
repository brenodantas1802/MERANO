import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Supabase with the public key and no session. The database is closed to this key (RLS, no grants): only the
// keep-alive function answers it. Everything else goes through createSecretClient on the server.
export function createPublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  return createSupabaseClient(url, key, { auth: { persistSession: false } });
}

// Supabase with the secret key, bypassing RLS. Only for the owners' panel, after it has checked the owner's session.
export function createSecretClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) return null;
  return createSupabaseClient(url, key, { auth: { persistSession: false } });
}
