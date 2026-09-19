"use client";

import { Filter, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { ProductCard } from "@/components/product-card";
import { SiteHeader } from "@/components/site-header";
import { products } from "@/lib/products";

export default function ProductsPage() {
  const [category, setCategory] = useState("Todos");
  const [sort, setSort] = useState("featured");
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => products.filter((product) => (category === "Todos" || product.category === category) && `${product.name} ${product.note}`.toLowerCase().includes(query.toLowerCase())).sort((a, b) => sort === "price-low" ? a.price - b.price : sort === "price-high" ? b.price - a.price : a.name.localeCompare(b.name)), [category, query, sort]);
  return <main><SiteHeader /><div className="mx-auto max-w-360 px-6 py-16 md:px-12 md:py-24"><div className="flex flex-col justify-between gap-8 border-b border-[var(--line)] pb-10 md:flex-row md:items-end"><div><p className="sans mb-5 text-[10px] uppercase tracking-[.2em] text-[var(--muted)]">Descoberta</p><h1 className="display text-7xl md:text-9xl">Shop.</h1><p className="mt-6 max-w-md text-xl">Peças com origem, imagem e espaço para o seu jeito.</p></div><label className="sans flex w-full items-center gap-3 border-b border-[var(--ink)] pb-3 text-[10px] uppercase tracking-[.14em] md:w-72"><Filter size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar produtos" className="w-full bg-transparent outline-none" /></label></div><div className="flex flex-wrap items-center justify-between gap-4 py-6"><div className="flex gap-2">{["Todos", "Camisetas"].map((value) => <button key={value} onClick={() => setCategory(value)} className={`sans px-4 py-2 text-[10px] uppercase tracking-[.12em] ${category === value ? "bg-[var(--ink)] text-white" : "border border-[var(--line)]"}`}>{value}</button>)}</div><label className="sans flex items-center gap-2 text-[10px] uppercase tracking-[.12em]"><SlidersHorizontal size={14} /><select value={sort} onChange={(event) => setSort(event.target.value)} className="bg-transparent outline-none"><option value="featured">Em destaque</option><option value="price-low">Menor preço</option><option value="price-high">Maior preço</option><option value="name">Nome</option></select></label></div>{filtered.length ? <div className="grid gap-x-6 gap-y-12 md:grid-cols-3">{filtered.map((product) => <ProductCard product={product} key={product.id} />)}</div> : <div className="border-y border-[var(--line)] py-16"><p className="text-3xl">Nenhuma peça encontrada.</p><button onClick={() => { setQuery(""); setCategory("Todos"); }} className="sans mt-6 border-b border-[var(--ink)] pb-2 text-[10px] uppercase tracking-[.14em]">Limpar filtros</button></div>}</div></main>;
}
