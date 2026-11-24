"use client";

import { useState } from "react";
import { BotaoAdmin, type Admins } from "./lista-pre-venda";

// Every account on the site (Supabase Auth), last access first. Read with the secret key in page.tsx.
export type Conta = { id: string; email: string | null; nome: string | null; google: boolean; senha: boolean; criado_em: string; ultimo_acesso: string | null; semana: boolean };

const MOSTRAR = 40;
const SP = "America/Sao_Paulo";
const dia = (iso: string) => new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit", timeZone: SP });
const diaHora = (iso: string) => new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", timeZone: SP });

function Linha({ conta, admins }: { conta: Conta; admins: Admins }) {
  const entra = [conta.google && "Google", conta.senha && "e-mail e senha"].filter(Boolean).join(" ou ") || "outro jeito";
  const email = conta.email?.toLowerCase() ?? "";
  const ehAdmin = admins.fixos.includes(email) || admins.painel.includes(email);
  return <li className="flex flex-wrap items-center justify-between gap-3 py-3">
    <div className="min-w-0">
      <p className="truncate text-[16px]">{conta.nome || conta.email || "Sem e-mail"}</p>
      <p className="sans text-xs leading-relaxed text-[var(--muted)] [overflow-wrap:anywhere]">{conta.nome && conta.email ? `${conta.email} · ` : ""}entra com {entra} · conta de {dia(conta.criado_em)} · {conta.ultimo_acesso ? `último acesso ${diaHora(conta.ultimo_acesso)}` : "nunca entrou"}</p>
      {ehAdmin && !conta.google && <p className="sans mt-0.5 text-xs text-[var(--vinho)]">Para abrir o painel, essa pessoa precisa entrar com o Google.</p>}
    </div>
    {conta.email && <BotaoAdmin email={conta.email} admins={admins} />}
  </li>;
}

export function ContasAdmin({ contas, admins }: { contas: Conta[] | null; admins: Admins }) {
  const [busca, setBusca] = useState("");
  const [todas, setTodas] = useState(false);
  const termo = busca.trim().toLowerCase();
  const achadas = (contas ?? []).filter((conta) => !termo || `${conta.nome ?? ""} ${conta.email ?? ""}`.toLowerCase().includes(termo));
  const visiveis = todas || termo ? achadas : achadas.slice(0, MOSTRAR);
  const semana = (contas ?? []).filter((conta) => conta.semana).length;
  return <section className="mb-24">
    <p className="sans mb-4 text-[11px] uppercase tracking-[.2em] text-[var(--muted)]">Contas e administradores</p>
    <h2 className="display text-6xl">Quem já entrou.</h2>
    <p className="sans mt-4 max-w-2xl text-sm text-[var(--muted)]">Todas as contas criadas no site, de quem entrou por último para o primeiro. “Tornar admin” libera o Painel da equipe para a pessoa; “Admin ✓” tira. Os donos fixos só mudam na Vercel (<code>OWNER_EMAILS</code>).</p>
    {contas === null ? <p className="sans mt-8 max-w-2xl text-sm text-[var(--muted)]">Para ver as contas, cadastre <code>SUPABASE_SECRET_KEY</code> na Vercel.</p> : <>
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <p className="sans text-xs uppercase tracking-[.14em] text-[var(--muted)]">{contas.length} {contas.length === 1 ? "conta" : "contas"} · {semana} {semana === 1 ? "entrou" : "entraram"} nos últimos 7 dias · {admins.fixos.length + admins.painel.length} com acesso ao painel</p>
        <input type="search" value={busca} onChange={(evento) => setBusca(evento.target.value)} placeholder="Buscar nome ou e-mail" aria-label="Buscar conta por nome ou e-mail" className="sans h-11 w-full rounded-full border border-[var(--line)] bg-[var(--campo)] px-4 text-[14px] outline-none focus:border-[var(--vinho)]/60 sm:w-72" />
      </div>
      {visiveis.length ? <ul className="mt-2 divide-y divide-[var(--line)] border-y border-[var(--line)]">{visiveis.map((conta) => <Linha key={conta.id} conta={conta} admins={admins} />)}</ul>
        : <p className="sans mt-4 text-sm text-[var(--muted)]">{termo ? "Ninguém com esse nome ou e-mail." : "Ninguém criou conta ainda."}</p>}
      {!todas && !termo && achadas.length > MOSTRAR && <button type="button" onClick={() => setTodas(true)} className="press sans mt-4 h-11 rounded-full border border-[var(--line)] px-5 text-[12px] uppercase tracking-[.12em] hover:bg-[var(--realce)]">Ver todas as {achadas.length}</button>}
    </>}
  </section>;
}
