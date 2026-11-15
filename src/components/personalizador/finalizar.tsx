"use client";

import { ShoppingBag } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/components/cart-provider";
import { formatPrice } from "@/lib/products";
import { MODELAGENS, PRECO_PERSONALIZADA, TAMANHOS, escritaDe, fonteDe, nomeDaCor, type Ficha, type Painel, type Tamanho } from "@/lib/estampa";

// A small picture for the cart: the art on the shirt colour. The full art is stored in Supabase, not in the browser.
async function miniatura(arte: string, malha: string): Promise<string> {
  const imagem = new Image();
  imagem.src = arte;
  await imagem.decode();
  const canvas = document.createElement("canvas");
  canvas.width = 240;
  canvas.height = 300;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = malha;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const escala = Math.min(200 / imagem.width, 260 / imagem.height);
  const w = imagem.width * escala;
  const h = imagem.height * escala;
  ctx.drawImage(imagem, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
  return canvas.toDataURL("image/jpeg", 0.8);
}

type Props = { painel: Painel; ficha: Ficha; arte: string; referencias: number; className?: string };

export function Finalizar({ painel, ficha, arte, referencias, className = "" }: Props) {
  const { addItem, openDrawer } = useCart();
  const [tamanho, setTamanho] = useState<Tamanho | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [salvaComo, setSalvaComo] = useState<string | null>(null);
  // The "I designed it myself" effect (Franke et al. 2010): the name goes on the "Criado por você" card in the package.
  const [assinatura, setAssinatura] = useState("");

  async function adicionar() {
    if (!arte) return setErro("Crie a estampa antes de adicionar ao carrinho.");
    if (!tamanho) return setErro("Escolha o tamanho.");
    setErro("");
    setSalvando(true);
    try {
      const response = await fetch("/api/estampa/salvar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ painel, ficha, tamanho, referencias, arte, assinatura: assinatura.trim() || undefined }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não consegui guardar a sua criação.");
      const modelagem = MODELAGENS.find((m) => m.id === painel.modelagem)?.nome ?? "";
      addItem({
        id: `criacao-${data.id}`,
        criacaoId: data.id,
        name: `Camiseta personalizada MERANNO${ficha.texto ? ` · ${ficha.texto}` : ""}`,
        price: PRECO_PERSONALIZADA,
        size: tamanho,
        fit: modelagem,
        color: `${nomeDaCor(painel.paleta[0])} · frente ${escritaDe(painel.fonte)} em ${fonteDe(painel.fonte).nome}${assinatura.trim() ? ` · criado por ${assinatura.trim()}` : ""}`,
        image: await miniatura(arte, painel.paleta[0]),
      });
      setSalvaComo(arte);
      openDrawer();
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Não consegui guardar a sua criação.");
    } finally {
      setSalvando(false);
    }
  }

  const jaNoCarrinho = salvaComo === arte;

  return <div className={`border-t border-[var(--pz-linha)] bg-[var(--pz-creme)] px-6 py-4 ${className}`}>
    <label className="block">
      <span className="pz-rotulo">Criado por você</span>
      <input value={assinatura} onChange={(e) => setAssinatura(e.target.value.slice(0, 24))} maxLength={24} placeholder="Seu nome no cartão da embalagem (opcional)" className="mt-1.5 h-11 w-full rounded-full border border-[var(--pz-borda)] bg-[var(--pz-campo)] px-4 text-[14px] text-[var(--pz-tinta)] outline-none placeholder:text-[var(--pz-apagado)] focus:border-[var(--pz-vinho)]/60" />
    </label>
    <div className="mt-3 flex items-center justify-between gap-3">
      <span className="pz-rotulo">Tamanho</span>
      <span className="text-[15px] font-semibold text-[var(--pz-tinta)]">{formatPrice(PRECO_PERSONALIZADA)}</span>
    </div>
    <div className="mt-2.5 grid grid-cols-5 gap-1.5">
      {TAMANHOS.map((t) => <button key={t} type="button" aria-pressed={tamanho === t} onClick={() => setTamanho(t)} className={`h-11 text-[13px] font-semibold transition-colors ${tamanho === t ? "bg-[var(--pz-vinho)] text-[var(--pz-creme)]" : "border border-[var(--pz-linha)] bg-[var(--pz-cartao)] text-[var(--pz-tinta)] hover:border-[var(--pz-borda)]"}`}>{t}</button>)}
    </div>
    <button type="button" onClick={adicionar} disabled={salvando || jaNoCarrinho} className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-[var(--pz-vinho)] px-4 py-3 text-[14px] font-semibold text-[var(--pz-creme)] transition-opacity hover:opacity-90 disabled:opacity-50">
      <ShoppingBag size={16} strokeWidth={1.8} /> {salvando ? "Guardando a sua criação…" : jaNoCarrinho ? "No carrinho" : "Adicionar ao carrinho"}
    </button>
    {!arte && <p className="mt-2 text-center text-[12px] text-[var(--pz-suave)]">Crie a estampa no chat para liberar o carrinho.</p>}
    {erro && <p className="mt-2 text-center text-[12px] text-[var(--pz-vinho)]">{erro}</p>}
  </div>;
}
