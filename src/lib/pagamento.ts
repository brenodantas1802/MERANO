import type { SupabaseClient } from "@supabase/supabase-js";
import { asaasConfigurado, cobrancasDoCheckout, criarCheckout, resumoDoCheckout } from "@/lib/asaas";
import { criarPreferencia, lerPagamento, mercadoPagoConfigurado } from "@/lib/mercado-pago";
import { registrarPagamento, type Pedido } from "@/lib/pedidos";

// Online payment, through whichever provider is connected: Asaas when ASAAS_API_KEY is set, else Mercado Pago when
// MERCADOPAGO_ACCESS_TOKEN is set. With neither, the order is closed by hand on WhatsApp.
export type Provedor = "asaas" | "mercadopago";

export const provedor = (): Provedor | null => (asaasConfigurado() ? "asaas" : mercadoPagoConfigurado() ? "mercadopago" : null);
export const pagamentoOnline = () => provedor() !== null;
export const NOME_PROVEDOR: Record<Provedor, string> = { asaas: "Asaas", mercadopago: "Mercado Pago" };

// Opens the payment for an order. Returns the link and what to keep in the order's `pagamento`.
export async function abrirPagamento(pedido: Pedido, origem: string) {
  const anterior = pedido.pagamento ?? {};
  if (provedor() === "asaas") {
    const { link, checkout } = await criarCheckout(pedido, origem);
    // Every checkout opened for the order is kept: an older one may still be paid.
    const checkouts = [...(anterior.checkouts ?? []), checkout].slice(-10);
    return { link, registro: { ...anterior, provedor: "asaas", checkout, checkouts, link } };
  }
  const { link, preferencia } = await criarPreferencia(pedido, origem);
  return { link, registro: { ...anterior, provedor: "mercadopago", preferencia, link } };
}

// Reads the charges of an Asaas checkout and applies them to its order.
export async function conciliarCheckoutAsaas(admin: SupabaseClient, pedido: Pick<Pedido, "id" | "total">, checkout: string) {
  const resumo = resumoDoCheckout(await cobrancasDoCheckout(checkout), Number(pedido.total));
  if (!resumo.id) return null;
  return registrarPagamento(admin, { id: resumo.id, status: resumo.status, pedidoId: pedido.id, valor: resumo.valor, metodo: resumo.metodo, pago: resumo.pago, provedor: "asaas" });
}

// The customer is back on the order's page from the payment: confirm right away instead of waiting for the notification.
export async function conferirRetorno(admin: SupabaseClient, pedido: Pedido, busca: Record<string, string | string[] | undefined>) {
  if (pedido.status !== "aguardando_pagamento") return false;
  if (pedido.pagamento?.provedor === "asaas" && asaasConfigurado()) {
    for (const checkout of (pedido.pagamento.checkouts ?? []).slice(-3).reverse()) {
      const status = await conciliarCheckoutAsaas(admin, pedido, checkout).catch(() => null);
      if (status && status !== "aguardando_pagamento") return true;
    }
    return false;
  }
  const paymentId = String(busca.payment_id ?? busca.collection_id ?? "");
  if (!paymentId || !mercadoPagoConfigurado()) return false;
  const pagamento = await lerPagamento(paymentId).catch(() => null);
  if (pagamento?.pedidoId !== pedido.id) return false;
  await registrarPagamento(admin, { ...pagamento, provedor: "mercadopago" });
  return true;
}
