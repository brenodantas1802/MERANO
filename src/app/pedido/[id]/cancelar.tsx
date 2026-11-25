"use client";

import { useState, useTransition } from "react";
import { cancelarMeuPedido } from "./acoes";

// "Cancelar pedido", with a second tap to confirm. `pago`: the money goes back by itself (Pix right away, card as a
// credit on the same card).
export function CancelarPedido({ id, pago, prazo }: { id: string; pago: boolean; prazo: string }) {
  const [confirmando, setConfirmando] = useState(false);
  const [erro, setErro] = useState("");
  const [cancelando, startTransition] = useTransition();
  if (!confirmando) return <div className="w-full">
    <button type="button" onClick={() => setConfirmando(true)} className="sans text-[13px] text-[var(--muted)] underline underline-offset-4 hover:text-[var(--ink)]">Cancelar pedido</button>
    <p className="sans mt-1 text-[12px] text-[var(--muted)]">Dá para cancelar por aqui até {prazo}, antes do envio.</p>
  </div>;
  return <div className="w-full max-w-xl rounded-[22px] border border-[var(--vinho)]/40 bg-[var(--vinho)]/[.04] p-5">
    <p className="text-[17px]">Cancelar este pedido?</p>
    <p className="sans mt-1 text-[13px] text-[var(--muted)]">{pago ? "O valor volta sozinho para onde você pagou: no Pix, na hora; no cartão, como crédito na fatura (pode levar até duas faturas)." : "O pedido sai da nossa lista e o link de pagamento deixa de valer."}</p>
    <div className="mt-4 flex flex-wrap gap-2">
      <button type="button" disabled={cancelando} onClick={() => setConfirmando(false)} className="press sans h-11 rounded-full border border-[var(--line)] px-5 text-[12px] uppercase tracking-[.12em]">Voltar</button>
      <button type="button" disabled={cancelando} onClick={() => startTransition(async () => { const resultado = await cancelarMeuPedido(id); if (!resultado.ok) setErro(resultado.erro); })} className="press sans h-11 rounded-full bg-[var(--vinho)] px-5 text-[12px] uppercase tracking-[.12em] text-[var(--creme)] disabled:opacity-60">{cancelando ? "Cancelando…" : pago ? "Sim, cancelar e estornar" : "Sim, cancelar"}</button>
    </div>
    {erro && <p role="alert" className="sans mt-3 text-[13px] text-[var(--vinho)]">{erro}</p>}
  </div>;
}
