"use server";

import { refresh } from "next/cache";
import { cancelarPedido } from "@/lib/cancelamento";
import { clientePodeCancelar } from "@/lib/pedido-status";
import type { Pedido } from "@/lib/pedidos";
import { createSecretClient } from "@/lib/supabase/publico";

// "Cancelar pedido" on the order's page. Whoever has the order's link can use it, like the page itself: the refund only
// ever goes back to the payment it came from, so nobody else can get the money. Only within the 24 hours and before
// shipping (clientePodeCancelar); after that the team handles it.
export async function cancelarMeuPedido(id: string): Promise<{ ok: true } | { ok: false; erro: string }> {
  if (!/^[0-9a-f-]{36}$/.test(id)) return { ok: false, erro: "Pedido não encontrado." };
  const admin = createSecretClient();
  if (!admin) return { ok: false, erro: "Não consegui cancelar agora. Fale com a gente pelo WhatsApp." };
  const { data } = await admin.from("pedidos").select("*").eq("id", id).maybeSingle();
  const pedido = data as Pedido | null;
  if (!pedido) return { ok: false, erro: "Pedido não encontrado." };
  if (!clientePodeCancelar(pedido)) return { ok: false, erro: "Por aqui dá para cancelar só nas primeiras 24 horas e antes do envio. Fale com a gente pelo WhatsApp." };
  const resultado = await cancelarPedido(admin, pedido, "cliente");
  // The customer doesn't need Asaas's reason; the team sees it in the logs and refunds by hand if needed.
  if (!resultado.ok) return { ok: false, erro: "Não consegui cancelar automaticamente. Fale com a gente pelo WhatsApp que a gente resolve na hora." };
  refresh();
  return { ok: true };
}
