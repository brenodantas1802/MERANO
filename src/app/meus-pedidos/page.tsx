import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { createClient } from "@/lib/supabase/server";
import { createSecretClient } from "@/lib/supabase/publico";
import { STATUS_PEDIDO, type Pedido, type StatusPedido } from "@/lib/pedidos";
import { formatPrice, getProduct } from "@/lib/products";

export const metadata: Metadata = { title: "Meus pedidos | MERANNO", robots: { index: false, follow: false } };

type Resumo = Pick<Pedido, "id" | "numero" | "criado_em" | "status" | "itens" | "total">;
const CAMPOS = "id, numero, criado_em, status, itens, total";

const PAGO: StatusPedido[] = ["pago", "em_separacao", "enviado", "entregue"];
const data = (quando: string) => new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric", timeZone: "America/Sao_Paulo" }).format(new Date(quando));

// The signed-in customer's orders (owners, 2026-11-24): the ones placed while signed in, plus the ones placed with the
// account's e-mail, but only once that e-mail is confirmed, so nobody sees someone else's orders by typing their address.
// Read with the secret key, as the orders table has no policies for customers. Each one opens its page, /pedido/[id].
async function pedidosDe(usuarioId: string, email: string | null) {
  const admin = createSecretClient();
  if (!admin) return [];
  const consulta = (coluna: "usuario_id" | "email", valor: string) => admin.from("pedidos").select(CAMPOS).eq(coluna, valor).order("criado_em", { ascending: false }).limit(50);
  const listas = await Promise.all([consulta("usuario_id", usuarioId), ...(email ? [consulta("email", email)] : [])]);
  const todos = new Map<string, Resumo>();
  for (const { data: lista } of listas) for (const pedido of (lista ?? []) as Resumo[]) todos.set(pedido.id, pedido);
  return [...todos.values()].sort((a, b) => new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime());
}

export default async function MeusPedidosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const email = user?.email && user.email_confirmed_at ? user.email.trim().toLowerCase() : null;
  const pedidos = user ? await pedidosDe(user.id, email) : [];
  const botao = "press label mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-[var(--vinho)] px-7 text-[12px] text-[var(--creme)]";

  return <main><SiteHeader /><div className="mx-auto max-w-3xl px-6 pb-24 pt-12 md:pt-16">
    <h1 className="display text-5xl md:text-7xl">Meus pedidos</h1>

    {!user ? <div className="mt-8 max-w-xl">
      <p className="text-xl leading-snug">Entre na sua conta para ver os seus pedidos.</p>
      <p className="sans mt-3 text-[13px] text-[var(--muted)]">Aparecem os pedidos feitos com a conta e os feitos com o mesmo e-mail dela.</p>
      <Link href="/conta?next=/meus-pedidos" className={botao}>Entrar <ArrowRight size={14} /></Link>
    </div> : pedidos.length === 0 ? <div className="mt-8 max-w-xl">
      <p className="text-xl leading-snug">Você ainda não tem pedidos{email ? <> com <span className="break-all">{email}</span></> : ""}.</p>
      <Link href="/shop" className={botao}>Ver a loja <ArrowRight size={14} /></Link>
    </div> : <ul className="mt-10 space-y-3">
      {pedidos.map((pedido) => {
        const foto = pedido.itens.map((item) => item.productId ? getProduct(item.productId)?.image : undefined).find(Boolean);
        const selo = PAGO.includes(pedido.status) ? "bg-[var(--vinho)] text-[var(--creme)]" : pedido.status === "cancelado" ? "bg-[var(--line)] text-[var(--muted)]" : "border border-[var(--vinho)]/60 text-[var(--vinho)]";
        return <li key={pedido.id}>
          <Link href={`/pedido/${pedido.id}`} className="group flex items-center gap-4 rounded-2xl bg-[var(--superficie)] p-4 shadow-[0px_2px_16px_-6px_rgba(32,28,23,0.18)] transition-transform hover:-translate-y-0.5 md:gap-5 md:p-5">
            <div className="relative h-[4.5rem] w-14 shrink-0 overflow-hidden rounded-xl bg-[var(--cream)]/50">
              {foto && <Image src={foto} alt="" fill sizes="56px" className="object-cover" />}
            </div>
            <div className="min-w-0 flex-1">
              <span className={`sans inline-block rounded-full px-2.5 py-0.5 text-[10px] uppercase tracking-[.12em] ${selo}`}>{STATUS_PEDIDO[pedido.status]}</span>
              <p className="mt-1.5 truncate text-lg leading-tight">{pedido.itens.map((item) => `${item.quantidade}× ${item.nome} ${item.tamanho}`).join(", ")}</p>
              <p className="sans mt-1 text-[12px] text-[var(--muted)]">{pedido.numero} · {data(pedido.criado_em)} · <span className="tabular-nums text-[var(--ink)]">{formatPrice(Number(pedido.total))}</span></p>
            </div>
            <span aria-hidden className="text-xl transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </li>;
      })}
    </ul>}
  </div></main>;
}
