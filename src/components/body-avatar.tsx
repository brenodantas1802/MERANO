"use client";

import { motion } from "motion/react";
import { measure, type BodyProfile } from "@/lib/body-profile";

// Stylised front-view mannequin drawn from the customer's measurements. Widths come from circumferences
// (a torso section is roughly an ellipse whose depth is ~70% of its width), so it reads proportionally
// rather than exactly. Missing measurements fall back to typical proportions and stay unlabelled.
const PX_PER_CM = 2.4;
const CENTER = 140;
const FLOOR = 505;
const REFERENCE_HEIGHT = 170;
const halfWidth = (circumference: number) => (circumference / (1.7 * Math.PI)) * PX_PER_CM;

type Point = [number, number];

// Smooth closed path through the points (midpoint quadratic curves).
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

function useFigure(profile: BodyProfile) {
  const busto = measure(profile, "busto") ?? 92;
  const cintura = measure(profile, "cintura") ?? busto * 0.8;
  const quadril = measure(profile, "quadril") ?? busto * 1.04;
  const ombro = measure(profile, "ombro") ?? busto * 0.43;
  const altura = measure(profile, "altura") ?? REFERENCE_HEIGHT;

  const height = Math.min(470, Math.max(360, altura * PX_PER_CM * 1.12));
  const top = FLOOR - height;
  const y = (fraction: number) => top + fraction * height;

  const bust = halfWidth(busto);
  const waist = halfWidth(cintura);
  const hip = halfWidth(quadril);
  const shoulder = Math.max((ombro / 2) * PX_PER_CM, bust * 0.9);
  const neck = 13;

  // Right half from the neck down to the foot and back up the inside of the leg; mirrored for the left.
  const right: Point[] = [
    [neck, y(0.15)],
    [shoulder, y(0.18)],
    [bust * 1.02, y(0.235)],
    [bust, y(0.285)],
    [waist, y(0.4)],
    [hip, y(0.5)],
    [hip * 0.92, y(0.6)],
    [hip * 0.52, y(0.76)],
    [hip * 0.34, y(0.95)],
    [hip * 0.42, y(1)],
    [hip * 0.1, y(1)],
    [hip * 0.1, y(0.95)],
    [hip * 0.12, y(0.76)],
    [3, y(0.54)],
  ];
  const outline = [...right, ...[...right].reverse().map(([x, py]): Point => [-x, py])].map(([x, py]): Point => [CENTER + x, py]);
  const arm = (side: 1 | -1) => {
    const x = (value: number) => CENTER + side * value;
    return `M${x(shoulder - 4)} ${y(0.19)} Q${x(shoulder + 16)} ${y(0.3)} ${x(Math.max(hip, bust) + 14)} ${y(0.48)}`;
  };

  return {
    body: smoothPath(outline),
    armRight: arm(1),
    armLeft: arm(-1),
    head: { cx: CENTER, cy: y(0.07), rx: height * 0.045, ry: height * 0.062 },
    y,
    top,
    edges: { shoulder, bust, waist, hip, leg: hip * 0.52 },
  };
}

const SPRING = { type: "spring", stiffness: 120, damping: 18 } as const;

export function BodyAvatar({ profile, className }: { profile: BodyProfile; className?: string }) {
  const figure = useFigure(profile);
  const value = (field: keyof BodyProfile) => measure(profile, field);

  const callouts = [
    { field: "ombro", label: "Ombros", at: 0.18, edge: figure.edges.shoulder },
    { field: "busto", label: "Busto", at: 0.285, edge: figure.edges.bust },
    { field: "cintura", label: "Cintura", at: 0.4, edge: figure.edges.waist },
    { field: "quadril", label: "Quadril", at: 0.5, edge: figure.edges.hip },
    { field: "entrepernas", label: "Entrepernas", at: 0.76, edge: figure.edges.leg },
  ] as const;
  const altura = value("altura");

  return <svg viewBox="0 0 360 520" className={className} role="img" aria-label="Manequim com as suas medidas">
    <line x1="20" y1={FLOOR + 4} x2="340" y2={FLOOR + 4} stroke="var(--ink)" strokeOpacity={0.15} strokeWidth={1} />
    <motion.ellipse initial={false} animate={figure.head} transition={SPRING} fill="var(--areia)" fillOpacity={0.55} stroke="var(--ink)" strokeWidth={1.4} />
    <motion.path initial={false} animate={{ d: figure.armLeft }} transition={SPRING} fill="none" stroke="var(--ink)" strokeWidth={9} strokeOpacity={0.12} strokeLinecap="round" />
    <motion.path initial={false} animate={{ d: figure.armRight }} transition={SPRING} fill="none" stroke="var(--ink)" strokeWidth={9} strokeOpacity={0.12} strokeLinecap="round" />
    <motion.path initial={false} animate={{ d: figure.body }} transition={SPRING} fill="var(--areia)" fillOpacity={0.55} stroke="var(--ink)" strokeWidth={1.4} strokeLinejoin="round" />

    {callouts.map(({ field, label, at, edge }) => {
      const cm = value(field);
      if (!cm) return null;
      const lineY = figure.y(at);
      return <motion.g key={field} initial={{ opacity: 0 }} animate={{ opacity: 1, y: 0 }} transition={SPRING}>
        <motion.line initial={false} animate={{ x1: CENTER - edge, x2: 262, y1: lineY, y2: lineY }} transition={SPRING} stroke="var(--sol-1)" strokeWidth={1.3} strokeDasharray="2 4" />
        <motion.circle initial={false} animate={{ cx: 262, cy: lineY }} transition={SPRING} r={2.5} fill="var(--sol-1)" />
        <motion.text initial={false} animate={{ x: 270, y: lineY - 3 }} transition={SPRING} className="script" fontSize="17" fill="var(--terra)">{label}</motion.text>
        <motion.text initial={false} animate={{ x: 270, y: lineY + 13 }} transition={SPRING} className="sans" fontSize="11" letterSpacing="1" fill="var(--ink)">{cm} cm</motion.text>
      </motion.g>;
    })}

    {altura && <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <motion.line initial={false} animate={{ y1: figure.top, y2: FLOOR }} transition={SPRING} x1="38" x2="38" stroke="var(--sol-1)" strokeWidth={1.3} />
      <motion.line initial={false} animate={{ y1: figure.top, y2: figure.top }} transition={SPRING} x1="32" x2="44" stroke="var(--sol-1)" strokeWidth={1.3} />
      <line x1="32" x2="44" y1={FLOOR} y2={FLOOR} stroke="var(--sol-1)" strokeWidth={1.3} />
      <text x="26" y={(figure.top + FLOOR) / 2} transform={`rotate(-90 26 ${(figure.top + FLOOR) / 2})`} textAnchor="middle" className="sans" fontSize="11" letterSpacing="1" fill="var(--ink)">{altura} cm</text>
    </motion.g>}

  </svg>;
}
