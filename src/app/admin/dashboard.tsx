"use client";

import Link from "next/link";
import { Package, Search } from "lucide-react";
import { SignOutButton } from "@/components/auth-buttons";

// Demo orders until checkout writes real ones to the database.
const orders = [
  { id: "MR-0007", customer: "Ana Clara Ribeiro", item: "Serra · M · Ampla · Natural", date: "18 set 2026", status: "Recebido", total: "R$ 189,00" },
  { id: "MR-0006", customer: "João Pedro Lima", item: "Aurora · G · Regular · Terracota", date: "17 set 2026", status: "Em produção", total: "R$ 189,00" },
  { id: "MR-0005", customer: "Marina Alves", item: "Rio · P · Cropped · Azul claro", date: "16 set 2026", status: "Enviado", total: "R$ 189,00" },
];

export type CriacaoAdmin = {
  id: string;
  criada_em: string;
  status: string;
  tamanho: string;
  painel: { modelagem?: string; paleta?: string[]; fonte?: string };
  ficha: { ideia?: string; texto?: string };
  arte_path: string;
  arte_url: string | null;
  pedido: string | null;
  cliente: { nome?: string; email?: string; celular?: string; cidade?: string } | null;
};

const STATUS: Record<string, string> = { no_carrinho: "No carrinho", pedida: "Pedida", em_producao: "Em produção", entregue: "Entregue", cancelada: "Cancelada" };

// Prints made in the Personalizador. `null` means the secret key isn't configured, so the list can't be read here.
function Criacoes({ criacoes }: { criacoes: CriacaoAdmin[] | null }) {
  return <section className="mt-24">
    <div className="flex items-end justify-between"><div><p className="sans mb-4 text-[11px] uppercase tracking-[.2em] text-[var(--muted)]">Personalizador</p><h2 className="display text-6xl">Estampas criadas.</h2></div></div>
    {criacoes === null ? <p className="sans mt-8 max-w-2xl text-sm text-[var(--muted)]">Para ver as estampas aqui, cadastre a variável <code>SUPABASE_SECRET_KEY</code> (chave secreta do Supabase) na Vercel. Enquanto isso, elas ficam no Supabase: tabela <code>criacoes_estampa</code> e pasta <code>estampas</code> no Storage.</p>
      : criacoes.length === 0 ? <p className="sans mt-8 text-sm text-[var(--muted)]">Nenhuma estampa salva ainda.</p>
      : <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {criacoes.map((c) => <article key={c.id} className="border border-[var(--line)]">
          <div className="aspect-[3/4]" style={{ background: c.painel.paleta?.[0] ?? "#eee" }}>
            {/* eslint-disable-next-line @next/next/no-img-element -- signed Supabase link */}
            {c.arte_url && <a href={c.arte_url} target="_blank" rel="noreferrer"><img src={c.arte_url} alt={c.ficha.ideia ?? "Estampa"} className="h-full w-full object-contain" /></a>}
          </div>
          <div className="sans space-y-1 p-4 text-xs">
            <p className="flex justify-between"><span className="uppercase tracking-[.1em]">{STATUS[c.status] ?? c.status}{c.pedido ? ` · ${c.pedido}` : ""}</span><span>{c.tamanho} · {c.painel.modelagem}</span></p>
            <p className="text-[var(--muted)]">{new Date(c.criada_em).toLocaleString("pt-BR")}</p>
            {c.ficha.ideia && <p className="text-sm">{c.ficha.ideia}</p>}
            {c.ficha.texto && <p>Texto: “{c.ficha.texto}”</p>}
            <p>Frente: fonte {c.painel.fonte}</p>
            {c.cliente && <p className="text-[var(--muted)]">{[c.cliente.nome, c.cliente.email, c.cliente.celular, c.cliente.cidade].filter(Boolean).join(" · ")}</p>}
          </div>
        </article>)}
      </div>}
  </section>;
}

export function AdminDashboard({ email, criacoes }: { email: string; criacoes: CriacaoAdmin[] | null }) {
  return <main>
    <header className="sans flex items-center justify-between gap-4 border-b border-[var(--line)] px-6 py-5 md:px-12">
      <Link href="/" className="font-bold tracking-[.28em]">MERANNO / equipe</Link>
      <div className="flex items-center gap-4 text-[13px] text-[var(--muted)]">
        <span className="hidden truncate sm:inline">{email}</span>
        <SignOutButton className="rounded-full border border-[var(--ink)]/20 px-4 py-2 text-[var(--ink)] transition-colors hover:bg-[var(--creme)]" />
      </div>
    </header>
    <div className="mx-auto max-w-360 px-6 py-14 md:px-12">
      <div className="flex items-end justify-between">
        <div><p className="sans mb-4 text-[11px] uppercase tracking-[.2em] text-[var(--muted)]">Operação</p><h1 className="display text-7xl">Pedidos.</h1></div>
        <span className="sans flex items-center gap-2 text-[11px] uppercase tracking-[.14em] text-[var(--muted)]"><Package size={15} /> {orders.length} ativos</span>
      </div>
      <div className="mt-14 flex items-center gap-3 border-b border-[var(--line)] pb-3 sans text-[11px] text-[var(--muted)]"><Search size={15} /><input placeholder="Buscar por pedido ou cliente" className="w-full bg-transparent outline-none" /></div>
      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-190 border-collapse text-left">
          <thead className="sans text-[11px] uppercase tracking-[.14em] text-[var(--muted)]"><tr className="border-b border-[var(--line)]"><th className="py-4">Pedido</th><th>Cliente</th><th>Peça / especificações</th><th>Data</th><th>Status</th><th className="text-right">Total</th></tr></thead>
          <tbody>{orders.map((order) => <tr key={order.id} className="border-b border-[var(--line)]"><td className="py-5 sans text-xs">{order.id}</td><td className="text-lg">{order.customer}</td><td className="sans text-xs">{order.item}</td><td className="sans text-xs text-[var(--muted)]">{order.date}</td><td><span className="sans bg-[var(--cream)] px-3 py-2 text-[11px] uppercase tracking-[.1em]">{order.status}</span></td><td className="text-right sans text-xs">{order.total}</td></tr>)}</tbody>
        </table>
      </div>
      <Criacoes criacoes={criacoes} />
    </div>
  </main>;
}
