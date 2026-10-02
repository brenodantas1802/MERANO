"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useMotionValue, useSpring } from "motion/react";
import { ViewTransition, type PointerEvent } from "react";
import type { Product } from "@/lib/products";
import { formatPrice, getProductPrice } from "@/lib/products";
import { QuickAdd } from "@/components/quick-add";

const EASE = [0.22, 1, 0.36, 1] as const;

export function ProductCard({ product }: { product: Product }) {
  const discounted = product.salePrice && product.salePrice < product.price;
  const second = product.gallery[1];
  // Gentle tilt toward the pointer; touch devices skip it.
  const rotateX = useSpring(useMotionValue(0), { stiffness: 160, damping: 20 });
  const rotateY = useSpring(useMotionValue(0), { stiffness: 160, damping: 20 });
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    rotateY.set(((event.clientX - rect.left) / rect.width - 0.5) * 9);
    rotateX.set(-((event.clientY - rect.top) / rect.height - 0.5) * 7);
  };
  const onPointerLeave = () => { rotateX.set(0); rotateY.set(0); };

  return <motion.article
    className="group relative"
    initial={{ opacity: 0, y: 28 }}
    whileInView={{ opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } }}
    viewport={{ once: true, margin: "-80px" }}
  >
    <Link href={`/produto/${product.id}`} aria-label={`Ver ${product.name}`} transitionTypes={["nav-forward"]}>
      <div className="[perspective:1100px]" onPointerMove={onPointerMove} onPointerLeave={onPointerLeave}>
        <motion.div style={{ rotateX, rotateY, transformStyle: "preserve-3d" }} className="relative">
          <ViewTransition name={`produto-${product.id}`} share="morph" default="none">
            <div className="relative aspect-[.82] overflow-hidden bg-[var(--cream)] shadow-[0_0_0_rgba(25,35,30,0)] transition-shadow duration-500 ease-out group-hover:shadow-[0_28px_50px_-20px_rgba(25,35,30,0.4)]">
              <Image src={product.image} alt={product.name} fill sizes="(min-width: 768px) 33vw, 100vw" className={`object-cover transition-[opacity,transform] duration-700 ease-[cubic-bezier(.22,1,.36,1)] ${second ? "group-hover:scale-[1.03] group-hover:opacity-0" : "group-hover:scale-[1.04]"}`} />
              {second && <Image src={second} alt={`${product.name}, segunda vista`} fill sizes="(min-width: 768px) 33vw, 100vw" className="scale-[1.06] object-cover opacity-0 transition-[opacity,transform] duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-100 group-hover:opacity-100" />}
              {/* Soft light that follows the tilt. */}
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_30%_0%,rgba(255,255,255,.28),transparent_55%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              {discounted && <span className="sans absolute left-4 top-4 -rotate-6 rounded-full bg-[var(--sol-1)] px-3 py-1 text-[10px] uppercase tracking-[.12em] text-white shadow-sm">Oferta</span>}
            </div>
          </ViewTransition>
        </motion.div>
      </div>
      <div className="flex flex-col gap-1 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4 sm:py-4"><h3 className="text-lg leading-tight md:text-xl">{product.name}</h3><div className="sans text-sm sm:text-right">{discounted && <del className="mr-2 text-[var(--muted)]">{formatPrice(product.price)}</del>}<strong>{formatPrice(getProductPrice(product))}</strong></div></div>
    </Link>
    <QuickAdd product={product} />
  </motion.article>;
}
