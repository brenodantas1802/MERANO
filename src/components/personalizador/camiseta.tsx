"use client";

import { useId } from "react";
import { type EstampaCasaId, type FonteId, type Modelagem, escritaDe, estampaCasaDe, fonteDe } from "@/lib/estampa";

// The tee from the MERANNO prototype: a photo of the black tee (front and back), cut out of the prototype, plus a
// grey shading map of it. Any other colour is that colour under the shading ("overlay" blend), so folds and collar stay.
const FOTO = {
  frente: { foto: "/imagens/personalizador/camiseta-frente.png", sombra: "/imagens/personalizador/camiseta-frente-sombra.png" },
  verso: { foto: "/imagens/personalizador/camiseta-verso.png", sombra: "/imagens/personalizador/camiseta-verso-sombra.png" },
};

// The photo is one fit; the others stretch it the way they sit (wider and dropped, or wider and shorter).
const ESCALA: Record<Modelagem, [number, number]> = { regular: [1, 1], oversized: [1.1, 1.04], boxy: [1.08, 0.9] };

function luminancia(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
}

export type ArteVerso =
  | { tipo: "arte"; src: string }
  | { tipo: "esboco"; svg: string }
  | { tipo: "casa"; id: EstampaCasaId; cor: string }
  | null;

type Props = {
  lado: "frente" | "verso";
  modelagem: Modelagem;
  corMalha: string;
  fonte: FonteId;
  corEscrita: string;
  arte?: ArteVerso;
  textoVerso?: string;
  carregando?: boolean;
  semEscrita?: boolean;
  className?: string;
};

// Print areas, in the 400 × 400 box the photo fills. Measured on the photo: the body runs from 21% to 78% of the width.
const AREA = { x: 120, y: 70, w: 160, h: 212 };

export function Camiseta({ lado, modelagem, corMalha, fonte, corEscrita, arte = null, textoVerso = "", carregando = false, semEscrita = false, className = "" }: Props) {
  const id = useId().replace(/:/g, "");
  const [sx, sy] = ESCALA[modelagem];
  const preta = luminancia(corMalha) < 0.06;
  const clara = luminancia(corMalha) > 0.6;
  const f = fonteDe(fonte);
  const casa = arte?.tipo === "casa" ? estampaCasaDe(arte.id) : undefined;
  const esboco = arte?.tipo === "esboco" ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(arte.svg.includes("xmlns=") ? arte.svg : arte.svg.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"'))}` : undefined;
  const { x, y, w, h } = AREA;
  const contorno = clara ? "rgba(42,26,29,.22)" : "rgba(245,241,232,.22)";

  return (
    <svg viewBox="-40 -16 480 476" className={className} role="img" aria-label={lado === "frente" ? "Frente da camiseta" : "Verso da camiseta"}>
      <defs>
        <filter id={`tingir-${id}`} x="0" y="0" width="1" height="1" colorInterpolationFilters="sRGB">
          <feFlood floodColor={corMalha} result="cor" />
          <feComposite in="cor" in2="SourceAlpha" operator="in" result="base" />
          <feBlend in="SourceGraphic" in2="base" mode="overlay" />
        </filter>
        {casa?.tinta && (
          <mask id={`tinta-${id}`} maskUnits="userSpaceOnUse" x={x} y={y} width={w} height={h}>
            <image href={casa.src} x={x} y={y} width={w} height={h} preserveAspectRatio="xMidYMid meet" />
          </mask>
        )}
      </defs>

      <g transform={`translate(200 200) scale(${sx} ${sy}) translate(-200 -200)`}>
        <g style={{ filter: "drop-shadow(0 14px 18px rgba(20,4,10,.45))" }}>
          {preta
            ? <image href={FOTO[lado].foto} x="0" y="0" width="400" height="400" preserveAspectRatio="xMidYMid meet" />
            : <image href={FOTO[lado].sombra} x="0" y="0" width="400" height="400" preserveAspectRatio="xMidYMid meet" filter={`url(#tingir-${id})`} />}
        </g>
      </g>

      {lado === "frente" ? (
        !semEscrita && <text x="200" y={f.caixa === "livre" ? 104 : 98} textAnchor="middle" fill={corEscrita} style={{ fontFamily: f.css, fontSize: f.caixa === "livre" ? 24 : 15, letterSpacing: `${f.espaco}em` }}>
          {escritaDe(fonte)}
        </text>
      ) : (
        <>
          {arte?.tipo === "arte" && <image href={arte.src} x={x} y={y} width={w} height={h} preserveAspectRatio="xMidYMid meet" />}
          {esboco && <image href={esboco} x={x} y={y} width={w} height={h} preserveAspectRatio="xMidYMid meet" opacity={0.94} />}
          {casa && (casa.tinta
            ? <rect x={x} y={y} width={w} height={h} fill={arte?.tipo === "casa" ? arte.cor : corEscrita} mask={`url(#tinta-${id})`} />
            : <image href={casa.src} x={x} y={y} width={w} height={h} preserveAspectRatio="xMidYMid meet" />)}
          {!arte && !carregando && <rect x={x} y={y} width={w} height={h} fill="none" stroke={contorno} strokeWidth="1" strokeDasharray="4 5" />}
          {carregando && (
            <rect x={x} y={y} width={w} height={h} fill={clara ? "rgba(0,0,0,.07)" : "rgba(255,255,255,.08)"}>
              <animate attributeName="opacity" values=".35;1;.35" dur="1.6s" repeatCount="indefinite" />
            </rect>
          )}
          {textoVerso && (
            <text x="200" y={y + h + 24} textAnchor="middle" fill={corEscrita} style={{ fontFamily: f.css, fontSize: f.caixa === "livre" ? 20 : 13, letterSpacing: `${Math.max(0.04, f.espaco / 2)}em` }}>
              {f.caixa === "alta" ? textoVerso.toUpperCase() : textoVerso}
            </text>
          )}
        </>
      )}
    </svg>
  );
}
