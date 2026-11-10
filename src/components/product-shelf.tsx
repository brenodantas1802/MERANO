import Link from "next/link";
import type { Product } from "@/lib/products";
import { ProductCard } from "@/components/product-card";

// A row of cards that snaps under the thumb: two per screen on phones and three on computers, side by side with the
// same 4px seam as the collection grid, so the shirts keep their usual proportions.
export function ProductShelf({ id, numero, titulo, verTudo, products }: { id?: string; numero?: string; titulo: string; verTudo?: string; products: Product[] }) {
  return <section id={id} className="scroll-mt-[var(--header-h,64px)] pt-10 md:pt-14">
    <div className="mb-1 flex items-end justify-between px-6 md:px-12"><h2 className="secao">{numero && <b>{numero} /</b>}{titulo}</h2>{verTudo && <Link href={verTudo} className="label inline-flex min-h-11 items-center text-[12px] text-[var(--muted)] underline underline-offset-4 hover:text-[var(--ink)]">Ver tudo</Link>}</div>
    <div className="rule-latao mx-6 mb-4 w-16 md:mx-12" />
    <div className="shelf auto-cols-[calc((100%-4px)/2)] gap-1 px-1 scroll-px-1 md:auto-cols-[calc((100%-8px)/3)]">
      {products.map((product) => <ProductCard key={product.id} product={product} />)}
    </div>
  </section>;
}
