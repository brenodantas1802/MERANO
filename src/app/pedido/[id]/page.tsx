import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { createSecretClient } from "@/lib/supabase/publico";
import { lerPagamento, pagamentoOnline } from "@/lib/mercado-pago";
import { linkWhatsApp, mensagemWhatsApp, registrarPagamento, type Pedido, type StatusPedido } from "@/lib/pedidos";
import { formatPrice } from "@/lib/products";
import { PagarAgora } from "./pagar-agora";

export const metadata: Metadata = { title: "Seu pedido | MERANNO", robots: { index: false, follow: false } };

// An order's own page: where Mercado Pago sends the customer back, and the link to follow the order later.
// The address is the order's random id, so only whoever got the link sees it.
const ETAPAS: StatusPedido[] = ["aguardando_pagamento", "pago", "em_separacao", "enviado", "entregue"];
const ROTULO: Partial<Record<StatusPedido, string>> = { aguardando_pagamento: "Pedido feito", pago: "Pago", em_separacao: "Separação", enviado: "Enviado", entregue: "Entregue" };

const TITULO: Record<StatusPedido, [string, string]> = {
  aguardando_pagamento: ["Pedido registrado.", "Falta o pagamento."],
  pago: ["Pagamento confirmado.", "Obrigado."],
  em_separacao: ["Seu pedido", "está sendo separado."],
  enviado: ["Seu pedido", "está a caminho."],
  entregue: ["Pedido entregue.", "Aproveite."],
  cancelado: ["Pedido cancelado.", ""],
};

// Mercado Pago links last two days (see criarPreferencia).
const passouDeDoisDias = (criadoEm: string) => Date.now() - new Date(criadoEm).getTime() > 2 * 86400_000;

export default async function PedidoPage({ params, searchParams }: PageProps<"/pedido/[id]">) {
  const { id } = await params;
  const busca = await searchParams;
  const admin = createSecretClient();
  if (!admin || !/^[0-9a-f-]{36}$/.test(id)) notFound();

  const ler = async () => (await admin.from("pedidos").select("*").eq("id", id).maybeSingle()).data as Pedido | null;
  let pedido = await ler();
  if (!pedido) notFound();

  // Back from Mercado Pago with a payment id: confirm it right away instead of waiting for the notification.
  const paymentId = String(busca.payment_id ?? busca.collection_id ?? "");
  if (pedido.status === "aguardando_pagamento" && paymentId && pagamentoOnline()) {
    const pagamento = await lerPagamento(paymentId).catch(() => null);
    if (pagamento?.pedidoId === pedido.id) {
      await registrarPagamento(admin, pagamento);
      pedido = (await ler()) ?? pedido;
    }
  }

  const status = pedido.status;
  const [linha1, linha2] = TITULO[status];
  const etapa = ETAPAS.indexOf(status);
  const forma = pedido.metodo === "cartao" ? "cartao" : pedido.metodo === "pix" ? "pix" : pedido.pagamento?.metodo === "cartao" ? "cartao" : "pix";
  const whatsapp = linkWhatsApp(status === "aguardando_pagamento" && pedido.metodo === "whatsapp"
    ? mensagemWhatsApp(pedido, forma)
    : `Olá, Meranno! Tenho uma dúvida sobre o pedido ${pedido.numero}.`);
  const recusado = status === "aguardando_pagamento" && ["rejected", "cancelled"].includes(pedido.pagamento?.status ?? "");
  const emAnalise = status === "aguardando_pagamento" && ["in_process", "pending", "authorized"].includes(pedido.pagamento?.status ?? "");
  const expirado = passouDeDoisDias(pedido.criado_em);
  const primeiroNome = pedido.cliente?.nome?.split(" ")[0] ?? "";

  return <main><SiteHeader /><div className="mx-auto max-w-5xl px-6 pb-24 pt-10 md:px-12">
    <Link href="/shop" className="sans mb-10 flex min-h-11 w-fit items-center gap-2 text-[11px] uppercase tracking-[.15em] text-[var(--muted)]"><ArrowLeft size={14} /> Voltar à loja</Link>
    <p className="sans mb-5 text-[11px] uppercase tracking-[.2em] text-[var(--muted)]">Pedido {pedido.numero} · {formatPrice(Number(pedido.total))}</p>
    <h1 className="display text-5xl md:text-7xl">{linha1}{linha2 && <><br /><i>{linha2}</i></>}</h1>

    {status !== "cancelado" && <ol className="mt-10 grid grid-cols-5 gap-2" aria-label="Andamento do pedido">
      {ETAPAS.map((nome, indice) => <li key={nome} className="min-w-0">
        <span className={`block h-1 rounded-full ${indice <= etapa ? "bg-[var(--vinho)]" : "bg-[var(--line)]"}`} />
        <span className={`sans mt-2 block text-[10px] uppercase leading-tight tracking-[.1em] md:text-[11px] ${indice === etapa ? "text-[var(--ink)]" : "text-[var(--muted)]"}`}>{ROTULO[nome]}</span>
      </li>)}
    </ol>}

    <div className="mt-10 max-w-2xl text-xl leading-snug md:text-2xl">
      {status === "aguardando_pagamento" && pedido.metodo === "whatsapp" && <p>Envie o pedido pelo WhatsApp e a equipe Meranno manda {forma === "pix" ? "o Pix" : "o link do cartão"} para você pagar.</p>}
      {status === "aguardando_pagamento" && pedido.metodo !== "whatsapp" && (recusado
        ? <p>O pagamento não foi aprovado. Você pode tentar de novo, com outro cartão ou com Pix.</p>
        : emAnalise ? <p>O pagamento está em análise no Mercado Pago. Assim que for aprovado, esta página muda sozinha quando você voltar a ela.</p>
          : <p>{primeiroNome ? `${primeiroNome}, falta` : "Falta"} só o pagamento para garantir as suas peças.</p>)}
      {status === "pago" && <p>Recebemos o pagamento{primeiroNome ? `, ${primeiroNome}` : ""}. Como é pré-venda, avisamos pelo WhatsApp quando o pedido for despachado.</p>}
      {status === "em_separacao" && <p>As peças estão sendo separadas e embaladas. O código de rastreio aparece aqui quando o pedido sair.</p>}
      {status === "enviado" && <p>O pedido saiu{pedido.frete?.nome ? ` por ${pedido.frete.nome}` : ""}.{pedido.rastreio ? "" : " O código de rastreio aparece aqui em breve."}</p>}
      {status === "entregue" && <p>Esperamos que goste. Qualquer coisa, é só chamar no WhatsApp.</p>}
      {status === "cancelado" && <p>Este pedido foi cancelado. Se foi engano, fale com a gente pelo WhatsApp.</p>}
    </div>

    {pedido.rastreio && <p className="mt-6 rounded-[18px] border border-[var(--line)] bg-white/50 px-5 py-4"><span className="sans block text-[11px] uppercase tracking-[.14em] text-[var(--muted)]">Código de rastreio</span><b className="mt-1 block select-all text-lg tracking-[.06em]">{pedido.rastreio}</b></p>}

    <div className="mt-10 flex flex-wrap gap-3">
      {status === "aguardando_pagamento" && pedido.metodo !== "whatsapp" && pagamentoOnline() && !expirado && !emAnalise && <PagarAgora id={pedido.id} />}
      <a href={whatsapp} target="_blank" rel="noopener noreferrer" className={`press label inline-flex min-h-12 items-center gap-2 rounded-full px-7 text-[12px] ${status === "aguardando_pagamento" && pedido.metodo === "whatsapp" ? "bg-[#1f9e55] text-white" : "border border-[var(--line)] text-[var(--ink)]"}`}>
        {status === "aguardando_pagamento" && pedido.metodo === "whatsapp" ? "Enviar pelo WhatsApp" : "Falar no WhatsApp"} <ArrowRight size={14} />
      </a>
    </div>

    <section className="glass mt-14 rounded-[28px] p-6 md:p-8">
      <h2 className="display text-3xl">Resumo</h2>
      <ul className="mt-6 divide-y divide-[var(--line)]">
        {pedido.itens.map((item, indice) => <li key={indice} className="flex items-baseline justify-between gap-4 py-3">
          <span>{item.quantidade}× {item.nome}<span className="sans ml-2 text-[12px] text-[var(--muted)]">{item.tamanho}{item.cor ? ` · ${item.cor}` : ""}</span></span>
          <span className="sans shrink-0 text-sm tabular-nums">{formatPrice(item.preco * item.quantidade)}</span>
        </li>)}
      </ul>
      <dl className="sans mt-4 space-y-2 border-t border-[var(--line)] pt-4 text-sm">
        <div className="flex justify-between"><dt className="text-[var(--muted)]">Subtotal</dt><dd className="tabular-nums">{formatPrice(Number(pedido.subtotal))}</dd></div>
        {Number(pedido.desconto_cupom) > 0 && <div className="flex justify-between"><dt className="text-[var(--muted)]">Cupom {pedido.cupom}</dt><dd className="tabular-nums">−{formatPrice(Number(pedido.desconto_cupom))}</dd></div>}
        {Number(pedido.desconto_pix) > 0 && <div className="flex justify-between"><dt className="text-[var(--muted)]">Desconto Pix</dt><dd className="tabular-nums">−{formatPrice(Number(pedido.desconto_pix))}</dd></div>}
        <div className="flex justify-between"><dt className="text-[var(--muted)]">Frete{pedido.frete?.nome ? ` · ${pedido.frete.nome}` : ""}</dt><dd className="tabular-nums">{formatPrice(Number(pedido.frete?.preco ?? 0))}</dd></div>
        <div className="flex justify-between border-t border-[var(--line)] pt-3 text-base text-[var(--ink)]"><dt>Total</dt><dd className="tabular-nums">{formatPrice(Number(pedido.total))}</dd></div>
      </dl>
      {pedido.endereco && <p className="sans mt-6 flex items-start gap-2 text-[13px] text-[var(--muted)]"><Check size={14} className="mt-0.5 shrink-0" />Entrega em {pedido.endereco.cidade}/{pedido.endereco.uf}, CEP {pedido.endereco.cep}</p>}
    </section>

    <p className="sans mt-8 text-[12px] text-[var(--muted)]">Guarde o link desta página para acompanhar o pedido.</p>
  </div></main>;
}
