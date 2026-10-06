"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";

type Frame = { src: string; alt: string; caption?: string; href?: string; wide?: boolean };

const FRAMES: Frame[] = [
  { src: "/imagens/merano-assets/foto praia 2.jpg", alt: "Pôr do sol na beira do mar" },
  { src: "/imagens/merano-assets/lookbook/modelo-barco.webp", alt: "Modelo de costas vestindo a camiseta Rastro no lago", caption: "Rastro no lago", href: "/produto/rastro-no-lago" },
  { src: "/imagens/merano-assets/foto praia 1.jpg", alt: "Mar visto de cima encontrando a areia", wide: true },
  { src: "/imagens/merano-assets/lookbook/modelo-tenis.webp", alt: "Modelo de costas vestindo a camiseta Match point", caption: "Match point", href: "/produto/match-point" },
  { src: "/imagens/merano-assets/etiqueta-linho.jpg", alt: "Etiqueta de linho Merano, feito no Brasil" },
  { src: "/imagens/merano-assets/lookbook/modelo-who-cares.webp", alt: "Modelo de costas vestindo a camiseta Who cares", caption: "Who cares", href: "/produto/who-cares" },
];

function FrameCard({ frame }: { frame: Frame }) {
  const body = <>
    <div className={`relative overflow-hidden bg-[var(--cream)] ${frame.wide ? "aspect-[1.45]" : "aspect-[.78]"}`}>
      <Image src={frame.src} alt={frame.alt} fill sizes="(min-width: 768px) 36vw, 80vw" className="object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.04]" />
    </div>
    {frame.caption && <p className="mt-3 text-[13px]">{frame.caption}</p>}
  </>;
  const size = frame.wide ? "w-[86vw] md:w-[44vw]" : "w-[70vw] md:w-[24vw]";
  return frame.href
    ? <Link href={frame.href} className={`group block shrink-0 snap-center ${size}`}>{body}</Link>
    : <div className={`group shrink-0 snap-center ${size}`}>{body}</div>;
}

// A horizontal reel of the collection. On desktop it drifts sideways as the section passes, with no extra scrolling;
// on phones it is a native swipe.
export function Lookbook() {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion() ?? false;
  const [distance, setDistance] = useState(0);
  const [desktop, setDesktop] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 768px)");
    const measure = () => {
      setDesktop(query.matches);
      if (track.current) setDistance(Math.max(0, track.current.scrollWidth - window.innerWidth));
    };
    measure();
    window.addEventListener("resize", measure);
    query.addEventListener("change", measure);
    return () => { window.removeEventListener("resize", measure); query.removeEventListener("change", measure); };
  }, []);

  const drifting = desktop && !reduce;
  const { scrollYProgress } = useScroll({ target: section, offset: ["start end", "end start"] });
  const x = useTransform(scrollYProgress, [0.15, 0.85], [0, -distance]);

  return (
    <section ref={section} className="overflow-hidden bg-[var(--paper)] pb-24 pt-16 md:pb-32 md:pt-20">
      <h2 className="label px-6 text-[13px] md:px-16">Lookbook</h2>
      <motion.div
        ref={track}
        style={drifting ? { x } : undefined}
        className={`mt-6 flex items-end gap-6 px-6 md:mt-8 md:gap-10 md:px-16 ${drifting ? "w-max" : "snap-x snap-mandatory overflow-x-auto pb-4 [scrollbar-width:none]"}`}
      >
        {FRAMES.map((frame) => <FrameCard frame={frame} key={frame.src} />)}
      </motion.div>
    </section>
  );
}
