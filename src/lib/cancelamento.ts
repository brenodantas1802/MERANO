import type { SupabaseClient } from "@supabase/supabase-js";
import { asaasConfigurado, estornarCheckouts } from "@/lib/asaas";
import type { Pedido } from "@/lib/pedidos";

// Cancels an order and, when it was paid through Asaas, gives the money back right away (owners, 2026-11-25). Server only.
//   por: "cliente" (the customer, on the order's page, within the 24 hours of pedido-status) or the team member's e-mail.
// The refund goes back to the payment it came from, never anywhere else. If Asaas refuses (a Pix refund needs balance),
// nothing changes and the reason comes back, so the team can top up and try again or refund by hand.
const PAGOS = ["pago", "em_separacao", "enviado", "entregue"];

export async function cancelarPedido(admin: SupabaseClient, pedido: Pedido, por: string): Promise<{ ok: true; estornado: number } | { ok: false; erro: string }> {
  if (pedido.status === "cancelado") return { ok: false, erro: "Esse pedido já está cancelado." };
  const pagoNoAsaas = PAGOS.includes(pedido.status) && pedido.pagamento?.provedor === "asaas";
  let estornado = 0;
  if (pagoNoAsaas) {
    if (!asaasConfigurado()) return { ok: false, erro: "O Asaas não está ligado no site: estorne pelo site do Asaas." };
    try {
      estornado = await estornarCheckouts(pedido.pagamento.checkouts ?? [], `Cancelamento do pedido ${pedido.numero} (Meranno)`);
    } catch (erro) {
      const motivo = erro instanceof Error ? erro.message : "";
      console.error("estorno failed:", pedido.numero, motivo);
      return { ok: false, erro: `O Asaas não fez o estorno${motivo ? ` (${motivo.replace(/^Asaas \d+: ?/, "") || "sem motivo"})` : ""}. Confira o saldo do Asaas ou estorne por lá.` };
    }
  }
  const agora = new Date().toISOString();
  const pagamento = { ...pedido.pagamento, estorno: pagoNoAsaas ? { valor: estornado, em: agora, por } : undefined, cancelado_em: agora, cancelado_por: por };
  const { error } = await admin.from("pedidos").update({ status: "cancelado", pagamento, atualizado_em: agora }).eq("id", pedido.id);
  if (error) {
    // The money already went back: say so, so nobody refunds twice.
    console.error("cancelarPedido update failed:", pedido.numero, error.message);
    return { ok: false, erro: estornado ? `O estorno de R$ ${estornado.toFixed(2).replace(".", ",")} foi feito, mas não consegui marcar o pedido como cancelado. Mude o status para “Cancelado”.` : "Não consegui cancelar agora. Tente de novo." };
  }
  return { ok: true, estornado };
}
