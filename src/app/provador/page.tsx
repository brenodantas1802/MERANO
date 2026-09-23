"use client";

import { type FormEvent, useState } from "react";
import { SiteHeader } from "@/components/site-header";

type SlotKey = "personFront" | "personBack" | "shirtFront" | "shirtBack";
type View = "front" | "back";
type GenerateResult = { image: string; cost: number; model: string } | { error: string };
type Run = { status: "idle" } | { status: "loading"; views: View[] } | { status: "done"; entries: { view: View; result: GenerateResult }[]; elapsedLabel: string };

const SLOTS: { key: SlotKey; title: string; hint: string }[] = [
  { key: "personFront", title: "Pessoa · frente", hint: "obrigatória" },
  { key: "personBack", title: "Pessoa · verso", hint: "opcional · ativa 2ª vista" },
  { key: "shirtFront", title: "Camisa · frente", hint: "obrigatória" },
  { key: "shirtBack", title: "Camisa · verso", hint: "opcional · estampa traseira" },
];

const QUICK_PROMPTS = [
  { label: "Editorial", text: "Foto editorial realista, corpo inteiro, luz natural suave, preserve rosto e identidade." },
  { label: "E-commerce", text: "Provador comercial limpo, pose natural, fundo neutro, foco no caimento da roupa." },
  { label: "Lookbook", text: "Lookbook contemporâneo, enquadramento 3/4, iluminação de estúdio, textura fiel do tecido." },
];

const DEFAULT_PROMPT = `EDITAR A FOTO DA PESSOA, não criar uma pessoa nova. A foto da pessoa é a imagem-base e deve ser preservada: mantenha exatamente a mesma pessoa, rosto, identidade, expressão, tom de pele, cabelo, pose, mãos, proporções corporais, enquadramento, câmera, iluminação e fundo. Faça somente uma troca virtual de roupa sobre a pessoa. Use as fotos da camisa exclusivamente como referência exata da roupa. Não substitua a pessoa, não mude a pose e não faça uma nova sessão de fotos.

Vista a pessoa da imagem 1 com a roupa da imagem 2, mantendo fielmente modelo, corte, caimento, comprimento, gola, mangas, costuras, textura, material, cores, etiquetas e todos os detalhes visuais. Se a imagem 2 mostrar a roupa de frente e de costas, interprete as duas vistas da mesma peça: use a vista frontal na parte da frente e reproduza no verso a estampa ou arte traseira maior na posição, escala e cores corretas. Não invente logotipos, textos, estampas ou detalhes que não estejam na imagem 2.

Resultado: uma edição fotográfica realista da imagem 1, com a roupa trocada e todo o restante praticamente idêntico. Preserve a anatomia e evite mãos extras, membros deformados, rosto alterado, pessoa diferente, roupa genérica, estampa inventada ou fundo modificado.`;

function readImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function buildPrompt(basePrompt: string, view: View) {
  if (view === "front") {
    return `${basePrompt}\n\nVISTA FRONTAL: edite somente a imagem da pessoa de frente. Preserve exatamente a pessoa, pose, rosto, fundo e enquadramento da referência frontal. Troque apenas a camisa pela referência frontal da peça. Gere somente a vista frontal, sem mostrar as costas.`;
  }
  return `${basePrompt}\n\nVISTA TRASEIRA: edite somente a imagem da pessoa de costas. Preserve exatamente a pessoa, pose, cabelo, fundo e enquadramento da referência traseira. Mostre a parte de trás da camisa usando a referência traseira da peça; reproduza fielmente a estampa traseira maior, sem inventar detalhes. Gere somente a vista traseira, sem mostrar a frente.`;
}

function money(value: number) {
  return `$${value.toFixed(4)}`;
}

export default function ProvadorPage() {
  const [references, setReferences] = useState<Record<SlotKey, string | null>>({ personFront: null, personBack: null, shirtFront: null, shirtBack: null });
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [aspect, setAspect] = useState("3:4");
  const [resolution, setResolution] = useState("1K");
  const [error, setError] = useState("");
  const [run, setRun] = useState<Run>({ status: "idle" });

  async function handleFile(slot: SlotKey, file: File | null) {
    if (!file || !file.type.startsWith("image/")) return;
    const data = await readImage(file);
    setReferences((prev) => ({ ...prev, [slot]: data }));
  }

  function addQuickPrompt(text: string) {
    setPrompt((prev) => (prev.trim() ? `${prev.trim()} ${text}` : text));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (!references.personFront) return setError("Adicione a foto frontal da pessoa.");
    if (!references.shirtFront) return setError("Adicione a foto frontal da camisa.");
    if (!prompt.trim()) return setError("Escreva uma direção criativa antes de gerar.");

    const views: View[] = references.personBack ? ["front", "back"] : ["front"];
    setRun({ status: "loading", views });

    const started = performance.now();
    const entries = await Promise.all(
      views.map(async (view) => {
        const person = view === "front" ? references.personFront : references.personBack;
        const shirt = view === "front" ? references.shirtFront : references.shirtBack || references.shirtFront;
        const body = { prompt: buildPrompt(prompt, view), references: [person, shirt].filter(Boolean) as string[], aspectRatio: aspect, resolution };
        try {
          const response = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
          const data = await response.json();
          if (!response.ok) throw new Error(data.error || "Falha na geração.");
          return { view, result: data as { image: string; cost: number; model: string } };
        } catch (generationError) {
          return { view, result: { error: generationError instanceof Error ? generationError.message : "Falha na geração." } };
        }
      })
    );

    const elapsedLabel = `${((performance.now() - started) / 1000).toFixed(1)}s · ${views.length} ${views.length === 1 ? "requisição" : "requisições"}`;
    setRun({ status: "done", entries, elapsedLabel });
  }

  const loading = run.status === "loading";

  return (
    <main>
      <SiteHeader />
      <div className="mx-auto max-w-4xl px-6 pb-28 md:px-12">
        <section className="pt-14 pb-10 md:pt-20">
          <p className="sans mb-4 text-[10px] uppercase tracking-[.2em] text-[var(--muted)]">Provador virtual</p>
          <h1 className="display text-6xl md:text-8xl">Vista a peça.<br /><em className="not-italic text-[var(--sol-1)]">Veja o caimento.</em></h1>
          <p className="mt-8 max-w-xl text-xl leading-relaxed text-[var(--muted)]">Envie sua foto e a foto da peça: a inteligência artificial troca a roupa preservando rosto, pose e fundo.</p>
        </section>

        <form onSubmit={handleSubmit}>
          <section className="border-t border-[var(--origem)] py-8">
            <div className="mb-7 flex gap-5">
              <span className="sans pt-1 text-xs text-[var(--sol-1)]">01</span>
              <div><h2 className="text-2xl">Referências</h2><p className="sans mt-1 text-xs text-[var(--muted)]">Envie a pessoa e a camisa em cada vista. A traseira da pessoa é opcional.</p></div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {SLOTS.map((slot) => {
                const image = references[slot.key];
                return (
                  <label key={slot.key} className="group relative flex min-h-[190px] cursor-pointer flex-col items-center justify-center overflow-hidden border border-dashed border-[var(--areia)] text-center transition-colors hover:bg-[var(--areia)]/25">
                    <input type="file" accept="image/*" className="hidden" onChange={(event) => handleFile(slot.key, event.target.files?.[0] ?? null)} />
                    {image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover" />
                    ) : (
                      <>
                        <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-full border border-[var(--origem)] text-xl font-light">+</span>
                        <strong className="text-sm">{slot.title}</strong>
                        <small className="sans mt-1 text-[10px] text-[var(--muted)]">{slot.hint}</small>
                      </>
                    )}
                    {image && <span className="sans absolute inset-x-0 bottom-0 bg-[var(--origem)]/80 py-2 text-center text-[10px] uppercase tracking-[.1em] text-[var(--creme)]">Trocar imagem</span>}
                  </label>
                );
              })}
            </div>
          </section>

          <section className="border-t border-[var(--origem)] py-8">
            <div className="mb-7 flex gap-5">
              <span className="sans pt-1 text-xs text-[var(--sol-1)]">02</span>
              <div><h2 className="text-2xl">Direção criativa</h2><p className="sans mt-1 text-xs text-[var(--muted)]">Seja específico sobre caimento, pose, luz e cenário.</p></div>
            </div>
            <textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              className="block min-h-[160px] w-full resize-y border border-[var(--areia)] bg-white/40 p-4 text-[15px] leading-relaxed text-[var(--origem)] outline-none"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {QUICK_PROMPTS.map((quick) => (
                <button key={quick.label} type="button" onClick={() => addQuickPrompt(quick.text)} className="sans border border-[var(--areia)] px-3 py-1.5 text-[10px] uppercase tracking-[.1em] text-[var(--muted)] hover:bg-[var(--areia)]/30 hover:text-[var(--origem)]">
                  {quick.label}
                </button>
              ))}
            </div>
          </section>

          <section className="border-t border-[var(--origem)] py-8">
            <div className="mb-7 flex gap-5">
              <span className="sans pt-1 text-xs text-[var(--sol-1)]">03</span>
              <div><h2 className="text-2xl">Configuração</h2><p className="sans mt-1 text-xs text-[var(--muted)]">Ajuste proporção e resolução da geração.</p></div>
            </div>
            <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="border border-[var(--areia)] p-3"><span className="sans block text-[10px] uppercase tracking-[.1em] text-[var(--muted)]">Modelo ativo</span><strong className="mt-1 block text-sm">GPT Image 2.5 Flare</strong><small className="sans text-[10px] uppercase text-[var(--muted)]">OpenAI · fixo</small></div>
              <label className="border border-[var(--areia)] p-3">
                <span className="sans block text-[10px] uppercase tracking-[.1em] text-[var(--muted)]">Proporção</span>
                <select value={aspect} onChange={(event) => setAspect(event.target.value)} className="mt-2 w-full bg-transparent text-sm outline-none">
                  <option value="3:4">Retrato 3:4</option>
                  <option value="1:1">Quadrado 1:1</option>
                  <option value="9:16">Vertical 9:16</option>
                  <option value="4:5">Social 4:5</option>
                </select>
              </label>
              <label className="border border-[var(--areia)] p-3">
                <span className="sans block text-[10px] uppercase tracking-[.1em] text-[var(--muted)]">Resolução</span>
                <select value={resolution} onChange={(event) => setResolution(event.target.value)} className="mt-2 w-full bg-transparent text-sm outline-none">
                  <option value="1K">1K · rápido</option>
                  <option value="2K">2K · detalhado</option>
                </select>
              </label>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="sans flex w-full items-center justify-between bg-gradient-to-r from-[var(--sol-1)] to-[var(--sol-2)] px-6 py-4 text-[13px] font-semibold uppercase tracking-[.1em] text-[var(--origem)] transition-opacity disabled:cursor-wait disabled:opacity-60"
            >
              <span>{loading ? (run.views.length > 1 ? `Gerando ${run.views.length} imagens...` : "Gerando imagem frontal...") : "Gerar provador virtual"}</span>
              <span aria-hidden>↗</span>
            </button>
            {error && <p role="alert" className="sans mt-3 min-h-[16px] text-xs text-[#8a3a2c]">{error}</p>}
          </section>
        </form>

        {run.status !== "idle" && (
          <section className="border-t border-[var(--origem)] py-10">
            <div className="mb-6 flex items-end justify-between border-t border-[var(--areia)] pt-6">
              <div><p className="sans text-[10px] uppercase tracking-[.2em] text-[var(--muted)]">Resultado</p><h2 className="mt-1 text-3xl">O que mudou?</h2></div>
              {run.status === "done" && <span className="sans text-[10px] text-[var(--muted)]">{run.elapsedLabel}</span>}
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {run.status === "loading" &&
                run.views.map((view) => (
                  <article key={view} className="flex aspect-[3/4] items-center justify-center bg-[var(--areia)] text-center">
                    <p className="sans px-4 text-[11px] uppercase tracking-[.1em] text-[var(--muted)]">Gerando {view === "front" ? "frente" : "verso"}...</p>
                  </article>
                ))}
              {run.status === "done" &&
                run.entries.map(({ view, result }, index) => {
                  const viewLabel = view === "front" ? "Frente" : "Verso";
                  if ("error" in result) {
                    return (
                      <article key={index} className="border border-[var(--areia)] p-5">
                        <strong className="text-sm">{viewLabel}</strong>
                        <p className="sans mt-2 text-xs leading-relaxed text-[#8a3a2c]">{result.error}</p>
                      </article>
                    );
                  }
                  return (
                    <article key={index} className="bg-[var(--areia)]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={result.image} alt={`Resultado ${viewLabel.toLowerCase()}`} className="aspect-[3/4] w-full object-cover" />
                      <div className="flex items-center justify-between gap-4 p-4">
                        <div><div className="text-sm font-semibold">{viewLabel}</div><div className="sans mt-0.5 text-[10px] text-[var(--muted)]">{result.model}</div></div>
                        <div className="sans text-right text-sm"><div>{money(result.cost)}</div><small className="text-[9px] text-[var(--muted)]">custo real</small></div>
                      </div>
                    </article>
                  );
                })}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
