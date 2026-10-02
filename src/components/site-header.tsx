"use client";

import { Menu, Search, ShoppingCart, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useCart } from "./cart-provider";
import { MeranoSymbol } from "./merano-symbol";
import { formatPrice, getProductPrice, products } from "@/lib/products";

const NAV_LINKS = [
  { href: "/a-marca", label: "A marca" },
  { href: "/shop", label: "Shop" },
  { href: "/categorias", label: "Categorias" },
  { href: "/meu-fit", label: "Meu Merano Fit" },
  { href: "/sobre-mim", label: "Sobre mim" },
  { href: "/provador", label: "Provador" },
];
const INLINE_LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/a-marca", label: "Identidade" },
  { href: "/meu-fit", label: "Merano Fit" },
  { href: "/provador", label: "Provador" },
];
const EASE = [0.22, 1, 0.36, 1] as const;
const ROUND = "flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-300";
const OUTLINE = `${ROUND} border border-[var(--ink)]/20 bg-[var(--paper)] text-[var(--ink)] hover:border-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--paper)]`;

// Floating "island" header: a rounded bar of frosted sand glass, detached from the page edges.
// On the home page it floats over the hero video (`overlay`); elsewhere it sticks to the top as the page scrolls under it.
export function SiteHeader({ overlay = false }: { overlay?: boolean }) {
  const { count, openDrawer } = useCart();
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchInput = useRef<HTMLInputElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const term = query.trim().toLowerCase();
  // With nothing typed yet the panel suggests a few pieces instead of showing an empty box.
  const matches = (term ? products.filter((product) => `${product.name} ${product.category} ${product.note} ${product.tags.join(" ")}`.toLowerCase().includes(term)) : products).slice(0, 4);

  useEffect(() => {
    if (!searchOpen) return;
    searchInput.current?.focus();
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setSearchOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [searchOpen]);

  // Sticky sections sit just under the header, whose height changes when a panel opens.
  useEffect(() => {
    const element = headerRef.current;
    if (!element) return;
    const observer = new ResizeObserver(() => document.documentElement.style.setProperty("--header-h", `${Math.round(element.getBoundingClientRect().height)}px`));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const closeSearch = () => { setSearchOpen(false); setQuery(""); };
  const toggleSearch = () => { setMenuOpen(false); if (searchOpen) closeSearch(); else setSearchOpen(true); };
  const toggleMenu = () => { closeSearch(); setMenuOpen((open) => !open); };
  const panel = "mx-auto mt-2 max-w-360 overflow-hidden rounded-3xl border border-white/60 bg-[var(--paper)]/95 shadow-[0_24px_50px_-30px_rgba(6,24,30,.55)] backdrop-blur-xl";

  return <header ref={headerRef} className={`${overlay ? "fixed inset-x-0" : "sticky"} top-0 z-50 px-3 pt-3 text-[var(--ink)] md:px-5`}>
    <div className="sans mx-auto flex max-w-360 items-center justify-between gap-3 rounded-full border border-white/60 bg-[var(--paper)]/80 py-2 pl-4 pr-2 shadow-[0_18px_40px_-24px_rgba(6,24,30,.6)] backdrop-blur-xl md:pl-5">
      <Link href="/" aria-label="Merano - início" className="flex items-center gap-2.5 md:gap-3">
        <MeranoSymbol className="h-7 w-auto md:h-8" ink="#19231e" />
        <span className="wordmark text-[15px] font-light tracking-[.42em] md:text-[19px] md:tracking-[.5em]">MERANO</span>
      </Link>

      <nav aria-label="Principal" className="hidden items-center gap-1 lg:flex">
        {INLINE_LINKS.map((link) => {
          const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
          return <Link key={link.href} href={link.href} aria-current={active ? "page" : undefined} className={`rounded-full px-4 py-2 text-[15px] font-medium tracking-[.02em] transition-colors duration-300 ${active ? "bg-[var(--ink)] text-[var(--paper)]" : "text-[var(--ink)] hover:bg-[var(--ink)]/[.08]"}`}>{link.label}</Link>;
        })}
      </nav>

      <div className="flex items-center gap-2">
        <button type="button" onClick={openDrawer} aria-label={`Abrir carrinho (${count} ${count === 1 ? "item" : "itens"})`} className={`${OUTLINE} relative`}>
          <ShoppingCart size={17} strokeWidth={1.6} />
          {count > 0 && <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[var(--sol-1)] px-1 text-[10px] font-semibold text-white ring-2 ring-[var(--paper)]">{count}</span>}
        </button>
        <button type="button" onClick={toggleSearch} aria-label={searchOpen ? "Fechar busca" : "Buscar produtos"} aria-expanded={searchOpen} className={OUTLINE}>
          {searchOpen ? <X size={17} strokeWidth={1.6} /> : <Search size={17} strokeWidth={1.6} />}
        </button>
        <button type="button" onClick={toggleMenu} aria-label={menuOpen ? "Fechar menu" : "Abrir menu"} aria-expanded={menuOpen} className={`${ROUND} bg-[var(--ink)] text-[var(--paper)] shadow-[0_6px_16px_-8px_rgba(25,35,30,.6)] hover:bg-[var(--terra-dark)]`}>
          <motion.span animate={{ rotate: menuOpen ? 90 : 0 }} transition={{ duration: 0.3, ease: EASE }} className="flex">{menuOpen ? <X size={17} strokeWidth={1.6} /> : <Menu size={17} strokeWidth={1.6} />}</motion.span>
        </button>
      </div>
    </div>

    <AnimatePresence initial={false}>
      {searchOpen && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4, ease: EASE }} className={panel}>
          <div className="px-6 pb-8 pt-6 md:px-10">
            <input ref={searchInput} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="O que você procura?" aria-label="Buscar produtos" className="display w-full border-b border-[var(--ink)]/25 bg-transparent pb-3 text-3xl outline-none placeholder:text-[var(--ink)]/35 focus:border-[var(--ink)] md:text-4xl" />
            {matches.length ? <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
              {matches.map((product) => <Link key={product.id} href={`/produto/${product.id}`} onClick={closeSearch} className="group flex items-center gap-3">
                <span className="relative h-16 w-14 shrink-0 overflow-hidden bg-[var(--cream)]"><Image src={product.image} alt="" fill sizes="56px" className="object-cover transition-transform duration-500 group-hover:scale-105" /></span>
                <span className="min-w-0"><span className="block truncate text-base">{product.name}</span><span className="sans block text-xs text-[var(--muted)]">{formatPrice(getProductPrice(product))}</span></span>
              </Link>)}
            </div> : <p className="sans mt-6 text-sm text-[var(--muted)]">Nenhuma peça com esse nome — tente “barco”, “tênis” ou “café”.</p>}
          </div>
        </motion.div>
      )}
    </AnimatePresence>

    <AnimatePresence initial={false}>
      {menuOpen && (
        <motion.nav aria-label="Menu" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4, ease: EASE }} className={`sans text-[11px] uppercase tracking-[.15em] ${panel}`}>
          <div className="grid grid-cols-1 gap-5 px-6 py-6 md:grid-flow-col md:grid-cols-none md:grid-rows-3 md:gap-x-16 md:gap-y-5 md:px-10">
            {NAV_LINKS.map((link) => <Link key={link.href} onClick={() => setMenuOpen(false)} href={link.href}>{link.label}</Link>)}
            <Link onClick={() => setMenuOpen(false)} href="/carrinho" className="flex items-center gap-2">Carrinho{count > 0 && <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--ink)] px-1 text-[9px] text-[var(--creme)]">{count}</span>}</Link>
            <Link onClick={() => setMenuOpen(false)} href="/conta">Conta</Link>
            <Link onClick={() => setMenuOpen(false)} href="/personalizar-estampa">Personalizar estampa</Link>
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  </header>;
}
