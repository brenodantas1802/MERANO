import { SiteHeader } from "./site-header";

// Plain information pages (delivery, exchanges, FAQ, contact, terms): a title and the sections, nothing else.
export function ContentPage({ title, intro, sections }: { title: string; intro?: string; sections: { title: string; text: string }[] }) {
  return <main><SiteHeader /><article className="mx-auto max-w-3xl px-6 pb-24 pt-10 md:px-12 md:pt-14">
    <h1 className="display text-5xl md:text-6xl">{title}</h1>
    {intro && <p className="mt-4 text-lg leading-snug text-[var(--ink)]/75">{intro}</p>}
    <div className="mt-10 space-y-8">{sections.map((section) => <section key={section.title} className="border-t border-[var(--line)] pt-5">
      <h2 className="text-lg font-medium">{section.title}</h2>
      <p className="mt-2 leading-relaxed text-[var(--ink)]/80">{section.text}</p>
    </section>)}</div>
  </article></main>;
}
