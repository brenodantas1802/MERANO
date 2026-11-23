"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Product } from "@/lib/products";
import { SHIRT_STORIES, thumbOf } from "@/lib/shirt-stories";
import { ShirtStage } from "@/components/shirt-stage";
import { PillLink } from "@/components/ui/pill-link";

const EASE = [0.22, 1, 0.36, 1] as const;

// Showcase for the collection: the shirt holds its place on the left, its name on the right;
// the row of thumbnails turns the shirt over to the next piece without leaving the section.
export function SeasonShirt({ products }: { products: Product[] }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion() ?? false;
  const stories = SHIRT_STORIES.filter((story) => products.some((product) => product.id === story.id));
  const [index, setIndex] = useState(0);
  const story = stories[index];
  const product = products.find((item) => item.id === story.id)!;
  // The shirt stays still (owners, 2026-11-22): no floating, no turning with the scroll; it only leans toward the mouse.
  const go = (step: number) => setIndex((current) => (current + step + stories.length) % stories.length);

  // Warm the other shirts' images (the size this screen will use) once the section comes near, so the flip to the next
  // shirt never waits for a download or a decode (that was the stutter). Not at load: the cover video needs the
  // connection first (owners, 2026-11-22: the video started stuck).
  useEffect(() => {
    const secao = ref.current;
    if (!secao) return;
    const grande = window.matchMedia("(min-width: 768px)").matches && window.devicePixelRatio > 1;
    // decode() prepares each image off the main thread, so switching doesn't stall on decoding.
    const warm = () => stories.slice(1).forEach((item) => { const image = new Image(); image.src = `${item.cutout.src}-${grande ? item.cutout.large : item.cutout.small}.webp`; image.decode().catch(() => undefined); });
    const observador = new IntersectionObserver(([entrada]) => {
      if (!entrada.isIntersecting) return;
      observador.disconnect();
      warm();
    }, { rootMargin: "100% 0px" });
    observador.observe(secao);
    return () => observador.disconnect();
  }, [stories]);

  // Quick (owners, 2026-11-22: same animation, faster switch).
  const swap = reduce ? {} : { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: EASE, delay: 0.06 } }, exit: { opacity: 0, y: -10, transition: { duration: 0.12 } } };

  return (
    <section ref={ref} className="season-wash relative grid grid-cols-[minmax(0,1fr)] md:grid-cols-[1.1fr_.9fr]">
      <div className="px-6 pb-4 pt-16 md:sticky md:top-[var(--header-h,72px)] md:h-[calc(100svh-var(--header-h,72px))] md:self-start md:p-10">
        <ShirtStage story={story} sizes="(min-width: 768px) 600px, 88vw" alt={`Camiseta ${product.name}, verso`} className="w-[min(88vw,30rem)] md:w-[min(44vw,46rem,calc((100svh-var(--header-h,72px)-7rem)*.9))]" />
      </div>

      <div className="px-6 pb-20 md:px-0 md:pb-[14svh] md:pr-20">
        <div className="pb-12 pt-4 md:flex md:min-h-[78svh] md:flex-col md:justify-end md:pb-14 md:pt-0">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={story.id} {...swap}>
              <h2 className="display text-3xl md:text-4xl">{product.name}</h2>
              <div className="mt-6"><PillLink href={`/produto/${product.id}`} variant="ouro">Ver a peça</PillLink></div>
            </motion.div>
          </AnimatePresence>

          <div className="mt-10">
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => go(-1)} aria-label="Estampa anterior" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--latao)]/60 bg-[var(--paper)] transition-colors hover:border-[var(--latao)] hover:bg-[var(--latao)] hover:text-[var(--vinho)]"><ChevronLeft size={18} strokeWidth={1.6} /></button>
              <div className="flex min-w-0 touch-pan-x gap-2 overflow-x-auto overflow-y-hidden overscroll-x-contain p-2 [scrollbar-width:none]">
                {stories.map((item, itemIndex) => {
                  const itemProduct = products.find((candidate) => candidate.id === item.id)!;
                  const active = itemIndex === index;
                  return <button key={item.id} type="button" onClick={() => setIndex(itemIndex)} aria-label={`Ver ${itemProduct.name}`} aria-pressed={active} title={itemProduct.name} className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-[#EFE9DF] p-1 transition-[opacity,box-shadow] duration-300 ${active ? "ring-2 ring-[var(--latao)] ring-offset-2 ring-offset-[var(--paper)]" : "opacity-70 hover:opacity-100"}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element -- 200px thumbnails made for this row */}
                    <img src={thumbOf(item)} alt="" width={200} height={200} loading="lazy" className="h-full w-full object-contain" />
                  </button>;
                })}
              </div>
              <button type="button" onClick={() => go(1)} aria-label="Próxima estampa" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--latao)]/60 bg-[var(--paper)] transition-colors hover:border-[var(--latao)] hover:bg-[var(--latao)] hover:text-[var(--vinho)]"><ChevronRight size={18} strokeWidth={1.6} /></button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
