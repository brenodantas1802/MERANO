"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

export function HeroVideo({ src, poster }: { src: string; poster: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "16%"]);

  return (
    <motion.div ref={ref} style={{ y }} className="absolute inset-x-0 -top-[10%] h-[120%]">
      <video
        src={src}
        poster={poster}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="h-full w-full object-cover"
      />
    </motion.div>
  );
}
