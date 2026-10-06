import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { NewPasswordForm } from "@/components/auth-forms";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Nova senha · MERANO" };

// Reached from the password e-mail: the link signs the customer in, and here they choose the new password.
export default async function NewPasswordPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return <main>
    <SiteHeader />
    <div className="px-6 pb-24 pt-12 md:pt-16">
      <div className="mx-auto w-full max-w-md">
        <h1 className="display text-center text-5xl md:text-6xl">Nova senha</h1>
        <div className="mt-10 rounded-[2rem] bg-[var(--creme)] p-6 text-center shadow-[0px_2px_24px_-6px_rgba(17,17,17,0.18)] md:p-8">
          {user
            ? <><p className="mb-6 text-[15px] text-[var(--ink)]/80">Escolha a nova senha da conta <strong>{user.email}</strong>.</p><NewPasswordForm /></>
            : <><p className="text-[15px] text-[var(--ink)]/80">Este link expirou ou já foi usado.</p><Link href="/conta/esqueci" className="label mt-6 flex h-12 w-full items-center justify-center bg-[var(--ink)] text-[13px] text-[var(--creme)]">Pedir um link novo</Link></>}
        </div>
      </div>
    </div>
  </main>;
}
