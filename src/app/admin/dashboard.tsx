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

export function AdminDashboard({ email }: { email: string }) {
  return <main>
    <header className="sans flex items-center justify-between gap-4 border-b border-[var(--line)] px-6 py-5 md:px-12">
      <Link href="/" className="font-bold tracking-[.28em]">MERANO / equipe</Link>
      <div className="flex items-center gap-4 text-[13px] text-[var(--muted)]">
        <span className="hidden truncate sm:inline">{email}</span>
        <SignOutButton className="rounded-full border border-[var(--ink)]/20 px-4 py-2 text-[var(--ink)] transition-colors hover:bg-[var(--creme)]" />
      </div>
    </header>
    <div className="mx-auto max-w-360 px-6 py-14 md:px-12">
      <div className="flex items-end justify-between">
        <div><p className="sans mb-4 text-[10px] uppercase tracking-[.2em] text-[var(--muted)]">Operação</p><h1 className="display text-7xl">Pedidos.</h1></div>
        <span className="sans flex items-center gap-2 text-[11px] uppercase tracking-[.14em] text-[var(--muted)]"><Package size={15} /> {orders.length} ativos</span>
      </div>
      <div className="mt-14 flex items-center gap-3 border-b border-[var(--line)] pb-3 sans text-[11px] text-[var(--muted)]"><Search size={15} /><input placeholder="Buscar por pedido ou cliente" className="w-full bg-transparent outline-none" /></div>
      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-190 border-collapse text-left">
          <thead className="sans text-[10px] uppercase tracking-[.14em] text-[var(--muted)]"><tr className="border-b border-[var(--line)]"><th className="py-4">Pedido</th><th>Cliente</th><th>Peça / especificações</th><th>Data</th><th>Status</th><th className="text-right">Total</th></tr></thead>
          <tbody>{orders.map((order) => <tr key={order.id} className="border-b border-[var(--line)]"><td className="py-5 sans text-xs">{order.id}</td><td className="text-lg">{order.customer}</td><td className="sans text-xs">{order.item}</td><td className="sans text-xs text-[var(--muted)]">{order.date}</td><td><span className="sans bg-[var(--cream)] px-3 py-2 text-[10px] uppercase tracking-[.1em]">{order.status}</span></td><td className="text-right sans text-xs">{order.total}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  </main>;
}
