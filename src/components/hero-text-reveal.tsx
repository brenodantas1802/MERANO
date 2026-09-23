"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

export function HeroTextReveal({ lines, className }: { lines: ReactNode[]; className?: string }) {
  return (
    <h1 className={className}>
      {lines.map((line, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0, filter: "blur(4px)", y: 10 }}
          animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1, ease: "easeInOut" }}
          className="block"
        >
          {line}
        </motion.span>
      ))}
    </h1>
  );
}
