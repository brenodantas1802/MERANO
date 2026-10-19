"use client";

import Image from "next/image";
import { useRef, useState, useSyncExternalStore, ViewTransition, type PointerEvent } from "react";
import { animate, motion, useMotionValue, useTransform, type MotionValue } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Lens } from "@/components/ui/lens";
import type { ShirtViews } from "@/lib/products";

const GALLERY_LABELS = ["Verso", "Frente", "Lado esquerdo", "Lado direito"];
// A slow drag turns the photo past this share of its width; a flick turns it past this speed (px/ms).
const SWIPE_SHARE = 0.2;
const FLICK_SPEED = 0.4;
const SLIDE = { duration: 0.35, ease: [0.32, 0.72, 0, 1] } as const;

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

// While the page is pinched in, one finger pans around the photo instead of turning it.
const subscribeViewport = (onChange: () => void) => {
  window.visualViewport?.addEventListener("resize", onChange);
  return () => window.visualViewport?.removeEventListener("resize", onChange);
};
const pinchedIn = () => (window.visualViewport?.scale ?? 1) > 1.01;

// Each photo sits beside the current one at its distance around the loop, so every move is the same sideways slide, wrapping included.
function Slide({ frame, alt, order, count, position }: { frame: Frame; alt: string; order: number; count: number; position: MotionValue<number> }) {
  const x = useTransform(position, (current) => {
    let slot = (((order - current) % count) + count) % count;
    if (slot >= count / 2) slot -= count;
    return `${slot * 100}%`;
  });
  return (
    <motion.div style={{ x }} className="absolute inset-0">
      <Image src={frame.src} alt={alt} fill draggable={false} loading="eager" sizes="(min-width: 768px) 55vw, 100vw" className="object-cover" />
    </motion.div>
  );
}

// One viewer for every angle: a swipe, the arrows and the dots all slide to the next photo, pinch-zoom is the browser's, and the magnifier follows the mouse.
export function ProductGallery3D({ id, name, images, views }: { id: string; name: string; images: string[]; views?: ShirtViews }) {
  const frames = framesFor(images, views);
  const count = frames.length;
  const [index, setIndex] = useState(0);
  const [hovering, setHovering] = useState(false);
  const [dragging, setDragging] = useState(false);
  const zoomed = useSyncExternalStore(subscribeViewport, pinchedIn, () => false);
  const position = useMotionValue(0);
  const target = useRef(0);
  const slide = useRef<ReturnType<typeof animate> | null>(null);
  const drag = useRef<{ id: number; x: number; from: number; width: number; time: number; moved: boolean } | null>(null);
  const wrap = (value: number) => ((value % count) + count) % count;

  const slideTo = (next: number) => {
    target.current = next;
    setIndex(wrap(next));
    slide.current?.stop();
    slide.current = animate(position, next, SLIDE);
  };
  const go = (step: number) => slideTo(target.current + step);
  const show = (dot: number) => {
    let step = dot - wrap(target.current);
    if (step > count / 2) step -= count;
    if (step < -count / 2) step += count;
    slideTo(target.current + step);
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (count < 2 || zoomed || !event.isPrimary || event.button !== 0) return;
    drag.current = { id: event.pointerId, x: event.clientX, from: 0, width: event.currentTarget.offsetWidth, time: event.timeStamp, moved: false };
  };
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const current = drag.current;
    if (!current || event.pointerId !== current.id) return;
    if (!current.moved) {
      if (Math.abs(event.clientX - current.x) < 6) return;
      // A tap does nothing; only a real sideways drag takes hold of the photo, from wherever it is.
      slide.current?.stop();
      Object.assign(current, { moved: true, from: position.get() });
      setDragging(true);
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    position.set(current.from - (event.clientX - current.x) / current.width);
  };
  const endDrag = (event: PointerEvent<HTMLDivElement>, cancelled = false) => {
    const current = drag.current;
    if (!current || event.pointerId !== current.id) return;
    drag.current = null;
    if (!current.moved) return;
    setDragging(false);
    const moved = position.get() - current.from;
    const distance = Math.abs(moved) * current.width;
    const flick = distance > 24 && distance / Math.max(event.timeStamp - current.time, 1) > FLICK_SPEED;
    let next = Math.round(position.get());
    if (!cancelled && next === Math.round(current.from) && (Math.abs(moved) > SWIPE_SHARE || flick)) next += Math.sign(moved);
    slideTo(next);
  };

  return (
    <div>
      <ViewTransition name={`produto-${id}`} share="morph" default="none">
        <div className="relative overflow-hidden">
          <div
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={(event) => endDrag(event)}
            onPointerCancel={(event) => endDrag(event, true)}
            style={{ touchAction: count > 1 && !zoomed ? "pan-y pinch-zoom" : undefined }}
            className={count > 1 ? (dragging ? "cursor-grabbing select-none" : "cursor-grab") : undefined}
          >
            <Lens zoomFactor={2} lensSize={190} hovering={hovering && !dragging} setHovering={setHovering}>
              <div className="relative aspect-[.9] w-full overflow-hidden bg-[var(--paper)]">
                {frames.map((frame, order) => (
                  <Slide key={frame.src} frame={frame} alt={`${name}, ${frame.label.toLowerCase()}`} order={order} count={count} position={position} />
                ))}
              </div>
            </Lens>
          </div>
          {count > 1 && <>
            <button type="button" onClick={() => go(-1)} aria-label="Vista anterior" className="absolute left-2 top-1/2 z-30 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--paper)]/90 shadow-[0_2px_10px_rgba(25,35,30,.15)] transition-transform hover:scale-105"><ChevronLeft size={16} strokeWidth={1.5} /></button>
            <button type="button" onClick={() => go(1)} aria-label="Próxima vista" className="absolute right-2 top-1/2 z-30 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--paper)]/90 shadow-[0_2px_10px_rgba(25,35,30,.15)] transition-transform hover:scale-105"><ChevronRight size={16} strokeWidth={1.5} /></button>
          </>}
        </div>
      </ViewTransition>
      {count > 1 && <div className="mt-2 flex justify-center">
        {frames.map((frame, dot) => <button key={frame.src} type="button" onClick={() => show(dot)} aria-label={`Ver ${frame.label.toLowerCase()}`} aria-current={dot === index} className="flex h-8 items-center px-1">
          <span className={`block h-1.5 rounded-full transition-all duration-300 ${dot === index ? "w-6 bg-[var(--ink)]" : "w-1.5 bg-[var(--ink)]/25"}`} />
        </button>)}
      </div>}
    </div>
  );
}
