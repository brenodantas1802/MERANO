import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Personalizador | MERANNO",
  description: "Monte a sua camiseta MERANNO: escolha modelagem, cores e a escrita da frente, e crie a estampa das costas conversando com a nossa IA.",
};

// The Personalizador is the programmer's app (public/personalizador), kept as he wrote it, under the store's header.
export default function PersonalizadorPage() {
  return <main>
    <SiteHeader />
    <iframe src="/personalizador/index.html" title="Personalizador MERANNO" allow="fullscreen; clipboard-write" className="block h-[calc(100svh-var(--header-h,64px))] w-full border-0" />
  </main>;
}
