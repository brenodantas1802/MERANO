"use client";

import Image from "next/image";
import { useState } from "react";

export function ProductGallery({ name, images }: { name: string; images: string[] }) {
  const [active, setActive] = useState(0);
  return <div className="grid gap-3 md:grid-cols-[84px_1fr] md:gap-5"><div className="order-2 flex gap-3 md:order-1 md:flex-col">{images.map((image, index) => <button key={image} onClick={() => setActive(index)} aria-label={`Ver imagem ${index + 1} de ${name}`} className={`relative aspect-square w-20 overflow-hidden ${active === index ? "ring-1 ring-[var(--ink)]" : "opacity-60"}`}><Image src={image} alt="" fill className="object-cover" /></button>)}</div><div className="relative order-1 aspect-[.86] overflow-hidden bg-[var(--cream)] md:order-2"><Image src={images[active]} alt={name} fill priority className="object-cover" /></div></div>;
}
