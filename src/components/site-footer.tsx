"use client";

import Link from "next/link";
import { LogoNome, LogoSimbolo } from "./logo-meranno";
import { usePathname } from "next/navigation";
import { ESPADAS } from "@/lib/naipes";
import { EMPRESA } from "@/lib/empresa";
import { INSTAGRAM_URL } from "./whatsapp-button";

const LINKS = [
  { href: "/shop", label: "Loja" },
  { href: "/sobre-nos", label: "Sobre nós" },
  { href: "/meu-fit", label: "Meranno Fit" },
  { href: "/contact", label: "Contato" },
  { href: "/faq", label: "FAQ" },
  { href: "/entrega", label: "Entrega" },
  { href: "/trocas", label: "Trocas" },
  { href: "/privacidade", label: "Privacidade" },
  { href: "/termos", label: "Termos" },
  { href: INSTAGRAM_URL, label: "Instagram" },
];

export function SiteFooter() {
  const pathname = usePathname();
  // No footer on the checkout (2026-11-24, like the Saint Tropez one): its own links sit under the pay button.
  if (pathname.startsWith("/admin") || pathname.startsWith("/pagamento")) return null;
  // A brass line with the ace in the middle opens the footer (the sea waves that sat here went on 2026-11-17: the
  // owners no longer want sea imagery).
  return <footer className="bg-black text-white">
    <div aria-hidden className="flex items-center gap-4 px-6 pt-8 md:px-12"><span className="h-px flex-1 bg-[linear-gradient(90deg,transparent,var(--latao))]" /><svg viewBox="0 0 100 100" className="h-4 w-4"><path d={ESPADAS} fill="var(--latao)" /></svg><span className="h-px flex-1 bg-[linear-gradient(90deg,var(--latao),transparent)]" /></div>
    <div className="flex flex-col gap-8 px-6 pb-6 pt-8 md:flex-row md:items-center md:justify-between md:pl-12 md:pr-32 md:pt-6"><span className="flex flex-col items-start gap-2 text-white" aria-label="MERANNO" role="img"><LogoSimbolo className="h-9 w-auto" /><LogoNome className="h-auto w-[118px]" /></span><nav className="sans flex flex-wrap gap-x-5 text-[11px] uppercase tracking-[.15em]">{LINKS.map((link) => <Link key={link.href} href={link.href} className="toque inline-flex min-h-11 items-center transition-opacity hover:opacity-70">{link.label}</Link>)}</nav><span className="sans text-[11px] uppercase tracking-[.15em] text-white/75">© Meranno 2026</span></div>
    {/* Who sells, as the law asks every online shop to show in plain sight (Decreto 7.962/2013, art. 2). */}
    {/* Room at the bottom on phones for the Instagram and WhatsApp buttons, which float over the right side. */}
    <p className="sans px-6 pb-36 text-[11px] leading-relaxed text-white/55 md:pb-10 md:pl-12 md:pr-32">{EMPRESA.nome} · CNPJ {EMPRESA.cnpj} · {EMPRESA.enderecoCurto} · {EMPRESA.email}</p>
  </footer>;
}
