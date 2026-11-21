import { createClient } from "@/lib/supabase/server";
import { createSecretClient } from "@/lib/supabase/publico";
import { isOwnerSession } from "@/lib/owners";

// The owner check for the panel's server actions. A server action is a public endpoint, so the page check alone
// doesn't protect it: each action calls this again. Kept out of the "use server" files so it isn't an action itself.
export async function dono() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data } = await supabase.auth.getClaims();
  if (!user?.email || !user.email_confirmed_at || !isOwnerSession(user.email, data?.claims.amr)) return null;
  const admin = createSecretClient();
  return admin ? { admin, email: user.email } : null;
}
