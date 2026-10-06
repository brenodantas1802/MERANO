"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SeaWaves } from "./beach-art";

const LINKS = [
  { href: "/shop", label: "Loja" },
  { href: "/sobre-nos", label: "Sobre nós" },
  { href: "/meu-fit", label: "Merano Fit" },
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
    <div className="flex flex-col gap-8 px-6 pb-24 pt-10 md:flex-row md:items-center md:justify-between md:py-10 md:pl-12 md:pr-32"><Image src="/imagens/merano-assets/logo-principal.png" alt="Merano" width={120} height={80} className="h-14 w-auto object-contain object-left" /><nav className="sans flex flex-wrap gap-5 text-[11px] uppercase tracking-[.15em]">{LINKS.map((link) => <Link key={link.href} href={link.href} className="transition-opacity hover:opacity-70">{link.label}</Link>)}</nav><span className="sans text-[11px] uppercase tracking-[.15em] text-white/75">© Merano 2026</span></div>
  </footer></>;
}
