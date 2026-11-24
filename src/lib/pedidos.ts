import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { cotarFrete, freteConfigurado, freteExemplo, type OpcaoFrete } from "@/lib/frete";
import { PRECO_PERSONALIZADA } from "@/lib/estampa";
import { formatPrice, getProduct, getProductPrice, TAMANHOS_LOJA } from "@/lib/products";
import type { StatusPedido } from "@/lib/pedido-status";

// Orders from the payment page (table `pedidos`, server only through the secret key). Everything that costs money is
// worked out here from the catalogue, the coupon table and a fresh shipping quote: nothing the browser sends about
// prices is trusted.

// No Pix discount (owners, 2026-11-22): Pix and card cost the same. Kept as a number so it can come back.
export const PIX_DESCONTO = 0;

// Pre-sale delivery: up to 7 December (owners, 2026-11-24: "até 7 de dezembro"). Shown on the product, the payment page
// and the order, after "entrega prevista".
export const ENTREGA_PRE_VENDA = { curta: "até 7/12", longa: "até 7 de dezembro" };
// The Personalizador sells the same sizes as the shop.
export const TAMANHOS_PERSONALIZADA = TAMANHOS_LOJA;
export { STATUS_PEDIDO, type StatusPedido } from "@/lib/pedido-status";
export type Metodo = "pix" | "cartao" | "whatsapp";

const centavos = (valor: number) => Math.round(valor * 100) / 100;
const digitos = (texto: string) => texto.replace(/\D/g, "");

export const normalizarCupom = (codigo: string) => codigo.normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase().replace(/[^A-Z0-9_-]/g, "");

// A valid CPF (check digits), so typos are caught before the payment provider refuses them.
export function cpfValido(cpf: string) {
  const n = digitos(cpf);
  if (n.length !== 11 || /^(\d)\1{10}$/.test(n)) return false;
  const dv = (base: string, peso: number) => { const soma = [...base].reduce((total, d, i) => total + Number(d) * (peso - i), 0); const resto = (soma * 10) % 11; return resto === 10 ? 0 : resto; };
  return dv(n.slice(0, 9), 10) === Number(n[9]) && dv(n.slice(0, 10), 11) === Number(n[10]);
}

const texto = (max: number, mensagem: string) => z.string().trim().min(1, mensagem).max(max);

export const pedidoSchema = z.object({
  cliente: z.object({
    nome: texto(120, "Escreva o seu nome completo.").refine((nome) => nome.split(/\s+/).length >= 2, "Escreva nome e sobrenome."),
    email: z.email("Confira o e-mail.").max(160),
    celular: z.string().transform(digitos).pipe(z.string().min(10, "Confira o celular, com DDD.").max(11, "Confira o celular, com DDD.")),
    cpf: z.string().refine(cpfValido, "Confira o CPF.").transform(digitos),
  }),
  endereco: z.object({
    cep: z.string().transform(digitos).pipe(z.string().length(8, "Confira o CEP.")),
    rua: texto(160, "Escreva a rua."),
    numero: texto(20, "Escreva o número."),
    complemento: z.string().trim().max(80).default(""),
    bairro: texto(80, "Escreva o bairro."),
    cidade: texto(80, "Escreva a cidade."),
    uf: z.string().trim().toUpperCase().regex(/^[A-Z]{2}$/, "Confira o estado (UF)."),
  }),
  itens: z.array(z.object({
    productId: z.string().max(80).optional(),
    criacaoId: z.uuid().optional(),
    tamanho: z.string().max(4),
    cor: z.string().max(40).optional(),
    quantidade: z.number().int().min(1).max(10),
  })).min(1, "O carrinho está vazio.").max(20),
  freteId: z.number().int(),
  cupom: z.string().max(40).optional(),
  metodo: z.enum(["pix", "cartao"]),
});
export type PedidoEntrada = z.infer<typeof pedidoSchema>;

export type ItemPedido = { productId: string | null; criacaoId: string | null; nome: string; tamanho: string; cor: string; preco: number; quantidade: number };
export type CupomAplicado = { codigo: string; percentual: number };
// What the order keeps about its online payment. `checkouts` are all the Asaas checkouts opened for it.
export type PagamentoRegistro = { forma?: string; provedor?: string; id?: string; mp_id?: string; status?: string; metodo?: string; atualizado?: string; link?: string; preferencia?: string; checkout?: string; checkouts?: string[] };

export type Pedido = {
  id: string; numero: string; criado_em: string; status: StatusPedido; metodo: Metodo; email: string;
  cliente: { nome: string; email: string; celular: string; cpf: string };
  endereco: { cep: string; rua: string; numero: string; complemento: string; bairro: string; cidade: string; uf: string };
  itens: ItemPedido[]; subtotal: number; desconto_cupom: number; desconto_pix: number; frete: OpcaoFrete; total: number;
  cupom: string | null; pagamento: PagamentoRegistro; rastreio: string | null;
};

// Orders that count as a purchase (for first-purchase coupons).
const COMPRAS = ["pago", "em_separacao", "enviado", "entregue"];

// Checks a coupon for this e-mail. Returns the coupon, or a message for the customer.
export async function validarCupom(admin: SupabaseClient, codigoDigitado: string, email?: string): Promise<{ cupom: CupomAplicado } | { erro: string }> {
  const codigo = normalizarCupom(codigoDigitado);
  if (codigo.length < 3) return { erro: "Digite o código do cupom." };
  const { data } = await admin.from("cupons").select("codigo, percentual, ativo, primeira_compra").eq("codigo", codigo).maybeSingle();
  if (!data || !data.ativo) return { erro: "Esse cupom não existe ou não vale mais." };
  if (data.primeira_compra && email) {
    // First purchase: no paid order with this e-mail yet, with or without a coupon.
    const { count } = await admin.from("pedidos").select("id", { count: "exact", head: true }).eq("email", email.trim().toLowerCase()).in("status", COMPRAS);
    if (count) return { erro: "Esse cupom vale só na primeira compra, e esse e-mail já tem uma compra." };
  }
  return { cupom: { codigo: data.codigo, percentual: data.percentual } };
}

// Turns the cart into priced order lines. Catalogue tees take the catalogue price; Personalizador pieces must exist
// in criacoes_estampa and still be in a cart.
export async function precificarItens(admin: SupabaseClient, itens: PedidoEntrada["itens"]): Promise<{ itens: ItemPedido[] } | { erro: string }> {
  const linhas: ItemPedido[] = [];
  const criacoes = itens.flatMap((item) => (item.criacaoId ? [item.criacaoId] : []));
  const encontradas = new Map<string, { tamanho: string; painel: { fabricName?: string; fitName?: string } }>();
  if (criacoes.length) {
    const { data } = await admin.from("criacoes_estampa").select("id, tamanho, painel, status").in("id", criacoes);
    for (const linha of data ?? []) if (linha.status === "no_carrinho") encontradas.set(linha.id, linha);
  }
  for (const item of itens) {
    if (item.criacaoId) {
      const criacao = encontradas.get(item.criacaoId);
      if (!criacao) return { erro: "Uma peça do Personalizador não está mais disponível. Crie de novo ou tire do carrinho." };
      linhas.push({ productId: null, criacaoId: item.criacaoId, nome: `Personalizada${criacao.painel.fitName ? ` · ${criacao.painel.fitName}` : ""}`, tamanho: criacao.tamanho, cor: criacao.painel.fabricName ?? "", preco: PRECO_PERSONALIZADA, quantidade: item.quantidade });
      continue;
    }
    const produto = item.productId ? getProduct(item.productId) : undefined;
    if (!produto) return { erro: "Uma peça do carrinho saiu da loja. Tire do carrinho para continuar." };
    if (!produto.fits.includes(item.tamanho)) return { erro: `Escolha de novo o tamanho da ${produto.name}.` };
    const cor = item.cor && produto.colors.includes(item.cor) ? item.cor : produto.colors[0];
    linhas.push({ productId: produto.id, criacaoId: null, nome: produto.name, tamanho: item.tamanho, cor, preco: getProductPrice(produto), quantidade: item.quantidade });
  }
  return { itens: linhas };
}

// The same quote the customer saw (SuperFrete, or the marked example values while it isn't connected).
export async function escolherFrete(cep: string, pecas: number, freteId: number): Promise<{ frete: OpcaoFrete } | { erro: string }> {
  let opcoes: OpcaoFrete[];
  try {
    opcoes = freteConfigurado() ? await cotarFrete(cep, pecas) : freteExemplo(pecas);
  } catch {
    return { erro: "Não deu para calcular o frete agora. Tente de novo em instantes." };
  }
  const frete = opcoes.find((opcao) => opcao.id === freteId);
  return frete ? { frete } : { erro: "Essa opção de frete não está mais disponível. Escolha de novo." };
}

export function totais(itens: ItemPedido[], frete: OpcaoFrete, cupom: CupomAplicado | null, metodo: Metodo) {
  const subtotal = centavos(itens.reduce((soma, item) => soma + item.preco * item.quantidade, 0));
  const desconto_cupom = cupom ? centavos(subtotal * cupom.percentual / 100) : 0;
  const desconto_pix = metodo === "pix" ? centavos((subtotal - desconto_cupom) * PIX_DESCONTO) : 0;
  const total = centavos(subtotal - desconto_cupom - desconto_pix + frete.preco);
  return { subtotal, desconto_cupom, desconto_pix, total };
}

// "MR-" and six characters without look-alikes (no 0/O, 1/I).
export function novoNumero() {
  const letras = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return `MR-${[...bytes].map((b) => letras[b % letras.length]).join("")}`;
}

// The message a WhatsApp order opens with, for when online payment isn't connected yet.
export function mensagemWhatsApp(pedido: Pick<Pedido, "numero" | "itens" | "frete" | "cupom" | "desconto_cupom" | "desconto_pix" | "total" | "metodo" | "endereco" | "cliente">, forma: "pix" | "cartao") {
  const linhas = [
    `Olá, Meranno! Quero fechar o pedido ${pedido.numero}:`,
    ...pedido.itens.map((item) => `• ${item.quantidade}× ${item.nome} (${item.tamanho}${item.cor ? ` · ${item.cor}` : ""}) — ${formatPrice(item.preco * item.quantidade)}`),
    `Frete: ${pedido.frete.nome} — ${formatPrice(pedido.frete.preco)}`,
    ...(pedido.cupom ? [`Cupom ${pedido.cupom}: −${formatPrice(pedido.desconto_cupom)}`] : []),
    ...(pedido.desconto_pix ? [`Desconto Pix: −${formatPrice(pedido.desconto_pix)}`] : []),
    `Total: ${formatPrice(pedido.total)}`,
    `Pagamento: ${forma === "pix" ? "Pix" : "cartão"}`,
    `Entrega: ${pedido.endereco.rua}, ${pedido.endereco.numero} — ${pedido.endereco.cidade}/${pedido.endereco.uf}, CEP ${pedido.endereco.cep.replace(/(\d{5})(\d{3})/, "$1-$2")}`,
    `Nome: ${pedido.cliente.nome}`,
  ];
  return linhas.join("\n");
}

export const WHATSAPP_NUMERO = "5511986464056";
export const linkWhatsApp = (mensagem: string) => `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(mensagem)}`;

// Applies what the payment provider says (read straight from it, never from the browser) to its order. Only a paid
// payment of the full amount marks the order as paid; anything else is just noted. `pago` is the provider's own
// verdict (Asaas); without it, Mercado Pago's "approved".
export async function registrarPagamento(admin: SupabaseClient, pagamento: { id: string; status: string; pedidoId: string; valor: number; metodo: string; pago?: boolean; provedor?: string }) {
  const { data: pedido } = await admin.from("pedidos").select("id, status, total, pagamento, cupom").eq("id", pagamento.pedidoId).maybeSingle();
  if (!pedido) return null;
  const aprovado = pagamento.pago ?? pagamento.status === "approved";
  const pago = aprovado && Math.abs(Number(pedido.total) - pagamento.valor) < 0.06;
  const novoStatus = pago && pedido.status === "aguardando_pagamento" ? "pago" : pedido.status;
  const registro = { ...pedido.pagamento, id: pagamento.id, ...(pagamento.provedor === "mercadopago" ? { mp_id: pagamento.id } : {}), provedor: pagamento.provedor ?? pedido.pagamento?.provedor, status: pagamento.status, metodo: pagamento.metodo, atualizado: new Date().toISOString() };
  await admin.from("pedidos").update({ status: novoStatus, pagamento: registro, atualizado_em: new Date().toISOString() }).eq("id", pedido.id);
  return novoStatus as StatusPedido;
}
