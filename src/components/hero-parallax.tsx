"use client";

import { motion, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import { useRef } from "react";

export function HeroParallax({ src, alt }: { src: string; alt: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "16%"]);

  return (
    <motion.div ref={ref} style={{ y }} className="absolute inset-x-0 -top-[10%] h-[120%]">
      <Image src={src} alt={alt} fill priority sizes="100vw" className="object-cover" />
    </motion.div>
  );
}
