import { isOwner, viaGoogle, type Amr } from "@/lib/owners";
import { createSecretClient } from "@/lib/supabase/publico";

// Who may use the owners' panel: the fixed owners (OWNER_EMAILS) and whoever an owner made an administrator in the
// panel (table administradores). Always signed in through Google in this session: Google has checked the address is
// theirs, so an account made with an admin's e-mail and a password never gets in. Server only.
export async function ehAdmin(email?: string | null, amr?: readonly Amr[] | null) {
  if (!email || !viaGoogle(amr)) return false;
  if (isOwner(email)) return true;
  const db = createSecretClient();
  if (!db) return false;
  const { data } = await db.from("administradores").select("email").eq("email", email.trim().toLowerCase()).maybeSingle();
  return !!data;
}

// The fixed owners, for the panel's list.
export const donosFixos = () => (process.env.OWNER_EMAILS ?? "").split(",").map((email) => email.trim().toLowerCase()).filter(Boolean);
