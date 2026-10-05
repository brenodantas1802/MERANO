import Link from "next/link";
import Image from "next/image";
import { SiteHeader } from "@/components/site-header";
import { GoogleButton, RememberAccount, SignOutButton } from "@/components/auth-buttons";
import { createClient } from "@/lib/supabase/server";
import { isOwner } from "@/lib/owners";

const ERRORS: Record<string, string> = {
  login: "Não deu pra entrar com o Google. Tenta de novo?",
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
  const owner = user?.email_confirmed_at && isOwner(user.email);

  return (
    <main>
      <SiteHeader />
      <div className="mx-auto grid max-w-360 gap-10 px-6 pb-24 pt-8 md:grid-cols-[1.05fr_.95fr] md:gap-16 md:px-12 md:pt-10">
        {/* Sunset over the sea, with the brand's welcome on it. */}
        <div className="relative h-56 overflow-hidden rounded-[2rem] md:sticky md:top-[calc(var(--header-h,72px)+1rem)] md:h-[calc(100svh-var(--header-h,72px)-3rem)]">
          <Image src="/imagens/merano-assets/foto praia 2.jpg" alt="Pôr do sol na beira do mar" fill priority sizes="(min-width: 768px) 50vw, 100vw" className="object-cover object-[50%_70%]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,24,30,.05)_30%,rgba(6,24,30,.65)_100%)]" />
          <div className="absolute inset-x-0 bottom-0 p-6 text-white md:p-10">
            <p className="serif-note text-2xl text-[var(--sol-2)] md:text-3xl">{user ? "bem-vindo de volta" : "bem-vindo"}</p>
            <p className="display mt-2 max-w-md text-2xl leading-tight md:text-4xl">Seus pedidos, suas medidas e o provador, num lugar só.</p>
          </div>
        </div>
        <div className="mx-auto w-full max-w-md md:py-10">
          <h1 className="display text-7xl">Minha<br /><i>conta.</i></h1>

          {user ? <>
            <RememberAccount />
            <div className="mt-10 flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element -- the Google profile photo, from Google's servers */}
              {avatar && <img src={avatar} alt="" width={56} height={56} referrerPolicy="no-referrer" className="h-14 w-14 rounded-full object-cover ring-2 ring-white" />}
              <div className="min-w-0">
                <p className="serif-note text-xl text-[var(--terra)]">que bom te ver por aqui{name ? `, ${name.split(" ")[0]}` : ""}.</p>
                <p className="sans truncate text-[13px] text-[var(--muted)]">{user.email}</p>
              </div>
            </div>
            <nav aria-label="Menu da conta" className="mt-8 space-y-3">
              {MENU.map((item) => <Link key={item.title} href={item.href} className="group flex items-center justify-between rounded-2xl bg-[var(--creme)] px-6 py-5 shadow-[0px_2px_16px_-6px_rgba(32,28,23,0.18)] transition-transform hover:-translate-y-0.5"><span><span className="block text-2xl">{item.title}</span><span className="sans text-xs text-[var(--muted)]">{item.text}</span></span><span className="text-xl transition-transform group-hover:translate-x-1">→</span></Link>)}
              {owner && <Link href="/admin" className="group flex items-center justify-between rounded-2xl bg-[var(--terra-dark)] px-6 py-5 text-[var(--creme)] transition-transform hover:-translate-y-0.5"><span><span className="block text-2xl">Painel da equipe</span><span className="sans text-xs text-[var(--creme)]/65">Pedidos e operação da Merano.</span></span><span className="text-xl transition-transform group-hover:translate-x-1">→</span></Link>}
            </nav>
            <SignOutButton className="sans mt-8 rounded-full border border-[var(--ink)]/20 px-6 py-3 text-[14px] transition-colors hover:bg-[var(--creme)]" />
          </> : <>
            <div className="mt-12 rounded-[2rem] bg-[var(--creme)] p-6 shadow-[0px_2px_16px_-4px_rgba(32,28,23,0.18)] md:p-8">
              <p className="display text-3xl">Entre ou crie sua conta.</p>
              <p className="mt-2 leading-snug text-[var(--ink)]/70">Com a sua conta Google, num toque. Na primeira vez, a sua conta Merano é criada na hora.</p>
              {erro && ERRORS[erro] && <p role="alert" className="sans mt-5 rounded-2xl bg-[#8a3a2c]/10 px-4 py-3 text-[13px] text-[#8a3a2c]">{ERRORS[erro]}</p>}
              <div className="mt-6"><GoogleButton next={next} /></div>
              <p className="sans mt-5 text-[12px] leading-relaxed text-[var(--muted)]">Ao continuar, você concorda com os <Link href="/termos" className="underline underline-offset-2 hover:text-[var(--ink)]">Termos</Link> e a <Link href="/privacidade" className="underline underline-offset-2 hover:text-[var(--ink)]">Política de Privacidade</Link>.</p>
            </div>
            <Link href="/meu-fit" className="mt-8 flex items-center justify-between rounded-2xl border border-[var(--ink)]/15 px-6 py-5 transition-colors hover:bg-[var(--creme)]"><span><span className="serif-note block text-lg text-[var(--terra)]">ainda sem conta?</span><span className="text-lg">Salve suas medidas no Merano Fit</span></span><span className="text-xl">→</span></Link>
            <Link href="/carrinho" className="sans mt-10 block text-[13px] text-[var(--muted)] underline underline-offset-4 hover:text-[var(--ink)]">Continuar como visitante no checkout</Link>
          </>}
        </div>
      </div>
    </main>
  );
}
