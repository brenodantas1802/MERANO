import { SiteHeader } from "@/components/site-header";

// Shown at once when a link leads to a page the server still has to put together (Minha conta, Meu Fit, a pedido,
// the payment): the tap answers straight away instead of seeming dead for a second (owners, 2026-11-22: the account
// button "não tava indo direito"). Pages that are ready ahead of time never show it. The spinner only appears after a
// moment, so a fast page doesn't flash it.
export default function Carregando() {
  return <main>
    <SiteHeader />
    <div role="status" className="flex min-h-[60svh] items-center justify-center">
      <span aria-hidden className="carregando h-8 w-8 animate-spin rounded-full border-2 border-[var(--latao)] border-t-transparent" />
      <span className="sr-only">Carregando…</span>
    </div>
  </main>;
}
