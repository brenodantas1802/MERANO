"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";

// "Pagar agora": asks the server for a fresh payment link for this order and goes there.
export function PagarAgora({ id }: { id: string }) {
  const [abrindo, setAbrindo] = useState(false);
  const [erro, setErro] = useState("");

  async function pagar() {
    setAbrindo(true);
    setErro("");
    try {
      const resposta = await fetch(`/api/pedidos/${id}/pagar`, { method: "POST" });
      const dados = await resposta.json();
      if (!resposta.ok || !dados.pagar) throw new Error(dados.error || "O pagamento não abriu agora. Tente de novo em instantes.");
      window.location.assign(dados.pagar);
    } catch (problema) {
      setErro(problema instanceof Error ? problema.message : "O pagamento não abriu agora. Tente de novo em instantes.");
      setAbrindo(false);
    }
  }

  return <div>
    <button type="button" onClick={pagar} disabled={abrindo} className="press label inline-flex min-h-12 items-center gap-2 rounded-full bg-[var(--vinho)] px-7 text-[12px] text-[var(--creme)] disabled:cursor-wait disabled:opacity-75">
      {abrindo ? "Abrindo o pagamento…" : "Pagar agora"} <ArrowRight size={14} />
    </button>
    {erro && <p role="alert" className="sans mt-3 text-[13px] text-[#8a3a2c]">{erro}</p>}
  </div>;
}
