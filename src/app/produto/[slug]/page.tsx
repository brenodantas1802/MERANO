import Link from "next/link";
import { ArrowLeft, Shirt } from "lucide-react";
import { notFound } from "next/navigation";
import { getProduct, products, formatPrice, getProductPrice } from "@/lib/products";
import { AddToCart } from "@/components/add-to-cart";
import { SiteHeader } from "@/components/site-header";
import { CartProvider } from "@/components/cart-provider";
import { ProductGallery3D } from "@/components/product-gallery-3d";
import { ProductCard } from "@/components/product-card";
import { SizeChart } from "@/components/size-chart";
import { ShareButton } from "@/components/share-button";

export function generateStaticParams() { return products.map((product) => ({ slug: product.id })); }

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();
  return <CartProvider><SiteHeader /><main className="mx-auto max-w-360 px-6 pb-24 md:px-12"><Link href="/shop" className="sans mb-8 flex items-center gap-2 text-[10px] uppercase tracking-[.15em] text-[var(--muted)]"><ArrowLeft size={14} /> Todos os produtos</Link><div className="grid gap-10 md:grid-cols-[1.1fr_.9fr] md:gap-20"><ProductGallery3D name={product.name} images={product.gallery} /><div className="flex flex-col justify-between py-4"><div><p className="sans mb-4 text-[10px] uppercase tracking-[.2em] text-[var(--muted)]">{product.note}</p><h1 className="display text-7xl md:text-9xl">{product.name}</h1><p className="mt-7 max-w-md text-xl leading-snug">{product.description}</p><div className="sans mt-8 grid gap-3 border-y border-[var(--line)] py-5 text-[11px] uppercase tracking-[.1em] text-[var(--muted)]"><p>Composição: {product.material}</p><p>Disponibilidade: {product.stock > 0 ? `${product.stock} peças em produção` : "Esgotado"}</p><p>Entrega: {product.delivery}</p><p>Cuidados: {product.care}</p></div></div><div className="mt-12"><div className="sans mb-6 text-2xl">{product.salePrice && <del className="mr-3 text-base text-[var(--muted)]">{formatPrice(product.price)}</del>}{formatPrice(getProductPrice(product))}</div><AddToCart product={product} /><Link href={`/provador?produto=${product.id}`} className="sans mt-3 flex w-full items-center justify-center gap-2 border border-[var(--ink)] px-5 py-3 text-[11px] uppercase tracking-[.15em] hover:bg-[var(--ink)] hover:text-white"><Shirt size={15} /> Vestir virtualmente</Link><p className="sans mt-5 text-[10px] uppercase tracking-[.12em] text-[var(--muted)]">Modelagem disponível de PP a GG. Trocas em até 30 dias. Passe o mouse na foto principal para ampliar o tecido.</p><ShareButton title={product.name} className="mt-6" /></div></div></div><section className="mt-24 border-t border-[var(--line)] pt-10"><p className="sans mb-6 text-[10px] uppercase tracking-[.2em] text-[var(--muted)]">Tabela de medidas</p><SizeChart /></section><section className="mt-28 border-t border-[var(--line)] pt-10"><p className="sans mb-8 text-[10px] uppercase tracking-[.2em] text-[var(--muted)]">You may also like</p><div className="grid gap-8 md:grid-cols-3">{products.filter((item) => item.id !== product.id).map((item) => <ProductCard product={item} key={item.id} />)}</div></section></main></CartProvider>;
}
