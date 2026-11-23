"use server";

import { refresh } from "next/cache";
import { dono } from "./dono";
import { aprovarPedido, lerLista } from "@/lib/pre-venda-lista";

// The pre-sale list, edited from the owners' panel. Every action checks the owner again (see dono).
export type RespostaLista = { tipo: "ok" | "erro"; texto: string } | null;

// Pasted text, one person per line. Entries already on the list (same e-mail or same number) are skipped.
export async function adicionarNaLista(_anterior: RespostaLista, form: FormData): Promise<RespostaLista> {
  const { linhas, ignoradas } = lerLista(String(form.get("lista") ?? "").slice(0, 60000));
  if (!linhas.length) return { tipo: "erro", texto: "Não achei nenhum e-mail ou número de WhatsApp. Coloque um por linha." };
  const sessao = await dono();
  if (!sessao) return { tipo: "erro", texto: "Só os donos, entrando com o Google, podem mexer na lista." };

  const { data: existentes } = await sessao.admin.from("pre_venda_autorizados").select("email, telefone");
  const emails = new Set((existentes ?? []).map((linha) => linha.email).filter(Boolean));
  const telefones = new Set((existentes ?? []).map((linha) => linha.telefone).filter(Boolean));
  const novas = [];
  for (const linha of linhas) {
    if ((linha.email && emails.has(linha.email)) || (linha.telefone && telefones.has(linha.telefone))) continue;
    if (linha.email) emails.add(linha.email);
    if (linha.telefone) telefones.add(linha.telefone);
    novas.push({ ...linha, criado_por: sessao.email });
  }
  if (novas.length) {
    const { error } = await sessao.admin.from("pre_venda_autorizados").insert(novas);
    if (error) {
      console.error("adicionarNaLista failed:", error.message);
      return { tipo: "erro", texto: "Não consegui salvar a lista. Tente de novo." };
    }
  }
  refresh();
  const repetidas = linhas.length - novas.length;
  const partes = [`${novas.length} ${novas.length === 1 ? "pessoa adicionada" : "pessoas adicionadas"}`];
  if (repetidas) partes.push(`${repetidas} já ${repetidas === 1 ? "estava" : "estavam"} na lista`);
  if (ignoradas.length) partes.push(`${ignoradas.length} ${ignoradas.length === 1 ? "linha sem" : "linhas sem"} e-mail ou número: ${ignoradas.slice(0, 3).join(" · ")}${ignoradas.length > 3 ? "…" : ""}`);
  return { tipo: "ok", texto: `${partes.join(". ")}.` };
}

export async function removerDaLista(id: string) {
  const sessao = await dono();
  if (!sessao) return;
  const { data } = await sessao.admin.from("pre_venda_autorizados").delete().eq("id", id).select("usuario_id").maybeSingle();
  // A person let in through an access request leaves the requests too, so a new one can come in if needed.
  if (data?.usuario_id) await sessao.admin.from("pre_venda_pedidos").delete().eq("usuario_id", data.usuario_id);
  refresh();
}

// Access requests (people who signed in on /pre-venda without being on the list).
export async function liberarPedido(id: string): Promise<RespostaLista> {
  const sessao = await dono();
  if (!sessao) return { tipo: "erro", texto: "Só os donos, entrando com o Google, podem liberar." };
  const resultado = await aprovarPedido(sessao.admin, id, sessao.email);
  if (!resultado.ok) return { tipo: "erro", texto: resultado.erro };
  refresh();
  return { tipo: "ok", texto: "Liberado." };
}

export async function recusarPedido(id: string): Promise<RespostaLista> {
  const sessao = await dono();
  if (!sessao) return { tipo: "erro", texto: "Só os donos, entrando com o Google, podem recusar." };
  const { error } = await sessao.admin.from("pre_venda_pedidos").update({ status: "recusado", resolvido_em: new Date().toISOString(), resolvido_por: sessao.email }).eq("id", id);
  if (error) return { tipo: "erro", texto: "Não consegui salvar. Tente de novo." };
  refresh();
  return { tipo: "ok", texto: "Recusado." };
}
