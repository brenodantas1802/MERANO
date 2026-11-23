"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { TEMA_KEY, TEMA_PADRAO, type Tema } from "@/lib/tema";

// Light / dark switch. Reads the theme off <html data-tema> (set before paint by SCRIPT_TEMA) and keeps the choice.
function assinar(avisar: () => void) {
  const observador = new MutationObserver(avisar);
  observador.observe(document.documentElement, { attributes: true, attributeFilter: ["data-tema"] });
  return () => observador.disconnect();
}
const atual = (): Tema => (document.documentElement.dataset.tema === "claro" ? "claro" : "escuro");

export function useTema() {
  const tema = useSyncExternalStore(assinar, atual, (): Tema => TEMA_PADRAO);
  const trocar = () => {
    const novo: Tema = tema === "escuro" ? "claro" : "escuro";
    document.documentElement.dataset.tema = novo;
    try { window.localStorage.setItem(TEMA_KEY, novo); } catch { /* the choice just won't be remembered */ }
  };
  return { tema, trocar };
}

export function TemaBotao({ className = "", comTexto = false }: { className?: string; comTexto?: boolean }) {
  const { tema, trocar } = useTema();
  const rotulo = tema === "escuro" ? "Modo claro" : "Modo escuro";
  return <button type="button" onClick={trocar} aria-label={`Trocar para o ${rotulo.toLowerCase()}`} title={rotulo} className={className}>
    {tema === "escuro" ? <Sun size={17} strokeWidth={1.6} /> : <Moon size={17} strokeWidth={1.6} />}
    {comTexto && <span>{rotulo}</span>}
  </button>;
}
