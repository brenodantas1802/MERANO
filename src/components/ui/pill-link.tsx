import Link from "next/link";
import type { ReactNode } from "react";

type Variant = "outline" | "solid" | "glass";

const BASE = "group/pill relative inline-flex w-fit items-center justify-center overflow-hidden rounded-full px-7 py-3.5 sans text-[11px] font-medium uppercase tracking-[.16em] transition-colors duration-500";

// Each variant has a fill that sweeps in from the left on hover, so the button answers the pointer without moving.
const VARIANTS: Record<Variant, { root: string; fill: string; label: string }> = {
  outline: { root: "border border-[var(--ink)] text-[var(--ink)]", fill: "bg-[var(--ink)]", label: "group-hover/pill:text-[var(--paper)]" },
  solid: { root: "bg-[var(--ink)] text-[var(--paper)]", fill: "bg-[var(--sol-1)]", label: "" },
  glass: { root: "border border-white/45 bg-white/[.14] text-white shadow-[inset_0_1px_0_rgba(255,255,255,.35)] backdrop-blur-md", fill: "bg-white", label: "group-hover/pill:text-[var(--ink)]" },
};

export function PillLink({ href, children, variant = "outline", className = "" }: { href: string; children: ReactNode; variant?: Variant; className?: string }) {
  const style = VARIANTS[variant];
  const content = <>
    <span aria-hidden className={`absolute inset-0 origin-left scale-x-0 rounded-full transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] group-hover/pill:scale-x-100 ${style.fill}`} />
    <span className={`relative transition-colors duration-500 ${style.label}`}>{children}</span>
  </>;
  // Same-page anchors stay plain links so the smooth scroller can take them.
  return href.startsWith("#")
    ? <a href={href} className={`${BASE} ${style.root} ${className}`}>{content}</a>
    : <Link href={href} className={`${BASE} ${style.root} ${className}`}>{content}</Link>;
}
