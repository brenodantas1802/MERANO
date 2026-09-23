"use client";

import { type FormEvent, Suspense, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Shirt, X } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { AnalyzingImage } from "@/components/ui/analyzing-image";
import { getProduct, products, type Product } from "@/lib/products";

type GenerateResult = { image: string; cost: number; model: string } | { error: string };
type Run = { status: "idle" } | { status: "loading" } | { status: "done"; result: GenerateResult };

const HIDDEN_PROMPT = `EDITAR A FOTO DA PESSOA, não criar uma pessoa nova. A foto da pessoa é a imagem-base e deve ser preservada: mantenha exatamente a mesma pessoa, rosto, identidade, expressão, tom de pele, cabelo, pose, mãos, proporções corporais, enquadramento, câmera, iluminação e fundo. Faça somente uma troca virtual de roupa sobre a pessoa. Use as fotos da camisa exclusivamente como referência exata da roupa. Não substitua a pessoa, não mude a pose e não faça uma nova sessão de fotos.

Vista a pessoa da imagem 1 com a roupa da imagem 2, mantendo fielmente modelo, corte, caimento, comprimento, gola, mangas, costuras, textura, material, cores, etiquetas e todos os detalhes visuais. Se a imagem 2 mostrar a roupa de frente e de costas, interprete as duas vistas da mesma peça: use a vista frontal na parte da frente e reproduza no verso a estampa ou arte traseira maior na posição, escala e cores corretas. Não invente logotipos, textos, estampas ou detalhes que não estejam na imagem 2.

Resultado: uma edição fotográfica realista da imagem 1, com a roupa trocada e todo o restante praticamente idêntico. Preserve a anatomia e evite mãos extras, membros deformados, rosto alterado, pessoa diferente, roupa genérica, estampa inventada ou fundo modificado.

VISTA FRONTAL: edite somente a imagem da pessoa de frente. Preserve exatamente a pessoa, pose, rosto, fundo e enquadramento da referência. Troque apenas a camisa pela referência da peça. Gere somente a vista frontal, sem mostrar as costas.`;

function readImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function money(value: number) {
  return `$${value.toFixed(4)}`;
}

function ShirtPicker({ onSelect, onClose }: { onSelect: (product: Product) => void; onClose: () => void }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  function scrollBy(amount: number) {
    scrollRef.current?.scrollBy({ left: amount, behavior: "smooth" });
  }
  return (
    <div className="mt-4 border border-[var(--areia)] p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="sans text-[10px] uppercase tracking-[.15em] text-[var(--muted)]">Escolha uma camisa</p>
        <button type="button" onClick={onClose} aria-label="Fechar" className="text-[var(--muted)] hover:text-[var(--origem)]"><X size={16} /></button>
      </div>
      <div className="relative">
        <div ref={scrollRef} className="flex snap-x gap-3 overflow-x-auto scroll-smooth pb-2">
          {products.map((product) => (
            <button
              key={product.id}
              type="button"
              onClick={() => onSelect(product)}
              className="group w-32 shrink-0 snap-start text-left"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={product.image} alt={product.name} className="aspect-[3/4] w-full bg-[var(--areia)] object-cover transition-opacity group-hover:opacity-80" />
              <p className="sans mt-2 text-[10px] uppercase tracking-[.08em] leading-snug">{product.name}</p>
            </button>
          ))}
        </div>
        <button type="button" onClick={() => scrollBy(-300)} aria-label="Anterior" className="absolute top-1/3 -left-3 hidden h-8 w-8 items-center justify-center rounded-full border border-[var(--areia)] bg-[var(--creme)] sm:flex"><ChevronLeft size={16} /></button>
        <button type="button" onClick={() => scrollBy(300)} aria-label="Próxima" className="absolute top-1/3 -right-3 hidden h-8 w-8 items-center justify-center rounded-full border border-[var(--areia)] bg-[var(--creme)] sm:flex"><ChevronRight size={16} /></button>
      </div>
    </div>
  );
}

function ProvadorContent() {
  const searchParams = useSearchParams();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(() => {
    const slug = searchParams.get("produto");
    return (slug && getProduct(slug)) || null;
  });
  const [pickerOpen, setPickerOpen] = useState(false);
  const [personPhoto, setPersonPhoto] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [run, setRun] = useState<Run>({ status: "idle" });

  async function handlePersonFile(file: File | null) {
    if (!file || !file.type.startsWith("image/")) return;
    setPersonPhoto(await readImage(file));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (!selectedProduct) return setError("Escolha uma camisa antes de gerar.");
    if (!personPhoto) return setError("Adicione a sua foto antes de gerar.");

    setRun({ status: "loading" });
    const shirtUrl = new URL(selectedProduct.image, window.location.origin).toString();
    const body = { prompt: HIDDEN_PROMPT, references: [personPhoto, shirtUrl], aspectRatio: "3:4", resolution: "1K" };
    try {
      const response = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Falha na geração.");
      setRun({ status: "done", result: data as { image: string; cost: number; model: string } });
    } catch (generationError) {
      setRun({ status: "done", result: { error: generationError instanceof Error ? generationError.message : "Falha na geração." } });
    }
  }

  const loading = run.status === "loading";

  return (
    <main>
      <SiteHeader />
      <div className="mx-auto max-w-3xl px-6 pb-28 md:px-12">
        <section className="pt-14 pb-10 md:pt-20">
          <p className="sans mb-4 text-[10px] uppercase tracking-[.2em] text-[var(--muted)]">Provador virtual</p>
          <h1 className="display text-6xl md:text-8xl">Vista a peça.<br /><em className="not-italic text-[var(--sol-1)]">Veja o caimento.</em></h1>
          <p className="mt-8 max-w-xl text-xl leading-relaxed text-[var(--muted)]">Escolha uma camisa da MERANO e envie sua foto: a inteligência artificial gera você vestindo a peça.</p>
        </section>

        <form onSubmit={handleSubmit}>
          <section className="border-t border-[var(--origem)] py-8">
            <div className="mb-7 flex gap-5">
              <span className="sans pt-1 text-xs text-[var(--sol-1)]">01</span>
              <div><h2 className="text-2xl">Escolha a camisa</h2><p className="sans mt-1 text-xs text-[var(--muted)]">Selecione qual peça da MERANO você quer experimentar.</p></div>
            </div>

            {selectedProduct ? (
              <div className="flex items-center gap-4 border border-[var(--areia)] p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={selectedProduct.image} alt={selectedProduct.name} className="h-20 w-16 shrink-0 bg-[var(--areia)] object-cover" />
                <div className="min-w-0 flex-1"><strong className="block truncate text-sm">{selectedProduct.name}</strong><p className="sans mt-1 text-[10px] uppercase tracking-[.1em] text-[var(--muted)]">{selectedProduct.note}</p></div>
                <button type="button" onClick={() => setPickerOpen(true)} className="sans shrink-0 border border-[var(--areia)] px-3 py-2 text-[10px] uppercase tracking-[.1em] hover:bg-[var(--areia)]/30">Trocar</button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setPickerOpen((open) => !open)}
                className="flex min-h-[100px] w-full flex-col items-center justify-center gap-2 border border-dashed border-[var(--areia)] text-center hover:bg-[var(--areia)]/25"
              >
                <Shirt size={22} />
                <strong className="text-sm">Escolher camisa do site</strong>
              </button>
            )}

            {pickerOpen && <ShirtPicker onSelect={(product) => { setSelectedProduct(product); setPickerOpen(false); }} onClose={() => setPickerOpen(false)} />}
          </section>

          <section className="border-t border-[var(--origem)] py-8">
            <div className="mb-7 flex gap-5">
              <span className="sans pt-1 text-xs text-[var(--sol-1)]">02</span>
              <div><h2 className="text-2xl">Sua foto</h2><p className="sans mt-1 text-xs text-[var(--muted)]">Envie uma foto sua de corpo inteiro, de frente.</p></div>
            </div>
            <label className="group relative flex min-h-[220px] cursor-pointer flex-col items-center justify-center overflow-hidden border border-dashed border-[var(--areia)] text-center transition-colors hover:bg-[var(--areia)]/25">
              <input type="file" accept="image/*" className="hidden" onChange={(event) => handlePersonFile(event.target.files?.[0] ?? null)} />
              {personPhoto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={personPhoto} alt="" className="absolute inset-0 h-full w-full object-cover" />
              ) : (
                <>
                  <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-full border border-[var(--origem)] text-xl font-light">+</span>
                  <strong className="text-sm">Sua foto</strong>
                  <small className="sans mt-1 text-[10px] text-[var(--muted)]">obrigatória</small>
                </>
              )}
              {personPhoto && <span className="sans absolute inset-x-0 bottom-0 bg-[var(--origem)]/80 py-2 text-center text-[10px] uppercase tracking-[.1em] text-[var(--creme)]">Trocar foto</span>}
            </label>
          </section>

          <section className="border-t border-[var(--origem)] py-8">
            <button
              type="submit"
              disabled={loading}
              className="sans flex w-full items-center justify-between bg-gradient-to-r from-[var(--sol-1)] to-[var(--sol-2)] px-6 py-4 text-[13px] font-semibold uppercase tracking-[.1em] text-[var(--origem)] transition-opacity disabled:cursor-wait disabled:opacity-60"
            >
              <span>{loading ? "Gerando provador virtual..." : "Gerar provador virtual"}</span>
              <span aria-hidden>↗</span>
            </button>
            {error && <p role="alert" className="sans mt-3 min-h-[16px] text-xs text-[#8a3a2c]">{error}</p>}
          </section>
        </form>

        {run.status !== "idle" && (
          <section className="border-t border-[var(--origem)] py-10">
            <div className="mb-6 flex items-end justify-between border-t border-[var(--areia)] pt-6">
              <div><p className="sans text-[10px] uppercase tracking-[.2em] text-[var(--muted)]">Resultado</p><h2 className="mt-1 text-3xl">O que mudou?</h2></div>
            </div>

            {run.status === "loading" && (
              <article className="flex aspect-[3/4] max-w-sm flex-col items-center justify-center gap-4 bg-[var(--areia)] text-center">
                <AnalyzingImage className="h-10 w-10 text-[var(--origem)]" />
                <p className="sans px-4 text-[11px] uppercase tracking-[.1em] text-[var(--muted)]">Gerando seu provador virtual...</p>
              </article>
            )}

            {run.status === "done" && "error" in run.result && (
              <article className="max-w-sm border border-[var(--areia)] p-5">
                <p className="sans text-xs leading-relaxed text-[#8a3a2c]">{run.result.error}</p>
              </article>
            )}

            {run.status === "done" && !("error" in run.result) && (
              <article className="max-w-sm bg-[var(--areia)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={run.result.image} alt={`Você vestindo ${selectedProduct?.name ?? "a peça"}`} className="aspect-[3/4] w-full object-cover" />
                <div className="flex items-center justify-between gap-4 p-4">
                  <div><div className="text-sm font-semibold">{selectedProduct?.name}</div><div className="sans mt-0.5 text-[10px] text-[var(--muted)]">{run.result.model}</div></div>
                  <div className="sans text-right text-sm"><div>{money(run.result.cost)}</div><small className="text-[9px] text-[var(--muted)]">custo real</small></div>
                </div>
              </article>
            )}
          </section>
        )}
      </div>
    </main>
  );
}

export default function ProvadorPage() {
  return (
    <Suspense fallback={null}>
      <ProvadorContent />
    </Suspense>
  );
}
