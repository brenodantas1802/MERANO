"use client";

import { createContext, useContext, useEffect, useState } from "react";

type CartItem = { id: string; name: string; price: number; size: string; fit: string; color: string; quantity: number };
type CartContextValue = { items: CartItem[]; addItem: (item: Omit<CartItem, "quantity">) => void; removeItem: (id: string) => void; updateQuantity: (id: string, quantity: number) => void; clear: () => void; total: number; count: number };

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];
    const saved = window.localStorage.getItem("merano-cart");
    return saved ? JSON.parse(saved) : [];
  });
  useEffect(() => { window.localStorage.setItem("merano-cart", JSON.stringify(items)); }, [items]);
  function addItem(item: Omit<CartItem, "quantity">) {
    setItems((current) => {
      const match = current.find((entry) => entry.id === item.id);
      return match ? current.map((entry) => entry.id === item.id ? { ...entry, quantity: entry.quantity + 1 } : entry) : [...current, { ...item, quantity: 1 }];
    });
  }
  function removeItem(id: string) { setItems((current) => current.filter((item) => item.id !== id)); }
  function updateQuantity(id: string, quantity: number) { setItems((current) => quantity < 1 ? current.filter((item) => item.id !== id) : current.map((item) => item.id === id ? { ...item, quantity } : item)); }
  function clear() { setItems([]); }
  return <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clear, total: items.reduce((sum, item) => sum + item.price * item.quantity, 0), count: items.reduce((sum, item) => sum + item.quantity, 0) }}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
