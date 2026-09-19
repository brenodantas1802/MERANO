import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SiteHeader } from "./site-header";

export function ContentPage({ eyebrow, title, intro, sections }: { eyebrow: string; title: string; intro: string; sections: { title: string; text: string }[] }) {
  return <main><SiteHeader /><article className="mx-auto max-w-3xl px-6 pb-24 md:px-12"><Link href="/" className="sans mb-16 flex items-center gap-2 pt-8 text-[10px] uppercase tracking-[.15em] text-[var(--muted)]"><ArrowLeft size={14} /> Voltar para o início</Link><p className="sans mb-5 text-[10px] uppercase tracking-[.2em] text-[var(--muted)]">{eyebrow}</p><h1 className="display text-7xl md:text-9xl">{title}</h1><p className="mt-10 text-2xl leading-snug">{intro}</p><div className="mt-16 space-y-10">{sections.map((section) => <section key={section.title} className="border-t border-[var(--line)] pt-5"><h2 className="text-2xl">{section.title}</h2><p className="mt-3 text-lg leading-relaxed">{section.text}</p></section>)}</div></article></main>;
}
