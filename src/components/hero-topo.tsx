import { PillLink } from "@/components/ui/pill-link";
import { CapaVideo } from "@/components/capa-video";

// Top of the home page (owners' meeting, 2026-11-22): a clean cover, only the background video (components/capa-video),
// darkened (dark bar, Art Deco mood), the white logo in the header above it and the two buttons.
export function HeroTopo() {
  return <section className="capa relative flex min-h-[100svh] items-end overflow-hidden bg-[#0b0808] text-white">
    <CapaVideo />
    {/* Darker at the top (under the white logo) and at the bottom (under the buttons). */}
    <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,5,5,.72)_0%,rgba(8,5,5,.18)_32%,rgba(8,5,5,.25)_60%,rgba(30,8,14,.88)_100%)]" />
    <h1 className="sr-only">MERANNO, feito para quem entende de exclusividade.</h1>
    <div className="relative z-10 flex w-full flex-wrap justify-center gap-3 px-6 pb-[max(3.5rem,env(safe-area-inset-bottom))] md:pb-16">
      <PillLink href="#lancamento" variant="glass">Ver lançamento</PillLink>
      <PillLink href="/personalizar-estampa" variant="glass">Criar a minha</PillLink>
    </div>
  </section>;
}
