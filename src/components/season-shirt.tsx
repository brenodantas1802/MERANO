"use client";

import Link from "next/link";
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";
import { useRef, type PointerEvent, type ReactNode } from "react";
import { formatPrice, getProductPrice, type Product } from "@/lib/products";
import { RevealHeading } from "@/components/reveal-heading";
import { ScrollReveal } from "@/components/scroll-reveal";
import { PillLink } from "@/components/ui/pill-link";

const SHIRT = "/imagens/merano-assets/recortes/verao-em-boa-companhia";

const useSum = (a: MotionValue<number>, b: MotionValue<number>) => useTransform(() => a.get() + b.get());

function Chapter({ title, children }: { title: string; children: ReactNode }) {
  return (
    <ScrollReveal className="border-t border-[var(--ink)]/15 pt-5">
      <h3 className="display text-xl italic md:text-3xl">{title}</h3>
      <div className="mt-2 text-[15px] leading-snug text-[var(--ink)]/75 md:text-lg">{children}</div>
    </ScrollReveal>
  );
}

// The season's shirt: it holds its place on the left while the story scrolls past on the right, then the page moves on.
export function SeasonShirt({ product }: { product: Product }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion() ?? false;
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });

  // A slow quarter-breath of rotation tied to the scroll, plus a pointer tilt; the shirt never travels.
  const scrollTurn = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [-9, 9]);
  const tiltX = useSpring(useMotionValue(0), { stiffness: 110, damping: 18 });
  const tiltY = useSpring(useMotionValue(0), { stiffness: 110, damping: 18 });
  const rotateY = useSum(scrollTurn, tiltY);
  const sheenX = useTransform(() => `${scrollYProgress.get() * 120 - 60 + tiltY.get() * 2}%`);

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (reduce || event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    tiltY.set(((event.clientX - rect.left) / rect.width - 0.5) * 16);
    tiltX.set(-((event.clientY - rect.top) / rect.height - 0.5) * 10);
  };
  const onPointerLeave = () => { tiltX.set(0); tiltY.set(0); };
  const price = getProductPrice(product);

  return (
    <section ref={ref} className="season-wash relative grid md:grid-cols-[1.1fr_.9fr]">
      <div className="md:sticky md:top-[var(--header-h,72px)] md:h-[calc(100svh-var(--header-h,72px))] md:self-start" onPointerMove={onPointerMove} onPointerLeave={onPointerLeave}>
        <div className="flex h-full items-center justify-center px-6 pb-4 pt-16 [perspective:1600px] md:p-10">
          <motion.div animate={reduce ? undefined : { y: [0, -12, 0] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }} className="relative w-[min(88vw,30rem)] md:w-[min(44vw,46rem)]">
            <motion.div style={{ rotateY, rotateX: tiltX, transformStyle: "preserve-3d" }} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element -- pre-sized 1400/2800 renders of the AI-upscaled cutout; Next's optimizer would recompress them */}
              <img
                src={`${SHIRT}-1400.webp`}
                srcSet={`${SHIRT}-1400.webp 1400w, ${SHIRT}-2800.webp 2800w`}
                sizes="(min-width: 768px) 44vw, 88vw"
                width={2800}
                height={2777}
                alt="Camiseta Verão em boa companhia, verso com laranjeira em flor"
                className="relative h-auto w-full drop-shadow-[0_45px_40px_rgba(32,28,23,.28)]"
              />
              {/* Light gliding over the cotton, clipped to the shirt's outline. */}
              <div className="pointer-events-none absolute inset-0 overflow-hidden mix-blend-soft-light" style={{ WebkitMaskImage: `url(${SHIRT}-1400.webp)`, maskImage: `url(${SHIRT}-1400.webp)`, WebkitMaskSize: "100% 100%", maskSize: "100% 100%" }}>
                <motion.div style={{ x: sheenX }} className="absolute inset-y-0 -left-1/2 w-[200%] bg-[linear-gradient(105deg,transparent_38%,rgba(255,255,255,.5)_50%,transparent_62%)]" />
              </div>
            </motion.div>
            <div className="mx-auto -mt-2 h-7 w-3/5 rounded-[50%] bg-[var(--terra-dark)]/25 blur-2xl" />
          </motion.div>
        </div>
      </div>

      <div className="px-6 pb-20 md:px-0 md:pb-[14svh] md:pr-20">
        <div className="pb-12 pt-4 md:flex md:min-h-[78svh] md:flex-col md:justify-end md:pb-14 md:pt-0">
          <p className="script -rotate-2 text-3xl text-[var(--sol-1)] md:text-4xl">a camiseta da estação</p>
          <RevealHeading className="display mt-3 text-[clamp(3rem,6vw,6rem)]" lines={["Verão em", <i key="b">boa companhia.</i>]} />
          <p className="mt-6 max-w-md text-xl leading-snug text-[var(--ink)]/80 md:text-2xl">{product.description}</p>
          <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
            <div><span className="display text-5xl md:text-6xl">{formatPrice(price)}</span><p className="sans mt-1 text-sm text-[var(--muted)]">ou 3x de {formatPrice(price / 3)} sem juros</p></div>
            <PillLink href={`/produto/${product.id}`} variant="solid">Ver a peça</PillLink>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-5 gap-y-7 md:gap-x-10 md:gap-y-8">
          <Chapter title="A estampa">Laranjeira em flor e, escrito à mão: sol, boa comida, boas histórias. Sempre.</Chapter>
          <Chapter title="O toque">{product.material}, azul marinho profundo, modelagem ampla do PP ao GG.</Chapter>
          <Chapter title="Feita pra você">Produzida depois do seu pedido, pronta em até 7 dias úteis. Sem excesso.</Chapter>
          <Chapter title="A Merano">Brasileira, entre cidade e natureza. <Link href="/a-marca" className="border-b border-[var(--ink)]/50">Conheça a marca</Link>.</Chapter>
        </div>
      </div>
    </section>
  );
}
