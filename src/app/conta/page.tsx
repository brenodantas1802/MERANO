"use client";

import { useState } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { SocialButton } from "@/components/ui/social-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/animated-tabs";

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
      <div className="mx-auto max-w-md px-6 pb-24 pt-16">
        <p className="sans mb-5 text-[10px] uppercase tracking-[.2em] text-[var(--muted)]">Área do cliente</p>
        <h1 className="display text-7xl">Minha<br /><i>conta.</i></h1>

        {done ? (
          <div className="mt-12 border-y border-[var(--line)] py-8">
            <p className="text-2xl">Combinado.</p>
            <p className="sans mt-3 text-xs text-[var(--muted)]">A conta ficará disponível quando o banco e a autenticação estiverem conectados.</p>
          </div>
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
                  <button type="submit" className="sans w-full bg-[var(--ink)] px-5 py-4 text-left text-[11px] uppercase tracking-[.15em] text-[var(--creme)] transition-opacity hover:opacity-85">Entrar</button>
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
                  <button type="submit" className="sans w-full bg-[var(--ink)] px-5 py-4 text-left text-[11px] uppercase tracking-[.15em] text-[var(--creme)] transition-opacity hover:opacity-85">Criar conta</button>
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

        <Link href="/carrinho" className="sans mt-10 block text-[10px] uppercase tracking-[.14em] text-[var(--muted)]">Continuar como visitante no checkout</Link>
      </div>
    </main>
  );
}
