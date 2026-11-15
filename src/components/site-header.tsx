"use client";

import { Menu, Search, ShoppingCart, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { useCart } from "./cart-provider";
import { MeranoSymbol } from "./merano-symbol";
import { products } from "@/lib/products";

// The big links at the top of the menu; the rest of NAV_LINKS follow in a quieter list.
const MENU_PRINCIPAL = [
  { href: "/shop", label: "Shop" },
  { href: "/personalizar-estampa", label: "Personalizar estampa" },
  { href: "/provador", label: "Provador virtual" },
];

const NAV_LINKS = [
  { href: "/sobre-nos", label: "Sobre nós" },
  { href: "/shop", label: "Shop" },
  { href: "/categorias", label: "Categorias" },
  { href: "/meu-fit", label: "Meranno Fit" },
  { href: "/provador", label: "Provador" },
];

// The account mark: a head over a rounded body, drawn to match the search and cart icons.
function AccountIcon() {
  return <svg viewBox="0 0 24 24" width="23" height="23" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinejoin="round" aria-hidden>
    <circle cx="12" cy="7.6" r="3.4" />
    <path d="M5.5 20v-4a3 3 0 0 1 3-3h7a3 3 0 0 1 3 3v4z" />
  </svg>;
}
const EASE = [0.22, 1, 0.36, 1] as const;
const ROUND = "flex h-11 w-11 items-center justify-center rounded-full transition-colors duration-300";
const OUTLINE = `${ROUND} border border-[var(--ink)]/20 bg-[var(--paper)] text-[var(--ink)] hover:border-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--paper)]`;
// Over the home video, before scrolling: the same buttons in white.
const OUTLINE_CLEAR = `${ROUND} border border-white/60 text-white hover:bg-white hover:text-[var(--ink)]`;

// Full-width header: menu on the left, the Meranno mark in the middle, search, cart and account on the right.
// On the home page it lies clear over the hero video (`overlay`) and turns solid once the page scrolls; elsewhere it is
// solid and sticks to the top.
export function SiteHeader({ overlay = false }: { overlay?: boolean }) {
  const { count, openDrawer } = useCart();
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  // The menu is portalled to <body> so it sits above every floating button; only once the page runs in the browser.
  const noNavegador = useSyncExternalStore(() => () => {}, () => true, () => false);
  const [query, setQuery] = useState("");
  const searchInput = useRef<HTMLInputElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);
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

  // The open menu holds the page still and closes with Escape.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setMenuOpen(false); };
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = overflow; window.removeEventListener("keydown", onKey); };
  }, [menuOpen]);

  useEffect(() => {
    if (!overlay) return;
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [overlay]);

  const closeSearch = () => { setSearchOpen(false); setQuery(""); };
  const toggleSearch = () => { setMenuOpen(false); if (searchOpen) closeSearch(); else setSearchOpen(true); };
  const toggleMenu = () => { closeSearch(); setMenuOpen((open) => !open); };
  const panel = "glass mx-2 mt-2 overflow-hidden rounded-[28px]";
  const clear = overlay && !scrolled && !menuOpen && !searchOpen;
  const outline = clear ? OUTLINE_CLEAR : OUTLINE;

  return <header ref={headerRef} data-clear={clear || undefined} className={`${overlay ? "fixed inset-x-0" : "sticky"} top-0 z-50 text-[var(--ink)]`}>
    <div className={`sans grid h-16 grid-cols-[1fr_auto_1fr] items-center gap-3 border-b px-3 transition-colors duration-300 md:px-6 ${clear ? "border-transparent bg-transparent" : "border-[var(--line)] bg-[var(--paper)]"}`}>
      <div className="flex items-center">
        <button type="button" onClick={toggleMenu} aria-label={menuOpen ? "Fechar menu" : "Abrir menu"} aria-expanded={menuOpen} className={outline}>
          <motion.span animate={{ rotate: menuOpen ? 90 : 0 }} transition={{ duration: 0.3, ease: EASE }} className="flex">{menuOpen ? <X size={17} strokeWidth={1.6} /> : <Menu size={17} strokeWidth={1.6} />}</motion.span>
        </button>
      </div>

      <Link href="/" aria-label="Meranno - início" className="flex min-h-11 items-center gap-2.5 md:gap-3">
        <MeranoSymbol className="h-6 w-auto min-[400px]:h-7 md:h-8" ink={clear ? "#ffffff" : "#111111"} />
        <Image src="/imagens/logo-nome-trimmed.png" alt="MERANNO" width={655} height={66} priority className={`h-auto w-[108px] min-[400px]:w-[122px] transition-[filter] duration-300 md:w-[187px] ${clear ? "brightness-0 invert" : ""}`} />
      </Link>

      <div className="flex items-center justify-end gap-1.5 md:gap-2">
        <button type="button" onClick={toggleSearch} aria-label={searchOpen ? "Fechar busca" : "Buscar produtos"} aria-expanded={searchOpen} className={outline}>
          {searchOpen ? <X size={17} strokeWidth={1.6} /> : <Search size={17} strokeWidth={1.6} />}
        </button>
        <button type="button" onClick={openDrawer} aria-label={`Abrir carrinho (${count} ${count === 1 ? "item" : "itens"})`} className={`${outline} relative`}>
          <ShoppingCart size={17} strokeWidth={1.6} />
          {count > 0 && <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[var(--sol-1)] px-1 text-[11px] font-semibold text-white ring-2 ring-[var(--paper)]">{count}</span>}
        </button>
        <Link href="/conta" aria-label="Minha conta" aria-current={pathname === "/conta" ? "page" : undefined} className={`${ROUND} ${clear ? "bg-white text-[var(--ink)]" : "bg-[var(--ink)] text-[var(--paper)] hover:bg-[var(--mar-fundo)]"}`}><AccountIcon /></Link>
      </div>
    </div>

    <AnimatePresence initial={false}>
      {searchOpen && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.24, ease: [0.2, 0.8, 0.2, 1] }} className={panel}>
          <div className="px-6 pb-8 pt-6 md:px-10">
            <input ref={searchInput} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="O que você procura?" aria-label="Buscar produtos" className="display w-full border-b border-[var(--ink)]/25 bg-transparent pb-3 text-3xl outline-none placeholder:text-[var(--ink)]/35 focus:border-[var(--ink)] md:text-4xl" />
            {matches.length ? <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
              {matches.map((product) => <Link key={product.id} href={`/produto/${product.id}`} onClick={closeSearch} className="group flex items-center gap-3">
                <span className="relative h-16 w-14 shrink-0 overflow-hidden bg-[var(--cream)]"><Image src={product.image} alt="" fill sizes="56px" className="object-cover transition-transform duration-500 group-hover:scale-105" /></span>
                <span className="min-w-0 truncate text-base font-medium">{product.name}</span>
              </Link>)}
            </div> : <p className="sans mt-6 text-sm text-[var(--muted)]">Nenhuma peça com esse nome — tente “barco”, “tênis” ou “café”.</p>}
          </div>
        </motion.div>
      )}
    </AnimatePresence>

    {noNavegador && createPortal(<AnimatePresence>
      {menuOpen && <>
        <motion.div key="menu-fundo" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} onClick={() => setMenuOpen(false)} className="fixed inset-0 z-[95] bg-black/20" />
        <motion.nav key="menu" aria-label="Menu" initial={{ opacity: 0, scale: 0.97, y: -8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98, y: -6 }} transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }} style={{ transformOrigin: "top left" }} className="glass fixed left-2 top-2 z-[96] flex max-h-[calc(100dvh-1rem)] w-[calc(100%-1rem)] max-w-[420px] flex-col overflow-y-auto overscroll-contain rounded-[28px] text-[var(--ink)]">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center px-4 pt-4">
            <button type="button" onClick={() => setMenuOpen(false)} aria-label="Fechar menu" className="press glass-tile flex h-11 w-11 items-center justify-center rounded-full"><X size={17} strokeWidth={1.6} /></button>
            <Image src="/imagens/logo-nome-trimmed.png" alt="MERANNO" width={655} height={66} className="h-auto w-[112px]" />
            <span />
          </div>
          <div className="px-6 pb-2 pt-6">
            {MENU_PRINCIPAL.map((link, index) => <motion.div key={link.href} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.22, delay: 0.03 * index, ease: [0.2, 0.8, 0.2, 1] }}>
              <Link onClick={() => setMenuOpen(false)} href={link.href} aria-current={pathname === link.href ? "page" : undefined} className="press block py-1.5 text-[26px] leading-tight hover:opacity-70">{link.label}</Link>
            </motion.div>)}
          </div>
          <div className="mx-6 mt-3 border-t border-black/10 pt-3">
            {NAV_LINKS.filter((link) => !MENU_PRINCIPAL.some((item) => item.href === link.href)).map((link) => <Link key={link.href} onClick={() => setMenuOpen(false)} href={link.href} className="press flex min-h-11 items-center justify-between text-[15px]">{link.label}<span aria-hidden className="text-black/30">›</span></Link>)}
          </div>
          <div className="px-6 pb-6 pt-4">
            <p className="label text-[11px] text-[var(--muted)]">Lançamento</p>
            <div className="mt-3 flex flex-col items-start gap-2">
              {products.filter((product, index, all) => product.lancamento && all.findIndex((other) => other.name.split(" · ")[0] === product.name.split(" · ")[0]) === index).map((product) => <Link key={product.id} href={`/produto/${product.id}`} onClick={() => setMenuOpen(false)} className="press glass-tile flex items-center gap-2.5 rounded-full py-1.5 pl-1.5 pr-4 text-[13px]">
                <span className="relative h-8 w-8 overflow-hidden rounded-full bg-white"><Image src={product.image} alt="" fill sizes="32px" className="object-cover" /></span>{product.name}
              </Link>)}
            </div>
          </div>
        </motion.nav>
      </>}
    </AnimatePresence>, document.body)}
  </header>;
}
