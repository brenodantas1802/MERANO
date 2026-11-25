"use client";

import type { ReactNode } from "react";
import { definirPrecos, type TabelaPrecos } from "@/lib/products";

// Hands the owners' price table (read on the server in the root layout) to the browser before anything below it reads a
// price: cards, product page, cart, checkout.
export function PrecosDoSite({ precos, children }: { precos: TabelaPrecos; children: ReactNode }) {
  definirPrecos(precos);
  return children;
}
