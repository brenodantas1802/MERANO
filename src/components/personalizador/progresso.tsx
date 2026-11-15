"use client";

import { useEffect, useState } from "react";

// Creating the art takes up to a minute: past ~10 s people lose track unless they see it moving (docs/PESQUISA-UX.md),
// so the wait is told in steps with a bar that creeps toward the end without ever claiming to be done.
const ETAPAS = ["Lendo a sua ficha…", "Desenhando a arte…", "Aplicando as cores da paleta…", "Ajustando os detalhes…", "Quase pronta…"];
const DURACAO_ESPERADA_MS = 45_000;

export function ProgressoCriacao() {
  const [decorrido, setDecorrido] = useState(0);
  useEffect(() => {
    const inicio = Date.now();
    const timer = window.setInterval(() => setDecorrido(Date.now() - inicio), 250);
    return () => window.clearInterval(timer);
  }, []);
  const fracao = 1 - Math.exp(-decorrido / (DURACAO_ESPERADA_MS / 2.3));
  const etapa = ETAPAS[Math.min(ETAPAS.length - 1, Math.floor((decorrido / DURACAO_ESPERADA_MS) * ETAPAS.length))];
  return <div role="status" aria-live="polite" className="w-full max-w-[280px] rounded-2xl bg-black/40 px-3 py-2.5 sm:px-4 sm:py-3 text-[var(--pz-creme)] backdrop-blur-sm">
    <p className="text-[12px] font-medium sm:text-[13px]">{etapa}</p>
    <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/20"><div className="h-full rounded-full bg-[var(--pz-ouro)] transition-[width] duration-300" style={{ width: `${Math.round(Math.min(0.94, fracao) * 100)}%` }} /></div>
    <p className="mt-1.5 hidden text-[11px] text-[var(--pz-creme)]/70 sm:block">Leva até um minuto. Pode continuar olhando a sua peça.</p>
  </div>;
}
