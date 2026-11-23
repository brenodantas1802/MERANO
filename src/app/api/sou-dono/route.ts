import { NextResponse } from "next/server";
import { ehAdmin } from "@/lib/admins";
import { createClient } from "@/lib/supabase/server";

// Answers only "is the person signed in here an owner?", for the "Painel da equipe" item in the top menu. It never
// sends the owners' list, and /admin checks again on its own: a customer gets false and the panel stays closed.
export async function GET() {
  const naoGuardar = { "Cache-Control": "private, no-store" };
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email || !user.email_confirmed_at) return NextResponse.json({ dono: false }, { headers: naoGuardar });
  const { data } = await supabase.auth.getClaims();
  return NextResponse.json({ dono: await ehAdmin(user.email, data?.claims.amr) }, { headers: naoGuardar });
}
