"use client";

import Link from "next/link";
import Script from "next/script";
import { useSyncExternalStore } from "react";

// Heat map and session recordings (Microsoft Clarity), only after the visitor says yes (LGPD).
// Nothing loads and no banner shows until NEXT_PUBLIC_CLARITY_ID is set in Vercel.
const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID;
const CHAVE = "meranno-consentimento-analise";
type Escolha = "sim" | "nao" | null;

function lerEscolha(): Escolha {
  try {
    const valor = window.localStorage.getItem(CHAVE);
    return valor === "sim" || valor === "nao" ? valor : null;
  } catch {
    return null;
  }
}

// The choice lives in localStorage; this tiny store lets React read it without a hydration mismatch.
let escolhaDaVisita: Escolha = null;
const ouvintes = new Set<() => void>();
const assinar = (ouvinte: () => void) => { ouvintes.add(ouvinte); return () => { ouvintes.delete(ouvinte); }; };
const lerNoNavegador = () => lerEscolha() ?? escolhaDaVisita;

export function ConsentimentoAnalise() {
  const escolha = useSyncExternalStore<Escolha | "carregando">(assinar, lerNoNavegador, () => "carregando");

  function decidir(valor: "sim" | "nao") {
    escolhaDaVisita = valor; // still holds for this visit if storage is blocked
    try { window.localStorage.setItem(CHAVE, valor); } catch { /* blocked storage */ }
    ouvintes.forEach((ouvinte) => ouvinte());
  }

  if (!CLARITY_ID || !/^[a-z0-9]{6,20}$/i.test(CLARITY_ID)) return null;
  return <>
    {escolha === "sim" && <Script id="clarity" strategy="afterInteractive">{`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${CLARITY_ID}");`}</Script>}
    {escolha === null && <div role="region" aria-label="Aviso de cookies" className="glass fixed inset-x-2 bottom-[calc(.5rem+env(safe-area-inset-bottom,0px))] z-[85] mx-auto max-w-xl rounded-[22px] p-4 md:bottom-6">
      <p className="text-[14px] leading-snug">Podemos usar cookies de análise para entender como o site é usado (mapa de cliques e rolagem) e melhorá-lo? Nenhum dado de pagamento é coletado. <Link href="/privacidade" className="underline underline-offset-2">Saiba mais</Link></p>
      <div className="mt-3 flex gap-2">
        <button type="button" onClick={() => decidir("sim")} className="press label min-h-11 flex-1 rounded-full bg-[var(--vinho)] px-5 text-[12px] text-[var(--creme)]">Aceitar</button>
        <button type="button" onClick={() => decidir("nao")} className="press label min-h-11 flex-1 rounded-full px-5 text-[12px] text-[var(--vinho)] shadow-[inset_0_0_0_1px_rgba(85,30,43,.6)]">Recusar</button>
      </div>
    </div>}
  </>;
}
