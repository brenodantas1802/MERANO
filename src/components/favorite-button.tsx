"use client";

import { Heart } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useSyncExternalStore } from "react";

const STORAGE_KEY = "merano-favorites";
const EMPTY: string[] = [];
const listeners = new Set<() => void>();
let cached: string[] | undefined;
let initialized = false;

function read(): string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function write(ids: string[]) {
  cached = ids;
  initialized = true;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  if (!initialized) {
    cached = read();
    initialized = true;
  }
  return cached!;
}

function getServerSnapshot() {
  return EMPTY;
}

export function FavoriteButton({ productId, name, className }: { productId: string; name: string; className?: string }) {
  const favorites = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const isFavorite = favorites.includes(productId);

  function toggle(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    write(isFavorite ? favorites.filter((id) => id !== productId) : [...favorites, productId]);
  }

  return (
    <motion.button
      type="button"
      onClick={toggle}
      whileTap={{ scale: 0.8 }}
      aria-label={isFavorite ? `Remover ${name} dos favoritos` : `Adicionar ${name} aos favoritos`}
      className={className}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isFavorite ? "on" : "off"}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="block"
        >
          <Heart size={16} strokeWidth={1.5} fill={isFavorite ? "#F37C22" : "none"} stroke={isFavorite ? "#F37C22" : "currentColor"} />
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}
