"use client";

import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { useCart } from "./cart-provider";
import type { Product } from "@/lib/products";
import { getProductPrice } from "@/lib/products";

export function AddToCart({ product }: { product: Product }) {
  const [fit, setFit] = useState("M");
  const [color, setColor] = useState(product.colors[0]);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();
  function submit() { addItem({ id: `${product.id}-${fit}-${color}`, name: product.name, price: getProductPrice(product), size: fit, fit, color }); setAdded(true); }
  return <div className="sans"><div className="mb-7 grid gap-6 border-y border-[var(--line)] py-6 md:grid-cols-2"><label className="text-[10px] uppercase tracking-[.14em]">Modelagem<select value={fit} onChange={(event) => setFit(event.target.value)} className="mt-3 block w-full border-b border-[var(--ink)] bg-transparent py-2 text-sm outline-none">{product.fits.map((value) => <option key={value}>{value}</option>)}</select></label><label className="text-[10px] uppercase tracking-[.14em]">Cor<select value={color} onChange={(event) => setColor(event.target.value)} className="mt-3 block w-full border-b border-[var(--ink)] bg-transparent py-2 text-sm outline-none">{product.colors.map((value) => <option key={value}>{value}</option>)}</select></label></div><button onClick={submit} className="flex w-full items-center justify-between bg-[var(--ink)] px-5 py-4 text-left text-[11px] uppercase tracking-[.15em] text-white transition-opacity hover:opacity-85">{added ? "Adicionado ao carrinho" : "Adicionar ao carrinho"}<ArrowUpRight size={16} /></button></div>;
}
