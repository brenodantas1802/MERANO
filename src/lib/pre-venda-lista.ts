import type { User } from "@supabase/supabase-js";
import { isOwner } from "@/lib/owners";
import { createSecretClient } from "@/lib/supabase/publico";

// The pre-sale list (table pre_venda_autorizados): e-mails and WhatsApp numbers of the people in the group. Server
// only, through the secret key. The owners (OWNER_EMAILS) are always let in.

// Brazilian numbers with the country code: "(11) 98765-4321" -> "5511987654321". Null if it can't be a phone.
export function normalizarTelefone(texto: string) {
  const digitos = texto.replace(/\D/g, "");
  if (digitos.length === 10 || digitos.length === 11) return `55${digitos}`;
  if ((digitos.length === 12 || digitos.length === 13) && digitos.startsWith("55")) return digitos;
  return null;
}

export type LinhaLista = { nome: string | null; email: string | null; telefone: string | null };

// One person per line, as pasted from the WhatsApp group or a spreadsheet: "Ana Souza, 11 98765-4321",
// "ana@gmail.com", "Pedro - +55 (21) 99999-0000 - pedro@hotmail.com". Lines without an e-mail or a phone come back
// in `ignoradas`.
export function lerLista(texto: string) {
  const linhas: LinhaLista[] = [];
  const ignoradas: string[] = [];
  for (const bruta of texto.split(/\r?\n/)) {
    const linha = bruta.trim();
    if (!linha) continue;
    const email = linha.match(/[^\s,;<>()]+@[^\s,;<>()]+\.[^\s,;<>()]+/)?.[0]?.toLowerCase() ?? null;
    const semEmail = email ? linha.replace(new RegExp(email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"), " ") : linha;
    const trechoTelefone = semEmail.match(/\+?\d[\d\s().-]{8,}\d/)?.[0] ?? null;
    const telefone = trechoTelefone ? normalizarTelefone(trechoTelefone) : null;
    if (!email && !telefone) {
      ignoradas.push(linha);
      continue;
    }
    const nome = (trechoTelefone ? semEmail.replace(trechoTelefone, " ") : semEmail).replace(/[,;:|–—-]+/g, " ").replace(/\s+/g, " ").trim().slice(0, 80) || null;
    linhas.push({ nome, email, telefone });
  }
  return { linhas, ignoradas };
}

export type Autorizacao = { liberado: true; nome: string | null } | { liberado: false };

// Is this account in the pre-sale? Owners always; otherwise a row already tied to the account, or the account's
// confirmed e-mail, or the WhatsApp saved when the account was created. A matching row is tied to the account.
export async function autorizacao(user: User): Promise<Autorizacao> {
  const email = user.email_confirmed_at ? user.email?.toLowerCase() ?? null : null;
  if (email && isOwner(email)) return { liberado: true, nome: null };
  const admin = createSecretClient();
  if (!admin) return { liberado: false };

  const ligada = await admin.from("pre_venda_autorizados").select("id, nome").eq("usuario_id", user.id).limit(1).maybeSingle();
  if (ligada.data) return { liberado: true, nome: ligada.data.nome };

  const candidatos: { coluna: "email" | "telefone"; valor: string }[] = [];
  if (email) candidatos.push({ coluna: "email", valor: email });
  const telefoneConta = typeof user.user_metadata?.phone === "string" ? normalizarTelefone(user.user_metadata.phone) : null;
  if (telefoneConta) candidatos.push({ coluna: "telefone", valor: telefoneConta });
  for (const { coluna, valor } of candidatos) {
    const { data } = await admin.from("pre_venda_autorizados").select("id, nome").eq(coluna, valor).is("usuario_id", null).limit(1).maybeSingle();
    if (data) {
      await admin.from("pre_venda_autorizados").update({ usuario_id: user.id, liberado_em: new Date().toISOString() }).eq("id", data.id);
      return { liberado: true, nome: data.nome };
    }
  }
  return { liberado: false };
}

// The WhatsApp typed on /pre-venda: lets the account in if the number is on the list and not taken by another account.
export async function liberarPorTelefone(user: User, texto: string): Promise<{ ok: true } | { ok: false; erro: string }> {
  const telefone = normalizarTelefone(texto);
  if (!telefone) return { ok: false, erro: "Confira o número: com DDD, são 10 ou 11 dígitos." };
  const admin = createSecretClient();
  if (!admin) return { ok: false, erro: "A lista da pré-venda não está disponível agora. Tente de novo em instantes." };
  const { data } = await admin.from("pre_venda_autorizados").select("id, usuario_id").eq("telefone", telefone).limit(1).maybeSingle();
  if (!data) return { ok: false, erro: "Esse número não está na lista da pré-venda. Use o mesmo WhatsApp que está no grupo." };
  if (data.usuario_id && data.usuario_id !== user.id) return { ok: false, erro: "Esse número já foi usado por outra conta. Se foi você, entre com aquela conta." };
  await admin.from("pre_venda_autorizados").update({ usuario_id: user.id, liberado_em: new Date().toISOString() }).eq("id", data.id);
  return { ok: true };
}
