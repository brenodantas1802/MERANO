"use client";

import { ArrowUpRight, Filter, SlidersHorizontal } from "lucide-react";
import Image from "next/image";
import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import { SiteHeader } from "@/components/site-header";
import { collections, products } from "@/lib/products";
import { buscarProdutos } from "@/lib/busca";

const TEMAS_NOME: Record<string, string> = { mar: "Mar", frase: "Frases", esporte: "Esporte", fruta: "Frutas", minimal: "Minimal", urbano: "Cidade" };

type Filtros = { categoria?: string | null; tema?: string | null; colecao?: string | null };

// The shop itself. The server sends it already filled (all pieces, no filters), so nothing jumps while the page loads;
// in the browser it picks up the filters from the address.
function ShopView({ inicial = {} }: { inicial?: Filtros }) {
  // ?tema=<tag> comes from the theme circles on the home page.
  const [tema, setTema] = useState(inicial.tema ?? null);
  const [category, setCategory] = useState(inicial.categoria ?? "Todos");
  // ?colecao=<id> comes from the menu, the home shelf and Categorias.
  const [selectedCollection, setSelectedCollection] = useState<string | null>(inicial.colecao ?? null);
  const [showCollections, setShowCollections] = useState(false);
  const [sort, setSort] = useState("featured");
  const [query, setQuery] = useState("");
  const categories = useMemo(() => ["Todos", ...Array.from(new Set(products.map((product) => product.category)))], []);
  const filtered = useMemo(() => buscarProdutos(products, query).filter((product) => (category === "Todos" || product.category === category) && (!selectedCollection || product.collection === selectedCollection) && (!tema || product.tags.includes(tema))).sort((a, b) => sort === "price-low" ? a.price - b.price : sort === "price-high" ? b.price - a.price : sort === "name" ? a.name.localeCompare(b.name) : 0), [category, selectedCollection, query, sort, tema]);

  function pickCategory(value: string) { setCategory(value); setSelectedCollection(null); setShowCollections(false); }
  function pickCollection(id: string) { setSelectedCollection(id); setCategory("Todos"); setShowCollections(false); }

  return <><div className="mx-auto max-w-360 px-6 pb-6 pt-10 md:px-12 md:pt-14">
    <div className="flex flex-col justify-between gap-6 border-b border-[var(--line)] pb-6 md:flex-row md:items-end"><h1 className="display text-5xl md:text-6xl">Shop</h1><label className="sans flex min-h-11 w-full items-center gap-3 border-b border-[var(--ink)] text-[11px] uppercase tracking-[.14em] md:w-72"><Filter size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar produtos" className="h-11 w-full bg-transparent outline-none" /></label></div>

    <div className="flex flex-wrap items-center justify-between gap-4 py-6">
      <div className="flex flex-wrap gap-2">
        {categories.map((value) => <button key={value} onClick={() => pickCategory(value)} className={`sans min-h-11 px-4 text-[11px] uppercase tracking-[.12em] ${!showCollections && category === value && !selectedCollection ? "bg-[var(--ink)] text-[var(--creme)]" : "border border-[var(--line)]"}`}>{value}</button>)}
        {selectedCollection && <button onClick={() => setSelectedCollection(null)} className="sans flex min-h-11 items-center gap-2 bg-[var(--ink)] px-4 text-[11px] uppercase tracking-[.12em] text-[var(--creme)]">{collections.find((item) => item.id === selectedCollection)?.name ?? "Coleção"} ✕</button>}
        {tema && <button onClick={() => setTema(null)} className="sans flex items-center gap-2 rounded-full bg-[var(--ink)] px-4 py-2 text-[11px] uppercase tracking-[.12em] text-[var(--creme)]">{TEMAS_NOME[tema] ?? tema} ✕</button>}
        <button onClick={() => setShowCollections(true)} className={`sans min-h-11 px-4 text-[11px] uppercase tracking-[.12em] ${showCollections ? "bg-[var(--ink)] text-[var(--creme)]" : "border border-[var(--line)]"}`}>Coleções</button>
      </div>
      {!showCollections && <label className="sans flex items-center gap-2 text-[11px] uppercase tracking-[.12em]"><SlidersHorizontal size={14} /><select value={sort} onChange={(event) => setSort(event.target.value)} className="h-11 bg-transparent outline-none"><option value="featured">Em destaque</option><option value="price-low">Menor preço</option><option value="price-high">Maior preço</option><option value="name">Nome</option></select></label>}
    </div>

    {showCollections ? (
      <div className="grid gap-6 md:grid-cols-3">
        {collections.map((collection) => {
          const count = products.filter((product) => product.collection === collection.id).length;
          return <button key={collection.id} onClick={() => pickCollection(collection.id)} className="group relative flex aspect-square flex-col justify-end overflow-hidden bg-[var(--areia)] text-left">
            <Image src={collection.image} alt="" fill sizes="(min-width: 768px) 33vw, 100vw" className="object-contain p-[12%] pb-[30%] transition-transform duration-700 ease-out group-hover:scale-105" />
            <div className="relative z-10 p-6 text-[var(--ink)]">
              <span className="sans text-[11px] uppercase tracking-[.14em]">{count} peça{count > 1 ? "s" : ""}</span>
              <h2 className="mt-2 flex items-center gap-2 text-3xl">{collection.name} <ArrowUpRight size={20} className="opacity-0 transition-opacity duration-300 group-hover:opacity-100" /></h2>
              <p className="sans mt-1 text-xs text-[var(--muted)]">{collection.tagline}</p>
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

function ShopContent() {
  const searchParams = useSearchParams();
  return <ShopView inicial={{ categoria: searchParams.get("categoria"), tema: searchParams.get("tema"), colecao: searchParams.get("colecao") }} />;
}

export default function ShopPage() {
  return <main><SiteHeader /><Suspense fallback={<ShopView />}><ShopContent /></Suspense></main>;
}
