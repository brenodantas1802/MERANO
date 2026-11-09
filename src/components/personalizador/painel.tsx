"use client";

import { ChevronLeft, ChevronRight, Plus, RotateCcw, Trash2, Upload, X } from "lucide-react";
import { useRef, useState, type ChangeEvent } from "react";
import { CORES_MALHA, ESTAMPAS_CASA, FONTES, MAX_PALETA, MAX_REFERENCIAS, MODELAGENS, escritaDe, nomeDaCor, type Painel } from "@/lib/estampa";
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

function Secao({ titulo, extra, children }: { titulo: string; extra?: React.ReactNode; children: React.ReactNode }) {
  return <section className="border-b border-[var(--pz-linha)] px-5 py-6 md:px-6">
    <div className="mb-4 flex items-baseline justify-between gap-3">
      <h3 className="pz-serif text-[26px] leading-none">{titulo}</h3>
      {extra && <span className="text-xs text-[var(--pz-suave)]">{extra}</span>}
    </div>
    {children}
  </section>;
}

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

  function trocarMalha(hex: string) {
    const extras = painel.paleta.slice(1).filter((cor) => cor.toLowerCase() !== hex.toLowerCase());
    // The front lettering can't disappear into the shirt: if it matched the new colour, it moves to the first print colour.
    const corEscrita = painel.corEscrita.toLowerCase() === hex.toLowerCase() ? extras[0] ?? (hex.toLowerCase() === "#0a0a0a" ? "#F6F2E6" : "#0A0A0A") : painel.corEscrita;
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

  return <div className="text-[var(--pz-tinta)]">
    <div className="flex items-center justify-between border-b border-[var(--pz-linha)] px-5 py-5 md:px-6">
      <h2 className="pz-serif text-[34px] leading-none">Sua peça</h2>
      <button type="button" onClick={onReset} className="inline-flex items-center gap-1.5 text-sm text-[var(--pz-vinho)] hover:opacity-75"><RotateCcw size={15} /> Restaurar padrões</button>
    </div>

    <Secao titulo="Modelagem">
      <div className="grid grid-cols-3 gap-2">
        {MODELAGENS.map((m) => {
          const ativo = painel.modelagem === m.id;
          return <button key={m.id} type="button" onClick={() => set({ modelagem: m.id })} aria-pressed={ativo} className={`relative border text-left transition-colors ${ativo ? "border-[var(--pz-vinho)] bg-white" : "border-[var(--pz-linha)] bg-[var(--pz-creme-2)] hover:border-[var(--pz-vinho)]/50"}`}>
            {ativo && <span className="absolute right-2 top-2 text-[var(--pz-vinho)]">◆</span>}
            <span className="block bg-[#ecebe8] px-3 pt-2"><Camiseta lado="frente" modelagem={m.id} corMalha="#F7F7F5" fonte={painel.fonte} corEscrita="#F7F7F5" className="h-auto w-full" /></span>
            <span className="block p-2.5"><span className="pz-serif block text-lg leading-tight">{m.nome}</span><span className="block text-[11px] leading-snug text-[var(--pz-suave)]">{m.nota}</span></span>
          </button>;
        })}
      </div>

      <div className="mt-6 flex items-center justify-between text-[11px] uppercase tracking-[.18em] text-[var(--pz-suave)]"><span>Cores disponíveis</span><span className="normal-case tracking-normal text-[var(--pz-tinta)]">{nomeDaCor(malha)}</span></div>
      <div className="mt-3 flex flex-wrap gap-2">
        {CORES_MALHA.map((cor) => {
          const ativo = cor.hex.toLowerCase() === malha.toLowerCase();
          return <button key={cor.hex} type="button" title={cor.nome} aria-label={`Malha ${cor.nome}`} aria-pressed={ativo} onClick={() => trocarMalha(cor.hex)} className={`h-8 w-8 rounded-full border transition-transform hover:scale-105 ${ativo ? "ring-2 ring-[var(--pz-vinho)] ring-offset-2 ring-offset-[var(--pz-creme)]" : "border-black/10"}`} style={{ background: cor.hex }} />;
        })}
      </div>
    </Secao>

    <Secao titulo="Paleta" extra="A primeira cor é a da malha">
      <div className="grid grid-cols-3 gap-0 overflow-hidden rounded-md border border-[var(--pz-linha)] sm:grid-cols-4">
        {painel.paleta.map((cor, index) => {
          const clara = luzDe(cor);
          return <div key={`${cor}-${index}`} className="relative flex h-24 flex-col justify-end p-2.5" style={{ background: cor, color: clara ? "#2A1A1D" : "#fff" }}>
            {index === 0 && <span className="absolute left-2 top-2 rounded-full border px-2 py-0.5 text-[10px]" style={{ borderColor: clara ? "#2A1A1D55" : "#ffffff88" }}>malha</span>}
            {index > 0 && <button type="button" aria-label={`Remover ${nomeDaCor(cor)}`} onClick={() => removerCor(index)} className="absolute right-1.5 top-1.5 rounded-full p-1 opacity-70 hover:opacity-100"><Trash2 size={13} /></button>}
            <span className="text-xs font-medium leading-tight">{nomeDaCor(cor)}</span>
            <span className="text-[10px] opacity-75">{cor.toUpperCase()}</span>
          </div>;
        })}
        {painel.paleta.length < MAX_PALETA && <label className="flex h-24 cursor-pointer flex-col items-center justify-center gap-1 bg-[var(--pz-creme-2)] text-xs text-[var(--pz-vinho)] hover:bg-white">
          <Plus size={18} /> Adicionar cor
          <input type="color" className="sr-only" onChange={(event) => adicionarCor(event.target.value)} />
        </label>}
      </div>
    </Secao>

    <Secao titulo="Escrita da frente" extra="Fixa · só muda o tipo">
      <div className="grid grid-cols-3 gap-2">
        {FONTES.map((fonte) => {
          const ativo = painel.fonte === fonte.id;
          return <button key={fonte.id} type="button" onClick={() => set({ fonte: fonte.id })} aria-pressed={ativo} className={`flex h-[74px] flex-col items-center justify-center border px-1 transition-colors ${ativo ? "border-[var(--pz-vinho)] bg-[var(--pz-vinho)] text-[var(--pz-creme)]" : "border-[var(--pz-linha)] bg-[var(--pz-creme-2)] hover:border-[var(--pz-vinho)]/50"}`}>
            <span style={{ fontFamily: fonte.css, letterSpacing: `${Math.min(fonte.espaco, 0.18)}em` }} className={fonte.caixa === "livre" ? "text-2xl" : "text-[15px]"}>{escritaDe(fonte.id)}</span>
            <span className="mt-1 text-[10px] opacity-70">{fonte.nome}</span>
          </button>;
        })}
      </div>
      <div className="mt-4 flex items-center gap-3 text-sm">
        <span className="text-[var(--pz-suave)]">Cor da escrita</span>
        <div className="flex gap-2">
          {painel.paleta.slice(1).map((cor) => <button key={cor} type="button" aria-label={`Escrita em ${nomeDaCor(cor)}`} aria-pressed={painel.corEscrita === cor} onClick={() => set({ corEscrita: cor })} className={`h-6 w-6 rounded-full border border-black/10 ${painel.corEscrita === cor ? "ring-2 ring-[var(--pz-vinho)] ring-offset-2 ring-offset-[var(--pz-creme)]" : ""}`} style={{ background: cor }} />)}
        </div>
      </div>
    </Secao>

    <Secao titulo="Estampas da casa" extra={`${casaIndex + 1} de ${ESTAMPAS_CASA.length}`}>
      <div className="relative">
        <div className="mx-auto flex aspect-square max-w-[300px] flex-col items-center justify-center bg-[var(--pz-vinho)] p-5 text-[var(--pz-creme)]">
          <div className="relative flex w-full flex-1 items-center justify-center">
            {casa.tinta
              ? <span className="block h-full w-full" style={{ backgroundColor: "#F4EFE6", WebkitMaskImage: `url("${casa.src}")`, maskImage: `url("${casa.src}")`, WebkitMaskSize: "contain", maskSize: "contain", WebkitMaskRepeat: "no-repeat", maskRepeat: "no-repeat", WebkitMaskPosition: "center", maskPosition: "center" }} />
              // eslint-disable-next-line @next/next/no-img-element -- transparent cutout with its own colours
              : <img src={casa.src} alt="" className="max-h-full max-w-full object-contain" />}
          </div>
          <p className="pz-serif mt-3 text-2xl">{casa.nome}</p>
          <button type="button" onClick={() => set({ estampaCasa: painel.estampaCasa === casa.id ? null : casa.id })} className="mt-1 text-sm text-[var(--pz-creme)]/85 underline-offset-4 hover:underline">
            {painel.estampaCasa === casa.id ? "✓ Usando esta estampa · remover" : "Usar esta estampa"}
          </button>
        </div>
        <button type="button" aria-label="Estampa anterior" onClick={() => setCasaIndex((i) => (i - 1 + ESTAMPAS_CASA.length) % ESTAMPAS_CASA.length)} className="absolute left-0 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--pz-ouro)] bg-[var(--pz-creme)]"><ChevronLeft size={18} /></button>
        <button type="button" aria-label="Próxima estampa" onClick={() => setCasaIndex((i) => (i + 1) % ESTAMPAS_CASA.length)} className="absolute right-0 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--pz-ouro)] bg-[var(--pz-creme)]"><ChevronRight size={18} /></button>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-[var(--pz-suave)]">Ela vai para o verso e serve de ponto de partida: no chat você pode pedir para adaptá-la.</p>
    </Secao>

    <Secao titulo="Referências" extra={`${referencias.length} de ${MAX_REFERENCIAS}`}>
      <p className="mb-4 text-sm leading-relaxed text-[var(--pz-suave)]">Envie até 3 imagens para inspirar sua estampa: um disco, uma carta, uma foto. PNG, JPG ou WebP, até 10 MB cada. Elas seguem junto com a sua próxima mensagem no chat.</p>
      <div className="grid grid-cols-3 gap-2">
        {referencias.map((ref) => <div key={ref.id} className="relative aspect-square overflow-hidden border border-[var(--pz-linha)]">
          {/* eslint-disable-next-line @next/next/no-img-element -- local data URL preview */}
          <img src={ref.url} alt="Referência enviada" className="h-full w-full object-cover" />
          <button type="button" aria-label="Remover referência" onClick={() => onReferencias(referencias.filter((r) => r.id !== ref.id))} className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white"><X size={12} /></button>
          {!ref.enviada && <span className="absolute inset-x-0 bottom-0 bg-[var(--pz-vinho)]/90 py-0.5 text-center text-[10px] text-white">vai na próxima mensagem</span>}
        </div>)}
        {referencias.length < MAX_REFERENCIAS && <button type="button" onClick={() => input.current?.click()} className="flex aspect-square flex-col items-center justify-center gap-2 border border-dashed border-[var(--pz-ouro)] text-xs text-[var(--pz-tinta)] hover:bg-white">
          <Upload size={18} /> Enviar referências
        </button>}
        {Array.from({ length: Math.max(0, MAX_REFERENCIAS - referencias.length - 1) }).map((_, i) => <div key={i} className="pz-listras aspect-square border border-[var(--pz-linha)]" />)}
      </div>
      <input ref={input} type="file" accept="image/png,image/jpeg,image/webp" multiple className="hidden" onChange={enviarReferencias} />
      {erroRef && <p className="mt-3 text-xs text-[var(--pz-vinho)]">{erroRef}</p>}
    </Secao>
  </div>;
}

export function luzDe(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255 > 0.6;
}
