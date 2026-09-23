"use client";

import { motion, type TargetAndTransition } from "motion/react";
import type { LucideIcon } from "lucide-react";

const VARIANTS: Record<"shake" | "fly", TargetAndTransition> = {
  shake: { rotate: [0, -12, 10, -8, 0], transition: { duration: 0.45 } },
  fly: { x: 3, y: -3, transition: { duration: 0.25, ease: "easeOut" } },
};

export function AnimatedIcon({
  icon: Icon,
  variant,
  size = 16,
  strokeWidth = 1.5,
  className,
}: {
  icon: LucideIcon;
  variant: keyof typeof VARIANTS;
  size?: number;
  strokeWidth?: number;
  className?: string;
}) {
  return (
    <motion.span whileHover={VARIANTS[variant]} className={`inline-flex ${className ?? ""}`}>
      <Icon size={size} strokeWidth={strokeWidth} />
    </motion.span>
  );
}
