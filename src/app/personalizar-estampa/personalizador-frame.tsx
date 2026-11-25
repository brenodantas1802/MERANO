"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useCart } from "@/components/cart-provider";
import { precoPersonalizada } from "@/lib/products";
import { TAMANHOS_LOJA } from "@/lib/products";

// The programmer's Personalizador in an iframe. "Comprar esta peça" in there (js/meranno-compra.js) saves the
// creation on the server and then sends it here, to go into the store's cart.
type Mensagem = { tipo: "meranno:carrinho"; item: { criacaoId: string; preco: number; tamanho: string; modelagem: string; cor: string; imagem: string } };

function valida(dados: unknown): dados is Mensagem {
  const item = (dados as Mensagem | null)?.item;
  return (dados as Mensagem | null)?.tipo === "meranno:carrinho" && !!item
    && /^[0-9a-f-]{36}$/.test(item.criacaoId) && (TAMANHOS_LOJA as readonly string[]).includes(item.tamanho)
    && typeof item.modelagem === "string" && item.modelagem.length <= 30 && typeof item.cor === "string" && item.cor.length <= 40
    && typeof item.imagem === "string" && item.imagem.startsWith("data:image/jpeg;base64,") && item.imagem.length < 300_000;
}

// The editor is heavy (its own fonts, scripts and the AI chat): it loads only when the customer taps "Começar"
// (owners, 2026-11-22), so the page itself opens at once on any phone. Someone who already opened it in this tab
// (and comes back to the page) goes straight in.
const SESSAO = "meranno-personalizador-aberto";
const nada = () => () => {};
const jaAbriu = () => {
  try {
    return window.sessionStorage.getItem(SESSAO) === "1";
  } catch {
    return false;
  }
};

// Starts downloading the editor while the finger or the mouse is on the button, so it opens faster.
let aquecido = false;
function aquecer() {
  if (aquecido) return;
  aquecido = true;
  for (const href of ["/personalizador/index.html", "/personalizador/js/app.js", "/personalizador/css/styles.css"]) {
    const link = document.createElement("link");
    link.rel = "prefetch";
    link.href = href;
    document.head.append(link);
  }
}

const ALTURA = "h-[calc(100svh-var(--header-h,64px))]";

export function PersonalizadorFrame() {
  const frame = useRef<HTMLIFrameElement>(null);
  const { addItem, openDrawer } = useCart();
  const voltou = useSyncExternalStore(nada, jaAbriu, () => false);
  const [tocou, setTocou] = useState(false);
  const [pronto, setPronto] = useState(false);
  const aberto = tocou || voltou;

  useEffect(() => {
    function receber(event: MessageEvent) {
      if (event.origin !== window.location.origin || event.source !== frame.current?.contentWindow || !valida(event.data)) return;
      const { criacaoId, tamanho, modelagem, cor, imagem } = event.data.item;
      // The price shown is the catalogue's; the order is priced again on the server either way.
      addItem({ id: `criacao-${criacaoId}`, criacaoId, name: `Personalizada · ${modelagem}`, price: precoPersonalizada(), size: tamanho, fit: modelagem, color: cor, image: imagem });
      openDrawer();
    }
    window.addEventListener("message", receber);
    return () => window.removeEventListener("message", receber);
  }, [addItem, openDrawer]);

  function abrir() {
    try { window.sessionStorage.setItem(SESSAO, "1"); } catch { /* it just asks again next time */ }
    setTocou(true);
  }

  if (!aberto) return <section className={`${ALTURA} grid min-h-[34rem] items-center gap-8 overflow-hidden px-6 py-10 md:grid-cols-2 md:gap-14 md:px-12`}>
    <div className="order-2 md:order-1 md:pl-[6vw]">
      <div className="rule-latao mb-5 w-16" />
      <p className="label text-[12px] text-[var(--latao)]">Personalizador</p>
      <h1 className="display mt-2 text-[clamp(2.8rem,7vw,5.5rem)]">A sua estampa.</h1>
      <p className="mt-4 max-w-md text-[17px] leading-snug text-[var(--muted)]">Escolha a cor da camiseta, conte a sua ideia e a nossa IA cria a estampa. Você ajusta, vê na peça e compra.</p>
      <button type="button" onClick={abrir} onPointerEnter={aquecer} onTouchStart={aquecer} onFocus={aquecer} className="btn-ouro press mt-8 inline-flex h-12 items-center rounded-full px-8 text-[13px] font-medium uppercase tracking-[.14em] text-[#551E2B]">Começar</button>
    </div>
    <div className="order-1 mx-auto w-[min(70vw,22rem)] overflow-hidden rounded-[28px] bg-[#0c0909] md:order-2 md:w-[min(34vw,26rem)]">
      {/* eslint-disable-next-line @next/next/no-img-element -- small pre-sized image, the plain tee waiting for a print */}
      <img src="/imagens/personalizador-banner.webp" alt="Camiseta regular Meranno com a estampa Match Point nas costas" width={600} height={800} className="h-auto w-full" />
    </div>
  </section>;

  return <div className={`relative ${ALTURA}`}>
    {!pronto && <div role="status" className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-[var(--muted)]">
      <span className="h-9 w-9 animate-spin rounded-full border-2 border-[var(--latao)] border-t-transparent" aria-hidden />
      <span className="sans text-[12px] uppercase tracking-[.16em]">Abrindo o Personalizador…</span>
    </div>}
    <iframe ref={frame} src="/personalizador/index.html" onLoad={() => setPronto(true)} data-preco={precoPersonalizada()} title="Personalizador MERANNO" allow="fullscreen; clipboard-write" className={`block h-full w-full border-0 transition-opacity duration-300 ${pronto ? "opacity-100" : "opacity-0"}`} />
  </div>;
}
