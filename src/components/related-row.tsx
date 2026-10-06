"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type PointerEvent } from "react";

export type RelatedItem = { id: string; name: string; image: string };

// "Você também pode gostar": four across on computers, a swipe on phones, and a bar under the row that shows where
// you are and can be dragged (or clicked) to slide through the other pieces.
export function RelatedRow({ items }: { items: RelatedItem[] }) {
  const row = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; left: number } | null>(null);
  const [bar, setBar] = useState({ width: 1, left: 0 });

  // Thumb size is the share of the row in view; its position follows the scroll.
  useEffect(() => {
    const element = row.current;
    if (!element) return;
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const width = element.clientWidth / element.scrollWidth;
        const room = element.scrollWidth - element.clientWidth;
        setBar({ width, left: room > 0 ? (element.scrollLeft / room) * (1 - width) : 0 });
      });
    };
    update();
    element.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => { cancelAnimationFrame(frame); element.removeEventListener("scroll", update); window.removeEventListener("resize", update); };
  }, []);

  const scrollToRatio = (ratio: number, smooth: boolean) => {
    const element = row.current;
    if (element) element.scrollTo({ left: ratio * (element.scrollWidth - element.clientWidth), behavior: smooth ? "smooth" : "auto" });
  };
  const onTrackDown = (event: PointerEvent<HTMLDivElement>) => {
    const rect = track.current!.getBoundingClientRect();
    const position = (event.clientX - rect.left) / rect.width;
    // Pressing on the thumb starts a drag; pressing elsewhere on the bar jumps there.
    if (position >= bar.left && position <= bar.left + bar.width) {
      drag.current = { x: event.clientX, left: bar.left };
      event.currentTarget.setPointerCapture(event.pointerId);
    } else {
      scrollToRatio(Math.min(1, Math.max(0, (position - bar.width / 2) / (1 - bar.width))), true);
    }
  };
  const onTrackMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    const rect = track.current!.getBoundingClientRect();
    const left = drag.current.left + (event.clientX - drag.current.x) / rect.width;
    scrollToRatio(Math.min(1, Math.max(0, left / (1 - bar.width))), false);
  };
  const endDrag = () => { drag.current = null; };

  return <>
    <div ref={row} id="related" className="-mx-6 mt-4 flex snap-x snap-mandatory scroll-px-6 gap-3 overflow-x-auto px-6 [scrollbar-width:none] md:mx-0 md:gap-4 md:scroll-px-0 md:px-0 [&::-webkit-scrollbar]:hidden">
      {items.map((item) => <Link key={item.id} href={`/produto/${item.id}`} className="group w-[64vw] shrink-0 snap-start md:w-[calc((100%-3rem)/4)]">
        <div className="relative aspect-square overflow-hidden bg-[var(--cream)]/35">
          <Image src={item.image} alt={item.name} fill sizes="(min-width: 768px) 25vw, 64vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
        </div>
        <p className="mt-2.5 truncate text-[14px] font-semibold uppercase tracking-[.04em]">{item.name}</p>
      </Link>)}
    </div>
    {bar.width < 0.999 && <div
      ref={track}
      role="scrollbar"
      aria-controls="related"
      aria-orientation="horizontal"
      aria-valuenow={Math.round((bar.left / Math.max(0.001, 1 - bar.width)) * 100)}
      aria-label="Arraste para ver mais peças"
      onPointerDown={onTrackDown}
      onPointerMove={onTrackMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      className="group mt-5 cursor-pointer touch-none py-2"
    >
      <div className="relative h-[3px] rounded-full bg-[var(--ink)]/12">
        <div className="absolute inset-y-0 rounded-full bg-[var(--ink)] transition-[height] group-hover:-inset-y-px" style={{ width: `${bar.width * 100}%`, left: `${bar.left * 100}%` }} />
      </div>
    </div>}
  </>;
}
