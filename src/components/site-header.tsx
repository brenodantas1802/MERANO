"use client";

import { Menu, ShoppingBag } from "lucide-react";
import { Search, X, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "./cart-provider";
import { products } from "@/lib/products";

export function SiteHeader() {
  const { count } = useCart();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const matches = products.filter((product) => `${product.name} ${product.category} ${product.note}`.toLowerCase().includes(query.toLowerCase())).slice(0, 4);
  return <>
    <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[var(--paper)]/95 backdrop-blur-md">
      <div className="sans mx-auto flex max-w-360 items-center justify-between px-4 py-1 text-[11px] uppercase tracking-[.18em] md:px-12 md:py-1"><Link href="/" aria-label="Merano - início" className="flex h-16 w-52 items-center gap-2 md:h-20 md:w-72 md:gap-4"><Image src="/imagens/logo-simbolo-escura.png" alt="" width={96} height={64} className="h-12 w-16 object-contain md:h-16 md:w-24" /><Image src="/imagens/logo-nome-escura.png" alt="MERANO" width={260} height={48} className="h-9 w-36 object-contain object-left md:h-12 md:w-56" /></Link><nav className="hidden gap-7 md:flex"><Link href="/produtos">Shop</Link><Link href="/#colecao">New in</Link><Link href="/produtos?categoria=Camisetas">Categorias</Link><Link href="/#feito">Sob demanda</Link><Link href="/about">A marca</Link></nav><div className="flex items-center gap-3 md:gap-4"><button onClick={() => setSearchOpen(!searchOpen)} aria-label="Buscar produtos"><Search size={17} strokeWidth={1.5} /></button><Link href="/conta" className="hidden md:block">Conta</Link><Link href="/carrinho" className="relative" aria-label="Abrir carrinho"><ShoppingBag size={18} strokeWidth={1.5} />{count > 0 && <span className="absolute -right-3 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--ink)] px-1 text-[9px] text-white">{count}</span>}</Link><button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden" aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}>{menuOpen ? <X size={19} /> : <Menu size={19} />}</button></div></div>
      {searchOpen && <div className="border-t border-[var(--line)] px-6 py-4 md:px-12"><div className="mx-auto flex max-w-360 items-center gap-3"><Search size={16} /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por produto ou categoria" className="sans w-full bg-transparent text-sm outline-none" />{query && <button onClick={() => setQuery("")} aria-label="Limpar busca"><X size={15} /></button>}</div>{query && <div className="mx-auto max-w-360 border-t border-[var(--line)] pt-3">{matches.length ? matches.map((product) => <Link onClick={() => setSearchOpen(false)} href={`/produtos/${product.id}`} key={product.id} className="sans flex items-center justify-between py-2 text-xs"><span>{product.name}</span><ArrowUpRight size={14} /></Link>) : <p className="sans py-2 text-xs text-[var(--muted)]">Nenhum produto encontrado.</p>}</div>}</div>}
      {menuOpen && <nav className="sans border-t border-[var(--line)] px-6 py-5 text-[11px] uppercase tracking-[.15em] md:hidden"><div className="grid gap-5"><Link onClick={() => setMenuOpen(false)} href="/produtos">Shop</Link><Link onClick={() => setMenuOpen(false)} href="/#colecao">New in</Link><Link onClick={() => setMenuOpen(false)} href="/produtos?categoria=Camisetas">Categorias</Link><Link onClick={() => setMenuOpen(false)} href="/conta">Minha conta</Link><Link onClick={() => setMenuOpen(false)} href="/contact">Contato</Link></div></nav>}
    </header>
  </>;
}
