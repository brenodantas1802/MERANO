"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { products } from "@/lib/products";

const SWAP_MS = 2800;
// Shirts whose photos cut out cleanly (public/imagens/merano-assets/recortes); light textured ones don't.
const HANGER_SHIRTS = ["wine-not", "terraco-ao-mar", "rastro-no-lago", "verao-em-boa-companhia", "who-cares-preto"];

// Hand-drawn hanger showing the real shirts one after another, a linen tag on a string and a slowly
// spinning "made to order" stamp. Uses background-free cutouts of the shirt photos.
export function ShopHeroArt({ className = "" }: { className?: string }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrent((index) => (index + 1) % HANGER_SHIRTS.length), SWAP_MS);
    return () => clearInterval(timer);
  }, []);

  return <div aria-hidden className={`relative h-[300px] w-[270px] ${className}`}>
    <div className="swing absolute left-6 top-0 h-[280px] w-[210px]">
      <svg viewBox="0 0 210 70" className="absolute inset-x-0 top-0 h-[70px] w-full" fill="none" stroke="var(--ink)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M105 44 V22 c0 -5 5 -7 7 -11 c2 -5 -2 -9 -7 -9 c-5 0 -8 3 -8 7" />
      </svg>
      {/* Cutouts are trimmed to the shirt, so the collar always lands under the hook, as if the hanger were inside. */}
      <div className="absolute inset-x-0 top-[34px] h-[230px] drop-shadow-[0_14px_18px_rgba(32,28,23,.22)]">
        {HANGER_SHIRTS.map((id, index) => <Image key={id} src={`/imagens/merano-assets/recortes/${id}.png`} alt="" fill sizes="210px" className={`object-contain object-top transition-opacity duration-1000 ${index === current ? "opacity-100" : "opacity-0"}`} />)}
      </div>
    </div>

    <div className="swing-slow absolute right-0 top-[58px] origin-top">
      <svg width="2" height="54" className="mx-auto block"><line x1="1" y1="0" x2="1" y2="54" stroke="var(--terra)" strokeWidth="1.4" strokeDasharray="3 2" /></svg>
      <div className="-mt-1 w-[88px] rotate-6 rounded-md bg-[#EFE3CF] px-3 pb-3 pt-4 text-center shadow-[0_8px_18px_-10px_rgba(32,28,23,.5)]">
        <span className="mx-auto mb-2 block h-2 w-2 rounded-full border border-[var(--terra)]/60 bg-[var(--paper)]" />
        <p className="serif-note text-base leading-none text-[var(--terra)]">Coleção 01</p>
        <p className="sans mt-1.5 text-[9px] uppercase tracking-[.16em] text-[var(--ink)]/70">{products.length} peças</p>
      </div>
    </div>

    <div className="absolute bottom-0 left-0 h-[104px] w-[104px]">
      <svg viewBox="0 0 120 120" className="absolute inset-0 h-full w-full">
        <circle cx="60" cy="60" r="57" fill="var(--paper)" stroke="var(--terra)" strokeWidth="1.2" />
        <circle cx="60" cy="60" r="33" fill="none" stroke="var(--terra)" strokeWidth="1" strokeDasharray="2 3" />
      </svg>
      <Image src="/imagens/logo-simbolo-trimmed.png" alt="" width={505} height={307} className="absolute left-1/2 top-1/2 w-[44px] -translate-x-1/2 -translate-y-1/2" />
      <svg viewBox="0 0 120 120" className="spin-slow absolute inset-0 h-full w-full">
        <defs><path id="stamp-circle" d="M60 60 m-44 0 a44 44 0 1 1 88 0 a44 44 0 1 1 -88 0" /></defs>
        <text className="sans" fontSize="10" fill="var(--terra)"><textPath href="#stamp-circle" textLength="274" lengthAdjust="spacing">FEITO SOB DEMANDA · COLEÇÃO 01 ·</textPath></text>
      </svg>
    </div>
  </div>;
}
