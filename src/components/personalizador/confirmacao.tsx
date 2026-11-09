"use client";

import { ChevronDown, Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";
import { MODELAGENS, escritaDe, fonteDe, nomeDaCor, planEstampa, type Ficha, type Painel, estampaCasaDe } from "@/lib/estampa";

const lista = (texto: string) => texto.split(/[,;\n]/).map((item) => item.trim()).filter(Boolean);

type Props = {
  ficha: Ficha;
  painel: Painel;
  referencias: number;
  restantes: number;
  gerando: boolean;
  onFechar: () => void;
  onConfirmar: (ficha: Ficha) => void;
};

// The customer reads (and can fix) every field before the one paid call; the prompt shown is the exact one sent.
// Mounted only while open, so each opening starts from the latest ficha.
export function Confirmacao({ ficha, painel, referencias, restantes, gerando, onFechar, onConfirmar }: Props) {
  const [rascunho, setRascunho] = useState(ficha);
  const [verPrompt, setVerPrompt] = useState(false);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") onFechar(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onFechar]);

  const set = (patch: Partial<Ficha>) => setRascunho((atual) => ({ ...atual, ...patch }));
  const casa = painel.estampaCasa ? estampaCasaDe(painel.estampaCasa) : undefined;
  const prompt = planEstampa(rascunho, painel, { referencias: rascunho.usarReferencias ? referencias : 0, estampaCasa: !!casa });
  const coresPaleta = painel.paleta.slice(1);
  const campo = "w-full rounded-md border border-[var(--pz-linha)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--pz-vinho)]";
  const rotulo = "mb-1 block text-[11px] uppercase tracking-[.16em] text-[var(--pz-suave)]";

  return <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/55 p-0 sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby="pz-confirmar-titulo" onClick={onFechar}>
    <div className="pz-tema max-h-[92dvh] w-full max-w-2xl overflow-y-auto bg-[var(--pz-creme)] text-[var(--pz-tinta)] shadow-2xl sm:rounded-lg" onClick={(e) => e.stopPropagation()}>
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--pz-linha)] bg-[var(--pz-creme)] px-5 py-4 sm:px-7">
        <div>
          <h2 id="pz-confirmar-titulo" className="pz-serif text-3xl leading-none">Confira antes de criar</h2>
          <p className="mt-1 text-xs text-[var(--pz-suave)]">Tudo abaixo vira o pedido da arte. Ajuste o que quiser.</p>
        </div>
        <button type="button" onClick={onFechar} aria-label="Fechar" className="rounded-full p-2 hover:bg-black/5"><X size={18} /></button>
      </div>

      <div className="space-y-5 px-5 py-5 sm:px-7">
        <div className="grid grid-cols-2 gap-3 rounded-md bg-[var(--pz-creme-2)] p-4 text-sm sm:grid-cols-4">
          <div><span className={rotulo}>Modelagem</span>{MODELAGENS.find((m) => m.id === painel.modelagem)?.nome}</div>
          <div><span className={rotulo}>Malha</span><span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded-full border border-black/10" style={{ background: painel.paleta[0] }} />{nomeDaCor(painel.paleta[0])}</span></div>
          <div><span className={rotulo}>Frente</span><span style={{ fontFamily: fonteDe(painel.fonte).css }}>{escritaDe(painel.fonte)}</span></div>
          <div><span className={rotulo}>Base</span>{casa ? casa.nome : "Criação nova"}</div>
        </div>

        <label className="block"><span className={rotulo}>Ideia</span><textarea value={rascunho.ideia} maxLength={400} rows={2} onChange={(e) => set({ ideia: e.target.value })} className={campo} /></label>
        <label className="block"><span className={rotulo}>Elementos (separe por vírgula)</span><input value={rascunho.elementos.join(", ")} onChange={(e) => set({ elementos: lista(e.target.value).slice(0, 10) })} className={campo} /></label>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block"><span className={rotulo}>Estilo</span><input value={rascunho.estilo} maxLength={200} onChange={(e) => set({ estilo: e.target.value })} className={campo} /></label>
          <label className="block"><span className={rotulo}>Composição</span><input value={rascunho.composicao} maxLength={200} onChange={(e) => set({ composicao: e.target.value })} className={campo} /></label>
        </div>

        <div>
          <span className={rotulo}>Cores da arte (da sua paleta)</span>
          <div className="flex flex-wrap gap-2">
            {coresPaleta.map((cor) => {
              const ativo = rascunho.cores.length === 0 || rascunho.cores.some((c) => c.toLowerCase() === cor.toLowerCase());
              const base = rascunho.cores.length ? rascunho.cores : coresPaleta;
              return <button key={cor} type="button" aria-pressed={ativo} onClick={() => set({ cores: ativo ? base.filter((c) => c.toLowerCase() !== cor.toLowerCase()) : [...base, cor] })} className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs ${ativo ? "border-[var(--pz-vinho)] bg-white" : "border-[var(--pz-linha)] opacity-50"}`}>
                <span className="h-3.5 w-3.5 rounded-full border border-black/10" style={{ background: cor }} />{nomeDaCor(cor)}
              </button>;
            })}
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block"><span className={rotulo}>Texto abaixo da arte (opcional)</span><input value={rascunho.texto} maxLength={40} onChange={(e) => set({ texto: e.target.value })} placeholder="Ex.: Sete de copas" className={campo} /><span className="mt-1 block text-[11px] text-[var(--pz-suave)]">Aplicado com a fonte {fonteDe(painel.fonte).nome}, letra por letra.</span></label>
          <label className="block"><span className={rotulo}>Evitar (separe por vírgula)</span><input value={rascunho.evitar.join(", ")} onChange={(e) => set({ evitar: lista(e.target.value).slice(0, 8) })} className={campo} /></label>
        </div>

        {referencias > 0 && <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={rascunho.usarReferencias} onChange={(e) => set({ usarReferencias: e.target.checked })} className="h-4 w-4 accent-[var(--pz-vinho)]" /> Usar minhas {referencias} referência(s) como inspiração</label>}

        <div className="rounded-md border border-[var(--pz-linha)]">
          <button type="button" onClick={() => setVerPrompt((v) => !v)} aria-expanded={verPrompt} className="flex w-full items-center justify-between px-4 py-3 text-sm">Ver o pedido completo enviado à IA <ChevronDown size={16} className={`transition-transform ${verPrompt ? "rotate-180" : ""}`} /></button>
          {verPrompt && <pre className="max-h-72 overflow-y-auto whitespace-pre-wrap border-t border-[var(--pz-linha)] bg-white px-4 py-3 text-xs leading-relaxed">{prompt}</pre>}
        </div>
      </div>

      <div className="sticky bottom-0 flex flex-col-reverse gap-3 border-t border-[var(--pz-linha)] bg-[var(--pz-creme)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
        <p className="text-xs text-[var(--pz-suave)]">{restantes > 0 ? `Você ainda pode criar ${restantes} versão(ões) nesta sessão.` : "Você usou as criações desta sessão."}</p>
        <div className="flex gap-2">
          <button type="button" onClick={onFechar} className="flex-1 border border-[var(--pz-linha)] px-4 py-3 text-sm sm:flex-none">Voltar ao chat</button>
          <button type="button" disabled={gerando || restantes <= 0 || (!rascunho.ideia.trim() && !rascunho.elementos.length)} onClick={() => onConfirmar(rascunho)} className="flex flex-1 items-center justify-center gap-2 bg-[var(--pz-vinho)] px-5 py-3 text-sm text-[var(--pz-creme)] disabled:opacity-40 sm:flex-none"><Sparkles size={16} /> {gerando ? "Criando…" : "Criar estampa"}</button>
        </div>
      </div>
    </div>
  </div>;
}
