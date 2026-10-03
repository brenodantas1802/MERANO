"use client";

import { useState } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { SocialButton } from "@/components/ui/social-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/animated-tabs";
import Image from "next/image";

export default function AccountPage() {
  const [done, setDone] = useState(false);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    window.localStorage.setItem("merano-account-exists", "1");
    setDone(true);
  }

  return (
    <main>
      <SiteHeader />
      <div className="mx-auto grid max-w-360 gap-10 px-6 pb-24 pt-8 md:grid-cols-[1.05fr_.95fr] md:gap-16 md:px-12 md:pt-10">
        {/* Sunset over the sea, with the brand's welcome on it. */}
        <div className="relative h-56 overflow-hidden rounded-[2rem] md:sticky md:top-[calc(var(--header-h,72px)+1rem)] md:h-[calc(100svh-var(--header-h,72px)-3rem)]">
          <Image src="/imagens/merano-assets/foto praia 2.jpg" alt="Pôr do sol na beira do mar" fill priority sizes="(min-width: 768px) 50vw, 100vw" className="object-cover object-[50%_70%]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,24,30,.05)_30%,rgba(6,24,30,.65)_100%)]" />
          <div className="absolute inset-x-0 bottom-0 p-6 text-white md:p-10">
            <p className="serif-note text-2xl text-[var(--sol-2)] md:text-3xl">bem-vindo de volta</p>
            <p className="display mt-2 max-w-md text-2xl leading-tight md:text-4xl">Seus pedidos, suas medidas e o provador, num lugar só.</p>
          </div>
        </div>
        <div className="mx-auto w-full max-w-md md:py-10">
        <h1 className="display text-7xl">Minha<br /><i>conta.</i></h1>

        {done ? (
          <nav aria-label="Menu da conta" className="mt-12 space-y-3">
            <p className="serif-note text-xl text-[var(--terra)]">que bom te ver por aqui.</p>
            {[
              { href: "/meu-fit", title: "Merano Fit", text: "Suas medidas, seu tamanho e suas peças." },
              { href: "/meu-fit#pecas", title: "Meus pedidos", text: "O que você já escolheu na Merano." },
              { href: "/provador", title: "Provador virtual", text: "Veja as estampas em você." },
            ].map((item) => <Link key={item.title} href={item.href} className="group flex items-center justify-between rounded-2xl bg-[var(--creme)] px-6 py-5 shadow-[0px_2px_16px_-6px_rgba(32,28,23,0.18)] transition-transform hover:-translate-y-0.5"><span><span className="block text-2xl">{item.title}</span><span className="sans text-xs text-[var(--muted)]">{item.text}</span></span><span className="text-xl transition-transform group-hover:translate-x-1">→</span></Link>)}
            <p className="sans pt-3 text-[11px] text-[var(--muted)]">O login de verdade chega com o banco de dados; por enquanto, seu perfil fica salvo neste navegador.</p>
          </nav>
        ) : (
          <div className="mt-12 rounded-2xl bg-[var(--creme)] p-6 shadow-[0px_2px_16px_-4px_rgba(32,28,23,0.18)] md:p-8">
            <Tabs defaultValue="entrar">
              <TabsList>
                <TabsTrigger value="entrar">Entrar</TabsTrigger>
                <TabsTrigger value="criar">Criar conta</TabsTrigger>
              </TabsList>

              <TabsContent value="entrar" className="pt-7">
                <form onSubmit={submit} className="space-y-5">
                  <div className="flex flex-col space-y-2"><Label htmlFor="login-email">E-mail</Label><Input id="login-email" required type="email" placeholder="seu@email.com" /></div>
                  <div className="flex flex-col space-y-2"><Label htmlFor="login-senha">Senha</Label><Input id="login-senha" required type="password" placeholder="••••••••" /></div>
                  <button type="submit" className="sans w-full rounded-full bg-[var(--ink)] px-5 py-4 text-center text-[11px] uppercase tracking-[.15em] text-[var(--creme)] transition-colors hover:bg-[var(--mar-fundo)]">Entrar</button>
                </form>
                <div className="my-6 h-px w-full bg-[var(--line)]" />
                <div className="flex flex-col gap-3">
                  <SocialButton social="google">Entrar com Google</SocialButton>
                  <SocialButton social="apple">Entrar com Apple</SocialButton>
                </div>
              </TabsContent>

              <TabsContent value="criar" className="pt-7">
                <form onSubmit={submit} className="space-y-5">
                  <div className="flex flex-col space-y-2"><Label htmlFor="nome">Nome</Label><Input id="nome" required placeholder="Seu nome" type="text" /></div>
                  <div className="flex flex-col space-y-2"><Label htmlFor="email">E-mail</Label><Input id="email" required type="email" placeholder="seu@email.com" /></div>
                  <div className="flex flex-col space-y-2"><Label htmlFor="senha">Senha</Label><Input id="senha" required minLength={8} type="password" placeholder="••••••••" /></div>
                  <button type="submit" className="sans w-full rounded-full bg-[var(--ink)] px-5 py-4 text-center text-[11px] uppercase tracking-[.15em] text-[var(--creme)] transition-colors hover:bg-[var(--mar-fundo)]">Criar conta</button>
                </form>
                <div className="my-6 h-px w-full bg-[var(--line)]" />
                <div className="flex flex-col gap-3">
                  <SocialButton social="google">Cadastrar com Google</SocialButton>
                  <SocialButton social="apple">Cadastrar com Apple</SocialButton>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {!done && <Link href="/meu-fit" className="mt-8 flex items-center justify-between rounded-2xl border border-[var(--ink)]/15 px-6 py-5 transition-colors hover:bg-[var(--creme)]"><span><span className="serif-note block text-lg text-[var(--terra)]">ainda sem conta?</span><span className="text-lg">Salve suas medidas no Merano Fit</span></span><span className="text-xl">→</span></Link>}
        <Link href="/carrinho" className="sans mt-10 block text-[13px] text-[var(--muted)] underline underline-offset-4 hover:text-[var(--ink)]">Continuar como visitante no checkout</Link>
        </div>
      </div>
    </main>
  );
}
