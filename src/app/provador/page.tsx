"use client";

import { type FormEvent, Suspense, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, Download, ImagePlus, X } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { BeforeAfter, HowItWorks, ShirtFan, TryOnSteps } from "@/components/try-on-visuals";
import { SeaWaves } from "@/components/beach-art";
import { AnalyzingImage } from "@/components/ui/analyzing-image";
import type { PersonBox } from "@/lib/people";
import { getProduct, products, type Product } from "@/lib/products";

type GenerateSuccess = { image: string; cost: number; model: string; pose: string; poseLabel: string; shown: string; productId: string };
type GenerateResult = GenerateSuccess | { error: string };
type People = { boxes: PersonBox[]; total: number };
type Run = { status: "idle" } | { status: "loading" } | { status: "done"; result: GenerateResult };

// The customer's photo and everything derived from it. Kept as a keyed slot so more photos can be added later.
type SlotKey = "principal";
type Slot = { photo: string | null; people: People | null; analyzing: boolean; target: number | null; run: Run };
const EMPTY_SLOT: Slot = { photo: null, people: null, analyzing: false, target: null, run: { status: "idle" } };
const SLOT_COPY: Record<SlotKey, { title: string; hint: string }> = {
  principal: { title: "Sua foto", hint: "De frente, de lado ou de costas. Corpo inteiro ou da cintura pra cima." },
};

// One step of the before/after viewer.
type Frame = { key: string; slot: SlotKey; stage: "antes" | "depois"; photo: string; run: Run };

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

function ShirtPicker({ selected, onSelect, onClose }: { selected: Product | null; onSelect: (product: Product) => void; onClose: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="mt-4 rounded-[1.75rem] bg-[var(--creme)] p-5 shadow-[0_18px_40px_-28px_rgba(32,28,23,.5)]">
      <div className="mb-4 flex items-center justify-between">
        <p className="display text-2xl">Escolha a estampa</p>
        <button type="button" onClick={onClose} aria-label="Fechar" className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-[var(--ink)] hover:text-[var(--creme)]"><X size={16} /></button>
      </div>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {products.map((product) => (
          <button key={product.id} type="button" onClick={() => onSelect(product)} className="group text-left">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={product.image} alt="" className={`aspect-[3/4] w-full rounded-xl bg-[var(--areia)] object-cover transition-all ${selected?.id === product.id ? "ring-2 ring-[var(--ink)] ring-offset-2 ring-offset-[var(--creme)]" : "group-hover:opacity-80"}`} />
            <p className="mt-2 text-sm leading-snug">{product.name}</p>
          </button>
        ))}
      </div>
    </motion.div>
  );
}

function PhotoDrop({ slot, slotKey, onFile }: { slot: Slot; slotKey: SlotKey; onFile: (file: File | null) => void }) {
  const [dragging, setDragging] = useState(false);
  const copy = SLOT_COPY[slotKey];
  return (
    <label
      onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => { event.preventDefault(); setDragging(false); onFile(event.dataTransfer.files?.[0] ?? null); }}
      className={`group relative flex aspect-[4/3] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[1.75rem] text-center transition-all ${slot.photo ? "bg-[var(--areia)]/30" : dragging ? "scale-[1.01] bg-[var(--sol-2)]/25" : "bg-[var(--areia)]/30 hover:bg-[var(--areia)]/45"}`}
    >
      <input type="file" accept="image/*" className="hidden" onChange={(event) => { onFile(event.target.files?.[0] ?? null); event.target.value = ""; }} />
      {slot.photo ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={slot.photo} alt={copy.title} className="absolute inset-0 h-full w-full object-contain" />
                    <span className="sans absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-[var(--paper)]/90 px-4 py-1.5 text-[10px] uppercase tracking-[.12em] text-[var(--ink)]">Trocar foto</span>
          {slot.analyzing && <span className="sans absolute left-3 top-3 rounded-full bg-[var(--paper)]/90 px-3 py-1 text-[10px] text-[var(--ink)]">analisando…</span>}
        </>
      ) : (
        <span className="flex flex-col items-center px-5">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--paper)] text-[var(--ink)] shadow-[0_12px_24px_-14px_rgba(32,28,23,.6)] transition-transform duration-500 group-hover:-translate-y-1"><ImagePlus size={22} strokeWidth={1.5} /></span>
          <span className="display mt-3 text-2xl">{copy.title}</span>
          <span className="sans mt-2 text-[11px] leading-snug text-[var(--muted)]">{copy.hint}</span>
          <span className="serif-note mt-3 text-base text-[var(--terra)]">toque ou arraste aqui</span>
        </span>
      )}
    </label>
  );
}

function PersonChooser({ slot, label, onChoose }: { slot: Slot; label: string; onChoose: (index: number) => void }) {
  if (!slot.photo || !slot.people) return null;
  return (
    <div className="mt-6">
      <p className="mb-3 text-lg"><span className="display mr-1 text-2xl text-[var(--sol-1)]">{slot.people.boxes.length} pessoas</span> na {label} — toque em quem vai vestir</p>
      <div className="relative inline-block max-w-full overflow-hidden rounded-2xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={slot.photo} alt="Sua foto, com as pessoas numeradas" className="block h-auto max-h-[460px] w-auto max-w-full" />
        {slot.people.boxes.map((box, index) => (
          <button
            key={index}
            type="button"
            onClick={() => onChoose(index)}
            aria-label={`Escolher a pessoa ${index + 1}`}
            aria-pressed={slot.target === index}
            style={{ left: `${box.x * 100}%`, top: `${box.y * 100}%`, width: `${box.w * 100}%`, height: `${box.h * 100}%` }}
            className={`absolute rounded-xl border-2 transition-colors ${slot.target === index ? "border-[var(--sol-1)] bg-[var(--sol-1)]/20" : "border-white/80 hover:bg-white/20"}`}
          >
            <span className={`sans absolute left-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full text-xs ${slot.target === index ? "bg-[var(--sol-1)] text-[var(--origem)]" : "bg-[var(--origem)] text-[var(--creme)]"}`}>{index + 1}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function TryOnViewer({ frames, index, onIndex, product }: { frames: Frame[]; index: number; onIndex: (index: number) => void; product: Product | null }) {
  const frame = frames[index];
  const go = (step: number) => onIndex((index + step + frames.length) % frames.length);

  if (!frame) {
    return (
      <div className="relative flex aspect-[3/4] flex-col items-center justify-center overflow-hidden rounded-[2rem] bg-[var(--areia)]/30 p-8 text-center md:aspect-auto md:h-[min(70vh,760px)]">
        {product ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.image} alt={product.name} className="w-1/2 rotate-3 rounded-2xl bg-[var(--paper)] p-2 shadow-[0_24px_50px_-28px_rgba(32,28,23,.6)]" />
        ) : (
          <BeforeAfter className="aspect-[4/5] w-1/2 rounded-2xl shadow-[0_24px_50px_-28px_rgba(32,28,23,.6)]" />
        )}
        <p className="serif-note mt-8 text-2xl text-[var(--terra)]">o seu resultado aparece aqui</p>
        <p className="sans mt-3 max-w-xs text-[11px] leading-relaxed text-[var(--muted)]">Você vai poder comparar a foto original com a versão vestindo a Merano, lado a lado.</p>
      </div>
    );
  }

  const result = frame.stage === "depois" && frame.run.status === "done" ? frame.run.result : null;
  const success = result && !("error" in result) ? result : null;

  return (
    <div className="flex flex-col-reverse gap-4 md:flex-row">
      <div className="flex gap-3 overflow-x-auto pb-1 md:w-20 md:shrink-0 md:flex-col md:overflow-visible">
        {frames.map((item, thumb) => {
          const done = item.stage === "depois" && item.run.status === "done" && !("error" in item.run.result) ? item.run.result : null;
          return (
            <button key={item.key} type="button" onClick={() => onIndex(thumb)} aria-label={item.stage === "antes" ? "Foto original" : "Resultado"} aria-current={thumb === index} className={`relative h-24 w-[4.5rem] shrink-0 overflow-hidden rounded-xl bg-[var(--areia)]/40 transition-all md:h-[6.5rem] md:w-20 ${thumb === index ? "ring-2 ring-[var(--ink)] ring-offset-2 ring-offset-[var(--paper)]" : "opacity-60 hover:opacity-100"}`}>
              {item.stage === "antes" || done ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={done ? done.image : item.photo} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center">{item.run.status === "loading" ? <AnalyzingImage className="h-6 w-6 text-[var(--terra)]" /> : <span className="sans text-[9px] uppercase text-[var(--muted)]">{item.run.status === "done" ? "erro" : "depois"}</span>}</span>
              )}
              <span className="sans absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-1 pb-1 pt-3 text-[8px] uppercase tracking-[.1em] text-white">{item.stage}</span>
            </button>
          );
        })}
      </div>

      <div className="min-w-0 flex-1">
        <div className="relative aspect-[3/4] overflow-hidden rounded-[2rem] bg-[var(--areia)]/30 md:aspect-auto md:h-[min(70vh,760px)]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={frame.key + frame.run.status} initial={{ opacity: 0, scale: 1.01 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }} className="absolute inset-0">
              {frame.stage === "antes" || success ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={success ? success.image : frame.photo} alt={success ? `Você vestindo ${product?.name ?? "a peça"}` : "Sua foto original"} className="h-full w-full object-contain" />
              ) : frame.run.status === "loading" || frame.run.status === "idle" ? (
                <div className="flex h-full flex-col items-center justify-center gap-4 px-8 text-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={frame.photo} alt="" className="absolute inset-0 h-full w-full object-contain opacity-25 blur-sm" />
                  <AnalyzingImage className="relative h-12 w-12 text-[var(--terra)]" />
                  <p className="serif-note relative text-xl text-[var(--terra)]">{frame.run.status === "loading" ? "vestindo você…" : "aperte gerar pra ver"}</p>
                </div>
              ) : (
                <div className="flex h-full flex-col items-center justify-center px-8 text-center">
                  <p className="serif-note text-xl text-[#8a3a2c]">ops, não rolou</p>
                  <p className="sans mt-3 max-w-xs text-xs leading-relaxed text-[var(--muted)]">{result && "error" in result ? result.error : "Tente de novo em instantes."}</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <span className="serif-note pointer-events-none absolute left-4 top-4 -rotate-3 rounded-full bg-[var(--paper)]/90 px-4 py-1 text-lg text-[var(--terra)] shadow-sm">{frame.stage === "antes" ? "antes" : "depois"}</span>
          {frames.length > 1 && <>
            <button type="button" onClick={() => go(-1)} aria-label="Imagem anterior" className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--paper)]/90 shadow-md transition-transform hover:scale-105"><ChevronLeft size={20} strokeWidth={1.5} /></button>
            <button type="button" onClick={() => go(1)} aria-label="Próxima imagem" className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--paper)]/90 shadow-md transition-transform hover:scale-105"><ChevronRight size={20} strokeWidth={1.5} /></button>
          </>}
        </div>

        {success && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-[var(--creme)] px-5 py-4">
            <div>
              <p className="text-lg leading-tight">{product?.name}</p>
              <p className="sans mt-1 text-[11px] text-[var(--muted)]">Pose: {success.poseLabel.toLowerCase()} · vestimos {success.shown} · <span title="custo real da geração">{money(success.cost)}</span></p>
            </div>
            <button type="button" onClick={() => void downloadImage(success.image, `merano-${success.productId}-${success.pose}`)} className="sans flex items-center gap-2 rounded-full border border-[var(--ink)] px-4 py-2 text-[10px] uppercase tracking-[.12em] transition-colors hover:bg-[var(--ink)] hover:text-[var(--creme)]"><Download size={13} /> Baixar foto</button>
          </div>
        )}
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
  const [error, setError] = useState("");
  const [slots, setSlots] = useState<Record<SlotKey, Slot>>({ principal: EMPTY_SLOT });
  // The viewer remembers which frame is showing by key, since frames come and go as photos are added.
  const [frameKey, setFrameKey] = useState<string | null>(null);
  const versions = useRef<Record<SlotKey, number>>({ principal: 0 });
  const viewerRef = useRef<HTMLDivElement>(null);

  const patch = (key: SlotKey, changes: Partial<Slot>) => setSlots((current) => ({ ...current, [key]: { ...current[key], ...changes } }));

  async function handleFile(key: SlotKey, file: File | null) {
    if (!file || !file.type.startsWith("image/")) return;
    const version = ++versions.current[key];
    const photo = await readImage(file);
    if (version !== versions.current[key]) return;
    patch(key, { photo, people: null, target: null, analyzing: true, run: { status: "idle" } });
    setError("");
    setFrameKey(`${key}-antes`);
    // Finds who is in the photo so the customer can pick one when there are several.
    try {
      const response = await fetch("/api/people", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ personPhoto: photo }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      if (version === versions.current[key]) patch(key, { people: { boxes: data.people, total: data.total } });
    } catch {
      // Without the analysis we go ahead as if the photo had a single person.
    } finally {
      if (version === versions.current[key]) patch(key, { analyzing: false });
    }
  }

  const needsChoice = (slot: Slot) => !!slot.photo && !!slot.people && slot.people.boxes.length >= 2;
  const filledKeys = (Object.keys(slots) as SlotKey[]).filter((key) => slots[key].photo);
  const loading = filledKeys.some((key) => slots[key].run.status === "loading");
  const analyzing = filledKeys.some((key) => slots[key].analyzing);

  async function generate(key: SlotKey, product: Product) {
    const slot = slots[key];
    patch(key, { run: { status: "loading" } });
    try {
      // With several people in the photo, the server is told which one to dress (a lone big person among small
      // background ones is chosen automatically). It then detects that person's pose and picks the matching shirt view.
      const { people, photo } = slot;
      const box = people && people.total >= 2 ? (people.boxes.length === 1 ? people.boxes[0] : people.boxes[slot.target!]) : null;
      const target = box && people ? { box, total: people.total, order: people.boxes.indexOf(box) + 1, candidates: people.boxes.length, crop: await cropPerson(photo!, box) } : undefined;
      const body = { personPhoto: photo, productId: product.id, target, aspectRatio: "3:4", resolution: "1K" };
      const response = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Falha na geração.");
      patch(key, { run: { status: "done", result: { ...(data as Omit<GenerateSuccess, "productId">), productId: product.id } } });
    } catch (generationError) {
      patch(key, { run: { status: "done", result: { error: generationError instanceof Error ? generationError.message : "Falha na geração." } } });
    }
    // The main photo's result is what the customer waits for, so the viewer jumps to it when it lands.
    if (key === "principal") setFrameKey("principal-depois");
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (!selectedProduct) return setError("Escolha uma camisa antes de gerar.");
    if (!slots.principal.photo) return setError("Adicione a sua foto antes de gerar.");
    const unchosen = filledKeys.find((key) => needsChoice(slots[key]) && slots[key].target === null);
    if (unchosen) return setError(`Toque em quem vai vestir a camiseta na ${SLOT_COPY[unchosen].title.toLowerCase()}.`);

    setFrameKey(`${filledKeys[0]}-depois`);
    if (window.matchMedia("(max-width: 767px)").matches) viewerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    for (const key of filledKeys) void generate(key, selectedProduct);
  }

  const frames: Frame[] = filledKeys.flatMap((key) => [
    { key: `${key}-antes`, slot: key, stage: "antes" as const, photo: slots[key].photo!, run: slots[key].run },
    { key: `${key}-depois`, slot: key, stage: "depois" as const, photo: slots[key].photo!, run: slots[key].run },
  ]);
  const frameIndex = Math.max(0, frames.findIndex((frame) => frame.key === frameKey));


  return (
    <main>
      <SiteHeader />

      <section className="grain">
        <div className="mx-auto max-w-360 px-6 pb-14 pt-14 md:px-12 md:pb-20 md:pt-20">
          <p className="serif-note mb-3 text-2xl text-[var(--sol-1)] md:text-3xl">provador virtual</p>
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <h1 className="display text-6xl md:text-8xl">Vista a peça.<br /><i>Antes de comprar.</i></h1>
            <TryOnSteps />
          </div>
        </div>
        <SeaWaves />
    </section>

      <div className="mx-auto grid max-w-360 gap-14 px-6 pb-28 pt-14 md:grid-cols-[minmax(0,.95fr)_minmax(0,1.05fr)] md:gap-16 md:px-12 md:pt-20">
        <form onSubmit={handleSubmit}>
          <HowItWorks />
          <section>
            <div className="mb-5 flex items-baseline gap-4"><span className="sans text-xs text-[var(--sol-1)]">01</span><h2 className="display text-3xl md:text-4xl">A estampa.</h2></div>
            {selectedProduct ? (
              <div className="flex items-center gap-4 rounded-[1.75rem] bg-[var(--creme)] p-3 pr-5 shadow-[0_18px_40px_-30px_rgba(32,28,23,.55)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={selectedProduct.image} alt={selectedProduct.name} className="h-24 w-20 shrink-0 rounded-2xl bg-[var(--areia)] object-cover" />
                <div className="min-w-0 flex-1"><p className="truncate text-2xl leading-tight">{selectedProduct.name}</p><p className="sans mt-1 text-[10px] uppercase tracking-[.1em] text-[var(--muted)]">{selectedProduct.note}</p></div>
                <button type="button" onClick={() => setPickerOpen((open) => !open)} className="sans shrink-0 rounded-full border border-[var(--ink)] px-4 py-2 text-[10px] uppercase tracking-[.12em] transition-colors hover:bg-[var(--ink)] hover:text-[var(--creme)]">{pickerOpen ? "Fechar" : "Trocar"}</button>
              </div>
            ) : (
              <button type="button" onClick={() => setPickerOpen((open) => !open)} className="group flex w-full items-center justify-between rounded-[1.75rem] bg-[var(--areia)]/30 px-6 py-5 text-left transition-colors hover:bg-[var(--areia)]/45">
                <span><span className="display block text-2xl">Escolher camiseta</span><span className="sans text-[11px] text-[var(--muted)]">{products.length} estampas da coleção</span></span>
                <ShirtFan size={52} />
              </button>
            )}
            <AnimatePresence>{pickerOpen && <ShirtPicker selected={selectedProduct} onSelect={(product) => { setSelectedProduct(product); setPickerOpen(false); setError(""); }} onClose={() => setPickerOpen(false)} />}</AnimatePresence>
          </section>

          <section className="mt-14">
            <div className="mb-5 flex items-baseline gap-4"><span className="sans text-xs text-[var(--sol-1)]">02</span><h2 className="display text-3xl md:text-4xl">Sua foto.</h2></div>
            <PhotoDrop slot={slots.principal} slotKey="principal" onFile={(file) => void handleFile("principal", file)} />
            <ul className="sans mt-4 flex flex-wrap gap-x-5 gap-y-1 text-[11px] text-[var(--muted)]">
              <li>· Boa luz, sem filtro</li>
              <li>· Mais de uma pessoa? Você escolhe quem veste</li>
            </ul>
            {needsChoice(slots.principal) && <PersonChooser slot={slots.principal} label="sua foto" onChoose={(index) => { patch("principal", { target: index }); setError(""); }} />}
          </section>

          <section className="mt-14">
            <button type="submit" disabled={loading || analyzing} className="sans flex w-full items-center justify-between rounded-full bg-gradient-to-r from-[var(--sol-1)] to-[var(--sol-2)] px-7 py-5 text-[13px] font-semibold uppercase tracking-[.12em] text-[var(--origem)] shadow-[0_18px_40px_-20px_rgba(243,124,34,.8)] transition-transform hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60 disabled:hover:translate-y-0">
              <span>{loading ? "Vestindo você…" : analyzing ? "Analisando a foto…" : "Gerar provador virtual"}</span>
              <span aria-hidden>↗</span>
            </button>
            {error && <p role="alert" className="sans mt-4 w-fit -rotate-1 rounded-full bg-[#8a3a2c] px-4 py-2 text-xs text-white">{error}</p>}
          </section>
        </form>

        <div ref={viewerRef} className="scroll-mt-24 md:sticky md:top-28 md:h-fit">
          <TryOnViewer frames={frames} index={frameIndex} onIndex={(index) => setFrameKey(frames[index].key)} product={selectedProduct} />
        </div>
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
