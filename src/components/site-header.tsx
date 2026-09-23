"use client";

import { ArrowUpRight, Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useCart } from "./cart-provider";
import { GooeyInput } from "./ui/gooey-input";
import { products } from "@/lib/products";

const NAV_LINKS = [
  { href: "/a-marca", label: "A marca" },
  { href: "/shop", label: "Shop" },
  { href: "/categorias", label: "Categorias" },
  { href: "/meu-fit", label: "Meu Merano Fit" },
  { href: "/provador", label: "Provador" },
];

export function SiteHeader() {
  const { count } = useCart();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const matches = products.filter((product) => `${product.name} ${product.category} ${product.note}`.toLowerCase().includes(query.toLowerCase())).slice(0, 4);
  return <>
    <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[var(--paper)]/95 text-[var(--ink)] backdrop-blur-md">
      <div className="sans mx-auto grid max-w-360 grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-3 text-[11px] uppercase tracking-[.18em] md:px-12">
        <button onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? "Fechar menu" : "Abrir menu"} className="flex h-10 w-10 items-center justify-center justify-self-start border border-[var(--line)] transition-colors hover:bg-[var(--ink)] hover:text-[var(--creme)]">
          <motion.span animate={{ rotate: menuOpen ? 90 : 0 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} className="flex">
            {menuOpen ? <X size={18} strokeWidth={1.5} /> : <Menu size={18} strokeWidth={1.5} />}
          </motion.span>
        </button>

        <Link href="/" aria-label="Merano - início" className="flex items-center gap-3 justify-self-center md:gap-4">
          <Image src="/imagens/logo-simbolo-trimmed.png" alt="" width={505} height={307} className="h-9 w-14 object-contain md:h-12 md:w-20" />
          <Image src="/imagens/logo-nome-trimmed.png" alt="MERANO" width={560} height={66} className="h-9 w-40 object-contain md:h-12 md:w-56" />
        </Link>

        <div className="flex items-center justify-self-end"><GooeyInput
          placeholder="Buscar produtos"
          value={query}
          onValueChange={setQuery}
          onOpenChange={setSearchOpen}
          collapsedWidth={40}
          expandedWidth={208}
          expandedOffset={44}
          classNames={{
            trigger: "px-2 bg-[var(--ink)] text-[var(--creme)] ring-[var(--areia)]/50 focus-visible:ring-[var(--areia)] focus-visible:ring-offset-[var(--creme)]",
            bubbleSurface: "bg-[var(--ink)] text-[var(--creme)] ring-[var(--areia)]/50",
            input: "text-[var(--creme)] placeholder:text-[var(--creme)]/50",
          }}
        /></div>
      </div>

      {searchOpen && query && <div className="border-t border-[var(--line)] px-6 py-4 md:px-12"><div className="mx-auto max-w-360">{matches.length ? matches.map((product) => <Link onClick={() => setSearchOpen(false)} href={`/produto/${product.id}`} key={product.id} className="sans flex items-center justify-between py-2 text-xs"><span>{product.name}</span><ArrowUpRight size={14} /></Link>) : <p className="sans py-2 text-xs text-[var(--muted)]">Nenhum produto encontrado.</p>}</div></div>}

      <AnimatePresence initial={false}>
        {menuOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="sans overflow-hidden border-t border-[var(--line)] text-[11px] uppercase tracking-[.15em]"
          >
            <div className="px-6 py-6">
              <div className="mx-auto grid max-w-360 grid-cols-1 gap-5 md:grid-flow-col md:grid-cols-none md:grid-rows-3 md:gap-x-16 md:gap-y-5">
                {NAV_LINKS.map((link) => <Link key={link.href} onClick={() => setMenuOpen(false)} href={link.href}>{link.label}</Link>)}
                <Link onClick={() => setMenuOpen(false)} href="/carrinho" className="flex items-center gap-2">Carrinho{count > 0 && <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--ink)] px-1 text-[9px] text-[var(--creme)]">{count}</span>}</Link>
                <Link onClick={() => setMenuOpen(false)} href="/conta">Conta</Link>
                <Link onClick={() => setMenuOpen(false)} href="/provador-3d">Provador 3D</Link>
                <Link onClick={() => setMenuOpen(false)} href="/personalizar-estampa">Personalizar estampa</Link>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  </>;
}
