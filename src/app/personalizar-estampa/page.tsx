import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { PersonalizadorFrame } from "./personalizador-frame";

export const metadata: Metadata = {
  title: "Personalizador | MERANNO",
  description: "Monte a sua camiseta MERANNO: escolha modelagem, cores e a escrita da frente, e crie a estampa das costas conversando com a nossa IA.",
};

// The Personalizador is the programmer's app (public/personalizador), kept as he wrote it, under the store's header,
// plus the store's "Comprar esta peça" (public/personalizador/js/meranno-compra.js).
export default function PersonalizadorPage() {
  return <main>
    <SiteHeader />
    <PersonalizadorFrame />
  </main>;
}
