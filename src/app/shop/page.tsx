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

  return <><div className="mx-auto max-w-360 px-6 pb-6 pt-10 md:px-12 md:pt-14">
    <div className="flex flex-col justify-between gap-6 border-b border-[var(--line)] pb-6 md:flex-row md:items-end"><h1 className="display text-5xl md:text-6xl">Shop</h1><label className="sans flex w-full items-center gap-3 border-b border-[var(--ink)] pb-3 text-[11px] uppercase tracking-[.14em] md:w-72"><Filter size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar produtos" className="w-full bg-transparent outline-none" /></label></div>

    <div className="flex flex-wrap items-center justify-between gap-4 py-6">
      <div className="flex flex-wrap gap-2">
        {categories.map((value) => <button key={value} onClick={() => pickCategory(value)} className={`sans px-4 py-2 text-[11px] uppercase tracking-[.12em] ${!showCollections && category === value && !selectedCollection ? "bg-[var(--ink)] text-[var(--creme)]" : "border border-[var(--line)]"}`}>{value}</button>)}
        <button onClick={() => setShowCollections(true)} className={`sans px-4 py-2 text-[11px] uppercase tracking-[.12em] ${showCollections ? "bg-[var(--ink)] text-[var(--creme)]" : "border border-[var(--line)]"}`}>Coleções</button>
      </div>
      {!showCollections && <label className="sans flex items-center gap-2 text-[11px] uppercase tracking-[.12em]"><SlidersHorizontal size={14} /><select value={sort} onChange={(event) => setSort(event.target.value)} className="bg-transparent outline-none"><option value="featured">Em destaque</option><option value="price-low">Menor preço</option><option value="price-high">Maior preço</option><option value="name">Nome</option></select></label>}
    </div>

    {showCollections ? (
      <div className="grid gap-6 md:grid-cols-3">
        {collections.map((collection) => {
          const count = products.filter((product) => product.collection === collection.id).length;
          return <button key={collection.id} onClick={() => pickCollection(collection.id)} className="group relative flex aspect-square flex-col justify-end overflow-hidden text-left">
            <Image src={collection.image} alt={collection.name} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/30 transition-colors duration-300 group-hover:bg-black/40" />
            <div className="relative z-10 p-6 text-white">
              <span className="sans text-[11px] uppercase tracking-[.14em]">{count} peça{count > 1 ? "s" : ""}</span>
              <h2 className="mt-2 flex items-center gap-2 text-3xl">{collection.name} <ArrowUpRight size={20} className="opacity-0 transition-opacity duration-300 group-hover:opacity-100" /></h2>
              <p className="sans mt-1 text-xs text-white/80">{collection.tagline}</p>
            </div>
          </button>;
        })}
      </div>
    ) : !filtered.length && (
      <div className="border-y border-[var(--line)] py-16"><p className="text-3xl">Nenhuma peça encontrada.</p><button onClick={() => { setQuery(""); pickCategory("Todos"); }} className="sans mt-6 border-b border-[var(--ink)] pb-2 text-[11px] uppercase tracking-[.14em]">Limpar filtros</button></div>
    )}
  </div>
  {/* The pieces run edge to edge, three across. */}
  {!showCollections && filtered.length > 0 && <div className="grid grid-cols-2 gap-1 px-1 pb-14 md:grid-cols-3">{filtered.map((product) => <ProductCard product={product} key={product.id} />)}</div>}
  </>;
}

export default function ShopPage() {
  return <main><SiteHeader /><Suspense fallback={null}><ShopContent /></Suspense></main>;
}
