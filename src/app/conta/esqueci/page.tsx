import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { ForgotPasswordForm } from "@/components/auth-forms";

export const metadata: Metadata = { title: "Esqueci minha senha · MERANO" };

export default function ForgotPasswordPage() {
  return <main>
    <SiteHeader />
    <div className="px-6 pb-24 pt-12 md:pt-16">
      <div className="mx-auto w-full max-w-md">
        <h1 className="display text-center text-5xl md:text-6xl">Esqueci minha senha</h1>
        <div className="mt-10 rounded-[2rem] bg-[var(--creme)] p-6 text-center shadow-[0px_2px_24px_-6px_rgba(17,17,17,0.18)] md:p-8">
          <p className="mb-6 text-[15px] text-[var(--ink)]/80">Digite o e-mail da sua conta e enviaremos um link para você criar uma senha nova.</p>
          <ForgotPasswordForm />
        </div>
        <p className="mt-6 text-center text-[14px] text-[var(--muted)]"><Link href="/conta" className="font-medium text-[var(--ink)] underline underline-offset-4">Voltar para entrar</Link></p>
      </div>
    </div>
  </main>;
}
