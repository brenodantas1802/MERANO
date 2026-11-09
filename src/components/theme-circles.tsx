import Image from "next/image";
import Link from "next/link";
import { products } from "@/lib/products";

// Ways into the collection by mood, as round photos the thumb can flick through (and the Personalizador at the end).
const TEMAS = [
  { tag: "mar", nome: "Mar" },
  { tag: "frase", nome: "Frases" },
  { tag: "esporte", nome: "Esporte" },
  { tag: "fruta", nome: "Frutas" },
  { tag: "urbano", nome: "Cidade" },
  { tag: "minimal", nome: "Minimal" },
];

export function ThemeCircles() {
  const temas = TEMAS.flatMap((tema) => {
    const capa = products.find((product) => product.tags.includes(tema.tag));
    return capa ? [{ ...tema, imagem: capa.image }] : [];
  });
  return <nav aria-label="Explorar por tema" className="shelf auto-cols-[84px] gap-4 px-6 pb-2 scroll-px-6 md:auto-cols-[104px] md:gap-6 md:px-12 md:scroll-px-12">
    {temas.map((tema) => <Link key={tema.tag} href={`/shop?tema=${tema.tag}`} className="press group flex flex-col items-center gap-2">
      <span className="relative block aspect-square w-full overflow-hidden rounded-full bg-[var(--cream)] ring-1 ring-[var(--latao)]/50 ring-offset-2 ring-offset-[var(--paper)]"><Image src={tema.imagem} alt="" fill sizes="104px" className="object-cover transition-transform duration-500 group-hover:scale-105" /></span>
      <span className="text-[13px]">{tema.nome}</span>
    </Link>)}
    <Link href="/personalizar-estampa" className="press group flex flex-col items-center gap-2">
      <span className="flex aspect-square w-full items-center justify-center rounded-full bg-[var(--vinho)] text-center text-[11px] font-medium uppercase leading-tight tracking-[.08em] text-[var(--latao)] ring-1 ring-[var(--latao)]/50 ring-offset-2 ring-offset-[var(--paper)]">Crie a<br />sua</span>
      <span className="text-[13px]">Personalizar</span>
    </Link>
  </nav>;
}
