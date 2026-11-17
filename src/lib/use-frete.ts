"use client";

import { useEffect, useState } from "react";
import type { OpcaoFrete } from "@/lib/frete";

export type { OpcaoFrete };
type Estado = { cep: string; pecas: number; opcoes: OpcaoFrete[]; exemplo: boolean; erro: string | null };

// The CEP typed in the cart comes back filled in on the payment page.
export const CEP_KEY = "meranno-cep";

export const prazoTexto = (opcao: OpcaoFrete) => opcao.prazoMin === opcao.prazoMax ? `${opcao.prazoMax} ${opcao.prazoMax === 1 ? "dia útil" : "dias úteis"}` : `${opcao.prazoMin} a ${opcao.prazoMax} dias úteis`;

// Quotes the shipping once the CEP is complete (8 digits) and again when the number of pieces changes.
export function useFrete(cep: string, pecas: number) {
  const digits = cep.replace(/\D/g, "");
  const pronto = digits.length === 8 && pecas > 0;
  const [resultado, setResultado] = useState<Estado | null>(null);

  useEffect(() => {
    if (!pronto) return;
    const controller = new AbortController();
    fetch("/api/frete", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ cep: digits, pecas }), signal: controller.signal })
      .then(async (response) => {
        const data = await response.json();
        setResultado(response.ok ? { cep: digits, pecas, opcoes: data.opcoes, exemplo: Boolean(data.exemplo), erro: null } : { cep: digits, pecas, opcoes: [], exemplo: false, erro: data.error ?? "Não deu para calcular o frete." });
      })
      .catch((error) => { if (error.name !== "AbortError") setResultado({ cep: digits, pecas, opcoes: [], exemplo: false, erro: "Sem conexão para calcular o frete." }); });
    return () => controller.abort();
  }, [pronto, digits, pecas]);

  // A result belongs to the CEP and quantity it was asked for; anything else is still loading.
  const atual = pronto && resultado?.cep === digits && resultado.pecas === pecas ? resultado : null;
  return { pronto, carregando: pronto && !atual, opcoes: atual?.opcoes ?? [], exemplo: atual?.exemplo ?? false, erro: atual?.erro ?? null };
}
