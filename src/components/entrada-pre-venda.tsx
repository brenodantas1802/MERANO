"use client";

import { useEffect, useState } from "react";
import { Cadeado } from "@/components/cadeado";
import { COOKIE_ENTRADA } from "@/lib/pre-venda";

// Right after the invite link: wine felt over the home page, the padlock opens and the page shows through a hole in
// the shape of the spade keyhole that grows to the whole screen. A tiny script in the layout adds `entrada` to <html>
// before the first paint (SCRIPT_ENTRADA, from the short-lived cookie), so the home page never flashes before the veil.

export function EntradaPreVenda() {
  const [abrindo, setAbrindo] = useState(false);

  useEffect(() => {
    const html = document.documentElement;
    if (!html.classList.contains("entrada")) return;
    document.cookie = `${COOKIE_ENTRADA}=; Max-Age=0; path=/`;
    const abrir = setTimeout(() => setAbrindo(true), 750);
    const fim = setTimeout(() => html.classList.remove("entrada"), 3400);
    return () => { clearTimeout(abrir); clearTimeout(fim); };
  }, []);

  return <div aria-hidden className={`veu-entrada feltro ${abrindo ? "abrindo" : ""}`}>
    <div className="veu-conteudo flex flex-col items-center px-6 text-center">
      <Cadeado id="cadeado-veu" className="w-[clamp(104px,20vw,150px)]" />
      <p className="display mt-9 text-[clamp(2.2rem,7vw,4rem)] leading-none text-[var(--creme)]">Bem-vindo à pré-venda.</p>
    </div>
  </div>;
}
