import Link from "next/link";

export default function NotFound() {
  return <main className="flex min-h-screen items-center justify-center px-6">
    <div className="text-center">
      <p className="label text-[12px] text-[var(--muted)]">Erro 404</p>
      <h1 className="display mt-3 text-5xl">Página não encontrada</h1>
      <Link href="/" className="label mt-8 inline-block border-b border-[var(--ink)] pb-1 text-[12px]">Voltar para o início</Link>
    </div>
  </main>;
}
