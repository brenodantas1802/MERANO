"use client";

import Link from "next/link";
import { useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { getShirtStory } from "@/lib/shirt-stories";
import { getProduct } from "@/lib/products";
import { ShirtStage } from "@/components/shirt-stage";

// The brand told in chapters, each one worn by a shirt from the collection.
const CHAPTERS = [
  { id: "rastro-no-lago", title: ["Nascida entre", "cidade e natureza."], text: "A Merano nasce do encontro entre corpo, território e tempo — da relação afetiva com a paisagem brasileira, sem pressa e sem excesso." },
  { id: "terraco-ao-mar", title: ["Boa mesa,", "boa companhia."], text: "Cada estampa guarda um lugar onde a vida acontece devagar: uma mesa posta, a conversa que se estende, o mar no fim da rua." },
  { id: "match-point", title: ["O jogo,", "com elegância."], text: "A quadra, a torcida, o ponto decisivo — o lado esportivo do verão, vestido com a calma de quem joga pelo prazer." },
  { id: "who-cares", title: ["O tempo", "é seu."], text: "Produzimos sob demanda, no ritmo de cada peça. Nada de estoque parado, nada de pressa: a peça segue até você quando fica pronta." },
  { id: "mares-tranquilos", title: ["A simplicidade", "das boas coisas."], text: "Um barco, um mar em silêncio. Menos coisas, escolhidas com mais intenção — e feitas para durar." },
  { id: "cafe", title: ["A cidade", "também é casa."], text: "O café da esquina, a calçada, o fim de tarde na rua: a Merano vive entre a cidade e a natureza." },
];

// Desktop: the shirt holds its place on the left and turns into the next one as each chapter reaches the middle of the screen.
// Phones: every chapter carries its own shirt above the text.
export function ShirtChapters() {
  const ref = useRef<HTMLElement>(null);
  const chapterRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const turn = useTransform(scrollYProgress, [0, 1], [-9, 9]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.index)); });
    }, { rootMargin: "-45% 0px -45% 0px" });
    chapterRefs.current.forEach((element) => element && observer.observe(element));
    return () => observer.disconnect();
  }, []);

  // On larger screens, decode the other shirts ahead of time so a chapter change never waits on an image.
  useEffect(() => {
    if (!window.matchMedia("(min-width: 768px)").matches) return;
    const timer = window.setTimeout(() => CHAPTERS.slice(1).forEach((chapter) => {
      const cutout = getShirtStory(chapter.id)?.cutout;
      if (!cutout) return;
      const image = new Image();
      image.src = `${cutout.src}-${cutout.small}.webp`;
      image.decode().catch(() => undefined);
    }), 1500);
    return () => window.clearTimeout(timer);
  }, []);

  const story = getShirtStory(CHAPTERS[active].id)!;
  const product = getProduct(story.id);

  return (
    <section ref={ref} className="season-wash relative md:grid md:grid-cols-[minmax(0,1.05fr)_minmax(0,.95fr)]">
      <div className="hidden md:sticky md:top-[var(--header-h,72px)] md:block md:h-[calc(100svh-var(--header-h,72px))] md:self-start md:p-10">
        <ShirtStage story={story} turn={turn} sheen={scrollYProgress} sizes="600px" alt={`Camiseta ${product?.name ?? ""}`} className="w-[min(42vw,44rem)]" />
      </div>

      <div className="px-6 py-16 md:px-0 md:py-[12svh] md:pr-20">
        {CHAPTERS.map((chapter, index) => {
          const chapterStory = getShirtStory(chapter.id)!;
          const chapterProduct = getProduct(chapter.id);
          return <div key={chapter.id} ref={(element) => { chapterRefs.current[index] = element; }} data-index={index} className={`flex flex-col justify-center py-10 transition-opacity duration-500 md:min-h-[52svh] md:py-0 ${index === active ? "md:opacity-100" : "md:opacity-35"}`}>
            {/* eslint-disable-next-line @next/next/no-img-element -- phone-only render of the cutout */}
            <img src={`${chapterStory.cutout.src}-${chapterStory.cutout.small}.webp`} alt={`Camiseta ${chapterProduct?.name ?? ""}`} width={chapterStory.cutout.small} height={Math.round(chapterStory.cutout.small * chapterStory.cutout.ratio)} loading="lazy" decoding="async" className="mx-auto mb-8 h-auto w-[78%] drop-shadow-[0_30px_30px_rgba(32,28,23,.25)] md:hidden" />
            <h2 className="display text-[clamp(2.6rem,4.6vw,4.6rem)]">{chapter.title[0]}<br /><i>{chapter.title[1]}</i></h2>
            <p className="mt-5 max-w-md text-lg leading-snug text-[var(--ink)]/75 md:text-xl">{chapter.text}</p>
            {chapterProduct && <Link href={`/produto/${chapterProduct.id}`} className="sans mt-6 w-fit border-b border-[var(--ink)]/40 pb-1 text-sm transition-colors hover:border-[var(--ink)]">Estampa {chapterProduct.name}</Link>}
          </div>;
        })}
      </div>
    </section>
  );
}
