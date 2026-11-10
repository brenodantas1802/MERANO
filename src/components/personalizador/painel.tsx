"use client";

import { ChevronLeft, ChevronRight, Plus, Pointer, RotateCcw, Trash2, Upload, X } from "lucide-react";
import { useRef, useState, type ChangeEvent } from "react";
import { CORES_MALHA, ESTAMPAS_CASA, FONTES, MAX_PALETA, MAX_REFERENCIAS, MODELAGENS, nomeDaCor, type Painel } from "@/lib/estampa";
import { Camiseta } from "./camiseta";

export type Referencia = { id: string; url: string; enviada: boolean };

const MAX_BYTES = 10 * 1024 * 1024;
const MAX_LADO = 1024;

// Shrinks a reference to a small JPEG (and bakes in EXIF rotation): the model only needs the gist, and it keeps requests light.
async function reduzir(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, MAX_LADO / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const context = canvas.getContext("2d")!;
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.85);
}

export function luzDe(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255 > 0.6;
}

function Secao({ titulo, extra, children }: { titulo: string; extra?: React.ReactNode; children: React.ReactNode }) {
  return <section className="border-b border-[var(--pz-linha)] px-6 pb-7 pt-6">
    <div className="mb-4 flex items-baseline justify-between gap-3">
      <h3 className="pz-serif text-[26px] leading-none text-[var(--pz-tinta)]">{titulo}</h3>
      {extra && <span className="text-[13px] text-[var(--pz-suave)]">{extra}</span>}
    </div>
    {children}
  </section>;
}

const FOTO_MODELAGEM = { regular: "/imagens/personalizador/modelagem-regular.jpg", oversized: "/imagens/personalizador/modelagem-oversized.jpg", boxy: "/imagens/personalizador/modelagem-boxy.jpg" } as const;

type Props = {
  painel: Painel;
  onChange: (painel: Painel) => void;
  onReset: () => void;
  referencias: Referencia[];
  onReferencias: (referencias: Referencia[]) => void;
};

export function PainelPeca({ painel, onChange, onReset, referencias, onReferencias }: Props) {
  const [casaIndex, setCasaIndex] = useState(0);
  const [erroRef, setErroRef] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const set = (patch: Partial<Painel>) => onChange({ ...painel, ...patch });
  const malha = painel.paleta[0];
  const casa = ESTAMPAS_CASA[casaIndex];
  const usando = painel.estampaCasa === casa.id;

  function trocarMalha(hex: string) {
    const extras = painel.paleta.slice(1).filter((cor) => cor.toLowerCase() !== hex.toLowerCase());
    // The front lettering can't disappear into the shirt: if it matched the new colour, it moves to the first print colour.
    const corEscrita = painel.corEscrita.toLowerCase() === hex.toLowerCase() ? extras[0] ?? (luzDe(hex) ? "#0A0A0A" : "#F6F2E6") : painel.corEscrita;
    const paleta = [hex, ...extras];
    set({ paleta: paleta.includes(corEscrita) ? paleta : [...paleta.slice(0, MAX_PALETA - 1), corEscrita], corEscrita });
  }

  function adicionarCor(hex: string) {
    if (painel.paleta.length >= MAX_PALETA || painel.paleta.some((cor) => cor.toLowerCase() === hex.toLowerCase())) return;
    set({ paleta: [...painel.paleta, hex.toUpperCase()] });
  }

  function removerCor(index: number) {
    const paleta = painel.paleta.filter((_, i) => i !== index);
    const corEscrita = paleta.includes(painel.corEscrita) ? painel.corEscrita : paleta[1] ?? (luzDe(paleta[0]) ? "#0A0A0A" : "#F6F2E6");
    set({ paleta: paleta.includes(corEscrita) ? paleta : [...paleta, corEscrita], corEscrita });
  }

  async function enviarReferencias(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    setErroRef("");
    const livres = MAX_REFERENCIAS - referencias.length;
    const aceitas = files.filter((file) => /^image\/(png|jpe?g|webp)$/.test(file.type) && file.size <= MAX_BYTES).slice(0, livres);
    if (aceitas.length < Math.min(files.length, livres)) setErroRef("Algumas imagens ficaram de fora: use PNG, JPG ou WebP de até 10 MB.");
    if (files.length > livres) setErroRef(`Você pode enviar até ${MAX_REFERENCIAS} referências.`);
    try {
      const novas = await Promise.all(aceitas.map(async (file) => ({ id: `${Date.now()}-${file.name}-${Math.random()}`, url: await reduzir(file), enviada: false })));
      onReferencias([...referencias, ...novas]);
    } catch {
      setErroRef("Não consegui abrir essa imagem. Tente outra.");
    }
  }

  const colunas = painel.paleta.length + (painel.paleta.length < MAX_PALETA ? 1 : 0);

  return <div className="text-[var(--pz-tinta)]">
    <div className="flex items-center justify-between border-b border-[var(--pz-linha)] px-6 py-6">
      <h2 className="pz-serif text-[32px] leading-none">Sua peça</h2>
      <button type="button" onClick={onReset} className="inline-flex items-center gap-2 text-[14px] font-medium text-[var(--pz-tinta)] hover:text-[var(--pz-vinho)]"><RotateCcw size={14} strokeWidth={1.8} /> Restaurar padrões</button>
    </div>

    <Secao titulo="Modelagem">
      <div className="grid grid-cols-3 gap-3">
        {MODELAGENS.map((m) => {
          const ativo = painel.modelagem === m.id;
          return <button key={m.id} type="button" onClick={() => set({ modelagem: m.id })} aria-pressed={ativo} className={`relative flex flex-col bg-[var(--pz-cartao)] text-left outline outline-1 -outline-offset-1 transition-[outline-color] ${ativo ? "outline-[1.5px] outline-[var(--pz-vinho)]" : "outline-[var(--pz-linha)] hover:outline-[var(--pz-borda)]"}`}>
            {ativo && <span className="absolute right-2.5 top-2 text-[15px] leading-none text-[var(--pz-vinho)]">◆</span>}
            {/* eslint-disable-next-line @next/next/no-img-element -- small static photo from the prototype */}
            <img src={FOTO_MODELAGEM[m.id]} alt="" className="aspect-[107/120] w-full bg-[var(--pz-foto)] object-cover" />
            <span className="block px-2.5 pb-3 pt-2.5"><span className="pz-serif block text-[18px] leading-tight">{m.nome}</span><span className="mt-0.5 block text-[11.5px] leading-snug text-[var(--pz-suave)]">{m.nota}</span></span>
          </button>;
        })}
      </div>

      <div className="mt-7 flex items-center justify-between"><span className="pz-rotulo">Cores disponíveis</span><span className="text-[13px] text-[var(--pz-tinta)]">{nomeDaCor(malha)}</span></div>
      <div className="mt-3.5 flex flex-wrap gap-[9px]">
        {CORES_MALHA.map((cor) => {
          const ativo = cor.hex.toLowerCase() === malha.toLowerCase();
          return <button key={cor.hex} type="button" title={cor.nome} aria-label={`Malha ${cor.nome}`} aria-pressed={ativo} onClick={() => trocarMalha(cor.hex)} className={`h-9 w-9 rounded-full transition-transform hover:scale-105 ${ativo ? "ring-[1.5px] ring-[var(--pz-vinho)] ring-offset-2 ring-offset-[var(--pz-creme)]" : "shadow-[inset_0_0_0_1px_rgba(0,0,0,.08)]"}`} style={{ background: cor.hex }} />;
        })}
      </div>
    </Secao>

    <Secao titulo="Paleta" extra="A primeira cor é a da malha">
      <div className="grid overflow-hidden rounded-[10px] border border-[var(--pz-linha)]" style={{ gridTemplateColumns: `repeat(${colunas}, minmax(0, 1fr))` }}>
        {painel.paleta.map((cor, index) => {
          const clara = luzDe(cor);
          return <div key={`${cor}-${index}`} className="relative flex h-[130px] flex-col justify-end p-3" style={{ background: cor, color: clara ? "#3C2326" : "#FFFFFF" }}>
            {index === 0 && <span className="absolute left-2.5 top-2.5 rounded-full border px-2 py-[1px] text-[11px] font-medium" style={{ borderColor: clara ? "rgba(60,35,38,.5)" : "rgba(255,255,255,.85)" }}>malha</span>}
            <span className="text-[13px] font-semibold leading-tight">{nomeDaCor(cor)}</span>
            <span className="mt-0.5 text-[12px] opacity-80">{cor.toUpperCase()}</span>
          </div>;
        })}
        {painel.paleta.length < MAX_PALETA && <label className="flex h-[130px] cursor-pointer flex-col items-center justify-center gap-1.5 bg-[var(--pz-areia)] text-[13px] font-semibold text-[var(--pz-tinta)] hover:brightness-[1.02]">
          <Plus size={20} strokeWidth={1.6} /> Adicionar cor
          <input type="color" className="sr-only" onChange={(event) => adicionarCor(event.target.value)} />
        </label>}
      </div>
      <div className="mt-2.5 grid" style={{ gridTemplateColumns: `repeat(${colunas}, minmax(0, 1fr))` }}>
        {painel.paleta.map((cor, index) => <div key={`${cor}-${index}-lixo`} className="flex justify-center">
          <button type="button" disabled={index === 0} title={index === 0 ? "A malha muda em Cores disponíveis" : undefined} aria-label={`Remover ${nomeDaCor(cor)}`} onClick={() => removerCor(index)} className="rounded p-1 text-[var(--pz-suave)] hover:text-[var(--pz-vinho)] disabled:cursor-default disabled:opacity-40 disabled:hover:text-[var(--pz-suave)]"><Trash2 size={15} strokeWidth={1.6} /></button>
        </div>)}
      </div>
    </Secao>

    <Secao titulo="Fonte" extra="Escrita MERANNO da frente">
      <div className="grid grid-cols-3 gap-2.5">
        {FONTES.map((fonte) => {
          const ativo = painel.fonte === fonte.id;
          return <button key={fonte.id} type="button" onClick={() => set({ fonte: fonte.id })} aria-pressed={ativo} className={`flex h-[72px] items-center justify-center px-2 text-center leading-[1.05] transition-colors ${ativo ? "bg-[var(--pz-vinho)] text-[var(--pz-creme)]" : "border border-[var(--pz-linha)] bg-[var(--pz-cartao)] text-[var(--pz-vinho)] hover:border-[var(--pz-borda)]"}`}>
            <span style={{ fontFamily: fonte.css, fontSize: fonte.id === "pinyon" ? 22 : fonte.id === "cinzel" ? 17 : 20, fontWeight: fonte.id === "grotesk" ? 600 : undefined }}>{fonte.nome}</span>
          </button>;
        })}
      </div>
      <div className="mt-4 flex items-center justify-between">
        <span className="pz-rotulo">Cor da escrita</span>
        <div className="flex gap-[9px]">
          {painel.paleta.slice(1).map((cor) => <button key={cor} type="button" title={nomeDaCor(cor)} aria-label={`Escrita em ${nomeDaCor(cor)}`} aria-pressed={painel.corEscrita === cor} onClick={() => set({ corEscrita: cor })} className={`h-9 w-9 rounded-full shadow-[inset_0_0_0_1px_rgba(0,0,0,.08)] ${painel.corEscrita === cor ? "ring-[1.5px] ring-[var(--pz-vinho)] ring-offset-2 ring-offset-[var(--pz-creme)]" : ""}`} style={{ background: cor }} />)}
        </div>
      </div>
    </Secao>

    <Secao titulo="Estampas da casa" extra={`${casaIndex + 1} de ${ESTAMPAS_CASA.length}`}>
      <div className="relative px-6">
        <div className="mx-auto flex aspect-square max-w-[330px] flex-col items-center bg-[var(--pz-vinho)] px-5 pb-5 pt-4 text-[var(--pz-creme)]">
          <div className="flex min-h-0 w-full flex-1 items-center justify-center">
            <Camiseta lado="verso" modelagem="regular" corMalha={malha} fonte={painel.fonte} corEscrita={painel.corEscrita} arte={{ tipo: "casa", id: casa.id, cor: painel.paleta[1] ?? painel.corEscrita }} className="h-full w-auto max-w-full" />
          </div>
          <p className="pz-serif mt-1 text-[24px] leading-tight">{casa.nome}</p>
          <button type="button" onClick={() => set({ estampaCasa: usando ? null : casa.id })} className="mt-1 inline-flex items-center gap-1.5 text-[13px] text-[var(--pz-creme)]/85 hover:text-[var(--pz-creme)]">
            <Pointer size={14} strokeWidth={1.6} /> {usando ? "Usando esta estampa · remover" : "Usar esta estampa"}
          </button>
        </div>
        <button type="button" aria-label="Estampa anterior" onClick={() => setCasaIndex((i) => (i - 1 + ESTAMPAS_CASA.length) % ESTAMPAS_CASA.length)} className="absolute left-0 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--pz-ouro)] bg-[var(--pz-creme)] text-[var(--pz-tinta)] hover:bg-white"><ChevronLeft size={17} strokeWidth={1.6} /></button>
        <button type="button" aria-label="Próxima estampa" onClick={() => setCasaIndex((i) => (i + 1) % ESTAMPAS_CASA.length)} className="absolute right-0 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--pz-ouro)] bg-[var(--pz-creme)] text-[var(--pz-tinta)] hover:bg-white"><ChevronRight size={17} strokeWidth={1.6} /></button>
      </div>
    </Secao>

    <Secao titulo="Referências" extra={`${referencias.length} de ${MAX_REFERENCIAS}`}>
      <p className="mb-4 text-[14px] leading-relaxed text-[var(--pz-suave)]">Envie até 3 imagens para inspirar sua estampa. PNG, JPG ou WebP, até 10 MB cada.</p>
      <div className="grid grid-cols-3 gap-2.5">
        {referencias.map((ref) => <div key={ref.id} className="relative aspect-square overflow-hidden border border-[var(--pz-linha)]">
          {/* eslint-disable-next-line @next/next/no-img-element -- local data URL preview */}
          <img src={ref.url} alt="Referência enviada" className="h-full w-full object-cover" />
          <button type="button" aria-label="Remover referência" onClick={() => onReferencias(referencias.filter((r) => r.id !== ref.id))} className="absolute right-1.5 top-1.5 rounded-full bg-[var(--pz-tinta)]/70 p-1 text-white"><X size={12} /></button>
          {!ref.enviada && <span className="absolute inset-x-0 bottom-0 bg-[var(--pz-vinho)]/90 py-0.5 text-center text-[10px] text-white">vai na próxima mensagem</span>}
        </div>)}
        {referencias.length < MAX_REFERENCIAS && <button type="button" onClick={() => input.current?.click()} className="flex aspect-square flex-col items-center justify-center gap-2.5 border border-dashed border-[var(--pz-ouro)] text-[13px] font-semibold text-[var(--pz-tinta)] hover:bg-[var(--pz-cartao)]">
          <Upload size={18} strokeWidth={1.6} /> Enviar referências
        </button>}
        {Array.from({ length: Math.max(0, MAX_REFERENCIAS - referencias.length - 1) }).map((_, i) => <div key={i} className="pz-listras aspect-square border border-[var(--pz-linha)]" />)}
      </div>
      <input ref={input} type="file" accept="image/png,image/jpeg,image/webp" multiple className="hidden" onChange={enviarReferencias} />
      {erroRef && <p className="mt-3 text-xs text-[var(--pz-vinho)]">{erroRef}</p>}
      {referencias.some((r) => !r.enviada) && <p className="mt-3 text-[12px] text-[var(--pz-suave)]">As novas referências seguem junto com a sua próxima mensagem no chat.</p>}
    </Secao>
  </div>;
}
