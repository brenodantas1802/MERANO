import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { GoogleButton } from "@/components/auth-buttons";
import { SignUpForm } from "@/components/auth-forms";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Criar conta · MERANO" };

export default async function CreateAccountPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect("/conta");

  return <main>
    <SiteHeader />
    <div className="px-6 pb-24 pt-12 md:pt-16">
      <div className="mx-auto w-full max-w-md">
        <h1 className="display text-center text-5xl md:text-6xl">Criar conta</h1>
        <div className="mt-10 rounded-[2rem] bg-[var(--creme)] p-6 text-center shadow-[0px_2px_24px_-6px_rgba(17,17,17,0.18)] md:p-8">
          <SignUpForm next={next} />
          <div className="my-5 flex items-center gap-3 text-[12px] text-[var(--muted)]"><span className="h-px flex-1 bg-[var(--line)]" />ou<span className="h-px flex-1 bg-[var(--line)]" /></div>
          <GoogleButton next={next} />
          <p className="sans mt-5 text-[12px] leading-relaxed text-[var(--muted)]">Ao criar a conta, você concorda com os <Link href="/termos" className="underline underline-offset-2 hover:text-[var(--ink)]">Termos</Link> e a <Link href="/privacidade" className="underline underline-offset-2 hover:text-[var(--ink)]">Política de Privacidade</Link>.</p>
        </div>
        <p className="mt-6 text-center text-[14px] text-[var(--muted)]">Já tem conta? <Link href={next ? `/conta?next=${encodeURIComponent(next)}` : "/conta"} className="font-medium text-[var(--ink)] underline underline-offset-4">Entrar</Link></p>
      </div>
    </div>
  </main>;
}
