"use server";

import { cookies, headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { COOKIE_ACESSO, COOKIE_ENTRADA, assinarAcesso, opcoesCookieAcesso, opcoesCookieEntrada, preVendaAtiva } from "@/lib/pre-venda";
import { autorizacao, liberarPorTelefone } from "@/lib/pre-venda-lista";

export type Resultado = { ok: true } | { ok: false; erro: string } | null;

// Gives this browser the signed access cookie and the one-shot cookie for the padlock animation. The page then
// does a full load of "/" so the animation plays (a soft navigation would skip it).
async function darAcesso(usuarioId: string) {
  const secure = (await headers()).get("x-forwarded-proto") === "https" || process.env.NODE_ENV === "production";
  const jar = await cookies();
  jar.set(COOKIE_ACESSO, await assinarAcesso(usuarioId), opcoesCookieAcesso(secure));
  jar.set(COOKIE_ENTRADA, "1", opcoesCookieEntrada(secure));
}

async function usuario() {
  const { data: { user } } = await (await createClient()).auth.getUser();
  return user;
}

// "Abrir o cadeado": the signed-in account is checked against the list again on the server before anything is given.
export async function abrirCadeado(): Promise<Resultado> {
  if (!preVendaAtiva()) return { ok: true };
  const user = await usuario();
  if (!user) return { ok: false, erro: "Entre na sua conta primeiro." };
  if (!(await autorizacao(user)).liberado) return { ok: false, erro: "Sua conta ainda não está na lista da pré-venda." };
  await darAcesso(user.id);
  return { ok: true };
}

// The account's e-mail isn't on the list: the WhatsApp number from the group can be.
export async function entrarComTelefone(_anterior: Resultado, form: FormData): Promise<Resultado> {
  if (!preVendaAtiva()) return { ok: true };
  const user = await usuario();
  if (!user) return { ok: false, erro: "Entre na sua conta primeiro." };
  const resultado = await liberarPorTelefone(user, String(form.get("telefone") ?? ""));
  if (!resultado.ok) return resultado;
  await darAcesso(user.id);
  return { ok: true };
}
