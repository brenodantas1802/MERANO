"use client";

import { useSyncExternalStore } from "react";

// Demo order history kept in the browser until orders are stored in the database (Order/OrderItem models).
export type OrderItemRecord = { productId: string; name: string; size: string; color: string; price: number; quantity: number; image: string };
export type OrderRecord = { id: string; date: string; total: number; items: OrderItemRecord[] };

const STORAGE_KEY = "merano-orders";
const EMPTY: OrderRecord[] = [];
const listeners = new Set<() => void>();
let cached: OrderRecord[] = EMPTY;
let initialized = false;

function getSnapshot() {
  if (!initialized) {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      cached = raw ? JSON.parse(raw) : EMPTY;
    } catch {
      cached = EMPTY;
    }
    initialized = true;
  }
  return cached;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function saveOrder(order: OrderRecord) {
  cached = [order, ...getSnapshot()].slice(0, 20);
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cached));
  } catch {
    // Storage unavailable: the order still shows on the confirmation screen.
  }
  listeners.forEach((listener) => listener());
}

export function useOrders() {
  return useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
}
