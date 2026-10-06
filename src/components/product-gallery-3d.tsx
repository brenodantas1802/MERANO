"use client";

import Image from "next/image";
import { useRef, useState, ViewTransition, type PointerEvent } from "react";
import { animate, motion, useMotionValue } from "motion/react";
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

// One viewer for every angle: drag (or the arrows and dots) turns the piece, and the magnifier works on whichever side is showing.
export function ProductGallery3D({ id, name, images, views }: { id: string; name: string; images: string[]; views?: ShirtViews }) {
  const frames = framesFor(images, views);
  const turntable = frames.length === 4 && Boolean(views?.front && views.left && views.right);
  const [index, setIndex] = useState(0);
  const [hovering, setHovering] = useState(false);
  const [dragging, setDragging] = useState(false);
  const tilt = useMotionValue(0);
  const drag = useRef<{ x: number; start: number } | null>(null);
  const wrap = (value: number) => (value + frames.length) % frames.length;
  const go = (step: number) => setIndex((current) => wrap(current + step));

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
        <div className="relative overflow-hidden">
          <div
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            style={{ touchAction: turntable ? "pan-y" : undefined }}
            className={turntable ? (dragging ? "cursor-grabbing select-none" : "cursor-grab") : undefined}
          >
            <Lens zoomFactor={2} lensSize={190} hovering={hovering && !dragging} setHovering={setHovering}>
              <div className="relative aspect-[.9] w-full bg-[var(--paper)] [perspective:1400px]">
                <motion.div style={{ rotateY: tilt }} className="absolute inset-0">
                  {frames.map((frame, frameIndex) => (
                    <Image key={frame.src} src={frame.src} alt={`${name}, ${frame.label.toLowerCase()}`} fill draggable={false} loading="eager" sizes="(min-width: 768px) 55vw, 100vw" className={`object-cover ${frameIndex === index ? "opacity-100" : "opacity-0"}`} />
                  ))}
                </motion.div>
              </div>
            </Lens>
          </div>
          {frames.length > 1 && <>
            <button type="button" onClick={() => go(-1)} aria-label="Vista anterior" className="absolute left-2 top-1/2 z-30 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--paper)]/90 shadow-[0_2px_10px_rgba(25,35,30,.15)] transition-transform hover:scale-105"><ChevronLeft size={16} strokeWidth={1.5} /></button>
            <button type="button" onClick={() => go(1)} aria-label="Próxima vista" className="absolute right-2 top-1/2 z-30 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--paper)]/90 shadow-[0_2px_10px_rgba(25,35,30,.15)] transition-transform hover:scale-105"><ChevronRight size={16} strokeWidth={1.5} /></button>
          </>}
        </div>
      </ViewTransition>
      {frames.length > 1 && <div className="mt-2 flex justify-center">
        {frames.map((frame, dot) => <button key={frame.src} type="button" onClick={() => setIndex(dot)} aria-label={`Ver ${frame.label.toLowerCase()}`} aria-current={dot === index} className="flex h-8 items-center px-1">
          <span className={`block h-1.5 rounded-full transition-all duration-300 ${dot === index ? "w-6 bg-[var(--ink)]" : "w-1.5 bg-[var(--ink)]/25"}`} />
        </button>)}
      </div>}
    </div>
  );
}
