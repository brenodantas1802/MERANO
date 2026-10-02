"use client";

import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring, useTransform, type MotionValue } from "motion/react";
import type { PointerEvent } from "react";
import type { ShirtStory } from "@/lib/shirt-stories";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

// A cut-out shirt floating in 3D: it leans toward the pointer, breathes with `turn` (degrees, usually tied to scroll),
// and when `story` changes the current shirt turns edge-on and the next one turns in.
export function ShirtStage({ story, alt, sizes, className = "", turn, sheen, priority = false }: { story: ShirtStory; alt: string; sizes: string; className?: string; turn?: MotionValue<number>; sheen?: MotionValue<number>; priority?: boolean }) {
  const reduce = useReducedMotion() ?? false;
  const still = useMotionValue(0);
  const tiltX = useSpring(useMotionValue(0), { stiffness: 110, damping: 18 });
  const tiltY = useSpring(useMotionValue(0), { stiffness: 110, damping: 18 });
  const scrollTurn = turn ?? still;
  const rotateY = useTransform(() => (reduce ? 0 : scrollTurn.get()) + tiltY.get());
  const sheenX = useTransform(() => `${(sheen?.get() ?? 0.5) * 120 - 60 + tiltY.get() * 2}%`);

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (reduce || event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    tiltY.set(((event.clientX - rect.left) / rect.width - 0.5) * 16);
    tiltX.set(-((event.clientY - rect.top) / rect.height - 0.5) * 10);
  };
  const onPointerLeave = () => { tiltX.set(0); tiltY.set(0); };
  const { src, small, large, ratio } = story.cutout;

  return (
    <div onPointerMove={onPointerMove} onPointerLeave={onPointerLeave} className="flex h-full w-full items-center justify-center [perspective:1600px]">
      <motion.div animate={reduce ? undefined : { y: [0, -12, 0] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }} className={`relative ${className}`}>
        <motion.div style={{ rotateY, rotateX: tiltX, transformStyle: "preserve-3d" }} className="relative">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={story.id}
              initial={reduce ? { opacity: 0 } : { rotateY: 90, opacity: 0.4 }}
              animate={reduce ? { opacity: 1 } : { rotateY: 0, opacity: 1, transition: { duration: 0.5, ease: EASE_OUT } }}
              exit={reduce ? { opacity: 0 } : { rotateY: -90, opacity: 0.4, transition: { duration: 0.26, ease: "easeIn" } }}
              style={{ transformStyle: "preserve-3d" }}
              className="relative"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- pre-sized renders of the AI-upscaled cutouts; Next's optimizer would recompress them */}
              <img
                src={`${src}-${small}.webp`}
                srcSet={`${src}-${small}.webp ${small}w, ${src}-${large}.webp ${large}w`}
                sizes={sizes}
                width={large}
                height={Math.round(large * ratio)}
                alt={alt}
                fetchPriority={priority ? "high" : undefined}
                className="relative h-auto w-full drop-shadow-[0_45px_40px_rgba(32,28,23,.28)]"
              />
              {/* Light gliding over the cotton, clipped to the shirt's outline. */}
              <div className="pointer-events-none absolute inset-0 overflow-hidden mix-blend-soft-light" style={{ WebkitMaskImage: `url(${src}-${small}.webp)`, maskImage: `url(${src}-${small}.webp)`, WebkitMaskSize: "100% 100%", maskSize: "100% 100%" }}>
                <motion.div style={{ x: sheenX }} className="absolute inset-y-0 -left-1/2 w-[200%] bg-[linear-gradient(105deg,transparent_38%,rgba(255,255,255,.5)_50%,transparent_62%)]" />
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
        <div className="mx-auto -mt-2 h-7 w-3/5 rounded-[50%] bg-[var(--terra-dark)]/25 blur-2xl" />
      </motion.div>
    </div>
  );
}
