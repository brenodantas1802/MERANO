"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { SignOutButton } from "@/components/auth-buttons";
import type { ConfigFinanceira, Despesa, ResumoFinanceiro } from "@/lib/financeiro";
import { FinanceiroAdmin } from "./financeiro-admin";
import { ListaPreVenda, type Admins, type Autorizado, type PedidoAcesso } from "./lista-pre-venda";
import { PedidosAdmin } from "./pedidos-admin";
import { CuponsAdmin, type CupomAdmin } from "./cupons-admin";
import { ContasAdmin, type Conta } from "./contas-admin";
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
  return <section id="estampas" className="mt-24 scroll-mt-28">
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
            <div className="aspect-[3/4] bg-[var(--cartao)]" style={capa ? undefined : { background: c.painel.paleta?.[0] ?? "#eee" }}>
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
  return <section id="emails" className="mt-24 scroll-mt-28">
    <p className="sans mb-4 text-[11px] uppercase tracking-[.2em] text-[var(--muted)]">Pop-up de primeira compra</p>
    <h2 className="display text-6xl">E-mails cadastrados.</h2>
    {cupons === null ? <p className="sans mt-8 max-w-2xl text-sm text-[var(--muted)]">Para ver a lista aqui, cadastre <code>SUPABASE_SECRET_KEY</code> na Vercel. Enquanto isso, ela fica no Supabase, tabela <code>cadastros_cupom</code>.</p>
      : cupons.length === 0 ? <p className="sans mt-8 text-sm text-[var(--muted)]">Nenhum e-mail ainda.</p>
      : <ul className="sans mt-8 divide-y divide-[var(--line)] border-y border-[var(--line)] text-sm">
        {cupons.map((c) => <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 py-3"><span>{c.email}</span><span className="text-xs text-[var(--muted)]">{new Date(c.criado_em).toLocaleDateString("pt-BR")} · {c.cupom_enviado ? "viu o cupom" : "sem cupom"}</span></li>)}
      </ul>}
  </section>;
}

// Light or dark: follows the device until an owner picks one with the button; the pick stays in this browser.
const TEMA_KEY = "meranno-admin-tema";
type Tema = "claro" | "escuro" | "";
const ouvintesTema = new Set<() => void>();
function lerTema(): Tema {
  try {
    const salvo = window.localStorage.getItem(TEMA_KEY);
    return salvo === "claro" || salvo === "escuro" ? salvo : "";
  } catch {
    return "";
  }
}
function useTema() {
  const tema = useSyncExternalStore((avisar) => { ouvintesTema.add(avisar); return () => { ouvintesTema.delete(avisar); }; }, lerTema, (): Tema => "");
  const trocar = () => {
    const escuroAgora = tema ? tema === "escuro" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    try { window.localStorage.setItem(TEMA_KEY, escuroAgora ? "claro" : "escuro"); } catch { /* the pick just won't be remembered */ }
    ouvintesTema.forEach((avisar) => avisar());
  };
  return { tema, trocar };
}

const SECOES = [["financeiro", "Financeiro"], ["pedidos", "Pedidos"], ["pre-venda", "Pré-venda"], ["contas", "Quem entrou"], ["cupons", "Cupons"], ["estampas", "Estampas"], ["emails", "E-mails"]] as const;

export type Financeiro = { resumo: ResumoFinanceiro; config: ConfigFinanceira; despesas: Despesa[]; disponivel: boolean };

export function AdminDashboard({ email, pedidos, descontos, criacoes, cupons, lista, pedidosAcesso, origem, cadeadoLigado, financeiro, contas, admins }: { email: string; pedidos: Pedido[] | null; descontos: CupomAdmin[] | null; criacoes: CriacaoAdmin[] | null; cupons: CadastroCupom[] | null; lista: Autorizado[] | null; pedidosAcesso: PedidoAcesso[]; origem: string; cadeadoLigado: boolean; financeiro: Financeiro; contas: Conta[] | null; admins: Admins }) {
  const { tema, trocar } = useTema();
  return <div className="painel min-h-screen" data-tema={tema || undefined}>
    <header className="sans sticky top-0 z-40 border-b border-[var(--line)] bg-[var(--paper)]/95 backdrop-blur">
      <div className="flex items-center justify-between gap-4 px-6 py-4 md:px-12">
        <Link href="/" className="font-bold tracking-[.28em]">MERANNO / equipe</Link>
        <div className="flex items-center gap-2 text-[13px] text-[var(--muted)] sm:gap-4">
          <span className="hidden truncate md:inline">{email}</span>
          <button type="button" onClick={trocar} aria-label="Trocar entre modo claro e modo noturno" title="Modo claro / noturno" className="press flex h-10 w-10 items-center justify-center rounded-full border border-[var(--line)] text-[var(--ink)] hover:bg-[var(--realce)]">
            <Moon size={16} className="tema-lua" /><Sun size={16} className="tema-sol" />
          </button>
          <SignOutButton className="rounded-full border border-[var(--line)] px-4 py-2 text-[var(--ink)] transition-colors hover:bg-[var(--realce)]" />
        </div>
      </div>
      <nav aria-label="Seções do painel" className="shelf gap-1 px-4 pb-3 md:px-10">
        {SECOES.map(([id, nome]) => <a key={id} href={`#${id}`} className="shrink-0 whitespace-nowrap rounded-full px-3.5 py-2 text-[12px] uppercase tracking-[.12em] text-[var(--muted)] hover:bg-[var(--realce)] hover:text-[var(--ink)]">{nome}</a>)}
      </nav>
    </header>
    <main className="mx-auto max-w-360 px-6 py-14 md:px-12">
      <FinanceiroAdmin {...financeiro} />
      <div id="pedidos" className="scroll-mt-28"><PedidosAdmin pedidos={pedidos} /></div>
      <div id="pre-venda" className="scroll-mt-28"><ListaPreVenda lista={lista} pedidos={pedidosAcesso} origem={origem} cadeadoLigado={cadeadoLigado} admins={admins} /></div>
      <div id="contas" className="scroll-mt-28"><ContasAdmin contas={contas} admins={admins} /></div>
      <div id="cupons" className="scroll-mt-28"><CuponsAdmin cupons={descontos} /></div>
      <Criacoes criacoes={criacoes} />
      <Cupons cupons={cupons} />
    </main>
  </div>;
}
