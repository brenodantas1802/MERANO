import Link from "next/link";
import type { Product } from "@/lib/products";
import { ProductCard } from "@/components/product-card";

// The home showcase: a still row, side by side with the same 4px seam as the collection grid. Phones show the first two
// (owners, 2026-11-22: no sideways carousel on the phone, it moved under the thumb), computers all three.
export function ProductShelf({ id, numero, titulo, verTudo, products }: { id?: string; numero?: string; titulo: string; verTudo?: string; products: Product[] }) {
  return <section id={id} className="scroll-mt-[var(--header-h,64px)] pt-10 md:pt-14">
    <div className="mb-1 flex items-end justify-between px-6 md:px-12 max-md:flex-col max-md:items-start"><h2 className="secao">{numero && <b>{numero} /</b>}{titulo}</h2>{verTudo && <Link href={verTudo} className="label inline-flex min-h-11 items-center text-[12px] text-[var(--muted)] underline underline-offset-4 hover:text-[var(--ink)]">Ver tudo</Link>}</div>
    <div className="rule-latao mx-6 mb-4 w-16 md:mx-12" />
    <div className="grid grid-cols-2 gap-1 px-1 md:grid-cols-3 max-md:[&>*:nth-child(n+3)]:hidden">
      {products.map((product) => <ProductCard key={product.id} product={product} />)}
    </div>
  </section>;
}
