import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isOwnerSession } from "@/lib/owners";
import { createSecretClient } from "@/lib/supabase/publico";
import { AdminDashboard, type CriacaoAdmin } from "./dashboard";

// The latest custom prints, with short-lived links to their art (the bucket is private). Needs SUPABASE_SECRET_KEY.
async function carregarCriacoes(): Promise<CriacaoAdmin[] | null> {
  const supabase = createSecretClient();
  if (!supabase) return null;
  const { data, error } = await supabase.from("criacoes_estampa").select("id, criada_em, status, tamanho, painel, ficha, arte_path, pedido, cliente").order("criada_em", { ascending: false }).limit(60);
  if (error || !data) return [];
  const links = await supabase.storage.from("estampas").createSignedUrls(data.map((row) => row.arte_path), 60 * 60);
  const porCaminho = new Map((links.data ?? []).map((link) => [link.path, link.signedUrl]));
  return data.map((row) => ({ ...row, arte_url: porCaminho.get(row.arte_path) ?? null }));
}

export const metadata: Metadata = { title: "Equipe · MERANNO", robots: { index: false, follow: false } };

// Owners only. The proxy already turns everyone else away; this checks again against Supabase itself, since the
// proxy is only a first gate.
export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/conta?next=/admin");
  const { data } = await supabase.auth.getClaims();
  if (!user.email || !user.email_confirmed_at || !isOwnerSession(user.email, data?.claims.amr)) redirect("/conta");
  return <AdminDashboard email={user.email} criacoes={await carregarCriacoes()} />;
}
