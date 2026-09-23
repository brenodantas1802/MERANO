"use client";

import { ArrowUpRight, Filter, SlidersHorizontal } from "lucide-react";
import Image from "next/image";
import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import { SiteHeader } from "@/components/site-header";
import { collections, products } from "@/lib/products";

function ShopContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("categoria") ?? "Todos";
  const [category, setCategory] = useState(initialCategory);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [showCollections, setShowCollections] = useState(false);
  const [sort, setSort] = useState("featured");
  const [query, setQuery] = useState("");
  const categories = useMemo(() => ["Todos", ...Array.from(new Set(products.map((product) => product.category)))], []);
  const filtered = useMemo(() => products.filter((product) => (category === "Todos" || product.category === category) && (!selectedCollection || product.collection === selectedCollection) && `${product.name} ${product.note}`.toLowerCase().includes(query.toLowerCase())).sort((a, b) => sort === "price-low" ? a.price - b.price : sort === "price-high" ? b.price - a.price : sort === "name" ? a.name.localeCompare(b.name) : 0), [category, selectedCollection, query, sort]);

  function pickCategory(value: string) { setCategory(value); setSelectedCollection(null); setShowCollections(false); }
  function pickCollection(id: string) { setSelectedCollection(id); setCategory("Todos"); setShowCollections(false); }

  return <div className="mx-auto max-w-360 px-6 py-16 md:px-12 md:py-24">
    <div className="flex flex-col justify-between gap-8 border-b border-[var(--line)] pb-10 md:flex-row md:items-end"><div><p className="sans mb-5 text-[10px] uppercase tracking-[.2em] text-[var(--muted)]">Descoberta</p><h1 className="display text-7xl md:text-9xl">Shop.</h1><p className="mt-6 max-w-md text-xl">Peças com origem, imagem e espaço para o seu jeito.</p></div><label className="sans flex w-full items-center gap-3 border-b border-[var(--ink)] pb-3 text-[10px] uppercase tracking-[.14em] md:w-72"><Filter size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar produtos" className="w-full bg-transparent outline-none" /></label></div>

    <div className="flex flex-wrap items-center justify-between gap-4 py-6">
      <div className="flex flex-wrap gap-2">
        {categories.map((value) => <button key={value} onClick={() => pickCategory(value)} className={`sans px-4 py-2 text-[10px] uppercase tracking-[.12em] ${!showCollections && category === value && !selectedCollection ? "bg-[var(--ink)] text-[var(--creme)]" : "border border-[var(--line)]"}`}>{value}</button>)}
        <button onClick={() => setShowCollections(true)} className={`sans px-4 py-2 text-[10px] uppercase tracking-[.12em] ${showCollections ? "bg-[var(--ink)] text-[var(--creme)]" : "border border-[var(--line)]"}`}>Coleções</button>
      </div>
      {!showCollections && <label className="sans flex items-center gap-2 text-[10px] uppercase tracking-[.12em]"><SlidersHorizontal size={14} /><select value={sort} onChange={(event) => setSort(event.target.value)} className="bg-transparent outline-none"><option value="featured">Em destaque</option><option value="price-low">Menor preço</option><option value="price-high">Maior preço</option><option value="name">Nome</option></select></label>}
    </div>

    {showCollections ? (
      <div className="grid gap-6 md:grid-cols-3">
        {collections.map((collection) => {
          const count = products.filter((product) => product.collection === collection.id).length;
          return <button key={collection.id} onClick={() => pickCollection(collection.id)} className="group relative flex aspect-square flex-col justify-end overflow-hidden text-left">
            <Image src={collection.image} alt={collection.name} fill className="object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/30 transition-colors duration-300 group-hover:bg-black/40" />
            <div className="relative z-10 p-6 text-white">
              <span className="sans text-[10px] uppercase tracking-[.14em]">{count} peça{count > 1 ? "s" : ""}</span>
              <h2 className="mt-2 flex items-center gap-2 text-3xl">{collection.name} <ArrowUpRight size={20} className="opacity-0 transition-opacity duration-300 group-hover:opacity-100" /></h2>
              <p className="sans mt-1 text-xs text-white/80">{collection.tagline}</p>
            </div>
          </button>;
        })}
      </div>
    ) : filtered.length ? (
      <div className="grid gap-x-6 gap-y-12 md:grid-cols-3">{filtered.map((product) => <ProductCard product={product} key={product.id} />)}</div>
    ) : (
      <div className="border-y border-[var(--line)] py-16"><p className="text-3xl">Nenhuma peça encontrada.</p><button onClick={() => { setQuery(""); pickCategory("Todos"); }} className="sans mt-6 border-b border-[var(--ink)] pb-2 text-[10px] uppercase tracking-[.14em]">Limpar filtros</button></div>
    )}
  </div>;
}

export default function ShopPage() {
  return <main><SiteHeader /><Suspense fallback={null}><ShopContent /></Suspense></main>;
}
