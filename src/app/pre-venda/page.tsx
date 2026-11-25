import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Cadeado } from "@/components/cadeado";
import { GoogleButton, SignOutButton } from "@/components/auth-buttons";
import { SignInForm } from "@/components/auth-forms";
import { createClient } from "@/lib/supabase/server";
import { COOKIE_ACESSO, acessoValido, preVendaAtiva } from "@/lib/pre-venda";
import { autorizacao, pedidoDaConta } from "@/lib/pre-venda-lista";
import { AbrirCadeado, Aguardando, Entrando, FormTelefone } from "./formularios";
import { PRECO_ESPECIAL, PRECO_LANCAMENTO, PRECO_PRE_VENDA } from "@/lib/products";

export const metadata: Metadata = { title: "MERANNO | Pré-venda", robots: { index: false, follow: false } };
// The phone's browser bars in the same wine as the page (.feltro).
export const viewport: Viewport = { themeColor: "#39000F" };

// The link sent to the WhatsApp group. Sign in (or create the account the first time); if the account's e-mail or
// WhatsApp is on the pre-sale list, "Abrir o cadeado" lets this browser in. Covers the whole screen, like /em-breve.
export default async function PreVenda() {
  const [jar, supabase] = await Promise.all([cookies(), createClient()]);
  if (!preVendaAtiva()) redirect("/");
  // Already in: no server redirect (it would be a client navigation and skip the padlock animation).
  const jaLiberado = await acessoValido(jar.get(COOKIE_ACESSO)?.value);
  const { data: { user } } = await supabase.auth.getUser();
  const situacao = user ? await autorizacao(user) : null;
  // Not on the list: the access request this account sent the team, if any.
  const pedido = user && !situacao?.liberado ? await pedidoDaConta(user.id) : null;
  const telefoneBonito = (telefone: string) => telefone.slice(2).replace(/^(\d{2})(\d{4,5})(\d{4})$/, "($1) $2-$3");
  const nome = ((user?.user_metadata.full_name ?? user?.user_metadata.name ?? "") as string).split(" ")[0];

  return <main className="feltro fixed inset-0 z-[1000] overflow-y-auto text-[var(--creme)]">
    <style>{"html,body{overflow:hidden}"}</style>
    <div className="mx-auto flex min-h-full w-full max-w-md flex-col items-center px-6 pb-12 pt-10 text-center">
      <p className="label text-[13px] tracking-[.55em] text-[var(--latao)]">Meranno</p>
      <Cadeado id="cadeado-pre-venda" className="cadeado-balanco mt-10 w-[clamp(80px,18vw,108px)]" />
      <h1 className="display mt-8 text-[clamp(3rem,12vw,5.2rem)] leading-[.9]">Pré-venda.</h1>
      <p className="mt-3 text-[16px] text-[var(--creme)]/90">Summer Collection 01, só para quem está no grupo.</p>
      {PRECO_ESPECIAL && <p className="sans mt-4 inline-flex rounded-full border border-[var(--latao)]/50 px-4 py-2 text-[12px] uppercase tracking-[.16em] text-[var(--creme)]">Todas as camisetas por&nbsp;<del className="opacity-60">R$ {PRECO_LANCAMENTO}</del>&nbsp;<b className="font-semibold text-[var(--latao)]">R$ {PRECO_PRE_VENDA}</b></p>}
      {PRECO_ESPECIAL && <p className="mt-3 text-[14px] text-[var(--creme)]/75">Preço só da pré-venda. Na venda aberta, volta para R$ {PRECO_LANCAMENTO}.</p>}

      <div className="mt-8 w-full rounded-[2rem] bg-[var(--superficie)] p-6 text-left text-[var(--ink)] shadow-[0_30px_60px_-30px_rgba(12,2,6,.8)] md:p-8">
        {jaLiberado ? <Entrando /> : !user ? <>
          <p className="display text-3xl">Entre para liberar</p>
          <p className="sans mt-2 text-[14px] text-[var(--muted)]">Use a conta com o e-mail ou o WhatsApp que está no grupo. Na primeira vez, crie a sua conta; depois é só entrar.</p>
          <div className="mt-6"><GoogleButton next="/pre-venda" /></div>
          <div className="my-5 flex items-center gap-3 text-[12px] text-[var(--muted)]"><span className="h-px flex-1 bg-[var(--line)]" />ou com e-mail<span className="h-px flex-1 bg-[var(--line)]" /></div>
          <SignInForm next="/pre-venda" />
          <p className="sans mt-5 text-center text-[14px] text-[var(--muted)]">Primeira vez? <Link href="/conta/criar?next=/pre-venda" className="font-medium text-[var(--vinho)] underline underline-offset-4">Criar conta</Link></p>
        </> : situacao?.liberado ? <>
          <p className="display text-3xl">Você está na lista{nome ? `, ${nome}` : ""}.</p>
          <p className="sans mt-2 text-[14px] text-[var(--muted)]">Sua conta está liberada. Em outro celular ou computador, é só entrar com ela de novo.</p>
          <AbrirCadeado />
        </> : pedido?.status === "pendente" ? <>
          <p className="display text-3xl">Pedido enviado.</p>
          <p className="sans mt-2 text-[14px] text-[var(--muted)]">A equipe Meranno vai conferir {pedido.telefone ? <>o WhatsApp <strong className="text-[var(--ink)]">{telefoneBonito(pedido.telefone)}</strong> no grupo</> : "seu cadastro"} e liberar a sua conta. Quando liberar, esta página abre o cadeado. Se fechar, é só abrir o mesmo link de novo.</p>
          <Aguardando />
          <details className="sans mt-5 text-[13px] text-[var(--muted)]">
            <summary className="cursor-pointer underline underline-offset-4">Digitei o número errado</summary>
            <FormTelefone rotulo="Enviar de novo" />
          </details>
        </> : pedido?.status === "recusado" ? <>
          <p className="display text-3xl">Acesso não liberado.</p>
          <p className="sans mt-2 text-[14px] text-[var(--muted)]">A equipe não liberou a conta <strong className="text-[var(--ink)]">{user.email}</strong>. Se acha que é engano, fale com quem te mandou o link.</p>
          <div className="sans mt-5 flex justify-center text-[13px] text-[var(--muted)]"><SignOutButton className="underline underline-offset-4 hover:text-[var(--ink)]" /><span className="ml-1">e entrar com outra conta</span></div>
        </> : <>
          <p className="display text-3xl">Quase lá.</p>
          <p className="sans mt-2 text-[14px] text-[var(--muted)]">O e-mail <strong className="text-[var(--ink)]">{user.email}</strong> não está na lista. Digite o WhatsApp que você usa no grupo: se ele estiver na lista, libera na hora; se não, o pedido vai para a equipe liberar.</p>
          <FormTelefone />
          <div className="sans mt-5 flex justify-center text-[13px] text-[var(--muted)]"><SignOutButton className="underline underline-offset-4 hover:text-[var(--ink)]" /><span className="ml-1">e entrar com outra conta</span></div>
        </>}
      </div>
    </div>
  </main>;
}
