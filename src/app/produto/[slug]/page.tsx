import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { getProduct, getSizeChart, products, formatPrice, getProductPrice, similarProducts, type Product } from "@/lib/products";
import { SiteHeader } from "@/components/site-header";
import { ProductGallery3D } from "@/components/product-gallery-3d";
import { ProductBuy, type Colorway } from "@/components/product-buy";

export function generateStaticParams() { return products.map((product) => ({ slug: product.id })); }

// The same print in other colours is its own product, named "<print> · <colour>".
function colorwaysOf(product: Product): Colorway[] {
  const base = product.name.split(" · ")[0];
  const ways = products.filter((item) => item.name.split(" · ")[0] === base);
  const seen = new Set<string>();
  return ways.filter((item) => !seen.has(item.colors[0]) && seen.add(item.colors[0])).map((item) => ({ id: item.id, color: item.colors[0] }));
}

// A detail that opens with its arrow, so the page stays clean until someone wants it.
function Detail({ title, children }: { title: string; children: ReactNode }) {
  return <details className="group border-b border-[var(--ink)]/80">
    <summary className="flex cursor-pointer list-none items-center justify-between py-4 text-[13px] [&::-webkit-details-marker]:hidden">
      {title}
      <ChevronDown size={18} strokeWidth={1.5} className="transition-transform duration-300 group-open:rotate-180" />
    </summary>
    <div className="pb-5 text-[13px] leading-relaxed text-[var(--ink)]/75">{children}</div>
  </details>;
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();
  const price = getProductPrice(product);
  const chart = getSizeChart(product);
  const related = similarProducts([product.id], products.length);

  return <><SiteHeader /><main className="mx-auto max-w-360 px-6 md:px-12">
    <div className="product-layout pt-2 md:pt-4">
      <div className="[grid-area:gallery] md:mx-auto md:w-full md:max-w-[calc(max(20rem,_100svh_-_19rem)_*_0.9)]">
        <ProductGallery3D id={product.id} name={product.name} images={product.gallery} views={product.views} />
      </div>

      <div className="[grid-area:head]">
        <h1 className="text-[15px] font-medium">{product.name}</h1>
        <p className="mt-1 text-[15px]">{product.salePrice && <del className="mr-2 text-[var(--muted)]">{formatPrice(product.price)}</del>}{formatPrice(price)}</p>
      </div>

      <div className="[grid-area:details] md:mt-6 md:border-t-0">
        <Detail title="Detalhes do produto">
          <p>{product.description}</p>
          <p className="mt-2">Modelagem ampla, de {product.fits[0]} a {product.fits[product.fits.length - 1]}. Feita sob demanda, depois do seu pedido.</p>
        </Detail>
        <Detail title="Composição e cuidados">
          <p>{product.material}.</p>
          <p className="mt-2">{product.care}</p>
        </Detail>
        <Detail title="Tabela de medidas">
          <table className="w-full text-left">
            <thead className="text-[var(--muted)]"><tr><th className="py-1 font-normal">Tam.</th><th className="font-normal">Busto</th><th className="font-normal">Compr.</th><th className="font-normal">Ombro</th></tr></thead>
            <tbody>{chart.map((row) => <tr key={row.size} className="border-t border-[var(--ink)]/10"><td className="py-1.5 font-medium text-[var(--ink)]">{row.size}</td><td>{row.largura}</td><td>{row.comprimento}</td><td>{row.ombro}</td></tr>)}</tbody>
          </table>
          <p className="mt-3">Medidas da peça em cm, deitada. <Link href="/meu-fit" className="underline underline-offset-4 hover:text-[var(--ink)]">Descubra seu tamanho</Link></p>
        </Detail>
      </div>

      <div className="[grid-area:buy] md:self-center"><ProductBuy product={product} colorways={colorwaysOf(product)} /></div>
    </div>


  </main>
  {related.length > 0 && <section className="mt-8 px-6 pb-20 md:px-12">
    <h2 className="label text-[13px]">Você também pode gostar</h2>
    {/* Phones swipe through them; wider screens show one full row, as many as fit. */}
    <div className="-mx-6 mt-4 flex snap-x scroll-px-6 gap-3 overflow-x-auto px-6 pb-2 [scrollbar-width:none] md:mx-0 md:grid md:auto-rows-[0] md:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] md:grid-rows-1 md:gap-x-4 md:gap-y-0 md:overflow-hidden md:px-0 md:pb-0">
      {related.map((item) => <Link key={item.id} href={`/produto/${item.id}`} className="group w-[64vw] shrink-0 snap-start md:w-auto">
        <div className="relative aspect-square overflow-hidden bg-[var(--cream)]/35">
          <Image src={item.image} alt={item.name} fill sizes="(min-width: 768px) 260px, 64vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
        </div>
        <p className="mt-2.5 truncate text-[14px] font-semibold uppercase tracking-[.04em]">{item.name}</p>
      </Link>)}
    </div>
  </section>}
  </>;
}
