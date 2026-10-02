"use client";

import Image from "next/image";
import { useEffect, useRef, useState, ViewTransition, type PointerEvent } from "react";
import { animate, motion, useMotionValue, useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Lens } from "@/components/ui/lens";
import type { ShirtViews } from "@/lib/products";

const GALLERY_LABELS = ["Verso", "Frente", "Lado esquerdo", "Lado direito"];
// Pixels of horizontal drag per quarter turn.
const STEP = 80;

type Frame = { src: string; label: string };

// With every angle on file the frames form a turntable (back → side → front → side); otherwise they follow the gallery.
function framesFor(images: string[], views?: ShirtViews): Frame[] {
  if (views?.front && views.left && views.right) {
    return [
      { src: views.back, label: "Verso" },
      { src: views.left, label: "Lado esquerdo" },
      { src: views.front, label: "Frente" },
      { src: views.right, label: "Lado direito" },
    ];
  }
  return images.map((src, index) => ({ src, label: GALLERY_LABELS[index] ?? `Vista ${index + 1}` }));
}

// One viewer for every angle: drag (or arrows/thumbnails) turns the piece, and the magnifier works on whichever side is showing.
export function ProductGallery3D({ id, name, images, views }: { id: string; name: string; images: string[]; views?: ShirtViews }) {
  const frames = framesFor(images, views);
  const turntable = frames.length === 4 && Boolean(views?.front && views.left && views.right);
  const [index, setIndex] = useState(0);
  const [hovering, setHovering] = useState(false);
  const [dragging, setDragging] = useState(false);
  const reduce = useReducedMotion();
  const tilt = useMotionValue(0);
  const drag = useRef<{ x: number; start: number } | null>(null);
  const wrap = (value: number) => (value + frames.length) % frames.length;
  const go = (step: number) => setIndex((current) => wrap(current + step));
  const label = frames[index]?.label;

  // A small nudge on arrival so it's clear the piece can be turned.
  useEffect(() => {
    if (!turntable || reduce) return;
    const controls = animate(tilt, [0, -18, 6, 0], { duration: 1.6, delay: 0.9, ease: "easeInOut" });
    return () => controls.stop();
  }, [turntable, reduce, tilt]);

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!turntable) return;
    drag.current = { x: event.clientX, start: index };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    const offset = (event.clientX - drag.current.x) / STEP;
    if (!dragging && Math.abs(offset) > 0.1) setDragging(true);
    const steps = Math.round(offset);
    setIndex(wrap(drag.current.start - steps));
    tilt.set((offset - steps) * 34);
  };
  const endDrag = () => {
    drag.current = null;
    setDragging(false);
    animate(tilt, 0, { type: "spring", stiffness: 260, damping: 22 });
  };

  return (
    <div>
      <ViewTransition name={`produto-${id}`} share="morph" default="none">
        <div className="relative overflow-hidden rounded-2xl">
          <div
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            style={{ touchAction: turntable ? "pan-y" : undefined }}
            className={turntable ? (dragging ? "cursor-grabbing select-none" : "cursor-grab") : undefined}
          >
            <Lens zoomFactor={2} lensSize={190} hovering={hovering && !dragging} setHovering={setHovering}>
              <div className="relative aspect-[.86] w-full bg-[var(--cream)] [perspective:1400px]">
                <motion.div style={{ rotateY: tilt }} className="absolute inset-0">
                  {frames.map((frame, frameIndex) => (
                    <Image key={frame.src} src={frame.src} alt={`${name}, ${frame.label.toLowerCase()}`} fill draggable={false} loading="eager" sizes="(min-width: 768px) 55vw, 100vw" className={`object-cover ${frameIndex === index ? "opacity-100" : "opacity-0"}`} />
                  ))}
                </motion.div>
              </div>
            </Lens>
          </div>
          <span className="script pointer-events-none absolute bottom-4 left-4 z-30 -rotate-3 rounded-full bg-[var(--paper)]/90 px-4 py-1.5 text-xl text-[var(--terra)] shadow-sm">{label}</span>
          {frames.length > 1 && <>
            <button type="button" onClick={() => go(-1)} aria-label="Vista anterior" className="absolute left-3 top-1/2 z-30 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--paper)]/90 shadow-md transition-transform hover:scale-105"><ChevronLeft size={20} strokeWidth={1.5} /></button>
            <button type="button" onClick={() => go(1)} aria-label="Próxima vista" className="absolute right-3 top-1/2 z-30 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--paper)]/90 shadow-md transition-transform hover:scale-105"><ChevronRight size={20} strokeWidth={1.5} /></button>
          </>}
        </div>
      </ViewTransition>
      {frames.length > 1 && <div className="mt-4 flex gap-3">
        {frames.map((frame, thumb) => <button key={frame.src} type="button" onClick={() => setIndex(thumb)} aria-label={`Ver ${frame.label.toLowerCase()}`} aria-current={thumb === index} className={`relative h-20 w-16 overflow-hidden rounded-xl bg-[var(--cream)] transition-all md:h-24 md:w-20 ${thumb === index ? "ring-2 ring-[var(--ink)] ring-offset-2 ring-offset-[var(--paper)]" : "opacity-60 hover:opacity-100"}`}><Image src={frame.src} alt="" fill sizes="80px" className="object-cover" /></button>)}
      </div>}
      <p className="script mt-3 -rotate-1 text-xl text-[var(--muted)]">{turntable ? "arraste a foto pro lado pra girar a peça" : <span className="hidden md:inline">passe o mouse na foto pra ver o tecido de pertinho</span>}</p>
    </div>
  );
}
