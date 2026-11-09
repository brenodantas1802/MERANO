"use client";

import { useId } from "react";
import { type EstampaCasaId, type FonteId, type Modelagem, escritaDe, estampaCasaDe, fonteDe } from "@/lib/estampa";

// Flat drawing of the tee, by fit. All numbers live in a 400 × 460 box; x is mirrored around 200.
const CORTES: Record<Modelagem, { ombro: number; ombroY: number; manga: [number, number]; punho: [number, number]; axila: number; axilaY: number; barra: number }> = {
  regular: { ombro: 92, ombroY: 58, manga: [150, 150], punho: [118, 176], axila: 104, axilaY: 150, barra: 420 },
  oversized: { ombro: 120, ombroY: 70, manga: [176, 196], punho: [134, 218], axila: 124, axilaY: 178, barra: 432 },
  boxy: { ombro: 112, ombroY: 64, manga: [166, 168], punho: [130, 192], axila: 120, axilaY: 162, barra: 382 },
};

function contorno(m: Modelagem, lado: "frente" | "verso") {
  const c = CORTES[m];
  const gola = lado === "frente" ? 30 : 10;
  const L = (dx: number) => 200 - dx;
  const R = (dx: number) => 200 + dx;
  return [
    `M ${L(38)} 40`,
    `Q 200 ${40 + gola * 2} ${R(38)} 40`,
    `L ${R(c.ombro)} ${c.ombroY}`,
    `L ${R(c.manga[0])} ${c.manga[1]}`,
    `L ${R(c.punho[0])} ${c.punho[1]}`,
    `L ${R(c.axila)} ${c.axilaY}`,
    `L ${R(c.axila + 2)} ${c.barra}`,
    `Q 200 ${c.barra + 6} ${L(c.axila + 2)} ${c.barra}`,
    `L ${L(c.axila)} ${c.axilaY}`,
    `L ${L(c.punho[0])} ${c.punho[1]}`,
    `L ${L(c.manga[0])} ${c.manga[1]}`,
    `L ${L(c.ombro)} ${c.ombroY}`,
    "Z",
  ].join(" ");
}

// Light shirts get dark stitching and shading; dark ones the opposite.
function luminancia(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
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
  className?: string;
};

export function Camiseta({ lado, modelagem, corMalha, fonte, corEscrita, arte = null, textoVerso = "", carregando = false, className = "" }: Props) {
  const id = useId().replace(/:/g, "");
  const c = CORTES[modelagem];
  const clara = luminancia(corMalha) > 0.6;
  const costura = clara ? "rgba(0,0,0,.18)" : "rgba(255,255,255,.14)";
  const f = fonteDe(fonte);

  // Back print area: centred under the collar, sized by the body width so a boxy or oversized tee carries it the same way.
  const largura = c.axila * 1.12;
  const altura = largura * (4 / 3);
  const topo = 96;
  const x = 200 - largura / 2;
  const casa = arte?.tipo === "casa" ? estampaCasaDe(arte.id) : undefined;
  const esboco = arte?.tipo === "esboco" ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(arte.svg.includes("xmlns=") ? arte.svg : arte.svg.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"'))}` : undefined;

  return (
    <svg viewBox="0 0 400 460" className={className} role="img" aria-label={lado === "frente" ? "Frente da camiseta" : "Verso da camiseta"}>
      <defs>
        <clipPath id={`corpo-${id}`}><path d={contorno(modelagem, lado)} /></clipPath>
        <linearGradient id={`luz-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity={clara ? 0.0 : 0.08} />
          <stop offset=".55" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity={clara ? 0.1 : 0.28} />
        </linearGradient>
        {casa?.tinta && (
          <mask id={`tinta-${id}`} maskUnits="userSpaceOnUse" x={x} y={topo} width={largura} height={altura}>
            <image href={casa.src} x={x} y={topo} width={largura} height={altura} preserveAspectRatio="xMidYMid meet" />
          </mask>
        )}
      </defs>

      <g style={{ filter: "drop-shadow(0 18px 22px rgba(0,0,0,.35))" }}>
        <path d={contorno(modelagem, lado)} fill={corMalha} />
      </g>

      <g clipPath={`url(#corpo-${id})`}>
        {lado === "frente" ? (
          <text x="200" y="128" textAnchor="middle" fill={corEscrita} style={{ fontFamily: f.css, fontSize: f.caixa === "livre" ? 26 : 17, letterSpacing: `${f.espaco}em` }}>
            {escritaDe(fonte)}
          </text>
        ) : (
          <>
            {arte?.tipo === "arte" && <image href={arte.src} x={x} y={topo} width={largura} height={altura} preserveAspectRatio="xMidYMid meet" />}
            {esboco && <image href={esboco} x={x} y={topo} width={largura} height={altura} preserveAspectRatio="xMidYMid meet" opacity={0.92} />}
            {casa && (casa.tinta
              ? <rect x={x} y={topo} width={largura} height={altura} fill={arte?.tipo === "casa" ? arte.cor : corEscrita} mask={`url(#tinta-${id})`} />
              : <image href={casa.src} x={x} y={topo} width={largura} height={altura} preserveAspectRatio="xMidYMid meet" />)}
            {!arte && !carregando && (
              <rect x={x} y={topo} width={largura} height={altura} fill="none" stroke={costura} strokeWidth="1.2" strokeDasharray="5 6" rx="4" />
            )}
            {carregando && (
              <rect x={x} y={topo} width={largura} height={altura} rx="4" fill={clara ? "rgba(0,0,0,.08)" : "rgba(255,255,255,.1)"}>
                <animate attributeName="opacity" values=".35;1;.35" dur="1.6s" repeatCount="indefinite" />
              </rect>
            )}
            {textoVerso && (
              <text x="200" y={topo + altura + 26} textAnchor="middle" fill={corEscrita} style={{ fontFamily: f.css, fontSize: f.caixa === "livre" ? 22 : 15, letterSpacing: `${Math.max(0.04, f.espaco / 2)}em` }}>
                {f.caixa === "alta" ? textoVerso.toUpperCase() : textoVerso}
              </text>
            )}
          </>
        )}
        <rect x="0" y="0" width="400" height="460" fill={`url(#luz-${id})`} />
        {/* Hem and cuff stitching */}
        <path d={`M ${200 - c.axila} ${c.barra - 12} Q 200 ${c.barra - 6} ${200 + c.axila} ${c.barra - 12}`} stroke={costura} strokeWidth="1" fill="none" strokeDasharray="3 3" />
      </g>

      {/* Collar band */}
      <path d={`M ${162} 40 Q 200 ${lado === "frente" ? 100 : 60} ${238} 40`} fill="none" stroke={costura} strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}
