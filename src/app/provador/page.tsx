"use client";

import { type FormEvent, Suspense, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Download, Shirt, X } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { AnalyzingImage } from "@/components/ui/analyzing-image";
import type { PersonBox } from "@/lib/people";
import { getProduct, products, type Product } from "@/lib/products";

type GenerateSuccess = { image: string; cost: number; model: string; pose: string; poseLabel: string; shown: string; productId: string };
type GenerateResult = GenerateSuccess | { error: string };
type People = { boxes: PersonBox[]; total: number };
type Run = { status: "idle" } | { status: "loading" } | { status: "done"; result: GenerateResult };

const MAX_PHOTO_SIDE = 1600;

function readDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Phone photos are huge and often carry an EXIF rotation. Re-encoding through a canvas bakes the rotation in
// (so the pose is detected on the picture as the person sees it) and keeps the upload small.
async function readImage(file: File): Promise<string> {
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, MAX_PHOTO_SIDE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const context = canvas.getContext("2d")!;
    context.fillStyle = "#fff"; // JPEG has no alpha: transparent PNGs would turn black
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    return canvas.toDataURL("image/jpeg", 0.9);
  } catch {
    return readDataUrl(file);
  }
}

// Crop of the chosen person (with a small margin), so their pose is detected on them alone.
async function cropPerson(dataUrl: string, box: PersonBox): Promise<string> {
  const image = new Image();
  image.src = dataUrl;
  await image.decode();
  const left = Math.max(0, box.x - box.w * 0.06) * image.width;
  const top = Math.max(0, box.y - box.h * 0.06) * image.height;
  const width = Math.min(1, box.x + box.w * 1.06) * image.width - left;
  const height = Math.min(1, box.y + box.h * 1.06) * image.height - top;
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  canvas.getContext("2d")!.drawImage(image, left, top, width, height, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.9);
}

function money(value: number) {
  return `$${value.toFixed(4)}`;
}

// Goes through a blob: `download` on a huge data: URL is ignored by some mobile browsers.
async function downloadImage(dataUrl: string, name: string) {
  const blob = await (await fetch(dataUrl)).blob();
  const extension = blob.type === "image/jpeg" ? "jpg" : blob.type.split("/")[1] || "png";
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${name}.${extension}`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
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

  const [people, setPeople] = useState<People | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [targetIndex, setTargetIndex] = useState<number | null>(null);
  const photoVersion = useRef(0);

  async function handlePersonFile(file: File | null) {
    if (!file || !file.type.startsWith("image/")) return;
    const version = ++photoVersion.current;
    const photo = await readImage(file);
    if (version !== photoVersion.current) return;
    setPersonPhoto(photo);
    setPeople(null);
    setTargetIndex(null);
    setError("");
    setAnalyzing(true);
    // Finds who is in the photo so the customer can pick one when there are several.
    try {
      const response = await fetch("/api/people", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ personPhoto: photo }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      if (version === photoVersion.current) setPeople({ boxes: data.people, total: data.total });
    } catch {
      // Without the analysis we go ahead as if the photo had a single person.
    } finally {
      if (version === photoVersion.current) setAnalyzing(false);
    }
  }

  const needsChoice = !!people && people.boxes.length >= 2;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (!selectedProduct) return setError("Escolha uma camisa antes de gerar.");
    if (!personPhoto) return setError("Adicione a sua foto antes de gerar.");

    if (needsChoice && targetIndex === null) return setError("Toque em quem vai vestir a camiseta.");

    setRun({ status: "loading" });
    try {
      // With several people in the photo, the server is told which one to dress (a lone big person among small
      // background ones is chosen automatically). It then detects that person's pose and picks the matching shirt view.
      const box = people && people.total >= 2 ? (people.boxes.length === 1 ? people.boxes[0] : people.boxes[targetIndex!]) : null;
      const target = box && people ? { box, total: people.total, crop: await cropPerson(personPhoto, box) } : undefined;
      const body = { personPhoto, productId: selectedProduct.id, target, aspectRatio: "3:4", resolution: "1K" };
      const response = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Falha na geração.");
      setRun({ status: "done", result: { ...(data as Omit<GenerateSuccess, "productId">), productId: selectedProduct.id } });
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
              <div><h2 className="text-2xl">Sua foto</h2><p className="sans mt-1 text-xs text-[var(--muted)]">Envie uma foto sua de corpo inteiro — de frente, de lado ou de costas. A gente identifica a pose e veste o lado certo da camiseta.</p></div>
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
            {analyzing && <p className="sans mt-3 text-[11px] text-[var(--muted)]">Analisando a foto...</p>}
            {needsChoice && personPhoto && people && (
              <div className="mt-5">
                <p className="sans mb-3 text-[10px] uppercase tracking-[.15em] text-[var(--muted)]">Mais de uma pessoa na foto — toque em quem vai vestir a camiseta</p>
                <div className="relative inline-block max-w-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={personPhoto} alt="Sua foto, com as pessoas numeradas" className="block h-auto max-h-[520px] w-auto max-w-full" />
                  {people.boxes.map((box, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => { setTargetIndex(index); setError(""); }}
                      aria-label={`Escolher a pessoa ${index + 1}`}
                      aria-pressed={targetIndex === index}
                      style={{ left: `${box.x * 100}%`, top: `${box.y * 100}%`, width: `${box.w * 100}%`, height: `${box.h * 100}%` }}
                      className={`absolute border-2 transition-colors ${targetIndex === index ? "border-[var(--sol-1)] bg-[var(--sol-1)]/20" : "border-white/80 hover:bg-white/20"}`}
                    >
                      <span className={`sans absolute top-1 left-1 flex h-6 w-6 items-center justify-center rounded-full text-[11px] ${targetIndex === index ? "bg-[var(--sol-1)] text-[var(--origem)]" : "bg-[var(--origem)] text-[var(--creme)]"}`}>{index + 1}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>

          <section className="border-t border-[var(--origem)] py-8">
            <button
              type="submit"
              disabled={loading || analyzing}
              className="sans flex w-full items-center justify-between bg-gradient-to-r from-[var(--sol-1)] to-[var(--sol-2)] px-6 py-4 text-[13px] font-semibold uppercase tracking-[.1em] text-[var(--origem)] transition-opacity disabled:cursor-wait disabled:opacity-60"
            >
              <span>{loading ? "Gerando provador virtual..." : analyzing ? "Analisando a foto..." : "Gerar provador virtual"}</span>
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
                  <div><div className="text-sm font-semibold">{selectedProduct?.name}</div><div className="sans mt-0.5 text-[10px] uppercase tracking-[.08em] text-[var(--muted)]">Pose detectada: {run.result.poseLabel}</div></div>
                  <div className="sans text-right text-sm"><div>{money(run.result.cost)}</div><small className="text-[9px] text-[var(--muted)]">custo real</small></div>
                </div>
                <p className="sans border-t border-[var(--origem)]/10 px-4 py-3 text-[11px] leading-relaxed text-[var(--muted)]">
                  Vestimos {run.result.shown} para combinar com a sua foto.
                  {run.result.pose.startsWith("frente") && " Para ver a estampa das costas, envie uma foto sua de costas."}
                </p>
                <button
                  type="button"
                  onClick={() => { const { image, productId, pose } = run.result as GenerateSuccess; void downloadImage(image, `merano-${productId}-${pose}`); }}
                  className="sans flex w-full items-center justify-center gap-2 border-t border-[var(--origem)]/10 px-4 py-3 text-[10px] uppercase tracking-[.1em] transition-colors hover:bg-[var(--origem)] hover:text-[var(--creme)]"
                >
                  <Download size={14} /> Baixar foto
                </button>
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
