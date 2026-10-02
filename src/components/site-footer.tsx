"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SeaWaves } from "./beach-art";
import { Illustration } from "./illustration";

const LINKS = [
  { href: "/shop", label: "Loja" },
  { href: "/a-marca", label: "A marca" },
  { href: "/meu-fit", label: "Meu Merano Fit" },
  { href: "/contact", label: "Contato" },
  { href: "/faq", label: "FAQ" },
  { href: "/entrega", label: "Entrega" },
  { href: "/trocas", label: "Trocas" },
  { href: "/privacidade", label: "Privacidade" },
  { href: "/termos", label: "Termos" },
];

// Pages whose own background is dark all the way down.
const DARK_PAGES = ["/personalizar-estampa"];
// Pages with the shallow-water background, which continues behind the waves.
const RIPPLE_PAGES = ["/carrinho"];

export function SiteFooter() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;
  // The waves sit between the page and the footer, so behind them goes the colour of the page above.
  const above = DARK_PAGES.some((page) => pathname.startsWith(page)) ? "bg-[var(--terra-dark)]" : RIPPLE_PAGES.some((page) => pathname.startsWith(page)) ? "ripples-plain" : "bg-[var(--paper)]";
  return <><SeaWaves into="#000" className={`-mb-px ${above}`} /><footer className="bg-black text-white">
    <div className="flex flex-col items-start justify-between gap-6 border-b border-white/15 px-6 pb-10 pt-14 md:flex-row md:items-end md:px-12">
      <p className="display max-w-2xl text-4xl md:text-6xl">Lugares simples,<br /><i>dias inesquecíveis.</i></p>
      <div className="flex items-center gap-4 text-[var(--sol-2)]"><Illustration name="barco" color="var(--sol-2)" className="w-24" /><span className="script -rotate-3 text-2xl">feito no Brasil, sob demanda.</span></div>
    </div>
    <div className="flex flex-col gap-8 px-6 pb-24 pt-10 md:flex-row md:items-center md:justify-between md:py-10 md:pl-12 md:pr-32"><Image src="/imagens/merano-assets/logo-principal.png" alt="Merano" width={120} height={80} className="h-14 w-auto object-contain object-left" /><nav className="sans flex flex-wrap gap-5 text-[10px] uppercase tracking-[.15em]">{LINKS.map((link) => <Link key={link.href} href={link.href} className="transition-opacity hover:opacity-70">{link.label}</Link>)}</nav><span className="sans text-[10px] uppercase tracking-[.15em]">Feito para quem entende exclusividade. · © Merano 2026</span></div>
  </footer></>;
}
