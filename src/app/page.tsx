import Link from "next/link";
import { products } from "@/lib/products";
import { SiteHeader } from "@/components/site-header";
import { ESPADAS, HeroTopo } from "@/components/hero-topo";
import { SeasonShirt } from "@/components/season-shirt";
import { ProductShelf } from "@/components/product-shelf";

// The café engraving is an alpha mask, so it takes the wine ink.
const CAFE = "url(/imagens/merano-assets/ilustracoes/cafe.webp)";
const CAFE_MASCARA = { WebkitMaskImage: CAFE, maskImage: CAFE, WebkitMaskSize: "contain", maskSize: "contain", WebkitMaskRepeat: "no-repeat", maskRepeat: "no-repeat", WebkitMaskPosition: "center", maskPosition: "center" } as const;

// The ace of the deck: a wine spade with the corner marks of a playing card.
function CartaAs() {
  const canto = <span className="display flex flex-col items-center text-[clamp(.9rem,2.2vw,1.35rem)] leading-none text-[var(--vinho)]">A<svg viewBox="0 0 100 100" className="mt-0.5 h-[.8em] w-[.8em]"><path d={ESPADAS} fill="currentColor" /></svg></span>;
  return <div className="carta carta-frente">
    <div className="absolute left-[9%] top-[6%]">{canto}</div>
    <div className="absolute bottom-[6%] right-[9%] rotate-180">{canto}</div>
    <svg viewBox="0 0 100 100" className="absolute left-1/2 top-1/2 w-[46%] -translate-x-1/2 -translate-y-1/2">
      <path d={ESPADAS} fill="var(--vinho)" />
      <path d={ESPADAS} transform="translate(50 50) scale(1.16) translate(-50 -50)" fill="none" stroke="var(--latao)" strokeWidth={1.2} />
    </svg>
  </div>;
}

// Personalizador banner: on the wine felt of the top, a hand of cards (two house prints and the ace). It replaced the
// aerial sea photo on 2026-11-17: the owners said the beach no longer goes with the brand.
function BannerPersonalizador() {
  return <section className="px-1 pt-12 md:pt-16">
    <Link href="/personalizar-estampa" className="feltro group relative block aspect-[4/5] overflow-hidden text-[var(--creme)] md:aspect-[21/9]">
      <div aria-hidden className="baralho absolute left-1/2 top-[9%] h-[42%] -translate-x-1/2 md:left-auto md:right-[17%] md:top-[13%] md:h-[74%] md:translate-x-0">
        <div className="carta carta-esq">
          {/* eslint-disable-next-line @next/next/no-img-element -- transparent drawing with its own colours */}
          <img src="/imagens/merano-assets/ilustracoes/laranjeira.webp" alt="" width={890} height={944} loading="lazy" className="absolute left-[30%] top-1/2 h-auto w-[58%] -translate-x-1/2 -translate-y-1/2" />
        </div>
        <div className="carta carta-dir">
          <span className="absolute inset-y-[18%] left-[50%] right-[8%] block bg-[var(--vinho)]" style={CAFE_MASCARA} />
        </div>
        <CartaAs />
      </div>
      <div className="absolute inset-x-0 bottom-0 p-6 md:max-w-[52%] md:p-12">
        <div className="rule-latao mb-5 w-16" />
        <p className="label text-[12px] text-[var(--latao)]">Novo · Personalizador</p>
        <h2 className="display mt-2 text-[clamp(2.6rem,9vw,5.5rem)]">A sua estampa.</h2>
        <span className="btn-ouro press mt-5 inline-flex h-11 items-center rounded-full px-6 text-[13px] font-medium text-[var(--vinho)]">Criar agora</span>
      </div>
    </Link>
  </section>;
}

export default function Home() {
  return <main>
    <SiteHeader overlay />

    <HeroTopo />

    <ProductShelf id="lancamento" numero="01" titulo="Summer Collection" verTudo="/shop?colecao=colecao-01" products={products.filter((product) => product.lancamento)} />

    <SeasonShirt products={products} />

    <BannerPersonalizador />
  </main>;
}
