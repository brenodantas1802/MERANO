"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Lens } from "@/components/ui/lens";

const VIEW_LABELS = ["Verso", "Frente", "Lado esquerdo", "Lado direito"];

// One viewer for every angle: arrows/thumbnails switch the view and the magnifier works on whichever is showing.
export function ProductGallery3D({ name, images }: { name: string; images: string[] }) {
  const [index, setIndex] = useState(0);
  const go = (step: number) => setIndex((current) => (current + step + images.length) % images.length);
  const label = VIEW_LABELS[index] ?? `Vista ${index + 1}`;

  return (
    <div>
      <div className="relative overflow-hidden rounded-2xl">
        <Lens key={index} zoomFactor={2} lensSize={190}>
          <div className="relative aspect-[.86] w-full bg-[var(--cream)]">
            <Image src={images[index]} alt={`${name}, ${label.toLowerCase()}`} fill loading="eager" sizes="(min-width: 768px) 55vw, 100vw" className="object-cover" />
          </div>
        </Lens>
        <span className="script pointer-events-none absolute bottom-4 left-4 z-30 -rotate-3 rounded-full bg-[var(--paper)]/90 px-4 py-1.5 text-xl text-[var(--terra)] shadow-sm">{label}</span>
        {images.length > 1 && <>
          <button type="button" onClick={() => go(-1)} aria-label="Vista anterior" className="absolute left-3 top-1/2 z-30 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--paper)]/90 shadow-md transition-transform hover:scale-105"><ChevronLeft size={20} strokeWidth={1.5} /></button>
          <button type="button" onClick={() => go(1)} aria-label="Próxima vista" className="absolute right-3 top-1/2 z-30 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--paper)]/90 shadow-md transition-transform hover:scale-105"><ChevronRight size={20} strokeWidth={1.5} /></button>
        </>}
      </div>
      {images.length > 1 && <div className="mt-4 flex gap-3">
        {images.map((src, thumb) => <button key={src} type="button" onClick={() => setIndex(thumb)} aria-label={`Ver ${(VIEW_LABELS[thumb] ?? `vista ${thumb + 1}`).toLowerCase()}`} aria-current={thumb === index} className={`relative h-20 w-16 overflow-hidden rounded-xl bg-[var(--cream)] transition-all md:h-24 md:w-20 ${thumb === index ? "ring-2 ring-[var(--ink)] ring-offset-2 ring-offset-[var(--paper)]" : "opacity-60 hover:opacity-100"}`}><Image src={src} alt="" fill sizes="80px" className="object-cover" /></button>)}
      </div>}
      <p className="script mt-3 hidden -rotate-1 text-xl text-[var(--muted)] md:block">passe o mouse na foto pra ver o tecido de pertinho</p>
    </div>
  );
}
