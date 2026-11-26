import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { getCollection, getProduct, getPrecoCheio, getSizeChart, products, formatPrice, getProductPrice, parcelado, percentualDesconto, similarProducts, TOLERANCIA_CM, type Product } from "@/lib/products";
import { usarPrecos } from "@/lib/precos-servidor";
import { SiteHeader } from "@/components/site-header";
import { POSTAGEM_DIAS_UTEIS } from "@/lib/entrega";
import { ProductGallery3D } from "@/components/product-gallery-3d";
import { ProductBuy, type Colorway } from "@/components/product-buy";
import { RelatedRow } from "@/components/related-row";
import { Avaliacoes } from "@/components/avaliacoes";

export function generateStaticParams() { return products.map((product) => ({ slug: product.id })); }

// Each tee's own tab title and link preview (WhatsApp, Instagram): its name, description and photo.
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const product = getProduct((await params).slug);
  if (!product) return { title: "Página não encontrada | MERANNO" };
  return { title: `${product.name} | MERANNO`, description: product.description, openGraph: { title: `${product.name} | MERANNO`, description: product.description, images: [product.image] } };
}

// The same tee in other colours is its own product, tied by `familia` (Amore Black and Amore White): each colour is a
// swatch that opens that product, with its own photos.
function colorwaysOf(product: Product): Colorway[] {
  const ways = product.familia ? products.filter((item) => item.familia === product.familia) : [product];
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
  await usarPrecos();
  const price = getProductPrice(product);
  const cheio = getPrecoCheio(product);
  const chart = getSizeChart(product);
  const related = similarProducts([product.id], 8);

  return <><SiteHeader /><main className="mx-auto max-w-360 px-6 md:px-12">
    <div className="product-layout pt-2 md:pt-4">
      <div className="[grid-area:gallery] md:mx-auto md:w-full md:max-w-[calc(max(20rem,_100svh_-_19rem)_*_0.9)]">
        <ProductGallery3D id={product.id} name={product.name} images={product.gallery} views={product.views} />
      </div>

      <div className="[grid-area:head]">
        {product.lancamento && <p className="secao mb-1 text-[11px]">{getCollection(product.collection)?.name ?? "Lançamento"}</p>}
        <h1 className="text-[15px] font-medium">{product.name}</h1>
        <p className="mt-1 text-[15px]">{cheio && <del className="mr-2 text-[var(--muted)]">{formatPrice(cheio)}</del>}{formatPrice(price)}</p>
        <p className="sans mt-0.5 text-[13px] text-[var(--muted)]">{parcelado(price)}</p>
        {cheio && <p className="sans mt-2 text-[13px] leading-snug text-[var(--vinho)]">Preço de pré-venda, só para quem está na lista: {percentualDesconto(cheio, price)}% de desconto.</p>}
      </div>

      <div className="[grid-area:details] md:mt-6 md:border-t-0">
        <Detail title="Detalhes do produto">
          <p>{product.description}</p>
          <p className="mt-2">Modelagem regular, de corte clássico, de {product.fits[0]} a {product.fits[product.fits.length - 1]}. Escolha o tamanho que você costuma usar.</p>
          <p className="mt-2">Postamos em até {POSTAGEM_DIAS_UTEIS} dias úteis depois do pagamento. A data de chegada aparece no carrinho, pelo seu CEP.</p>
        </Detail>
        <Detail title="Composição e cuidados">
          <p>{product.material}.</p>
          <p className="mt-2">{product.care}</p>
        </Detail>
        <Detail title="Tabela de medidas">
          <table className="w-full text-left">
            <thead className="text-[var(--muted)]"><tr><th className="py-1 font-normal">Tam.</th><th className="font-normal">Tórax</th><th className="font-normal">Barra</th><th className="font-normal">Compr.</th></tr></thead>
            <tbody>{chart.map((row) => <tr key={row.size} className="border-t border-[var(--ink)]/10"><td className="py-1.5 font-medium text-[var(--ink)]">{row.size}</td><td>{row.largura}</td><td>{row.barra ?? row.largura}</td><td>{String(row.comprimento).replace(".", ",")}</td></tr>)}</tbody>
          </table>
          <p className="mt-3">Medidas da peça em cm, deitada, com tolerância de {TOLERANCIA_CM} cm. <Link href="/meu-fit" className="underline underline-offset-4 hover:text-[var(--ink)]">Descubra seu tamanho</Link></p>
        </Detail>
      </div>

      <div className="[grid-area:buy] md:self-center"><ProductBuy product={product} colorways={colorwaysOf(product)} /></div>
    </div>

    <Avaliacoes produtoId={product.id} nomeProduto={product.name} />


  </main>
  {related.length > 0 && <section className="mt-8 px-6 pb-40 md:px-12 md:pb-20">
    <h2 className="label text-[13px]">Você também pode gostar</h2>
    <RelatedRow items={related.map((item) => ({ id: item.id, name: item.name, image: item.image }))} />
  </section>}
  </>;
}
