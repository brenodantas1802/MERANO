"use client";

import { motion } from "motion/react";
import { measure, type BodyProfile } from "@/lib/body-profile";
import type { SizeRow } from "@/lib/products";
import { FRONT_CUTOUT } from "@/lib/shirt-stories";

// A fashion-croquis figure built from the customer's measurements, wearing the photo of our tee in the chosen size
// and relaxed linen trousers. Body widths come from circumferences (a torso section is roughly an ellipse whose depth
// is ~70% of its width); legs take their volume from the hips and from weight-for-height.
const W = 400;
const H = 560;
const CENTER = 150;
const FLOOR = 520;
const PX_PER_CM = 2.4;
const halfWidth = (circumference: number) => (circumference / (1.7 * Math.PI)) * PX_PER_CM;
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

// Landmarks on the 1200 × 1180 front cutout (FRONT_CUTOUT, small render).
const TEE = { width: 1200, height: 1180, neckX: 600, collarTop: 48, bodyWidth: 790, hem: 1168, shoulder: [192, 205], sleeveEnd: [52, 575] } as const;

type Point = [number, number];

function smoothPath(points: Point[]) {
  const mid = (a: Point, b: Point): Point => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const start = mid(points[points.length - 1], points[0]);
  let d = `M${start[0].toFixed(1)} ${start[1].toFixed(1)}`;
  points.forEach((point, index) => {
    const end = mid(point, points[(index + 1) % points.length]);
    d += ` Q${point[0].toFixed(1)} ${point[1].toFixed(1)} ${end[0].toFixed(1)} ${end[1].toFixed(1)}`;
  });
  return `${d} Z`;
}
const mirror = (right: Point[]) => [...right, ...[...right].reverse().map(([x, y]): Point => [-x, y])].map(([x, y]): Point => [CENTER + x, y]);

// A limb as a tapered capsule from `from` to `to`.
function limb(from: Point, to: Point, startWidth: number, endWidth: number) {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const length = Math.hypot(dx, dy) || 1;
  const nx = -dy / length;
  const ny = dx / length;
  const p = (point: Point, width: number, side: 1 | -1): Point => [point[0] + nx * width * side, point[1] + ny * width * side];
  return smoothPath([p(from, startWidth, 1), p([from[0] + dx * 0.5, from[1] + dy * 0.5], (startWidth + endWidth) / 2 + 0.6, 1), p(to, endWidth, 1), [to[0] + (dx / length) * endWidth, to[1] + (dy / length) * endWidth], p(to, endWidth, -1), p([from[0] + dx * 0.5, from[1] + dy * 0.5], (startWidth + endWidth) / 2 + 0.6, -1), p(from, startWidth, -1)]);
}

function figureFor(profile: BodyProfile, size: SizeRow) {
  const busto = measure(profile, "busto") ?? 96;
  const cintura = measure(profile, "cintura") ?? busto * 0.84;
  const quadril = measure(profile, "quadril") ?? busto * 1.03;
  const altura = measure(profile, "altura") ?? 172;
  const peso = measure(profile, "peso");
  const build = peso ? clamp(1 + (peso / (altura / 100) ** 2 - 22) * 0.035, 0.85, 1.45) : 1;

  const height = clamp(altura * 2.7, 400, 486);
  const top = FLOOR - height;
  const y = (fraction: number) => top + fraction * height;
  const vertical = height / altura;

  const bust = halfWidth(busto);
  const waist = halfWidth(cintura);
  const hip = halfWidth(quadril);
  const neckBase = y(0.165);

  // The tee: width from the chart's chest measurement (worn, it drapes to ~85% of the flat width), length from the chart.
  const teeScaleX = (size.largura * PX_PER_CM * 0.85) / TEE.bodyWidth;
  const teeLength = size.comprimento * vertical;
  const teeScaleY = teeLength / (TEE.hem - TEE.collarTop);
  const tee = { x: CENTER - TEE.neckX * teeScaleX, y: neckBase - 10 - TEE.collarTop * teeScaleY, width: TEE.width * teeScaleX, height: TEE.height * teeScaleY };
  const at = ([ix, iy]: readonly [number, number], side: 1 | -1): Point => [CENTER + (ix - TEE.neckX) * teeScaleX * side * -1, tee.y + iy * teeScaleY];

  // Forearms leave the sleeve at the elbow and hang naturally toward the hip, ending in a hand.
  const teeHalf = (size.largura * PX_PER_CM * 0.85) / 2;
  const arm = (side: 1 | -1) => {
    const sleeve = at(TEE.sleeveEnd, side);
    const outward = sleeve[0] < CENTER ? -1 : 1;
    const target: Point = [CENTER + outward * (Math.max(hip * 1.05, teeHalf * 0.96) + 7 + build * 2), y(0.54)];
    const dx = target[0] - sleeve[0];
    const dy = target[1] - sleeve[1];
    const length = Math.hypot(dx, dy);
    const ux = dx / length;
    const uy = dy / length;
    const start: Point = [sleeve[0] - ux * 16, sleeve[1] - uy * 16];
    return { path: limb(start, target, 7.2 * build ** 0.75, 4.6 * build ** 0.55), hand: { cx: target[0] + ux * 5, cy: target[1] + uy * 8, rx: 4.8, ry: 7.6 } };
  };

  // Relaxed straight-leg linen trousers: fuller with the hips and the build.
  const extra = build - 1;
  const legOuter = hip * (1.02 + extra * 0.06);
  const hemOuter = hip * (0.74 + extra * 0.1);
  const trousers = mirror([
    [waist * 1.02, y(0.43)],
    [hip * 1.05, y(0.5)],
    [legOuter, y(0.6)],
    [hip * (0.86 + extra * 0.08), y(0.78)],
    [hemOuter, y(0.955)],
    [hip * 0.12, y(0.955)],
    [hip * 0.1, y(0.78)],
    [hip * 0.05, y(0.6)],
    [0.5, y(0.545)],
  ]);
  const torso = mirror([[11, neckBase - 4], [bust * 1.12, y(0.2)], [bust, y(0.29)], [waist, y(0.4)], [hip, y(0.5)]]);

  return {
    tee,
    torso: smoothPath(torso),
    trousers: smoothPath(trousers),
    crease: [`M${CENTER - hip * 0.48} ${y(0.6)} L${CENTER - hip * 0.43} ${y(0.95)}`, `M${CENTER + hip * 0.48} ${y(0.6)} L${CENTER + hip * 0.43} ${y(0.95)}`],
    neck: smoothPath([[CENTER - 8.5, neckBase + 4], [CENTER - 7.5, y(0.115)], [CENTER + 7.5, y(0.115)], [CENTER + 8.5, neckBase + 4]]),
    head: { cx: CENTER, cy: y(0.068), rx: height * 0.042, ry: height * 0.056 },
    hair: (() => {
      // Cap of short hair over the top of the head, with the hairline dipping slightly at the middle.
      const cx = CENTER, cy = y(0.068), rx = height * 0.042 * 1.05, ry = height * 0.056 * 1.04;
      const line = cy - ry * 0.28;
      const half = rx * Math.sqrt(1 - 0.28 ** 2);
      return `M${cx - half} ${line} A${rx} ${ry} 0 0 1 ${cx + half} ${line} Q${cx} ${cy - ry * 0.02} ${cx - half} ${line} Z`;
    })(),
    armLeft: arm(1),
    armRight: arm(-1),
    shoes: [{ cx: CENTER - hip * 0.44, cy: FLOOR - 3, rx: hip * 0.34, ry: 5.5 }, { cx: CENTER + hip * 0.44, cy: FLOOR - 3, rx: hip * 0.34, ry: 5.5 }],
    y,
    top,
    teeHem: tee.y + TEE.hem * teeScaleY,
    edges: { bust: Math.max(bust, (size.largura * PX_PER_CM * 0.85) / 2), waist: Math.max(waist, (size.largura * PX_PER_CM * 0.85) / 2), hip: Math.max(hip * 1.05, (size.largura * PX_PER_CM * 0.85) / 2) },
  };
}

const SPRING = { type: "spring", stiffness: 110, damping: 20 } as const;
const SKIN = "#dcc0a3";

export function FitFigure({ profile, size, className = "" }: { profile: BodyProfile; size: SizeRow; className?: string }) {
  const figure = figureFor(profile, size);
  const value = (field: keyof BodyProfile) => measure(profile, field);
  const altura = value("altura");
  const callouts = [
    { field: "busto", label: "Busto", at: figure.y(0.27), edge: figure.edges.bust },
    { field: "cintura", label: "Cintura", at: figure.y(0.39), edge: figure.edges.waist },
    { field: "quadril", label: "Quadril", at: figure.y(0.5), edge: figure.edges.hip },
  ] as const;

  return <svg viewBox={`0 0 ${W} ${H}`} className={className} role="img" aria-label={`Figura com as suas medidas vestindo a camiseta Merano no tamanho ${size.size}`}>
    <defs>
      <linearGradient id="fit-skin" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ead4bb" /><stop offset="1" stopColor={SKIN} /></linearGradient>
      <linearGradient id="fit-linen" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#c9b393" /><stop offset=".45" stopColor="#e2d3ba" /><stop offset="1" stopColor="#c4ad8c" /></linearGradient>
      <filter id="fit-shadow" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="10" stdDeviation="9" floodColor="#05181c" floodOpacity=".45" /></filter>
    </defs>

    <motion.ellipse initial={false} animate={{ cx: CENTER, cy: FLOOR + 2, rx: 70, ry: 8 }} fill="#000" fillOpacity={0.22} />

    <g filter="url(#fit-shadow)">
      <motion.path initial={false} animate={{ d: figure.trousers }} transition={SPRING} fill="url(#fit-linen)" />
      {figure.crease.map((d, index) => <motion.path key={index} initial={false} animate={{ d }} transition={SPRING} stroke="#a8916f" strokeOpacity={0.5} strokeWidth={0.9} fill="none" />)}
      {figure.shoes.map((shoe, index) => <motion.ellipse key={index} initial={false} animate={shoe} transition={SPRING} fill="#3a2a1f" />)}
      <motion.path initial={false} animate={{ d: figure.torso }} transition={SPRING} fill="url(#fit-skin)" />
      {[figure.armLeft, figure.armRight].map((arm, index) => <g key={index}>
        <motion.path initial={false} animate={{ d: arm.path }} transition={SPRING} fill="url(#fit-skin)" />
        <motion.ellipse initial={false} animate={arm.hand} transition={SPRING} fill="url(#fit-skin)" />
      </g>)}
      <motion.path initial={false} animate={{ d: figure.neck }} transition={SPRING} fill="url(#fit-skin)" />
      <motion.ellipse initial={false} animate={figure.head} transition={SPRING} fill="url(#fit-skin)" />
      <motion.path initial={false} animate={{ d: figure.hair }} transition={SPRING} fill="#2b2119" />
      <motion.image initial={false} animate={figure.tee} transition={SPRING} href={`${FRONT_CUTOUT.src}-${FRONT_CUTOUT.small}.webp`} preserveAspectRatio="none" />
    </g>

    {callouts.map(({ field, label, at, edge }) => {
      const cm = value(field);
      if (!cm) return null;
      return <motion.g key={field} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <motion.line initial={false} animate={{ x1: CENTER + edge + 6, x2: 292, y1: at, y2: at }} transition={SPRING} stroke="#fabd4b" strokeWidth={1.2} strokeDasharray="2 4" />
        <motion.circle initial={false} animate={{ cx: 292, cy: at }} transition={SPRING} r={2.6} fill="#fabd4b" />
        <motion.text initial={false} animate={{ x: 302, y: at - 3 }} transition={SPRING} className="sans" fontSize="12" fill="#fcf5eb" fillOpacity={0.7}>{label}</motion.text>
        <motion.text initial={false} animate={{ x: 302, y: at + 15 }} transition={SPRING} className="display" fontSize="19" fill="#fcf5eb">{cm} cm</motion.text>
      </motion.g>;
    })}

    {altura && <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <motion.line initial={false} animate={{ y1: figure.top, y2: FLOOR }} transition={SPRING} x1="40" x2="40" stroke="#fabd4b" strokeWidth={1.2} />
      <motion.line initial={false} animate={{ y1: figure.top, y2: figure.top }} transition={SPRING} x1="34" x2="46" stroke="#fabd4b" strokeWidth={1.2} />
      <line x1="34" x2="46" y1={FLOOR} y2={FLOOR} stroke="#fabd4b" strokeWidth={1.2} />
      <text x="28" y={(figure.top + FLOOR) / 2} transform={`rotate(-90 28 ${(figure.top + FLOOR) / 2})`} textAnchor="middle" className="display" fontSize="15" fill="#fcf5eb">{altura} cm</text>
    </motion.g>}
  </svg>;
}
