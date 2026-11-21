import { HeroTextReveal } from "@/components/hero-text-reveal";
import { PillLink } from "@/components/ui/pill-link";
import { ESPADAS } from "@/lib/naipes";

// Top of the home page: the "Royal flush" (chosen by the owners on 2026-11-21 from the options page
// https://claude.ai/artifact/95NRWaUtmySMzCogGxKrbk). The five launch tees printed on playing cards, 10-J-Q-K-A of
// spades, are dealt face down and turn up in a fan in front of the giant brass ace, which draws itself behind them.
// All CSS (globals.css, "Royal flush"); the cards are small cutouts (recortes/*-carta.webp, 360 px).

const MANCHETE = ["Feito para", "quem entende de", <span key="excl" className="hero-accent">exclusividade.</span>];

export { ESPADAS };

// The hand, left to right. `r` fans the card, `d` is when it is dealt, `v` when it turns face up.
const MAO = [
  { valor: "10", id: "va-tutto-bene", nome: "Va tutto bene", r: -26, d: 0.05, v: 1.05 },
  { valor: "J", id: "verao-em-boa-companhia", nome: "Verão em boa companhia", r: -13, d: 0.2, v: 1.17 },
  { valor: "Q", id: "coracao-branco", nome: "Coração · Branco", r: 0, d: 0.35, v: 1.29 },
  { valor: "K", id: "wine-not", nome: "Wine not?", r: 13, d: 0.5, v: 1.41 },
  { valor: "A", id: "coracao-preto", nome: "Coração · Preto", r: 26, d: 0.65, v: 1.53 },
];

function Naipe({ className }: { className?: string }) {
  return <svg viewBox="0 0 100 100" aria-hidden className={className}><path d={ESPADAS} /></svg>;
}

function AsGigante() {
  return <svg aria-hidden viewBox="0 0 100 100" className="as-gigante rf-as pointer-events-none absolute">
    <path d={ESPADAS} pathLength={1} className="as-traco" fill="none" stroke="var(--latao)" strokeWidth={0.55} />
    <path d={ESPADAS} transform="translate(50 50) scale(.86) translate(-50 -50)" fill="none" stroke="var(--latao)" strokeOpacity={0.35} strokeWidth={0.4} />
  </svg>;
}

function RoyalFlush() {
  return <div className="rf-mao" aria-hidden>
    {MAO.map((carta) => <a key={carta.id} href={`/produto/${carta.id}`} tabIndex={-1} className="rf-carta" style={{ "--r": `${carta.r}deg`, "--d": `${carta.d}s`, "--v": `${carta.v}s` } as React.CSSProperties}>
      <span className="rf-giro">
        <span className="rf-face">
          <span className="rf-indice">{carta.valor}<Naipe /></span>
          <span className="rf-indice rf-baixo">{carta.valor}<Naipe /></span>
          {/* eslint-disable-next-line @next/next/no-img-element -- small transparent cutout, sized by the card */}
          <img src={`/imagens/merano-assets/recortes/${carta.id}-carta.webp`} alt="" width={360} height={380} decoding="async" fetchPriority="high" />
          <span className="rf-nome">{carta.nome}</span>
        </span>
        <span className="rf-verso"><Naipe /></span>
      </span>
    </a>)}
  </div>;
}

function Manchete() {
  return <div className="rf-manchete relative z-10 flex min-h-[88svh] flex-col justify-end pb-14 pt-24 md:min-h-screen md:justify-center md:pb-0">
    <div className="rule-latao mb-6 w-20" />
    <HeroTextReveal className="display max-w-[min(48rem,46vw)] text-[clamp(2.9rem,6.2vw,5.6rem)] max-md:max-w-3xl max-md:text-[clamp(2.6rem,11vw,4rem)]" lines={MANCHETE} />
    <div className="mt-9 flex flex-wrap gap-3"><PillLink href="#lancamento" variant="glass">Ver lançamento</PillLink><PillLink href="/personalizar-estampa" variant="glass">Criar a minha</PillLink></div>
  </div>;
}

export function HeroTopo() {
  return <section className="feltro rf-topo relative overflow-hidden px-7 text-[var(--creme)] md:px-16"><AsGigante /><RoyalFlush /><Manchete /></section>;
}
