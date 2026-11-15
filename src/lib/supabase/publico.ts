import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Supabase with the public key and no session, for route handlers that only call the narrow public functions
// (registrar_criacao, marcar_criacoes_pedidas) and upload into the "estampas" bucket.
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
