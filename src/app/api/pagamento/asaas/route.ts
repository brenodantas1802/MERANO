import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { createSecretClient } from "@/lib/supabase/publico";
import { asaasConfigurado, lerCobranca } from "@/lib/asaas";
import { conciliarCheckoutAsaas } from "@/lib/pagamento";
import type { Pedido } from "@/lib/pedidos";

// Asaas's notifications (webhook), set up in Asaas → Integrações → Webhooks with this address and the events
// CHECKOUT_PAID, PAYMENT_CONFIRMED and PAYMENT_RECEIVED. They only say which checkout or charge changed: the charges
// are read back from Asaas with the API key and matched to the order, so a forged call can't mark an order as paid.
// Asaas sends each event at least once; reading the charges again is harmless.

const mesmoToken = (recebido: string | null, esperado: string) => {
  if (!recebido) return false;
  const a = Buffer.from(recebido);
  const b = Buffer.from(esperado);
  return a.length === b.length && timingSafeEqual(a, b);
};

export async function POST(request: Request) {
  if (!asaasConfigurado()) return new NextResponse(null, { status: 200 });
  const token = process.env.ASAAS_WEBHOOK_TOKEN;
  if (token && !mesmoToken(request.headers.get("asaas-access-token"), token)) return new NextResponse(null, { status: 401 });

  const evento = await request.json().catch(() => null);
  const tipo = String(evento?.event ?? "");
  if (!tipo.startsWith("CHECKOUT_") && !tipo.startsWith("PAYMENT_")) return new NextResponse(null, { status: 200 });

  const admin = createSecretClient();
  if (!admin) return new NextResponse(null, { status: 500 });

  // Which checkout this is about: the checkout event names it; a charge carries it (read back from Asaas if missing).
  let checkout: string | null = evento?.checkout?.id ? String(evento.checkout.id) : null;
  let referencia: string | null = null;
  if (!checkout && evento?.payment?.id) {
    const cobranca = await lerCobranca(String(evento.payment.id)).catch(() => null);
    checkout = cobranca?.checkoutSession ?? null;
    referencia = cobranca?.externalReference ?? null;
  }
  if (!checkout) return new NextResponse(null, { status: 200 });

  // The order that opened this checkout (by its id in externalReference, or by the checkouts it keeps).
  const porReferencia = referencia && /^[0-9a-f-]{36}$/.test(referencia) ? (await admin.from("pedidos").select("id, total, pagamento").eq("id", referencia).maybeSingle()).data : null;
  const pedido = (porReferencia?.pagamento?.checkouts?.includes(checkout) ? porReferencia : null)
    ?? (await admin.from("pedidos").select("id, total, pagamento").contains("pagamento", { checkouts: [checkout] }).maybeSingle()).data as Pick<Pedido, "id" | "total"> | null;
  if (!pedido) return new NextResponse(null, { status: 200 });

  try {
    await conciliarCheckoutAsaas(admin, pedido, checkout);
  } catch (erro) {
    console.error("Asaas webhook failed:", erro instanceof Error ? erro.message : erro);
    // Asaas tries again later.
    return new NextResponse(null, { status: 500 });
  }
  return new NextResponse(null, { status: 200 });
}
