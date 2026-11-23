import Link from "next/link";
import { getProduct, products, type Product } from "@/lib/products";
import { SiteHeader } from "@/components/site-header";
import { HeroTopo } from "@/components/hero-topo";
import { SeasonShirt } from "@/components/season-shirt";
import { ProductShelf } from "@/components/product-shelf";

// The home showcase (owners, 2026-11-22): Wine not? first, the orange one (Verão em boa companhia) in the middle,
// Va tutto bene on the right; the hearts follow in the big 3D carousel below (and stay in the shop).
const VITRINE = ["wine-not", "verao-em-boa-companhia", "va-tutto-bene"];

// Personalizador banner: the regular tee on black with one of the house prints (Match Point), only the button leads to
// the Personalizador (owners, 2026-11-22). It replaced the three playing cards (the owners found them ugly).
function BannerPersonalizador() {
  return <section className="px-1 pt-12 md:pt-16">
    <div className="relative grid overflow-hidden bg-[#0c0909] text-[#F6F1E8] md:grid-cols-2 md:items-center">
      <div className="relative order-2 p-8 pt-2 md:order-1 md:p-16">
        <div className="rule-latao mb-5 w-16" />
        <p className="label text-[12px] text-[var(--latao)]">Novo · Personalizador</p>
        <h2 className="display mt-2 text-[clamp(2.6rem,7vw,5.5rem)]">A sua estampa.</h2>
        <Link href="/personalizar-estampa" className="btn-ouro press mt-6 inline-flex h-11 items-center rounded-full px-6 text-[13px] font-medium text-[#551E2B]">Crie a sua</Link>
      </div>
      <div className="relative order-1 mx-auto aspect-[3/4] w-[78%] md:order-2 md:w-[70%]">
        {/* eslint-disable-next-line @next/next/no-img-element -- small pre-sized cutout on black */}
        <img src="/imagens/personalizador-banner.webp" alt="Camiseta regular Meranno com a estampa Match Point nas costas" width={600} height={800} loading="lazy" className="h-full w-full object-contain" />
      </div>
    </div>
  </section>;
}

export default function Home() {
  const vitrine = VITRINE.map((id) => getProduct(id)).filter((product): product is Product => !!product);
  return <main>
    <SiteHeader overlay />

    <HeroTopo />

    <ProductShelf id="lancamento" numero="01" titulo="Summer Collection" verTudo="/shop?colecao=colecao-01" products={vitrine} />

    <SeasonShirt products={products} />

    <BannerPersonalizador />
  </main>;
}
