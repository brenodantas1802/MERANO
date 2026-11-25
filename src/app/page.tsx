import Link from "next/link";
import { getProduct, products, type Product } from "@/lib/products";
import { SiteHeader } from "@/components/site-header";
import { HeroTopo } from "@/components/hero-topo";
import { SeasonShirt } from "@/components/season-shirt";
import { ProductShelf } from "@/components/product-shelf";
import { BeforeAfter, MODELO_VESTIDO } from "@/components/try-on-visuals";

// The home showcase (owners, 2026-11-24): Amore Black first, the orange one (Arancia) in the middle, Riviera on the
// right (phones show the first two). Why not swapped places with it: it opens the big 3D carousel below.
const VITRINE = ["amore-black", "arancia", "riviera"];
const PRIMEIRA_3D = "why-not";

// Try-on banner, under the showcase and before the 3D shirt (owners, 2026-11-24: the try-on is one of the site's most
// important things, so the home shows it exists). Same look as the Personalizador's: the model split in two, as
// photographed and wearing our shirts in turn, with the three steps.
function BannerProvador() {
  return <section className="px-1 pt-12 md:pt-16">
    <div className="relative grid overflow-hidden bg-[#0c0909] text-[#F6F1E8] md:grid-cols-2 md:items-center">
      <div className="relative order-2 p-8 pt-6 md:order-1 md:p-16">
        <div className="rule-latao mb-5 w-16" />
        <p className="label text-[12px] text-[var(--latao)]">Novo · Provador virtual</p>
        <h2 className="display mt-2 text-[clamp(2.6rem,7vw,5.5rem)]">Veja em você.</h2>
        <ol className="sans mt-5 space-y-2 text-[15px] text-[#F6F1E8]/85">
          {["Escolha a estampa", "Envie sua foto", "Compare o antes e o depois"].map((passo, indice) => <li key={passo} className="flex items-baseline gap-3"><span className="display text-xl text-[var(--latao)]">{indice + 1}</span>{passo}</li>)}
        </ol>
        <Link href="/provador" className="btn-ouro press mt-7 inline-flex h-11 items-center rounded-full px-6 text-[13px] font-medium text-[#551E2B]">Experimentar</Link>
      </div>
      <div className="relative order-1 p-4 pb-0 md:order-2 md:p-10">
        <BeforeAfter vestidos={MODELO_VESTIDO} rotulo className="mx-auto aspect-[3/4] w-full max-w-[460px] rounded-[18px]" />
        <p className="sans mt-3 flex justify-between px-1 text-[11px] uppercase tracking-[.18em] text-[#F6F1E8]/55 max-w-[460px] mx-auto"><span>Antes</span><span>Depois</span></p>
      </div>
    </div>
  </section>;
}

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
  // The 3D carousel opens on Why not and keeps the others after it.
  const carrossel = [...products.filter((product) => product.id === PRIMEIRA_3D), ...products.filter((product) => product.id !== PRIMEIRA_3D)];
  return <main>
    <SiteHeader overlay />

    <HeroTopo />

    <ProductShelf id="lancamento" numero="01" titulo="Summer Collection" verTudo="/shop?colecao=colecao-01" products={vitrine} />

    <BannerProvador />

    <SeasonShirt products={carrossel} />

    <BannerPersonalizador />
  </main>;
}
