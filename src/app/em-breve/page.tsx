import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Cadeado } from "@/components/cadeado";
import { COOKIE_CONVITE, conviteValido, preVendaAtiva } from "@/lib/pre-venda";

export const metadata: Metadata = { title: "MERANNO | Coming soon", robots: { index: false, follow: false } };

const INSTAGRAM = "https://www.instagram.com/meranoclothing/";

// What every page shows during the pre-sale to someone without the invite (the proxy swaps the content for this).
// It covers the whole screen, above the footer and the floating buttons of the root layout.
// Reading the cookies and the address first keeps this page rendered per visit: prerendered at build time (with the
// lock off) it would become a fixed redirect to "/", and a locked visitor would bounce between the two forever.
export default async function EmBreve({ searchParams }: { searchParams: Promise<{ convite?: string }> }) {
  const [{ convite }, jar] = await Promise.all([searchParams, cookies()]);
  if (!preVendaAtiva() || (await conviteValido(jar.get(COOKIE_CONVITE)?.value))) redirect("/");
  const grupo = process.env.PRE_VENDA_GRUPO_URL;

  return <main className="feltro fixed inset-0 z-[1000] flex flex-col items-center justify-between overflow-y-auto px-6 pb-8 pt-10 text-center text-[var(--creme)]">
    <style>{"html,body{overflow:hidden}"}</style>
    <p className="label text-[13px] tracking-[.55em] text-[var(--latao)]">Meranno</p>

    <div className="flex flex-col items-center py-10">
      <Cadeado id="cadeado-tela" className="cadeado-balanco w-[clamp(104px,20vw,150px)]" />
      <h1 className="display mt-10 text-[clamp(3.4rem,12vw,8.5rem)] leading-[.88]">Coming soon.</h1>
      <div className="mt-7 h-px w-24 bg-[linear-gradient(90deg,transparent,var(--latao),transparent)]" />
      <p className="mt-6 max-w-sm text-[17px] leading-snug text-[var(--creme)]/80">A pré-venda da Summer Collection 01 é só para quem está no grupo.</p>
      {convite === "invalido" && <p className="mt-3 max-w-sm text-[15px] text-[var(--latao)]">Esse convite não vale mais. Peça o link novo no grupo.</p>}
      {grupo && <a href={grupo} target="_blank" rel="noopener noreferrer" className="btn-ouro press label mt-8 inline-flex h-12 items-center rounded-full px-7 text-[13px] text-[var(--vinho)]">Quero entrar no grupo</a>}
    </div>

    <a href={INSTAGRAM} target="_blank" rel="noopener noreferrer" className="label inline-flex min-h-11 items-center text-[12px] text-[var(--creme)]/70 transition-colors hover:text-[var(--latao)]">Instagram</a>
  </main>;
}
