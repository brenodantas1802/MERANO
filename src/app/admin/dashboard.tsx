"use client";

import Link from "next/link";
import { SignOutButton } from "@/components/auth-buttons";
import { ListaPreVenda, type Autorizado } from "./lista-pre-venda";
import { PedidosAdmin } from "./pedidos-admin";
import { CuponsAdmin, type CupomAdmin } from "./cupons-admin";
import type { Pedido } from "@/lib/pedidos";

export type CriacaoAdmin = {
  id: string;
  criada_em: string;
  status: string;
  tamanho: string;
  painel: { modelagem?: string; paleta?: string[]; fonte?: string; fabric?: string; fabricName?: string; fitName?: string; marca?: boolean; posicao?: string; colecao?: string };
  ficha: { ideia?: string; texto?: string; assinatura?: string; producao?: { id?: string; arteCm?: { largura: number; altura: number }; artePx?: { largura: number; altura: number }; arteOriginal?: boolean; marcaCm?: number | null; layout?: { offsetXCM?: number; offsetYCM?: number } | null } };
  arte_path: string;
  arte_url: string | null;
  arquivos_url: Record<string, string | null>;
  pedido: string | null;
  cliente: { nome?: string; email?: string; celular?: string; cidade?: string } | null;
};

const STATUS: Record<string, string> = { no_carrinho: "No carrinho", pedida: "Pedida", em_producao: "Em produção", entregue: "Entregue", cancelada: "Cancelada" };
const POSICAO: Record<string, string> = { back: "costas", front: "frente", both: "frente e costas" };
const cm = (valor?: number) => (valor ?? 0).toLocaleString("pt-BR", { maximumFractionDigits: 1 });

// Prints made in the Personalizador. `null` means the secret key isn't configured, so the list can't be read here.
// "No carrinho" ones were added to a cart but not ordered (yet); "Pedida" ones are in an order.
function Criacoes({ criacoes }: { criacoes: CriacaoAdmin[] | null }) {
  return <section className="mt-24">
    <div className="flex items-end justify-between"><div><p className="sans mb-4 text-[11px] uppercase tracking-[.2em] text-[var(--muted)]">Personalizador</p><h2 className="display text-6xl">Estampas criadas.</h2></div></div>
    <p className="sans mt-4 max-w-2xl text-sm text-[var(--muted)]">Os arquivos para a confecção: arte em PNG a 300 DPI no tamanho da ficha, marca do peito e mockups só de referência. Envie os PNGs como documento no WhatsApp, nunca como foto.</p>
    {criacoes === null ? <p className="sans mt-8 max-w-2xl text-sm text-[var(--muted)]">Para ver as estampas aqui, cadastre a variável <code>SUPABASE_SECRET_KEY</code> (chave secreta do Supabase) na Vercel. Enquanto isso, elas ficam no Supabase: tabela <code>criacoes_estampa</code> e pasta <code>estampas</code> no Storage.</p>
      : criacoes.length === 0 ? <p className="sans mt-8 text-sm text-[var(--muted)]">Nenhuma estampa salva ainda.</p>
      : <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {criacoes.map((c) => {
          const producao = c.ficha.producao;
          const capa = c.painel.posicao === "front" ? c.arquivos_url.mockupFrente : c.arquivos_url.mockupCostas;
          const foto = capa ?? c.arte_url ?? "";
          const links = ([["Arte 300 DPI", c.arte_url], ["Marca do peito", c.arquivos_url.marca], ["Mockup frente", c.arquivos_url.mockupFrente], ["Mockup costas", c.arquivos_url.mockupCostas]] as [string, string | null | undefined][]).filter((link): link is [string, string] => !!link[1]);
          return <article key={c.id} className="border border-[var(--line)]">
            <div className="aspect-[3/4] bg-[#f5f1e9]" style={capa ? undefined : { background: c.painel.paleta?.[0] ?? "#eee" }}>
              {/* eslint-disable-next-line @next/next/no-img-element -- signed Supabase link */}
              {foto && <a href={foto} target="_blank" rel="noreferrer"><img src={foto} alt={c.ficha.ideia ?? "Estampa"} className="h-full w-full object-contain" /></a>}
            </div>
            <div className="sans space-y-1 p-4 text-xs">
              <p className="flex justify-between gap-2"><span className="uppercase tracking-[.1em]">{STATUS[c.status] ?? c.status}{c.pedido ? ` · ${c.pedido}` : ""}</span><span><b>{c.tamanho}</b> · {c.painel.fitName ?? c.painel.modelagem}</span></p>
              <p className="text-[var(--muted)]">{new Date(c.criada_em).toLocaleString("pt-BR")}</p>
              {c.painel.fabricName && <p>Malha {c.painel.fabricName.toLowerCase()} · estampa {POSICAO[c.painel.posicao ?? "back"]}{c.painel.marca === false ? " · sem marca no peito" : ""}</p>}
              {producao?.arteCm && <p>Arte {cm(producao.arteCm.largura)} × {cm(producao.arteCm.altura)} cm{producao.marcaCm ? ` · marca ${cm(producao.marcaCm)} cm` : ""}{producao.layout?.offsetYCM != null ? ` · ${cm(producao.layout.offsetYCM)} cm do topo da área` : ""}</p>}
              {producao?.arteOriginal && <p className="text-[var(--vinho)]">Arte na resolução original (grande demais a 300 DPI): ampliar na confecção para o tamanho acima.</p>}
              {producao?.id && <p className="text-[var(--muted)]">Ficha {producao.id}</p>}
              {c.ficha.ideia && <p className="text-sm">{c.ficha.ideia}</p>}
              {c.ficha.texto && <p>Texto: “{c.ficha.texto}”</p>}
              {c.ficha.assinatura && <p>Cartão “Criado por você”: {c.ficha.assinatura}</p>}
              {!c.painel.fabricName && c.painel.fonte && <p>Frente: fonte {c.painel.fonte}</p>}
              {c.cliente && <p className="text-[var(--muted)]">{[c.cliente.nome, c.cliente.email, c.cliente.celular, c.cliente.cidade].filter(Boolean).join(" · ")}</p>}
              <p className="flex flex-wrap gap-x-3 gap-y-1 pt-2">{links.map(([nome, url]) => <a key={nome} href={url} target="_blank" rel="noreferrer" download className="underline underline-offset-4">{nome}</a>)}</p>
            </div>
          </article>;
        })}
      </div>}
  </section>;
}

export type CadastroCupom = { id: string; criado_em: string; email: string; cupom_enviado: boolean };

// E-mails left on the first-purchase popup. "Viu o cupom" when the popup showed a code to that person.
function Cupons({ cupons }: { cupons: CadastroCupom[] | null }) {
  return <section className="mt-24">
    <p className="sans mb-4 text-[11px] uppercase tracking-[.2em] text-[var(--muted)]">Pop-up de primeira compra</p>
    <h2 className="display text-6xl">E-mails cadastrados.</h2>
    {cupons === null ? <p className="sans mt-8 max-w-2xl text-sm text-[var(--muted)]">Para ver a lista aqui, cadastre <code>SUPABASE_SECRET_KEY</code> na Vercel. Enquanto isso, ela fica no Supabase, tabela <code>cadastros_cupom</code>.</p>
      : cupons.length === 0 ? <p className="sans mt-8 text-sm text-[var(--muted)]">Nenhum e-mail ainda.</p>
      : <ul className="sans mt-8 divide-y divide-[var(--line)] border-y border-[var(--line)] text-sm">
        {cupons.map((c) => <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 py-3"><span>{c.email}</span><span className="text-xs text-[var(--muted)]">{new Date(c.criado_em).toLocaleDateString("pt-BR")} · {c.cupom_enviado ? "viu o cupom" : "sem cupom"}</span></li>)}
      </ul>}
  </section>;
}

export function AdminDashboard({ email, pedidos, descontos, criacoes, cupons, lista, origem, cadeadoLigado }: { email: string; pedidos: Pedido[] | null; descontos: CupomAdmin[] | null; criacoes: CriacaoAdmin[] | null; cupons: CadastroCupom[] | null; lista: Autorizado[] | null; origem: string; cadeadoLigado: boolean }) {
  return <main>
    <header className="sans flex items-center justify-between gap-4 border-b border-[var(--line)] px-6 py-5 md:px-12">
      <Link href="/" className="font-bold tracking-[.28em]">MERANNO / equipe</Link>
      <div className="flex items-center gap-4 text-[13px] text-[var(--muted)]">
        <span className="hidden truncate sm:inline">{email}</span>
        <SignOutButton className="rounded-full border border-[var(--ink)]/20 px-4 py-2 text-[var(--ink)] transition-colors hover:bg-[var(--creme)]" />
      </div>
    </header>
    <div className="mx-auto max-w-360 px-6 py-14 md:px-12">
      <ListaPreVenda lista={lista} origem={origem} cadeadoLigado={cadeadoLigado} />
      <PedidosAdmin pedidos={pedidos} />
      <CuponsAdmin cupons={descontos} />
      <Criacoes criacoes={criacoes} />
      <Cupons cupons={cupons} />
    </div>
  </main>;
}
