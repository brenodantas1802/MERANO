import { NextResponse } from "next/server";
import { clientKey, createRateLimiter } from "@/lib/rate-limit";
import { createSecretClient } from "@/lib/supabase/publico";
import { abrirPagamento, pagamentoOnline } from "@/lib/pagamento";
import type { Pedido } from "@/lib/pedidos";
import { origemDe } from "@/lib/origem";

// "Pagar agora" on an order's page: a fresh payment link for an order still waiting for payment.
const isRateLimited = createRateLimiter(10);

export async function POST(request: Request, ctx: RouteContext<"/api/pedidos/[id]/pagar">) {
  if (isRateLimited(clientKey(request))) return NextResponse.json({ error: "Muitas tentativas seguidas. Aguarde alguns minutos." }, { status: 429 });
  const { id } = await ctx.params;
  const admin = createSecretClient();
  if (!admin || !pagamentoOnline() || !/^[0-9a-f-]{36}$/.test(id)) return NextResponse.json({ error: "Pagamento indisponível agora." }, { status: 404 });
  const { data } = await admin.from("pedidos").select("*").eq("id", id).maybeSingle();
  const pedido = data as Pedido | null;
  if (!pedido || pedido.status !== "aguardando_pagamento" || pedido.metodo === "whatsapp") return NextResponse.json({ error: "Esse pedido não está esperando pagamento." }, { status: 409 });
  // Older than two days: the prices may have changed, so the customer starts again from the cart.
  if (Date.now() - new Date(pedido.criado_em).getTime() > 2 * 86400_000) return NextResponse.json({ error: "Esse pedido expirou. Monte o carrinho de novo." }, { status: 410 });
  try {
    const { link, registro } = await abrirPagamento(pedido, origemDe(request));
    await admin.from("pedidos").update({ pagamento: registro }).eq("id", id);
    return NextResponse.json({ pagar: link });
  } catch (error) {
    console.error("Payment link failed:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "O pagamento não abriu agora. Tente de novo em instantes." }, { status: 502 });
  }
}
