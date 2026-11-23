"use client";

import { useEffect, useRef } from "react";
import { useCart } from "@/components/cart-provider";
import { PRECO_PERSONALIZADA } from "@/lib/estampa";
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

export function PersonalizadorFrame() {
  const frame = useRef<HTMLIFrameElement>(null);
  const { addItem, openDrawer } = useCart();

  useEffect(() => {
    function receber(event: MessageEvent) {
      if (event.origin !== window.location.origin || event.source !== frame.current?.contentWindow || !valida(event.data)) return;
      const { criacaoId, tamanho, modelagem, cor, imagem } = event.data.item;
      // The price shown is the catalogue's; the order is priced again on the server either way.
      addItem({ id: `criacao-${criacaoId}`, criacaoId, name: `Personalizada · ${modelagem}`, price: PRECO_PERSONALIZADA, size: tamanho, fit: modelagem, color: cor, image: imagem });
      openDrawer();
    }
    window.addEventListener("message", receber);
    return () => window.removeEventListener("message", receber);
  }, [addItem, openDrawer]);

  return <iframe ref={frame} src="/personalizador/index.html" data-preco={PRECO_PERSONALIZADA} title="Personalizador MERANNO" allow="fullscreen; clipboard-write" className="block h-[calc(100svh-var(--header-h,64px))] w-full border-0" />;
}
