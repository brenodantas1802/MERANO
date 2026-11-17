"use server";

import { refresh } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createSecretClient } from "@/lib/supabase/publico";
import { isOwnerSession } from "@/lib/owners";
import { gerarCodigo } from "@/lib/pre-venda";

// Pre-sale invites, created and switched off from the owners' panel. Every action checks the owner again: a server
// action is a public endpoint, the page check alone doesn't protect it.
async function dono() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data } = await supabase.auth.getClaims();
  if (!user?.email || !user.email_confirmed_at || !isOwnerSession(user.email, data?.claims.amr)) return null;
  const admin = createSecretClient();
  return admin ? { admin, email: user.email } : null;
}

export async function criarConvite(_erroAnterior: string | null, form: FormData): Promise<string | null> {
  const nome = String(form.get("nome") ?? "").trim().slice(0, 80);
  const limiteTexto = String(form.get("limite") ?? "").trim();
  const limite = limiteTexto ? Number(limiteTexto) : null;
  if (!nome) return "Dê um nome ao convite, por exemplo: Grupo do WhatsApp.";
  if (limite !== null && (!Number.isInteger(limite) || limite < 1 || limite > 100000)) return "O limite precisa ser um número inteiro a partir de 1.";
  const sessao = await dono();
  if (!sessao) return "Só os donos, entrando com o Google, podem criar convites.";
  const { error } = await sessao.admin.from("convites_pre_venda").insert({ codigo: gerarCodigo(), nome, limite, criado_por: sessao.email });
  if (error) {
    console.error("criarConvite failed:", error.message);
    return "Não consegui criar o convite. Tente de novo.";
  }
  refresh();
  return null;
}

export async function alternarConvite(id: string, ativo: boolean) {
  const sessao = await dono();
  if (!sessao) return;
  const { error } = await sessao.admin.from("convites_pre_venda").update({ ativo }).eq("id", id);
  if (error) console.error("alternarConvite failed:", error.message);
  refresh();
}
