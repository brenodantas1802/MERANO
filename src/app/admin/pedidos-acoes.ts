"use server";

import { refresh } from "next/cache";
import { dono } from "./dono";
import { STATUS_PEDIDO, TAMANHOS_PERSONALIZADA, cpfValido, normalizarCupom, type Pedido, type StatusPedido } from "@/lib/pedidos";
import { cancelarPedido } from "@/lib/cancelamento";
import { formatPrice, getProduct } from "@/lib/products";

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

// The coupon form (create and edit): code, discount, note and "first purchase only", checked the same way the
// database does (table cupons).
function lerCupom(form: FormData): { erro: string } | { erro: null; dados: { codigo: string; percentual: number; descricao: string | null; primeira_compra: boolean } } {
  const codigo = normalizarCupom(String(form.get("codigo") ?? ""));
  const percentual = Number(form.get("percentual"));
  const descricao = String(form.get("descricao") ?? "").trim().slice(0, 200) || null;
  const primeira_compra = form.get("primeira_compra") === "on";
  if (!/^[A-Z0-9_-]{3,30}$/.test(codigo)) return { erro: "O código precisa ter de 3 a 30 letras ou números, sem espaço." };
  if (!Number.isInteger(percentual) || percentual < 1 || percentual > 99) return { erro: "O desconto vai de 1% a 99%." };
  return { erro: null, dados: { codigo, percentual, descricao, primeira_compra } };
}

export async function criarCupom(_anterior: Resposta, form: FormData): Promise<Resposta> {
  const lido = lerCupom(form);
  if (lido.erro !== null) return { tipo: "erro", texto: lido.erro };
  const { dados } = lido;
  const sessao = await dono();
  if (!sessao) return { tipo: "erro", texto: "Só os donos podem criar cupons." };
  const { error } = await sessao.admin.from("cupons").insert({ ...dados, ativo: true });
  if (error) {
    if (error.code === "23505") return { tipo: "erro", texto: `Já existe um cupom ${dados.codigo}.` };
    console.error("criarCupom failed:", error.message);
    return { tipo: "erro", texto: "Não consegui criar o cupom. Tente de novo." };
  }
  refresh();
  return { tipo: "ok", texto: `Cupom ${dados.codigo} criado: ${dados.percentual}% de desconto${dados.primeira_compra ? ", só na primeira compra" : ""}.` };
}

// Edits a coupon, code included. Orders that used it follow the new code (the foreign key cascades) and keep the
// discount they got; the old code stops working.
export async function editarCupom(codigoAtual: string, _anterior: Resposta, form: FormData): Promise<Resposta> {
  const lido = lerCupom(form);
  if (lido.erro !== null) return { tipo: "erro", texto: lido.erro };
  const { dados } = lido;
  const sessao = await dono();
  if (!sessao) return { tipo: "erro", texto: "Só os donos podem mexer nos cupons." };
  const { data, error } = await sessao.admin.from("cupons").update(dados).eq("codigo", normalizarCupom(codigoAtual)).select("codigo").maybeSingle();
  if (error) {
    if (error.code === "23505") return { tipo: "erro", texto: `Já existe um cupom ${dados.codigo}.` };
    console.error("editarCupom failed:", error.message);
    return { tipo: "erro", texto: "Não consegui salvar. Tente de novo." };
  }
  if (!data) return { tipo: "erro", texto: "Esse cupom não existe mais." };
  refresh();
  return { tipo: "ok", texto: `Cupom ${dados.codigo} salvo.` };
}

// Deletes a coupon for good. Orders that used it keep their discount (desconto_cupom) but lose the code
// (the foreign key sets it to null).
export async function excluirCupom(codigo: string): Promise<Resposta> {
  const sessao = await dono();
  if (!sessao) return { tipo: "erro", texto: "Só os donos podem mexer nos cupons." };
  const alvo = normalizarCupom(codigo);
  const { data, error } = await sessao.admin.from("cupons").delete().eq("codigo", alvo).select("codigo").maybeSingle();
  if (error) {
    console.error("excluirCupom failed:", error.message);
    return { tipo: "erro", texto: "Não consegui excluir. Tente de novo." };
  }
  if (!data) return { tipo: "erro", texto: "Esse cupom já tinha sido excluído." };
  refresh();
  return { tipo: "ok", texto: `Cupom ${alvo} excluído.` };
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

// Cancels and, if it was paid through Asaas, refunds right away (lib/cancelamento). For any status: after delivery it
// is the 7-day return (CDC, art. 49), once the piece is back.
export async function cancelarPedidoEquipe(id: string): Promise<Resposta> {
  if (!UUID.test(id)) return { tipo: "erro", texto: "Pedido inválido." };
  const sessao = await dono();
  if (!sessao) return { tipo: "erro", texto: "Só os donos podem cancelar pedidos." };
  const { data } = await sessao.admin.from("pedidos").select("*").eq("id", id).maybeSingle();
  if (!data) return { tipo: "erro", texto: "Pedido não encontrado." };
  const resultado = await cancelarPedido(sessao.admin, data as Pedido, sessao.email);
  if (!resultado.ok) return { tipo: "erro", texto: resultado.erro };
  refresh();
  return { tipo: "ok", texto: resultado.estornado ? `Cancelado e estornado: ${formatPrice(resultado.estornado)} voltaram para o cliente.` : "Cancelado." };
}

// Deletes an order for good (owners, 2026-11-26: the cancelled ones clutter the panel). Only cancelled orders, so a
// paid one can't go by mistake; whatever was refunded stays recorded in Asaas. Nothing else in the database points to
// an order, so the row just goes.
export async function excluirPedido(id: string): Promise<Resposta> {
  if (!UUID.test(id)) return { tipo: "erro", texto: "Pedido inválido." };
  const sessao = await dono();
  if (!sessao) return { tipo: "erro", texto: "Só os donos podem excluir pedidos." };
  const { data } = await sessao.admin.from("pedidos").select("numero, status").eq("id", id).maybeSingle();
  if (!data) return { tipo: "erro", texto: "Pedido não encontrado." };
  if (data.status !== "cancelado") return { tipo: "erro", texto: "Só dá para excluir pedido cancelado. Cancele primeiro." };
  const { error } = await sessao.admin.from("pedidos").delete().eq("id", id).eq("status", "cancelado");
  if (error) {
    console.error("excluirPedido failed:", error.message);
    return { tipo: "erro", texto: "Não consegui excluir agora. Tente de novo." };
  }
  refresh();
  return { tipo: "ok", texto: `Pedido ${data.numero} excluído.` };
}

// Fixes an order's customer and delivery data and the size of each piece (a wrong address, a size change). Prices,
// pieces and quantities don't change here: that would change what was charged.
export async function editarPedido(id: string, _anterior: Resposta, form: FormData): Promise<Resposta> {
  if (!UUID.test(id)) return { tipo: "erro", texto: "Pedido inválido." };
  const texto = (nome: string, maximo = 120) => String(form.get(nome) ?? "").trim().slice(0, maximo);
  const digitos = (nome: string) => texto(nome).replace(/\D/g, "");
  const cliente = { nome: texto("nome"), email: texto("email", 160).toLowerCase(), celular: digitos("celular"), cpf: digitos("cpf") };
  const endereco = { cep: digitos("cep"), rua: texto("rua"), numero: texto("numero", 20), complemento: texto("complemento", 80), bairro: texto("bairro", 80), cidade: texto("cidade", 80), uf: texto("uf", 2).toUpperCase() };
  if (cliente.nome.length < 2) return { tipo: "erro", texto: "Escreva o nome do cliente." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cliente.email)) return { tipo: "erro", texto: "E-mail inválido." };
  if (cliente.celular.length < 10 || cliente.celular.length > 11) return { tipo: "erro", texto: "Celular com DDD: 10 ou 11 números." };
  if (!cpfValido(cliente.cpf)) return { tipo: "erro", texto: "CPF inválido." };
  if (endereco.cep.length !== 8) return { tipo: "erro", texto: "O CEP tem 8 números." };
  if (!endereco.rua || !endereco.numero || !endereco.bairro || !endereco.cidade || !/^[A-Z]{2}$/.test(endereco.uf)) return { tipo: "erro", texto: "Preencha rua, número, bairro, cidade e estado." };
  const sessao = await dono();
  if (!sessao) return { tipo: "erro", texto: "Só os donos podem mexer nos pedidos." };
  const { data } = await sessao.admin.from("pedidos").select("itens").eq("id", id).maybeSingle();
  if (!data) return { tipo: "erro", texto: "Pedido não encontrado." };
  const itens = (data.itens as Pedido["itens"]).map((item, indice) => {
    const tamanho = texto(`tamanho_${indice}`, 4).toUpperCase();
    const validos: readonly string[] = item.criacaoId ? TAMANHOS_PERSONALIZADA : (item.productId ? getProduct(item.productId)?.fits : undefined) ?? [item.tamanho];
    return validos.includes(tamanho) ? { ...item, tamanho } : item;
  });
  const { error } = await sessao.admin.from("pedidos").update({ cliente, email: cliente.email, endereco, itens, atualizado_em: new Date().toISOString() }).eq("id", id);
  if (error) {
    console.error("editarPedido failed:", error.message);
    return { tipo: "erro", texto: "Não consegui salvar. Tente de novo." };
  }
  refresh();
  return { tipo: "ok", texto: "Dados do pedido salvos." };
}
