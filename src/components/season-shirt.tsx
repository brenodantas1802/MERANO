"use client";

import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "motion/react";
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
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  // A slow quarter-breath of rotation tied to the scroll; the shirt never travels.
  const scrollTurn = useTransform(scrollYProgress, [0, 1], [-9, 9]);
  const go = (step: number) => setIndex((current) => (current + step + stories.length) % stories.length);

  // On larger screens, warm the other shirts' images a moment after load so switching is instant.
  useEffect(() => {
    if (!window.matchMedia("(min-width: 768px)").matches) return;
    const warm = () => stories.slice(1).forEach((item) => { const image = new Image(); image.src = `${item.cutout.src}-${item.cutout.small}.webp`; });
    const timer = window.setTimeout(warm, 2500);
    return () => window.clearTimeout(timer);
  }, [stories]);

  const swap = reduce ? {} : { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE, delay: 0.12 } }, exit: { opacity: 0, y: -10, transition: { duration: 0.2 } } };

  return (
    <section ref={ref} className="season-wash relative grid grid-cols-[minmax(0,1fr)] md:grid-cols-[1.1fr_.9fr]">
      <div className="px-6 pb-4 pt-16 md:sticky md:top-[var(--header-h,72px)] md:h-[calc(100svh-var(--header-h,72px))] md:self-start md:p-10">
        <ShirtStage story={story} turn={scrollTurn} sheen={scrollYProgress} priority sizes="(min-width: 768px) 44vw, 88vw" alt={`Camiseta ${product.name}, verso`} className="w-[min(88vw,30rem)] md:w-[min(44vw,46rem)]" />
      </div>

      <div className="px-6 pb-20 md:px-0 md:pb-[14svh] md:pr-20">
        <div className="pb-12 pt-4 md:flex md:min-h-[78svh] md:flex-col md:justify-end md:pb-14 md:pt-0">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={story.id} {...swap}>
              <h2 className="display text-3xl md:text-4xl">{product.name}</h2>
              <div className="mt-6"><PillLink href={`/produto/${product.id}`} variant="solid">Ver a peça</PillLink></div>
            </motion.div>
          </AnimatePresence>

          <div className="mt-10">
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => go(-1)} aria-label="Estampa anterior" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--ink)]/20 bg-[var(--paper)] transition-colors hover:bg-[var(--ink)] hover:text-[var(--paper)]"><ChevronLeft size={18} strokeWidth={1.6} /></button>
              <div className="flex min-w-0 gap-2 overflow-x-auto py-1 [scrollbar-width:none]">
                {stories.map((item, itemIndex) => {
                  const itemProduct = products.find((candidate) => candidate.id === item.id)!;
                  const active = itemIndex === index;
                  return <button key={item.id} type="button" onClick={() => setIndex(itemIndex)} aria-label={`Ver ${itemProduct.name}`} aria-pressed={active} title={itemProduct.name} className={`relative h-14 w-14 shrink-0 rounded-full bg-white/70 p-1.5 transition-all duration-300 ${active ? "scale-105 ring-2 ring-[var(--ink)] ring-offset-2 ring-offset-[#f4f6f9]" : "opacity-70 hover:opacity-100"}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element -- 200px thumbnails made for this row */}
                    <img src={thumbOf(item)} alt="" width={200} height={200} loading="lazy" className="h-full w-full object-contain" />
                  </button>;
                })}
              </div>
              <button type="button" onClick={() => go(1)} aria-label="Próxima estampa" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--ink)]/20 bg-[var(--paper)] transition-colors hover:bg-[var(--ink)] hover:text-[var(--paper)]"><ChevronRight size={18} strokeWidth={1.6} /></button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
