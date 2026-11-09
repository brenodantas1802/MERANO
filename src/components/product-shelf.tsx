import Link from "next/link";
import type { Product } from "@/lib/products";
import { ProductCard } from "@/components/product-card";

// A row of cards that snaps under the thumb on phones and shows four at a time on computers.
export function ProductShelf({ titulo, verTudo, products }: { titulo: string; verTudo?: string; products: Product[] }) {
  return <section className="pt-10 md:pt-14">
    <div className="mb-4 flex items-end justify-between px-6 md:px-12"><h2 className="label text-[13px]">{titulo}</h2>{verTudo && <Link href={verTudo} className="label text-[12px] text-[var(--muted)] underline underline-offset-4 hover:text-[var(--ink)]">Ver tudo</Link>}</div>
    <div className="shelf auto-cols-[46%] gap-1 px-1 scroll-px-1 sm:auto-cols-[32%] md:auto-cols-[24%]">
      {products.map((product) => <ProductCard key={product.id} product={product} />)}
    </div>
  </section>;
}
