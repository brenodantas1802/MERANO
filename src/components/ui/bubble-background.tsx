"use client";

import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const BUBBLES = [
  { color: "#F37C22", size: 420, top: "10%", left: "15%", duration: 14 },
  { color: "#FABD4B", size: 340, top: "55%", left: "70%", duration: 18 },
  { color: "#C7BAA7", size: 380, top: "70%", left: "10%", duration: 20 },
  { color: "#F37C22", size: 260, top: "20%", left: "75%", duration: 16 },
];

export function BubbleBackground({ interactive = false, className, children }: { interactive?: boolean; className?: string; children?: ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 60, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 60, damping: 20 });
  const glowX = useTransform(springX, (v) => `${v}px`);
  const glowY = useTransform(springY, (v) => `${v}px`);

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    if (!interactive || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseX.set(event.clientX - rect.left);
    mouseY.set(event.clientY - rect.top);
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={cn("overflow-hidden bg-[var(--terra-dark)]", className)}
    >
      {BUBBLES.map((bubble, index) => (
        <motion.div
          key={index}
          className="absolute rounded-full opacity-40 blur-3xl"
          style={{ width: bubble.size, height: bubble.size, top: bubble.top, left: bubble.left, background: bubble.color }}
          animate={{ x: [0, 40, -20, 0], y: [0, -30, 20, 0] }}
          transition={{ duration: bubble.duration, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
      {interactive && (
        <motion.div
          className="pointer-events-none absolute h-80 w-80 rounded-full opacity-30 blur-3xl"
          style={{ left: glowX, top: glowY, translateX: "-50%", translateY: "-50%", background: "#FABD4B" }}
        />
      )}
      {children}
    </div>
  );
}
