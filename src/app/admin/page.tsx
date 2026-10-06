import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isOwnerSession } from "@/lib/owners";
import { AdminDashboard } from "./dashboard";

export const metadata: Metadata = { title: "Equipe · MERANO", robots: { index: false, follow: false } };

// Owners only. The proxy already turns everyone else away; this checks again against Supabase itself, since the
// proxy is only a first gate.
export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/conta?next=/admin");
  const { data } = await supabase.auth.getClaims();
  if (!user.email || !user.email_confirmed_at || !isOwnerSession(user.email, data?.claims.amr)) redirect("/conta");
  return <AdminDashboard email={user.email} />;
}
