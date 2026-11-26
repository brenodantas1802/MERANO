import type { SupabaseClient, User } from "@supabase/supabase-js";
import { isOwner } from "@/lib/owners";
import { createSecretClient } from "@/lib/supabase/publico";

// The pre-sale list (table pre_venda_autorizados): names, e-mails, WhatsApp numbers and group (Amigos, Familiares…)
// of the people in the group. Server only, through the secret key. The team (owners and administrators) always gets in.

// Brazilian numbers with the country code: "(11) 98765-4321" -> "5511987654321". Null if it can't be a phone.
export function normalizarTelefone(texto: string) {
  const digitos = texto.replace(/\D/g, "");
  if (digitos.length === 10 || digitos.length === 11) return `55${digitos}`;
  if ((digitos.length === 12 || digitos.length === 13) && digitos.startsWith("55")) return digitos;
  return null;
}

export type LinhaLista = { nome: string | null; email: string | null; telefone: string | null; grupo: string | null };

// "*Meranno pré venda AMIGOS*" -> "Amigos": the words that only say "pre-sale" are dropped.
const PALAVRAS_DO_TITULO = new Set(["meranno", "merano", "pre", "pré", "venda", "pre-venda", "pré-venda", "prevenda", "lista", "grupo", "da", "de", "do", "dos", "das"]);
function grupoDoTitulo(linha: string) {
  const palavras = linha.replace(/[*_~#:]/g, " ").split(/\s+/).filter((palavra) => palavra && !PALAVRAS_DO_TITULO.has(palavra.toLowerCase()));
  const grupo = palavras.join(" ").slice(0, 40);
  return grupo ? grupo.charAt(0).toUpperCase() + grupo.slice(1).toLowerCase() : null;
}

// One person per line, as pasted from the WhatsApp group or a spreadsheet: "Ana Souza, 11 98765-4321",
// "ana@gmail.com", "Pedro - +55 (21) 99999-0000 - pedro@hotmail.com", "7- Miguel +55 11 94062‑9090". A title line
// without contacts ("*Meranno pré venda AMIGOS*", "Família:") names the group of the lines below it. Other lines
// without an e-mail or a phone come back in `ignoradas`.
export function lerLista(texto: string) {
  const linhas: LinhaLista[] = [];
  const ignoradas: string[] = [];
  let grupo: string | null = null;
  for (const bruta of texto.split(/\r?\n/)) {
    // WhatsApp writes numbers with non-breaking hyphens and spaces; lists come numbered ("1- ", "12. ").
    const linha = bruta.replace(/[‐-―−]/g, "-").replace(/[  ]/g, " ").trim().replace(/^\d{1,3}\s*[-.)](?=\s*[^\s\d])\s*/, "");
    if (!linha) continue;
    const email = linha.match(/[^\s,;<>()]+@[^\s,;<>()]+\.[^\s,;<>()]+/)?.[0]?.toLowerCase() ?? null;
    const semEmail = email ? linha.replace(new RegExp(email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"), " ") : linha;
    const trechoTelefone = semEmail.match(/\+?\d[\d\s().-]{8,}\d/)?.[0] ?? null;
    const telefone = trechoTelefone ? normalizarTelefone(trechoTelefone) : null;
    if (!email && !telefone) {
      if (/^[*#]|:$/.test(linha)) grupo = grupoDoTitulo(linha);
      else ignoradas.push(linha);
      continue;
    }
    const nome = (trechoTelefone ? semEmail.replace(trechoTelefone, " ") : semEmail).replace(/[,;:|–—-]+/g, " ").replace(/\s+/g, " ").trim().slice(0, 80) || null;
    linhas.push({ nome, email, telefone, grupo });
  }
  return { linhas, ignoradas };
}

// liberado: may enter. Otherwise naLista says the account is already on the list (by e-mail or an approval) and only
// the WhatsApp is missing.
export type Autorizacao = { liberado: true; nome: string | null } | { liberado: false; naLista: boolean; nome: string | null };

// The team (fixed owners and the panel's administrators) always gets in, with a confirmed e-mail.
async function daEquipe(admin: SupabaseClient, email: string | null) {
  if (!email) return false;
  if (isOwner(email)) return true;
  const { data } = await admin.from("administradores").select("email").eq("email", email).maybeSingle();
  return !!data;
}

// Is this account in the pre-sale? Since 2026-11-26 the WhatsApp is required (the owners asked: it is how they know
// who is who): an account gets in once a list row with a number is tied to it. The number saved when the account was
// created counts; an e-mail on the list only ties the row, and the page then asks for the number.
export async function autorizacao(user: User): Promise<Autorizacao> {
  const email = user.email_confirmed_at ? user.email?.toLowerCase() ?? null : null;
  if (email && isOwner(email)) return { liberado: true, nome: null };
  const admin = createSecretClient();
  if (!admin) return { liberado: false, naLista: false, nome: null };
  if (await daEquipe(admin, email)) return { liberado: true, nome: null };

  const { data: ligadas } = await admin.from("pre_venda_autorizados").select("id, nome, telefone").eq("usuario_id", user.id).limit(5);
  const comNumero = ligadas?.find((linha) => linha.telefone);
  if (comNumero) return { liberado: true, nome: comNumero.nome };

  const telefoneConta = typeof user.user_metadata?.phone === "string" ? normalizarTelefone(user.user_metadata.phone) : null;
  if (telefoneConta) {
    const { data } = await admin.from("pre_venda_autorizados").select("id, nome").eq("telefone", telefoneConta).is("usuario_id", null).maybeSingle();
    if (data) {
      await admin.from("pre_venda_autorizados").update({ usuario_id: user.id }).eq("id", data.id);
      return { liberado: true, nome: data.nome };
    }
  }
  if (ligadas?.length) return { liberado: false, naLista: true, nome: ligadas[0].nome };
  if (email) {
    const { data } = await admin.from("pre_venda_autorizados").select("id, nome").eq("email", email).is("usuario_id", null).maybeSingle();
    if (data) {
      await admin.from("pre_venda_autorizados").update({ usuario_id: user.id }).eq("id", data.id);
      return { liberado: false, naLista: true, nome: data.nome };
    }
  }
  return { liberado: false, naLista: false, nome: null };
}

const nomeDa = (user: User) => String(user.user_metadata?.full_name ?? user.user_metadata?.name ?? "").replace(/\s+/g, " ").trim().slice(0, 80) || null;

export type StatusPedido = "pendente" | "liberado" | "recusado";
export type ResultadoTelefone = { ok: true } | { ok: false; erro: string } | { ok: false; pendente: true };

// The WhatsApp typed on /pre-venda (required to get in).
//  - On the list (and not taken by another account): the row is tied to this account and it gets in.
//  - Not on the list, but the account already is (by e-mail or an approval): the number is saved on its row.
//  - Otherwise it becomes an access request for the team to approve in /admin.
export async function liberarPorTelefone(user: User, texto: string): Promise<ResultadoTelefone> {
  const telefone = normalizarTelefone(texto);
  if (!telefone) return { ok: false, erro: "Confira o número: com DDD, são 10 ou 11 dígitos." };
  const admin = createSecretClient();
  if (!admin) return { ok: false, erro: "A lista da pré-venda não está disponível agora. Tente de novo em instantes." };
  const { data } = await admin.from("pre_venda_autorizados").select("id, usuario_id").eq("telefone", telefone).limit(1).maybeSingle();
  if (data?.usuario_id && data.usuario_id !== user.id) return { ok: false, erro: "Esse número já foi usado por outra conta. Se foi você, entre com aquela conta." };
  if (data) {
    await admin.from("pre_venda_autorizados").update({ usuario_id: user.id }).eq("id", data.id);
    return { ok: true };
  }
  const { data: ligada } = await admin.from("pre_venda_autorizados").select("id").eq("usuario_id", user.id).is("telefone", null).limit(1).maybeSingle();
  if (ligada) {
    const { error } = await admin.from("pre_venda_autorizados").update({ telefone }).eq("id", ligada.id);
    if (error) return { ok: false, erro: "Não consegui salvar o número agora. Tente de novo em instantes." };
    return { ok: true };
  }
  const { data: anterior } = await admin.from("pre_venda_pedidos").select("status").eq("usuario_id", user.id).maybeSingle();
  if (anterior?.status === "recusado") return { ok: false, erro: "A equipe não liberou esta conta. Se acha que é engano, fale com quem te mandou o link." };
  const { error } = await admin.from("pre_venda_pedidos").upsert({ usuario_id: user.id, nome: nomeDa(user), email: user.email?.toLowerCase() ?? null, telefone, status: "pendente", resolvido_em: null, resolvido_por: null }, { onConflict: "usuario_id" });
  if (error) {
    console.error("pre_venda_pedidos upsert failed:", error.message);
    return { ok: false, erro: "Não consegui enviar o pedido agora. Tente de novo em instantes." };
  }
  return { ok: false, pendente: true };
}

// This account's access request, if it sent one.
export async function pedidoDaConta(usuarioId: string): Promise<{ status: StatusPedido; telefone: string | null } | null> {
  const admin = createSecretClient();
  if (!admin) return null;
  const { data } = await admin.from("pre_venda_pedidos").select("status, telefone").eq("usuario_id", usuarioId).maybeSingle();
  return (data as { status: StatusPedido; telefone: string | null } | null) ?? null;
}

// "Abrir o cadeado" worked: the list shows when the person first came in.
export async function marcarEntrada(usuarioId: string) {
  await createSecretClient()?.from("pre_venda_autorizados").update({ liberado_em: new Date().toISOString() }).eq("usuario_id", usuarioId).is("liberado_em", null);
}

// The owners approve a request in /admin: the account goes on the list, tied to it, with the WhatsApp it typed. A list
// row with the same e-mail or WhatsApp that no account used yet is reused (keeping the name and group from the list);
// an e-mail or number already used by another account is left out.
export async function aprovarPedido(admin: SupabaseClient, pedidoId: string, dono: string): Promise<{ ok: true } | { ok: false; erro: string }> {
  const { data: pedido } = await admin.from("pre_venda_pedidos").select("id, usuario_id, nome, email, telefone").eq("id", pedidoId).maybeSingle();
  if (!pedido) return { ok: false, erro: "Pedido não encontrado." };
  const { data: ligada } = await admin.from("pre_venda_autorizados").select("id, telefone").eq("usuario_id", pedido.usuario_id).limit(1).maybeSingle();
  let resultado: { error: { message: string } | null };
  if (ligada) {
    resultado = ligada.telefone || !pedido.telefone ? { error: null } : await admin.from("pre_venda_autorizados").update({ telefone: pedido.telefone }).eq("id", ligada.id);
  } else {
    let livre: { id: string; nome: string | null; telefone: string | null } | null = null;
    const usados = new Set<string>();
    for (const coluna of ["telefone", "email"] as const) {
      const valor = pedido[coluna];
      if (!valor) continue;
      const { data } = await admin.from("pre_venda_autorizados").select("id, usuario_id, nome, telefone").eq(coluna, valor).maybeSingle();
      if (!data) continue;
      if (data.usuario_id) usados.add(coluna);
      else livre ??= data;
    }
    const telefoneLivre = pedido.telefone && !usados.has("telefone") ? pedido.telefone : null;
    resultado = livre
      ? await admin.from("pre_venda_autorizados").update({ usuario_id: pedido.usuario_id, nome: livre.nome ?? pedido.nome, ...(livre.telefone ? {} : { telefone: telefoneLivre }) }).eq("id", livre.id)
      : await (async () => {
        const email = usados.has("email") ? null : pedido.email;
        if (!email && !telefoneLivre) return { error: { message: "e-mail e número já usados" } };
        return admin.from("pre_venda_autorizados").insert({ nome: pedido.nome, email, telefone: telefoneLivre, usuario_id: pedido.usuario_id, criado_por: dono });
      })();
  }
  if (resultado.error) {
    console.error("aprovarPedido failed:", resultado.error.message);
    return { ok: false, erro: resultado.error.message === "e-mail e número já usados" ? "Esse e-mail e esse WhatsApp já liberaram outras contas." : "Não consegui liberar agora. Tente de novo." };
  }
  await admin.from("pre_venda_pedidos").update({ status: "liberado", resolvido_em: new Date().toISOString(), resolvido_por: dono }).eq("id", pedido.id);
  return { ok: true };
}
