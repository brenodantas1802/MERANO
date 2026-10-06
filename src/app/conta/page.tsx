import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { GoogleButton, RememberAccount, SignOutButton } from "@/components/auth-buttons";
import { SignInForm } from "@/components/auth-forms";
import { createClient } from "@/lib/supabase/server";
import { isOwnerSession } from "@/lib/owners";

const ERRORS: Record<string, string> = {
  login: "Não deu pra concluir a entrada. Tente de novo; se veio do e-mail de confirmação, abra o link no mesmo aparelho em que criou a conta.",
  cancelado: "O login foi cancelado no Google. Quando quiser, é só tentar de novo.",
};

const MENU = [
  { href: "/meu-fit", title: "Merano Fit", text: "Suas medidas, seu tamanho e suas peças." },
  { href: "/meu-fit#pecas", title: "Meus pedidos", text: "O que você já escolheu na Merano." },
  { href: "/provador", title: "Provador virtual", text: "Veja as estampas em você." },
];

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ next?: string; erro?: string }> }) {
  const { next, erro } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const name = (user?.user_metadata.full_name ?? user?.user_metadata.name ?? "") as string;
  const avatar = user?.user_metadata.avatar_url as string | undefined;
  const { data: claims } = await supabase.auth.getClaims();
  const owner = user?.email_confirmed_at && isOwnerSession(user.email, claims?.claims.amr);

  return (
    <main>
      <SiteHeader />
      {/* One centred column: the sign-in card, or the account menu once signed in. */}
      <div className="px-6 pb-24 pt-12 md:pt-16">
        <div className="mx-auto w-full max-w-md">
          <h1 className="display text-center text-5xl md:text-6xl">Minha conta</h1>

          {user ? <>
            <RememberAccount />
            <div className="mt-10 flex items-center justify-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element -- the Google profile photo, from Google's servers */}
              {avatar && <img src={avatar} alt="" width={56} height={56} referrerPolicy="no-referrer" className="h-14 w-14 rounded-full object-cover ring-2 ring-white" />}
              <div className="min-w-0">
                <p className="text-xl">Olá{name ? `, ${name.split(" ")[0]}` : ""}</p>
                <p className="sans truncate text-[13px] text-[var(--muted)]">{user.email}</p>
              </div>
            </div>
            <nav aria-label="Menu da conta" className="mt-8 space-y-3">
              {MENU.map((item) => <Link key={item.title} href={item.href} className="group flex items-center justify-between rounded-2xl bg-[var(--creme)] px-6 py-5 shadow-[0px_2px_16px_-6px_rgba(32,28,23,0.18)] transition-transform hover:-translate-y-0.5"><span><span className="block text-2xl">{item.title}</span><span className="sans text-xs text-[var(--muted)]">{item.text}</span></span><span className="text-xl transition-transform group-hover:translate-x-1">→</span></Link>)}
              {owner && <Link href="/admin" className="group flex items-center justify-between rounded-2xl bg-[var(--terra-dark)] px-6 py-5 text-[var(--creme)] transition-transform hover:-translate-y-0.5"><span><span className="block text-2xl">Painel da equipe</span><span className="sans text-xs text-[var(--creme)]/65">Pedidos e operação da Merano.</span></span><span className="text-xl transition-transform group-hover:translate-x-1">→</span></Link>}
            </nav>
            <div className="mt-8 flex justify-center"><SignOutButton className="sans rounded-full border border-[var(--ink)]/20 px-6 py-3 text-[14px] transition-colors hover:bg-[var(--areia-clara)]" /></div>
          </> : <>
            <div className="mt-10 rounded-[2rem] bg-[var(--creme)] p-6 text-center shadow-[0px_2px_24px_-6px_rgba(17,17,17,0.18)] md:p-8">
              <p className="display text-3xl">Entrar</p>
              {erro && ERRORS[erro] && <p role="alert" className="sans mt-5 rounded-xl bg-[#8a3a2c]/10 px-4 py-3 text-left text-[13px] text-[#8a3a2c]">{ERRORS[erro]}</p>}
              <div className="mt-6"><SignInForm next={next} /></div>
              <div className="my-5 flex items-center gap-3 text-[12px] text-[var(--muted)]"><span className="h-px flex-1 bg-[var(--line)]" />ou<span className="h-px flex-1 bg-[var(--line)]" /></div>
              <GoogleButton next={next} />
              <p className="sans mt-5 text-[12px] leading-relaxed text-[var(--muted)]">Ao continuar, você concorda com os <Link href="/termos" className="underline underline-offset-2 hover:text-[var(--ink)]">Termos</Link> e a <Link href="/privacidade" className="underline underline-offset-2 hover:text-[var(--ink)]">Política de Privacidade</Link>.</p>
            </div>
            <div className="mt-6 text-center">
              <p className="text-[14px] text-[var(--muted)]">Ainda não tem conta?</p>
              <Link href={next ? `/conta/criar?next=${encodeURIComponent(next)}` : "/conta/criar"} className="label mt-3 flex h-12 w-full items-center justify-center border border-[var(--ink)] text-[13px] transition-colors hover:bg-[var(--areia-clara)]">Criar conta</Link>
            </div>
            <Link href="/meu-fit" className="mt-6 flex items-center justify-between rounded-2xl border border-[var(--ink)]/15 px-6 py-5 transition-colors hover:bg-[var(--areia-clara)]"><span className="text-lg">Salve suas medidas no Merano Fit</span><span className="text-xl">→</span></Link>
            <Link href="/carrinho" className="sans mt-8 block text-center text-[13px] text-[var(--muted)] underline underline-offset-4 hover:text-[var(--ink)]">Continuar como visitante no checkout</Link>
          </>}
        </div>
      </div>
    </main>
  );
}
