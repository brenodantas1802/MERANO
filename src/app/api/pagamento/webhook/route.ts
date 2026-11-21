import { NextResponse } from "next/server";
import { createSecretClient } from "@/lib/supabase/publico";
import { lerPagamento, pagamentoOnline } from "@/lib/mercado-pago";
import { registrarPagamento } from "@/lib/pedidos";

// Mercado Pago's notification that a payment changed. It only carries the payment id; the payment itself is read
// back from Mercado Pago with the site's token, so a forged call can't mark an order as paid.
export async function POST(request: Request) {
  if (!pagamentoOnline()) return new NextResponse(null, { status: 200 });
  const url = new URL(request.url);
  const corpo = await request.json().catch(() => ({}));
  const tipo = corpo?.type ?? url.searchParams.get("type") ?? url.searchParams.get("topic");
  const id = String(corpo?.data?.id ?? url.searchParams.get("data.id") ?? url.searchParams.get("id") ?? "");
  if (tipo !== "payment" || !id) return new NextResponse(null, { status: 200 });

  const admin = createSecretClient();
  const pagamento = await lerPagamento(id).catch(() => null);
  // Unknown to Mercado Pago or no database: answer an error so they try again later.
  if (!admin || !pagamento) return new NextResponse(null, { status: 500 });
  await registrarPagamento(admin, pagamento);
  return new NextResponse(null, { status: 200 });
}
