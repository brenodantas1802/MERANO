"use client";

import { createContext, useContext, useEffect, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CartDrawer } from "./cart-drawer";
import { getProductPrice, precoPersonalizada, produtoDoItem } from "@/lib/products";

// `criacaoId` marks a tee made in the Personalizador: its art is stored in Supabase (criacoes_estampa).
export type CartItem = { id: string; productId?: string; criacaoId?: string; name: string; price: number; size: string; fit: string; color: string; image: string; quantity: number };
type NovoItem = Omit<CartItem, "quantity">;
type CartContextValue = { items: CartItem[]; addItem: (item: NovoItem) => void; adicionar: (item: NovoItem, aoConfirmar?: () => void) => boolean; removeItem: (id: string) => void; updateQuantity: (id: string, quantity: number) => void; clear: () => void; total: number; count: number; drawerOpen: boolean; openDrawer: () => void; closeDrawer: () => void };

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "merano-cart";
// The most of one piece (same tee, size and colour) per order: the server refuses more (pedidoSchema in lib/pedidos),
// so the cart stops there instead of letting the checkout fail (found in the 2026-11-26 phone review).
export const MAX_POR_PECA = 10;
const limitar = (quantidade: number) => Math.min(MAX_POR_PECA, Math.max(1, Math.floor(quantidade) || 1));
const EMPTY_CART: CartItem[] = [];
let cachedItems: CartItem[] = EMPTY_CART;
let initialized = false;
const listeners = new Set<() => void>();

// A cart kept in the browser shows today's price, the one the server charges (prices changed twice on 2026-11-24,
// R$ 160 → R$ 180 → R$ 160 for the pre-sale, and a saved cart would still show the old one). Older entries without
// productId go by their id.
function precoAtual(item: CartItem) {
  if (item.criacaoId) return precoPersonalizada();
  const produto = produtoDoItem(item);
  return produto ? getProductPrice(produto) : item.price;
}

function readStorage(): CartItem[] {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved ? (JSON.parse(saved) as CartItem[]).map((item) => ({ ...item, price: precoAtual(item), quantity: limitar(item.quantity) })) : [];
  } catch {
    return [];
  }
}

function writeStorage(items: CartItem[]) {
  cachedItems = items;
  initialized = true;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  if (!initialized) {
    cachedItems = readStorage();
    initialized = true;
  }
  return cachedItems;
}

function getServerSnapshot() {
  return EMPTY_CART;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [repetida, setRepetida] = useState<{ item: NovoItem; aoConfirmar?: () => void } | null>(null);

  function setItems(updater: (current: CartItem[]) => CartItem[]) {
    writeStorage(updater(initialized ? cachedItems : readStorage()));
  }
  function addItem(item: Omit<CartItem, "quantity">) {
    setItems((current) => {
      const match = current.find((entry) => entry.id === item.id);
      return match ? current.map((entry) => entry.id === item.id ? { ...entry, quantity: limitar(entry.quantity + 1) } : entry) : [...current, { ...item, quantity: 1 }];
    });
  }
  function removeItem(id: string) { setItems((current) => current.filter((item) => item.id !== id)); }
  function updateQuantity(id: string, quantity: number) { setItems((current) => quantity < 1 ? current.filter((item) => item.id !== id) : current.map((item) => item.id === id ? { ...item, quantity: limitar(quantity) } : item)); }
  function clear() { setItems(() => []); }
  // The shop's add buttons (owners, 2026-11-24): a tee already in the cart in the same size asks first. "Sim" adds one
  // more (then `aoConfirmar`, e.g. opening the bag), "Não" leaves the cart as it was. The + inside the cart adds straight
  // away. Returns whether the piece went in now.
  function adicionar(item: NovoItem, aoConfirmar?: () => void) {
    if (getSnapshot().some((entry) => entry.id === item.id)) {
      setRepetida({ item, aoConfirmar });
      return false;
    }
    addItem(item);
    return true;
  }
  function confirmarRepetida() {
    if (!repetida) return;
    addItem(repetida.item);
    repetida.aoConfirmar?.();
    setRepetida(null);
  }
  return <CartContext.Provider value={{ items, addItem, adicionar, removeItem, updateQuantity, clear, total: items.reduce((sum, item) => sum + item.price * item.quantity, 0), count: items.reduce((sum, item) => sum + item.quantity, 0), drawerOpen, openDrawer: () => setDrawerOpen(true), closeDrawer: () => setDrawerOpen(false) }}>{children}<CartDrawer /><AvisoRepetida item={repetida?.item ?? null} onSim={confirmarRepetida} onNao={() => setRepetida(null)} /></CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}

// "Essa camiseta já está no carrinho": a small card over the page, above the bag.
function AvisoRepetida({ item, onSim, onNao }: { item: NovoItem | null; onSim: () => void; onNao: () => void }) {
  useEffect(() => {
    if (!item) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") onNao(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [item, onNao]);

  return <AnimatePresence>
    {item && <>
      <motion.div key="fundo" onClick={onNao} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} className="fixed inset-0 z-[96] bg-black/30" />
      <div key="aviso" className="pointer-events-none fixed inset-0 z-[97] flex items-center justify-center p-4">
        <motion.div role="alertdialog" aria-modal="true" aria-labelledby="aviso-repetida" initial={{ opacity: 0, y: 14, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }} className="glass pointer-events-auto w-full max-w-sm rounded-[24px] p-6 text-center">
          <p id="aviso-repetida" className="display text-[30px] leading-none">Essa camiseta já está no carrinho.</p>
          <p className="sans mt-3 text-[14px] text-[var(--muted)]">{item.name}, tamanho {item.size}. Quer adicionar mais uma?</p>
          <div className="mt-6 grid grid-cols-2 gap-2.5">
            <button type="button" onClick={onNao} className="press label h-12 rounded-full border border-[var(--ink)]/20 text-[12px] hover:bg-[var(--ink)]/5">Não</button>
            <button type="button" onClick={onSim} autoFocus className="press label h-12 rounded-full bg-[var(--vinho)] text-[12px] text-[var(--creme)]">Sim, adicionar</button>
          </div>
        </motion.div>
      </div>
    </>}
  </AnimatePresence>;
}
