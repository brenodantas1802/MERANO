"use client";

import { motion } from "motion/react";
import { measure, type BodyProfile } from "@/lib/body-profile";

// Front-view figure drawn from the customer's measurements, wearing a Merano tee. Widths come from circumferences
// (a torso section is roughly an ellipse whose depth is ~70% of its width); limbs take their volume from the hips
// and from weight-for-height, so heavier or curvier profiles get fuller thighs, calves and arms. Missing
// measurements fall back to typical proportions and stay unlabelled.
const PX_PER_CM = 2.4;
const CENTER = 140;
const FLOOR = 505;
const REFERENCE_HEIGHT = 170;
const SKIN = "#e8d3bb";
const SHIRT = "#1f2c3d";
const halfWidth = (circumference: number) => (circumference / (1.7 * Math.PI)) * PX_PER_CM;
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

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

// Straight-edged closed path, for the tee's crisp seams.
const polyPath = (points: Point[]) => `M${points.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(" L")} Z`;

const mirror = (right: Point[]) => [...right, ...[...right].reverse().map(([x, y]): Point => [-x, y])].map(([x, y]): Point => [CENTER + x, y]);

function useFigure(profile: BodyProfile) {
  const busto = measure(profile, "busto") ?? 92;
  const cintura = measure(profile, "cintura") ?? busto * 0.82;
  const quadril = measure(profile, "quadril") ?? busto * 1.04;
  const ombro = measure(profile, "ombro") ?? busto * 0.43;
  const altura = measure(profile, "altura") ?? REFERENCE_HEIGHT;
  const peso = measure(profile, "peso");
  // Weight-for-height sets how full the limbs are: 1 at a typical build, up to ~1.4 for a heavier one.
  const build = peso ? clamp(1 + ((peso / (altura / 100) ** 2) - 22) * 0.035, 0.82, 1.45) : 1;

  const height = Math.min(470, Math.max(360, altura * PX_PER_CM * 1.12));
  const top = FLOOR - height;
  const y = (fraction: number) => top + fraction * height;

  const bust = halfWidth(busto);
  const waist = halfWidth(cintura);
  const hip = halfWidth(quadril);
  const shoulder = Math.max((ombro / 2) * PX_PER_CM, bust * 0.92);
  const neck = 12 + build * 2;
  // Leg and arm fullness grow with build but never past the hips' own width.
  const extra = build - 1;
  const arm = (9.5 + extra * 6) * PX_PER_CM;

  // Body: right half from the neck down the outside of the leg, back up the inside to the crotch; mirrored.
  const body = mirror([
    [neck, y(0.15)],
    [shoulder, y(0.185)],
    [bust * 1.02, y(0.235)],
    [bust, y(0.285)],
    [waist, y(0.4)],
    [hip, y(0.5)],
    [hip * (0.98 + extra * 0.05), y(0.56)],
    [hip * (0.9 + extra * 0.1), y(0.64)],
    [hip * (0.57 + extra * 0.12), y(0.75)],
    [hip * (0.56 + extra * 0.12), y(0.83)],
    [hip * 0.31, y(0.95)],
    [hip * 0.44, y(1)],
    [hip * 0.09, y(1)],
    [hip * 0.12, y(0.95)],
    [hip * (0.13 - extra * 0.04), y(0.84)],
    [hip * (0.14 - extra * 0.05), y(0.75)],
    [hip * Math.max(0.01, 0.06 - extra * 0.08), y(0.62)],
    [2, y(0.535)],
  ]);

  // Arms as filled shapes hanging alongside the torso.
  const armPath = (side: 1 | -1) => {
    const x = (value: number) => CENTER + side * value;
    const armpit = bust * 1.0;
    const elbowIn = Math.max(bust * 0.97, waist) + 3;
    const wristIn = Math.max(waist, hip) + 4;
    const points: Point[] = [
      [x(shoulder - 4), y(0.182)],
      [x(Math.max(shoulder + arm * 0.35, armpit + arm * 0.95)), y(0.235)],
      [x(elbowIn + arm * 0.82), y(0.34)],
      [x(wristIn + arm * 0.58), y(0.465)],
      [x(wristIn + arm * 0.42), y(0.53)],
      [x(wristIn + arm * 0.05), y(0.53)],
      [x(wristIn), y(0.465)],
      [x(elbowIn), y(0.34)],
      [x(armpit), y(0.25)],
    ];
    return smoothPath(points);
  };

  // An oversized Merano tee over the torso: short sleeves to the elbow, hem below the hips.
  const roomy = Math.max(bust, waist, hip) * 1.08;
  const tee = mirror([
    [neck + 7, y(0.152)],
    [shoulder + 4, y(0.18)],
    [Math.max(shoulder + arm * 0.45, bust + arm * 1.05) + 6, y(0.255)],
    [Math.max(bust * 0.97, waist) + arm * 0.95 + 8, y(0.31)],
    [Math.max(bust * 0.97, waist) - 1, y(0.315)],
    [bust * 1.05, y(0.275)],
    [roomy, y(0.38)],
    [roomy * 1.01, y(0.535)],
  ]);

  return {
    body: smoothPath(body),
    tee: polyPath(tee),
    armRight: armPath(1),
    armLeft: armPath(-1),
    head: { cx: CENTER, cy: y(0.066), rx: height * 0.043, ry: height * 0.058 },
    neck: { x: CENTER - neck * 0.75, y: y(0.11), width: neck * 1.5, height: y(0.165) - y(0.11) },
    collar: `M${CENTER - neck - 6} ${y(0.153)} Q${CENTER} ${y(0.185)} ${CENTER + neck + 6} ${y(0.153)}`,
    print: { x: CENTER, y: y(0.27) },
    y,
    top,
    edges: { shoulder: shoulder + 4, bust: roomy, waist: roomy, hip: roomy, leg: hip * (0.9 + extra * 0.1) },
    footWidth: hip * 0.9,
  };
}

const SPRING = { type: "spring", stiffness: 120, damping: 18 } as const;

export function BodyAvatar({ profile, className }: { profile: BodyProfile; className?: string }) {
  const figure = useFigure(profile);
  const value = (field: keyof BodyProfile) => measure(profile, field);

  const callouts = [
    { field: "ombro", label: "Ombros", at: 0.185, edge: figure.edges.shoulder },
    { field: "busto", label: "Busto", at: 0.285, edge: figure.edges.bust },
    { field: "cintura", label: "Cintura", at: 0.4, edge: figure.edges.waist },
    { field: "quadril", label: "Quadril", at: 0.5, edge: figure.edges.hip },
    { field: "entrepernas", label: "Entrepernas", at: 0.68, edge: figure.edges.leg },
  ] as const;
  const altura = value("altura");

  return <svg viewBox="0 0 360 520" className={className} role="img" aria-label="Manequim com as suas medidas, vestindo uma camiseta Merano">
    <defs>
      <radialGradient id="avatar-skin" cx="45%" cy="30%" r="80%"><stop offset="0" stopColor="#f1e1cd" /><stop offset="1" stopColor={SKIN} /></radialGradient>
      <linearGradient id="avatar-tee" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#2b3a50" /><stop offset="1" stopColor={SHIRT} /></linearGradient>
    </defs>
    <motion.ellipse initial={false} animate={{ cx: CENTER, cy: FLOOR + 3, rx: figure.footWidth + 26, ry: 7 }} transition={SPRING} fill="var(--terra-dark)" fillOpacity={0.12} />

    <motion.path initial={false} animate={{ d: figure.armLeft }} transition={SPRING} fill="url(#avatar-skin)" stroke="var(--ink)" strokeOpacity={0.55} strokeWidth={1.1} />
    <motion.path initial={false} animate={{ d: figure.armRight }} transition={SPRING} fill="url(#avatar-skin)" stroke="var(--ink)" strokeOpacity={0.55} strokeWidth={1.1} />
    <motion.path initial={false} animate={{ d: figure.body }} transition={SPRING} fill="url(#avatar-skin)" stroke="var(--ink)" strokeOpacity={0.55} strokeWidth={1.1} strokeLinejoin="round" />
    <motion.rect initial={false} animate={figure.neck} transition={SPRING} rx={4} fill="url(#avatar-skin)" stroke="var(--ink)" strokeOpacity={0.4} strokeWidth={1} />
    <motion.ellipse initial={false} animate={figure.head} transition={SPRING} fill="url(#avatar-skin)" stroke="var(--ink)" strokeOpacity={0.55} strokeWidth={1.1} />

    <motion.path initial={false} animate={{ d: figure.tee }} transition={SPRING} fill="url(#avatar-tee)" />
    <motion.path initial={false} animate={{ d: figure.collar }} transition={SPRING} fill="none" stroke="#3c4c63" strokeWidth={3} strokeLinecap="round" />
    <motion.text initial={false} animate={{ x: figure.print.x, y: figure.print.y }} transition={SPRING} textAnchor="middle" fontSize="7.5" letterSpacing="2.2" fill="#f3e6d1" className="display">MERANO</motion.text>
    <motion.circle initial={false} animate={{ cx: figure.print.x, cy: figure.print.y + 12 }} transition={SPRING} r={4} fill="var(--sol-1)" />

    {callouts.map(({ field, label, at, edge }) => {
      const cm = value(field);
      if (!cm) return null;
      const lineY = figure.y(at);
      return <motion.g key={field} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={SPRING}>
        <motion.line initial={false} animate={{ x1: CENTER + edge + 3, x2: 262, y1: lineY, y2: lineY }} transition={SPRING} stroke="var(--sol-1)" strokeWidth={1.3} strokeDasharray="2 4" />
        <motion.circle initial={false} animate={{ cx: 262, cy: lineY }} transition={SPRING} r={2.5} fill="var(--sol-1)" />
        <motion.text initial={false} animate={{ x: 270, y: lineY - 3 }} transition={SPRING} className="script" fontSize="19" fill="var(--terra)">{label}</motion.text>
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
