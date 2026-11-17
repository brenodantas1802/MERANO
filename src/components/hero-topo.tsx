import { HeroTextReveal } from "@/components/hero-text-reveal";
import { PillLink } from "@/components/ui/pill-link";
import { ESPADAS } from "@/lib/naipes";

// Top of the home page, on phones and computers: a giant brass ace drawn on wine felt (chosen by the owners on
// 2026-11-10 from the options page; the sea video and the other candidates are in git history). One simple idea, no
// video: low visual complexity reads best at first glance (docs/PESQUISA-UX.md §2) and the page stays light.

const MANCHETE = ["Feito para", "quem entende de", <span key="excl" className="hero-accent">exclusividade.</span>];

export { ESPADAS };

function AsGigante() {
  return <svg aria-hidden viewBox="0 0 100 100" className="as-gigante pointer-events-none absolute -right-[22%] top-[10%] h-[78%] w-auto md:-right-[4%] md:top-[6%] md:h-[96%]">
    <path d={ESPADAS} pathLength={1} className="as-traco" fill="none" stroke="var(--latao)" strokeWidth={0.55} />
    <path d={ESPADAS} transform="translate(50 50) scale(.86) translate(-50 -50)" fill="none" stroke="var(--latao)" strokeOpacity={0.35} strokeWidth={0.4} />
  </svg>;
}

function Manchete() {
  return <div className="relative z-10 flex min-h-[88svh] flex-col justify-end pb-14 pt-24 md:min-h-screen md:justify-center md:pb-0">
    <div className="rule-latao mb-6 w-20" />
    <HeroTextReveal className="display max-w-3xl text-[clamp(2.9rem,8.5vw,6.8rem)]" lines={MANCHETE} />
    <div className="mt-9 flex flex-wrap gap-3"><PillLink href="#lancamento" variant="glass">Ver lançamento</PillLink><PillLink href="/personalizar-estampa" variant="glass">Criar a minha</PillLink></div>
  </div>;
}

export function HeroTopo() {
  return <section className="feltro relative overflow-hidden px-7 text-[var(--creme)] md:px-16"><AsGigante /><Manchete /></section>;
}
