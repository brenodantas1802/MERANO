"use server";

import { refresh } from "next/cache";
import { dono } from "./dono";
import { STATUS_PEDIDO, normalizarCupom, type StatusPedido } from "@/lib/pedidos";

// Orders and coupons, edited from the owners' panel. Every action checks the owner again (see dono).
export type Resposta = { tipo: "ok" | "erro"; texto: string } | null;
const UUID = /^[0-9a-f-]{36}$/;

export async function mudarStatusPedido(id: string, status: string): Promise<Resposta> {
  if (!UUID.test(id) || !(status in STATUS_PEDIDO)) return { tipo: "erro", texto: "Status inválido." };
  const sessao = await dono();
  if (!sessao) return { tipo: "erro", texto: "Só os donos podem mexer nos pedidos." };
  const { error } = await sessao.admin.from("pedidos").update({ status: status as StatusPedido, atualizado_em: new Date().toISOString() }).eq("id", id);
  if (error) {
    console.error("mudarStatusPedido failed:", error.message);
    return { tipo: "erro", texto: "Não consegui salvar. Tente de novo." };
  }
  refresh();
  return { tipo: "ok", texto: `Agora: ${STATUS_PEDIDO[status as StatusPedido]}.` };
}

// Saving a tracking code also marks a paid order as shipped.
export async function salvarRastreio(id: string, codigo: string): Promise<Resposta> {
  const rastreio = codigo.trim().toUpperCase().replace(/\s+/g, "").slice(0, 40);
  if (!UUID.test(id)) return { tipo: "erro", texto: "Pedido inválido." };
  const sessao = await dono();
  if (!sessao) return { tipo: "erro", texto: "Só os donos podem mexer nos pedidos." };
  const { data: pedido } = await sessao.admin.from("pedidos").select("status").eq("id", id).maybeSingle();
  if (!pedido) return { tipo: "erro", texto: "Pedido não encontrado." };
  const status = rastreio && ["pago", "em_separacao"].includes(pedido.status) ? "enviado" : pedido.status;
  const { error } = await sessao.admin.from("pedidos").update({ rastreio: rastreio || null, status, atualizado_em: new Date().toISOString() }).eq("id", id);
  if (error) {
    console.error("salvarRastreio failed:", error.message);
    return { tipo: "erro", texto: "Não consegui salvar. Tente de novo." };
  }
  refresh();
  return { tipo: "ok", texto: rastreio ? (status === "enviado" && pedido.status !== "enviado" ? "Rastreio salvo e pedido marcado como enviado." : "Rastreio salvo.") : "Rastreio apagado." };
}

export async function criarCupom(_anterior: Resposta, form: FormData): Promise<Resposta> {
  const codigo = normalizarCupom(String(form.get("codigo") ?? ""));
  const percentual = Number(form.get("percentual"));
  const descricao = String(form.get("descricao") ?? "").trim().slice(0, 200) || null;
  const primeiraCompra = form.get("primeira_compra") === "on";
  if (!/^[A-Z0-9_-]{3,30}$/.test(codigo)) return { tipo: "erro", texto: "O código precisa ter de 3 a 30 letras ou números, sem espaço." };
  if (!Number.isInteger(percentual) || percentual < 1 || percentual > 99) return { tipo: "erro", texto: "O desconto vai de 1% a 99%." };
  const sessao = await dono();
  if (!sessao) return { tipo: "erro", texto: "Só os donos podem criar cupons." };
  const { error } = await sessao.admin.from("cupons").insert({ codigo, percentual, descricao, primeira_compra: primeiraCompra, ativo: true });
  if (error) {
    if (error.code === "23505") return { tipo: "erro", texto: `Já existe um cupom ${codigo}.` };
    console.error("criarCupom failed:", error.message);
    return { tipo: "erro", texto: "Não consegui criar o cupom. Tente de novo." };
  }
  refresh();
  return { tipo: "ok", texto: `Cupom ${codigo} criado: ${percentual}% de desconto${primeiraCompra ? ", só na primeira compra" : ""}.` };
}

export async function ligarCupom(codigo: string, ativo: boolean): Promise<Resposta> {
  const sessao = await dono();
  if (!sessao) return { tipo: "erro", texto: "Só os donos podem mexer nos cupons." };
  const { error } = await sessao.admin.from("cupons").update({ ativo }).eq("codigo", normalizarCupom(codigo));
  if (error) return { tipo: "erro", texto: "Não consegui salvar. Tente de novo." };
  refresh();
  return { tipo: "ok", texto: ativo ? "Cupom ligado." : "Cupom desligado." };
}

// The coupon the popup reveals. Only one at a time (the database enforces it too).
export async function cupomDoPopup(codigo: string): Promise<Resposta> {
  const sessao = await dono();
  if (!sessao) return { tipo: "erro", texto: "Só os donos podem mexer nos cupons." };
  const alvo = normalizarCupom(codigo);
  await sessao.admin.from("cupons").update({ boas_vindas: false }).eq("boas_vindas", true).neq("codigo", alvo);
  const { error } = await sessao.admin.from("cupons").update({ boas_vindas: true, ativo: true }).eq("codigo", alvo);
  if (error) {
    console.error("cupomDoPopup failed:", error.message);
    return { tipo: "erro", texto: "Não consegui salvar. Tente de novo." };
  }
  refresh();
  return { tipo: "ok", texto: `O pop-up agora mostra o ${alvo}.` };
}
