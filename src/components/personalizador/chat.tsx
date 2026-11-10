"use client";

import { ArrowUp, RotateCcw, Sparkles } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";

export type Mensagem = { papel: "cliente" | "assistente"; texto: string };

export const SAUDACAO = "Qual ideia você quer levar para a sua peça? Escolha modelagem, cores e a escrita da frente ao lado, envie referências se tiver, e me conte o que imagina para as costas.";
export const SUGESTOES_INICIAIS = ["Algo com naipes e um número da sorte", "Use minhas referências como base", "Uma ficha de cassino com meu nome"];

type Props = {
  mensagens: Mensagem[];
  sugestoes: string[];
  carregando: boolean;
  erro: string;
  pronto: boolean;
  referenciasPendentes: number;
  onEnviar: (texto: string) => void;
  onRecomecar: () => void;
  onRevisar: () => void;
  // Phones only: the tee sits above the chat, so a new sketch gets a shortcut back up to it.
  onVerPeca?: () => void;
};

export function ChatCriacao({ mensagens, sugestoes, carregando, erro, pronto, referenciasPendentes, onEnviar, onRecomecar, onRevisar, onVerPeca }: Props) {
  const [texto, setTexto] = useState("");
  const lista = useRef<HTMLDivElement>(null);

  // Scrolls only the message list (scrollIntoView would also move the whole page on phones).
  useEffect(() => { lista.current?.scrollTo({ top: lista.current.scrollHeight, behavior: "smooth" }); }, [mensagens.length, carregando]);

  function enviar(event?: FormEvent, conteudo = texto) {
    event?.preventDefault();
    const limpo = conteudo.trim();
    if (!limpo || carregando) return;
    onEnviar(limpo);
    setTexto("");
  }

  return <div className="flex h-full min-h-0 flex-col text-[var(--pz-tinta)]">
    <div className="flex items-start justify-between gap-3 border-b border-[var(--pz-linha)] px-6 pb-5 pt-6">
      <div>
        <h2 className="pz-serif text-[30px] leading-none">Criação</h2>
        <p className="mt-2 text-[13px] leading-snug text-[var(--pz-suave)]">Conte a sua ideia · a IA monta a estampa das costas</p>
      </div>
      <button type="button" onClick={onRecomecar} aria-label="Recomeçar conversa" title="Recomeçar conversa" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--pz-linha)] text-[var(--pz-tinta)] hover:border-[var(--pz-borda)]"><RotateCcw size={14} strokeWidth={1.8} /></button>
    </div>

    <div ref={lista} className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-6" aria-live="polite">
      <p className="pz-serif flex gap-2.5 text-[19px] leading-[1.45]"><span className="mt-[3px] text-[13px] text-[var(--pz-vinho)]">♦</span><span>{SAUDACAO}</span></p>
      {mensagens.map((m, i) => m.papel === "cliente"
        ? <p key={i} className="ml-10 whitespace-pre-line rounded-[18px] rounded-br-[6px] bg-[var(--pz-vinho)] px-4 py-2.5 text-[14px] leading-relaxed text-[var(--pz-creme)]">{m.texto}</p>
        : <p key={i} className="pz-serif flex gap-2.5 whitespace-pre-line text-[19px] leading-[1.45]"><span className="mt-[3px] text-[13px] text-[var(--pz-vinho)]">♦</span><span>{m.texto}</span></p>)}
      {carregando && <p className="flex items-center gap-2 text-sm text-[var(--pz-suave)]"><span className="inline-flex gap-1"><span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--pz-vinho)]" /><span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--pz-vinho)] [animation-delay:.15s]" /><span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--pz-vinho)] [animation-delay:.3s]" /></span> pensando na sua estampa…</p>}
      {erro && <p className="rounded-md border border-[var(--pz-vinho)]/30 bg-white px-3 py-2 text-sm text-[var(--pz-vinho)]">{erro}</p>}
      {onVerPeca && !carregando && mensagens.length > 0 && <button type="button" onClick={onVerPeca} className="text-sm text-[var(--pz-vinho)] underline underline-offset-4">Ver como está ficando na camiseta ↑</button>}
    </div>

    <div className="space-y-3 px-6 pb-6 pt-3">
      {pronto && <button type="button" onClick={onRevisar} className="flex w-full items-center justify-center gap-2 rounded-full bg-[var(--pz-vinho)] px-4 py-3 text-[14px] font-semibold text-[var(--pz-creme)] transition-opacity hover:opacity-90"><Sparkles size={16} strokeWidth={1.8} /> Revisar e criar a estampa</button>}
      {!carregando && sugestoes.length > 0 && <div className="flex flex-col items-start gap-2">
        {sugestoes.map((s) => <button key={s} type="button" onClick={() => enviar(undefined, s)} className="min-h-11 rounded-full border border-[var(--pz-borda)] px-[14px] py-2 text-left text-[13.5px] font-medium text-[var(--pz-tinta)] transition-colors hover:bg-[var(--pz-cartao)]">{s}</button>)}
      </div>}
      {referenciasPendentes > 0 && <p className="text-xs text-[var(--pz-suave)]">{referenciasPendentes} referência(s) seguem com a próxima mensagem.</p>}
      <form onSubmit={enviar} className="flex items-center gap-2 rounded-[20px] border border-[var(--pz-borda)] bg-[var(--pz-campo)] py-1.5 pl-4 pr-1.5 focus-within:border-[var(--pz-vinho)]/60">
        <input value={texto} onChange={(e) => setTexto(e.target.value)} maxLength={1200} placeholder="Conte a ideia da sua estampa…" aria-label="Mensagem" className="h-11 min-w-0 flex-1 bg-transparent text-[15px] text-[var(--pz-tinta)] outline-none placeholder:text-[var(--pz-apagado)]" />
        <button type="submit" disabled={carregando || !texto.trim()} aria-label="Enviar" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--pz-vinho)] text-white transition-opacity disabled:cursor-default"><ArrowUp size={17} strokeWidth={2} /></button>
      </form>
    </div>
  </div>;
}
