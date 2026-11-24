import type { SupabaseClient } from "@supabase/supabase-js";
import { asaasConfigurado, cobrancasDoCheckout, criarCheckout, resumoDoCheckout } from "@/lib/asaas";
import { registrarPagamento, type Pedido } from "@/lib/pedidos";

// Online payment through Asaas (when ASAAS_API_KEY is set). Without it, the order is closed by hand on WhatsApp.
// The Mercado Pago Checkout Pro integration that sat here as an alternative went on 2026-11-24 (Asaas is live).
export type Provedor = "asaas";

export const provedor = (): Provedor | null => (asaasConfigurado() ? "asaas" : null);
export const pagamentoOnline = () => provedor() !== null;
export const NOME_PROVEDOR: Record<Provedor, string> = { asaas: "Asaas" };

// Opens the payment for an order. Returns the link and what to keep in the order's `pagamento`.
export async function abrirPagamento(pedido: Pedido, origem: string) {
  const anterior = pedido.pagamento ?? {};
  const { link, checkout } = await criarCheckout(pedido, origem);
  // Every checkout opened for the order is kept: an older one may still be paid.
  const checkouts = [...(anterior.checkouts ?? []), checkout].slice(-10);
  return { link, registro: { ...anterior, provedor: "asaas", checkout, checkouts, link } };
}

// Reads the charges of an Asaas checkout and applies them to its order.
export async function conciliarCheckoutAsaas(admin: SupabaseClient, pedido: Pick<Pedido, "id" | "total">, checkout: string) {
  const resumo = resumoDoCheckout(await cobrancasDoCheckout(checkout), Number(pedido.total));
  if (!resumo.id) return null;
  return registrarPagamento(admin, { id: resumo.id, status: resumo.status, pedidoId: pedido.id, valor: resumo.valor, metodo: resumo.metodo, pago: resumo.pago, provedor: "asaas" });
}

// The customer is back on the order's page from the payment: confirm right away instead of waiting for the notification.
export async function conferirRetorno(admin: SupabaseClient, pedido: Pedido) {
  if (pedido.status !== "aguardando_pagamento" || pedido.pagamento?.provedor !== "asaas" || !asaasConfigurado()) return false;
  for (const checkout of (pedido.pagamento.checkouts ?? []).slice(-3).reverse()) {
    const status = await conciliarCheckoutAsaas(admin, pedido, checkout).catch(() => null);
    if (status && status !== "aguardando_pagamento") return true;
  }
  return false;
}
