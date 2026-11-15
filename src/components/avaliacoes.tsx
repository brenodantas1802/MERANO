"use client";

import { Star } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";

type Avaliacao = { id: string; criada_em: string; nome: string; nota: number; texto: string };

function Estrelas({ nota, tamanho = 15 }: { nota: number; tamanho?: number }) {
  return <span className="inline-flex gap-0.5" aria-label={`${nota.toFixed(1).replace(".", ",")} de 5`}>
    {[1, 2, 3, 4, 5].map((i) => <Star key={i} size={tamanho} strokeWidth={1.4} className={i <= Math.round(nota) ? "fill-[var(--latao)] text-[var(--latao)]" : "text-[var(--latao)]/40"} />)}
  </span>;
}

// Real reviews only: the list shows approved ones, and anyone can send one, which waits for the team's approval.
export function Avaliacoes({ produtoId, nomeProduto }: { produtoId: string; nomeProduto: string }) {
  const [lista, setLista] = useState<Avaliacao[] | null>(null);
  const [aberto, setAberto] = useState(false);
  const [nota, setNota] = useState(0);
  const [nome, setNome] = useState("");
  const [texto, setTexto] = useState("");
  const [pedido, setPedido] = useState("");
  const [estado, setEstado] = useState<"" | "enviando" | "enviada">("");
  const [erro, setErro] = useState("");

  useEffect(() => {
    let vivo = true;
    fetch(`/api/avaliacoes?produto=${encodeURIComponent(produtoId)}`).then((r) => r.json()).then((d) => vivo && setLista(d.avaliacoes ?? [])).catch(() => vivo && setLista([]));
    return () => { vivo = false; };
  }, [produtoId]);

  async function enviar(event: FormEvent) {
    event.preventDefault();
    if (!nota) return setErro("Escolha uma nota.");
    setErro("");
    setEstado("enviando");
    try {
      const response = await fetch("/api/avaliacoes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ produto: produtoId, nome, nota, texto, pedido: pedido || undefined }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não consegui enviar agora.");
      setEstado("enviada");
    } catch (problem) {
      setErro(problem instanceof Error ? problem.message : "Não consegui enviar agora.");
      setEstado("");
    }
  }

  const media = lista && lista.length ? lista.reduce((soma, a) => soma + a.nota, 0) / lista.length : 0;
  const campo = "mt-1.5 block w-full rounded-[14px] border border-[var(--line)] bg-white/70 px-4 text-[15px] outline-none focus:border-[var(--vinho)]/60";

  return <section aria-labelledby="avaliacoes-titulo" className="mt-10 border-t border-[var(--line)] pt-8">
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 id="avaliacoes-titulo" className="secao">Avaliações</h2>
        {lista && lista.length > 0 && <p className="mt-2 flex items-center gap-2 text-[14px]"><Estrelas nota={media} /> {media.toFixed(1).replace(".", ",")} · {lista.length} {lista.length === 1 ? "avaliação" : "avaliações"}</p>}
      </div>
      {!aberto && estado !== "enviada" && <button type="button" onClick={() => setAberto(true)} className="press label inline-flex min-h-11 items-center rounded-full px-5 text-[12px] text-[var(--vinho)] shadow-[inset_0_0_0_1px_rgba(85,30,43,.6)] hover:bg-[var(--vinho)] hover:text-[var(--creme)]">Avaliar esta peça</button>}
    </div>

    {lista === null ? <p className="mt-4 text-[14px] text-[var(--muted)]">Carregando avaliações…</p>
      : lista.length === 0 ? <p className="mt-4 text-[14px] text-[var(--muted)]">Ainda não há avaliações de {nomeProduto}. Se você já tem a sua, conte como ficou.</p>
      : <ul className="mt-5 grid gap-4 md:grid-cols-2">
        {lista.map((a) => <li key={a.id} className="glass-tile rounded-[18px] p-4">
          <div className="flex items-center justify-between gap-3"><span className="text-[14px] font-medium">{a.nome}</span><Estrelas nota={a.nota} tamanho={13} /></div>
          <p className="mt-2 text-[14px] leading-relaxed">{a.texto}</p>
          <p className="mt-2 text-[12px] text-[var(--muted)]">{new Date(a.criada_em).toLocaleDateString("pt-BR")}</p>
        </li>)}
      </ul>}

    {estado === "enviada" && <p role="status" className="mt-5 rounded-[14px] bg-white/70 p-4 text-[14px]">Obrigado! Recebemos sua avaliação. Ela aparece aqui depois que a equipe Meranno conferir.</p>}

    {aberto && estado !== "enviada" && <form onSubmit={enviar} className="glass-tile mt-5 grid gap-4 rounded-[20px] p-5 md:max-w-xl">
      <fieldset>
        <legend className="text-[13px] text-[var(--muted)]">Sua nota</legend>
        <div className="mt-1 flex">{[1, 2, 3, 4, 5].map((i) => <button key={i} type="button" aria-label={`${i} ${i === 1 ? "estrela" : "estrelas"}`} aria-pressed={nota === i} onClick={() => setNota(i)} className="press flex h-11 w-11 items-center justify-center"><Star size={24} strokeWidth={1.4} className={i <= nota ? "fill-[var(--latao)] text-[var(--latao)]" : "text-[var(--latao)]/50"} /></button>)}</div>
      </fieldset>
      <label className="text-[13px] text-[var(--muted)]">Seu nome<input required minLength={2} maxLength={40} value={nome} onChange={(e) => setNome(e.target.value)} className={`${campo} h-12`} /></label>
      <label className="text-[13px] text-[var(--muted)]">Sua avaliação<textarea required minLength={10} maxLength={600} rows={4} value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Caimento, tecido, estampa, entrega…" className={`${campo} py-3`} /></label>
      <label className="text-[13px] text-[var(--muted)]">Número do pedido (opcional)<input maxLength={40} value={pedido} onChange={(e) => setPedido(e.target.value)} placeholder="MR-0000" className={`${campo} h-12`} /></label>
      {erro && <p role="alert" className="text-[13px] text-[#8a3a2c]">{erro}</p>}
      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={estado === "enviando"} className="press label inline-flex min-h-11 items-center rounded-full bg-[var(--vinho)] px-6 text-[12px] text-[var(--creme)] disabled:opacity-60">{estado === "enviando" ? "Enviando…" : "Enviar avaliação"}</button>
        <button type="button" onClick={() => setAberto(false)} className="min-h-11 px-3 text-[13px] text-[var(--muted)] underline underline-offset-4">Cancelar</button>
      </div>
      <p className="text-[12px] text-[var(--muted)]">Publicamos seu nome e o texto. A avaliação aparece depois de conferida pela equipe.</p>
    </form>}
  </section>;
}
