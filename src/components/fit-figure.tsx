"use client";

import { useId } from "react";
import { motion } from "motion/react";
import { measure, type BodyProfile } from "@/lib/body-profile";
import type { SizeRow } from "@/lib/products";
import { FRONT_CUTOUT } from "@/lib/shirt-stories";

// A standing figure built from the customer's measurements, wearing the photo of our tee in the chosen size.
// Everything is laid out in centimetres and drawn at S px per cm, so the tee's real width and length land on the
// body where they would. The tee is a flat photo, so the body takes its pose from it: the neck rises out of the
// collar and the arms leave through the sleeve openings, bending at the elbow toward the thighs.
const W = 400;
const H = 580;
const CENTER = 160;
const FLOOR = 552;
const S = 2.62;
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

type Pt = readonly [number, number] | readonly [number, number, 1]; // a third value marks a sharp corner
type Vec = [number, number];

// Landmarks on the 1200 × 1180 front cutout (FRONT_CUTOUT, small render).
const TEE = {
  cx: 607,
  shoulderTop: 40, // where the collar meets the shoulder (the "high point" length is measured from)
  hem: 1168,
  chest: 790, // body width below the sleeves
  collar: [[495, 40], [499, 84], [538, 121], [607, 136], [676, 121], [715, 84], [719, 40]] as Vec[], // inner edge of the front band
  cuffs: { left: [[3, 545], [205, 668]] as Vec[], right: [[1195, 545], [1003, 668]] as Vec[] }, // outer corner → underarm
  // Right edge of the silhouette by row, for placing the measurement callouts.
  edge: [[40, 820], [120, 956], [200, 1010], [280, 1056], [360, 1099], [440, 1141], [520, 1183], [560, 1184], [600, 1115], [640, 1049], [680, 980], [800, 983], [1000, 991], [1168, 991]] as Vec[],
};

const f = (value: number) => value.toFixed(1);
const add = (a: Vec, b: Vec): Vec => [a[0] + b[0], a[1] + b[1]];
const sub = (a: Vec, b: Vec): Vec => [a[0] - b[0], a[1] - b[1]];
const scale = (a: Vec, k: number): Vec => [a[0] * k, a[1] * k];
const unit = (a: Vec): Vec => scale(a, 1 / (Math.hypot(a[0], a[1]) || 1));
const lerp = (a: Vec, b: Vec, t: number): Vec => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const fromAngle = (angle: number): Vec => [Math.sin(angle), Math.cos(angle)]; // 0 points straight down

// Smooth curve through the points (Catmull-Rom as cubic Béziers); every call with the same number of points
// yields the same commands, so motion can morph one body into another.
function curve(points: Pt[], closed = true) {
  const n = points.length;
  const at = (i: number) => points[closed ? (i + n) % n : clamp(i, 0, n - 1)];
  let d = `M${f(points[0][0])} ${f(points[0][1])}`;
  for (let i = 0; i < (closed ? n : n - 1); i++) {
    const [p0, p1, p2, p3] = [at(i - 1), at(i), at(i + 1), at(i + 2)];
    const k1 = p1[2] ? 0 : 1 / 6;
    const k2 = p2[2] ? 0 : 1 / 6;
    d += ` C${f(p1[0] + (p2[0] - p0[0]) * k1)} ${f(p1[1] + (p2[1] - p0[1]) * k1)} ${f(p2[0] - (p3[0] - p1[0]) * k2)} ${f(p2[1] - (p3[1] - p1[1]) * k2)} ${f(p2[0])} ${f(p2[1])}`;
  }
  return closed ? `${d} Z` : d;
}

// Right half (first and last points on the centre line) → the whole outline.
const mirrored = (right: Pt[]): Pt[] => [...right, ...right.slice(1, -1).reverse().map(([x, y, sharp]) => (sharp ? [-x, y, 1] : [-x, y]) as Pt)];

function figureFor(profile: BodyProfile, size: SizeRow) {
  const busto = measure(profile, "busto") ?? 96;
  const cintura = measure(profile, "cintura") ?? busto * 0.86;
  const quadril = measure(profile, "quadril") ?? busto * 1.02;
  const ombro = measure(profile, "ombro") ?? busto * 0.47;
  const altura = clamp(measure(profile, "altura") ?? 174, 148, 196);
  const peso = measure(profile, "peso");
  const build = peso ? clamp(1 + (peso / (altura / 100) ** 2 - 23) * 0.03, 0.86, 1.4) : 1;
  const braco = measure(profile, "braco") ?? altura * 0.335;
  const tronco = measure(profile, "tronco");
  const entrepernas = measure(profile, "entrepernas");
  const tall = altura / 175;

  // Vertical landmarks, in cm from the crown.
  const head = 23 * tall ** 0.45;
  const hps = head + altura * 0.033; // where neck meets shoulder
  const waistY = clamp(tronco ? hps + tronco : altura * 0.405, altura * 0.36, altura * 0.45);
  const ankleY = altura * 0.955;
  const crotchY = clamp(entrepernas ? ankleY - entrepernas : altura * 0.525, altura * 0.48, altura * 0.56);
  const hipY = crotchY - altura * 0.04;
  const kneeY = (crotchY + ankleY) / 2 - altura * 0.012;
  const bustY = hps + altura * 0.075;

  // Half widths of the body seen from the front (a torso section is roughly an ellipse ~70% as deep as wide).
  const chestHalf = busto / (1.75 * Math.PI);
  const waistHalf = cintura / (1.75 * Math.PI);
  const hipHalf = quadril / (1.8 * Math.PI);
  const shoulderHalf = ombro * 0.45;

  // The tee: worn, it drapes to ~82% of its flat width; a tee smaller than the body is stretched over it.
  const teeWidth = Math.max(size.largura * 0.82, chestHalf * 2 + 2, waistHalf * 2 + 2, hipHalf * 2 + 1.5);
  const kx = teeWidth / TEE.chest;
  const ky = size.comprimento / (TEE.hem - TEE.shoulderTop);
  const teeTop = hps - 1.5 - TEE.shoulderTop * ky;
  const img = ([ix, iy]: Vec): Vec => [(ix - TEE.cx) * kx, teeTop + iy * ky];

  // Head, drawn on a 23 cm reference and stretched a little for a heavier build at the cheeks and jaw.
  const hs = head / 23;
  const jaw = (y: number) => 1 + (build - 1) * (y > 12 ? 0.18 + 0.3 * Math.min(1, (y - 12) / 9) : 0.12);
  const hp = (x: number, y: number, sharp?: 1): Pt => (sharp ? [x * hs * jaw(y), y * hs, 1] : [x * hs * jaw(y), y * hs]);
  const headPath = curve(mirrored([hp(0, 0), hp(3.7, 0.4), hp(6.1, 2.0), hp(7.3, 4.6), hp(7.7, 7.8), hp(7.55, 10.8), hp(7.25, 13.6), hp(6.85, 16.2), hp(6.0, 18.6), hp(4.6, 20.7), hp(2.3, 22.5), hp(0, 22.95)]));
  const ear = (side: 1 | -1) => curve([hp(7.2 * side, 9.9), hp(8.55 * side, 9.4), hp(9.2 * side, 10.6), hp(9.05 * side, 12.9), hp(8.6 * side, 14.9), hp(7.7 * side, 16.0), hp(7.1 * side, 15.3)]);
  const earFold = (side: 1 | -1) => curve([hp(7.9 * side, 10.6), hp(8.55 * side, 11.0), hp(8.5 * side, 13.2), hp(8.0 * side, 14.6)], false);
  // A short textured crop, a little fuller on top and swept back.
  const hair = curve([
    hp(7.85, 11.3), hp(8.15, 8.2), hp(8.25, 5.0), hp(7.4, 1.6), hp(5.4, -0.9), hp(2.4, -2.3), hp(-1.2, -2.5), hp(-4.6, -1.7), hp(-7.0, 0.4), hp(-8.2, 3.6), hp(-8.25, 7.4), hp(-7.9, 11.3),
    hp(-7.3, 11.4, 1), hp(-7.2, 8.6), hp(-6.75, 6.4), hp(-5.6, 5.5), hp(-3.6, 4.7), hp(-1.6, 4.3), hp(0.6, 4.25), hp(2.8, 4.45), hp(4.9, 4.95), hp(6.3, 5.9), hp(6.85, 7.0), hp(7.2, 8.6), hp(7.3, 11.4, 1),
  ]);
  const hairStrands = [
    [hp(-5.2, 5.0), hp(-4.6, 2.4), hp(-2.8, -0.6)], [hp(-2.6, 4.4), hp(-1.6, 1.4), hp(0.6, -1.4)], [hp(0.2, 4.2), hp(1.4, 1.4), hp(3.6, -0.9)], [hp(2.8, 4.4), hp(4.2, 2.0), hp(6.0, 0.4)],
    [hp(5.0, 5.0), hp(6.4, 3.4), hp(7.4, 2.2)], [hp(-6.9, 6.0), hp(-7.2, 3.6), hp(-6.0, 1.0)],
  ].map((points) => curve(points, false));
  // Features, crisp: tapered brows, almond eyes with iris and lid line, nose wings, lips.
  const brows = ([-1, 1] as const).map((side) => curve([hp(1.05 * side, 10.25), hp(2.2 * side, 9.6), hp(3.5 * side, 9.45), hp(4.95 * side, 9.9), hp(3.5 * side, 9.82), hp(2.2 * side, 10.0)]));
  const eyes = ([-1, 1] as const).map((side) => {
    const c = 3.15 * side;
    const shape = curve([hp(c - 1.45 * side, 11.55, 1), hp(c - 0.55 * side, 11.0), hp(c + 0.5 * side, 10.98), hp(c + 1.45 * side, 11.4, 1), hp(c + 0.5 * side, 11.82), hp(c - 0.55 * side, 11.85)]);
    const lid = curve([hp(c - 1.5 * side, 11.5), hp(c - 0.55 * side, 10.93), hp(c + 0.5 * side, 10.92), hp(c + 1.55 * side, 11.42)], false);
    const crease = curve([hp(c - 1.1 * side, 10.85), hp(c, 10.42), hp(c + 1.2 * side, 10.75)], false);
    return { shape, lid, crease, iris: hp(c + 0.05 * side, 11.38) };
  });
  const nose = ([-1, 1] as const).map((side) => curve([hp(1.45 * side, 16.15), hp(1.25 * side, 16.85), hp(0.55 * side, 16.95)], false));
  const noseSide = curve([hp(0.65, 11.9), hp(0.95, 13.8), hp(1.35, 15.6)], false);
  const upperLip = curve([hp(-1.95, 18.65, 1), hp(-0.8, 18.25), hp(0, 18.42), hp(0.8, 18.25), hp(1.95, 18.65, 1), hp(0.85, 18.78), hp(0, 18.84), hp(-0.85, 18.78)]);
  const lowerLip = curve([hp(-1.8, 18.7, 1), hp(-0.85, 18.86), hp(0, 18.88), hp(0.85, 18.86), hp(1.8, 18.7, 1), hp(1.05, 19.5), hp(0, 19.7), hp(-1.05, 19.5)]);
  const mouthLine = curve([hp(-1.95, 18.65), hp(-0.85, 18.8), hp(0, 18.86), hp(0.85, 18.8), hp(1.95, 18.65)], false);

  // Neck, rising from inside the collar; the front collar band hides its base.
  const neckHalf = 5.5 * build ** 0.5 * tall ** 0.3;
  const neckPath = curve(mirrored([[0, head - 8], [neckHalf * 0.93, head - 8], [neckHalf * 0.97, head - 2], [neckHalf, head + 2.2], [neckHalf * 1.04, hps - 1.6], [neckHalf * 1.3, hps + 1.4], [neckHalf * 2.4, hps + 3.6], [neckHalf * 2.4, hps + 9, 1], [0, hps + 9, 1]]));
  const collar = TEE.collar.map(img);
  const [collarLeft, collarRight] = [collar[0], collar[collar.length - 1]];
  const collarClip = curve([[collarLeft[0], -60, 1], [collarLeft[0], collarLeft[1], 1], ...collar.slice(1, -1), [collarRight[0], collarRight[1], 1], [collarRight[0], -60, 1]]);

  // Arms: from the shoulder joint through the sleeve opening to the elbow, then the forearm swings back toward the thigh.
  const limb = build ** 0.75 * tall ** 0.6;
  const upper = braco * 0.55;
  const fore = braco * 0.45;
  const handLength = altura * 0.106;
  const arm = (side: 1 | -1) => {
    const [outer, inner] = (side < 0 ? TEE.cuffs.left : TEE.cuffs.right).map(img);
    const cuffMid = lerp(outer, inner, 0.42);
    const joint: Vec = [side * (shoulderHalf - 1.5), hps + 4.5];
    const along = unit(sub(cuffMid, joint));
    const elbow = add(joint, scale(along, upper));
    const upperAngle = Math.atan2(along[0], along[1]);
    const foreAngle = upperAngle * 0.42;
    const wrist = add(elbow, scale(fromAngle(foreAngle), fore));
    const handAngle = foreAngle * 0.5;
    // Outward normal of a direction (points away from the body on this side).
    const outward = (direction: Vec): Vec => (direction[1] * side >= 0 ? [direction[1], -direction[0]] : [-direction[1], direction[0]]);
    const foreDir = fromAngle(foreAngle);
    const elbowNormal = unit(add(outward(along), outward(foreDir)));
    const samples: [Vec, Vec, number, number][] = [
      [joint, outward(along), 5.0, 4.6],
      [lerp(joint, elbow, 0.5), outward(along), 4.7, 4.3],
      [lerp(joint, elbow, 0.88), outward(along), 4.15, 3.8],
      [elbow, elbowNormal, 4.05, 3.5],
      [lerp(elbow, wrist, 0.24), outward(foreDir), 4.35, 3.7],
      [lerp(elbow, wrist, 0.56), outward(foreDir), 3.55, 3.15],
      [lerp(elbow, wrist, 0.86), outward(foreDir), 2.7, 2.45],
      [wrist, outward(foreDir), 2.45, 2.3],
    ];
    const outline: Pt[] = [
      add(joint, scale(along, -4.5)),
      ...samples.map(([point, normal, out]) => add(point, scale(normal, out * limb))),
      add(wrist, scale(foreDir, 1.2)),
      ...[...samples].reverse().map(([point, normal, , inward]) => add(point, scale(normal, -inward * limb))),
    ];

    // Hand in its own frame: u runs from the wrist to the fingertips, v away from the body. Seen from the front the
    // relaxed hand shows its thumb side, back of the hand outward, fingers curling in toward the thigh.
    const handScale = tall ** 0.8 * build ** 0.25;
    const u = fromAngle(handAngle);
    const v = outward(u);
    const hand = (uu: number, vv: number, sharp?: 1): Pt => {
      const [x, y] = add(wrist, add(scale(u, uu * handScale * (handLength / 18.5)), scale(v, vv * handScale)));
      return sharp ? [x, y, 1] : [x, y];
    };
    const palm = curve([
      hand(-1.2, 2.5), hand(2.5, 2.75), hand(6.0, 2.85), hand(8.8, 2.6), hand(10.4, 2.25), hand(12.8, 1.95), hand(14.8, 1.5), hand(16.3, 0.85), hand(17.0, 0.05), hand(16.75, -0.6),
      hand(16.15, -0.85, 1), hand(16.45, -1.45), hand(16.0, -2.2), hand(14.7, -2.6), hand(12.7, -2.8), hand(10.0, -3.15), hand(7.0, -3.2), hand(4.0, -2.95), hand(1.2, -2.5), hand(-1.2, -2.35),
    ]);
    const thumb = curve([hand(2.0, 1.3), hand(5.2, 0.9), hand(8.4, -0.1), hand(10.6, -1.1), hand(11.6, -1.9), hand(11.1, -2.6), hand(9.0, -2.65), hand(6.2, -2.35), hand(3.4, -1.75), hand(1.6, -0.9)]);
    const thumbShadow = curve([hand(8.2, -0.4), hand(10.9, -1.6), hand(12.6, -2.3), hand(11.8, -2.9), hand(9.6, -2.8)]);
    const knuckles = [curve([hand(13.2, -0.35), hand(14.8, -0.55), hand(16.15, -0.85)], false), curve([hand(13.9, 1.2), hand(15.6, 0.75), hand(16.85, 0.25)], false)];
    const nail = curve([hand(10.3, -1.55), hand(11.15, -1.9), hand(10.9, -2.35), hand(10.1, -2.15)]);

    // Only what lies beyond the sleeve opening shows: everything on the shoulder's side of the cuff line is in the sleeve.
    const cuffAlong = unit(sub(inner, outer));
    let away: Vec = [-cuffAlong[1], cuffAlong[0]];
    if (away[0] * (cuffMid[0] - joint[0]) + away[1] * (cuffMid[1] - joint[1]) < 0) away = scale(away, -1);
    const clip = [add(outer, scale(cuffAlong, -60)), add(inner, scale(cuffAlong, 30)), add(add(inner, scale(cuffAlong, 30)), scale(away, 120)), add(add(outer, scale(cuffAlong, -60)), scale(away, 120))];
    // A soft shadow where the arm comes out of the sleeve.
    const shade = [lerp(outer, inner, 0.05), lerp(outer, inner, 0.82), add(lerp(outer, inner, 0.82), scale(away, 3.2)), add(lerp(outer, inner, 0.05), scale(away, 3.2))];
    const reach = Math.max(...outline.map(([x]) => x * side)) * side;
    return { path: curve(outline), palm, thumb, thumbShadow, knuckles, nail, clip, shade, reach, wristY: wrist[1] };
  };

  // Relaxed straight linen trousers, fuller with the hips and the build.
  const legCenter = hipHalf * 0.5 + 1.2;
  const hemHalf = 6.1 * build ** 0.35 * tall ** 0.3;
  const kneeHalf = hemHalf * 1.2;
  const hemY = ankleY + 0.6;
  const waistOut = waistHalf + 1.2;
  const hipOut = hipHalf + 1.8;
  const trousers = curve(mirrored([
    [0, waistY - 2, 1], [waistOut, waistY - 2, 1], [(waistOut + hipOut) / 2 + 0.3, (waistY + hipY) / 2], [hipOut, hipY], [hipOut - 0.4, crotchY + 6],
    [legCenter + kneeHalf, kneeY], [legCenter + hemHalf + 0.1, hemY - 3], [legCenter + hemHalf + 0.15, hemY, 1], [legCenter + 0.4, hemY + 0.9], [legCenter - hemHalf + 0.5, hemY, 1],
    [legCenter - hemHalf + 0.55, hemY - 3], [legCenter - kneeHalf + 0.9, kneeY], [1.9, crotchY + 7], [0.9, crotchY + 2.3], [0, crotchY + 1.8, 1],
  ]));
  const legShade = ([-1, 1] as const).map((side) => ({ x: side * legCenter - (hipOut - legCenter + 0.6), width: (hipOut - legCenter + 0.6) * 2, y: waistY - 2, height: hemY + 4 - waistY }));
  const creases = ([-1, 1] as const).map((side) => curve([[side * (legCenter * 0.82), hipY + 3], [side * (legCenter * 0.95), kneeY], [side * (legCenter + 0.35), hemY + 0.8]], false));
  const folds = ([-1, 1] as const).flatMap((side) => [
    curve([[side * 1.6, crotchY + 2.5], [side * 4.2, crotchY - 0.6], [side * 7.6, crotchY - 2.2]], false),
    curve([[side * (legCenter - hemHalf + 1.4), hemY - 2.6], [side * legCenter, hemY - 1.5], [side * (legCenter + hemHalf - 1.2), hemY - 2.8]], false),
  ]);

  // Minimal white leather sneakers, toes turned slightly out.
  const shoeScale = tall ** 0.8;
  const shoe = (side: 1 | -1) => {
    const cx = side * (legCenter + 0.6);
    const p = (x: number, y: number, sharp?: 1): Pt => (sharp ? [cx + x * shoeScale, altura + y * shoeScale, 1] : [cx + x * shoeScale, altura + y * shoeScale]);
    const o = side * 0.5; // toes turn out a touch
    return {
      upper: curve([p(-5.25 + o, -1.5, 1), p(-5.0 + o, -3.4), p(-4.2 + o * 0.5, -5.8), p(-3.5, -7.6, 1), p(3.5, -7.6, 1), p(4.2 + o * 0.5, -5.8), p(5.0 + o, -3.4), p(5.25 + o, -1.5, 1)]),
      toe: curve([p(-4.5 + o, -1.6, 1), p(-3.4 + o, -3.7), p(o, -4.6), p(3.4 + o, -3.7), p(4.5 + o, -1.6, 1)]),
      tongue: curve([p(-1.7 + o * 0.6, -4.2, 1), p(-1.9, -7.8, 1), p(1.9, -7.8, 1), p(1.7 + o * 0.6, -4.2, 1)]),
      laces: [-6.9, -6.0, -5.1].map((y) => curve([p(-1.9 + o * 0.3, y), p(o * 0.3, y - 0.15), p(1.9 + o * 0.3, y)], false)),
      sole: curve([p(-5.55 + o, -1.9, 1), p(5.55 + o, -1.9, 1), p(5.7 + o, -0.4), p(5.1 + o, 0, 1), p(-5.1 + o, 0, 1), p(-5.7 + o, -0.4)]),
      contact: { cx: cx + o, cy: altura - 0.2, rx: 6.2 * shoeScale, ry: 1.0 },
    };
  };

  // Where the silhouette ends on the right at a given height (for the callout lines).
  const teeEdge = (y: number) => {
    const iy = (y - teeTop) / ky;
    const rows = TEE.edge;
    if (iy < rows[0][0] || iy > rows[rows.length - 1][0]) return 0;
    const index = rows.findIndex(([row]) => row >= iy);
    const [a, b] = [rows[Math.max(0, index - 1)], rows[index]];
    const x = a[1] + ((b[1] - a[1]) * (iy - a[0])) / ((b[0] - a[0]) || 1);
    return (x - TEE.cx) * kx;
  };
  const right = arm(1);
  const edgeAt = (y: number) => Math.max(teeEdge(y), y > waistY ? hipOut : 0, y > hps + 25 && y < right.wristY + handLength ? right.reach : 0);

  return {
    altura,
    tee: { x: -TEE.cx * kx, y: teeTop, width: 1200 * kx, height: 1180 * ky },
    hemShadow: { x: -hipOut - 2, y: teeTop + TEE.hem * ky - 0.6, width: hipOut * 2 + 4, height: 2.6 },
    head: { path: headPath, ears: [ear(-1), ear(1)], earFolds: [earFold(-1), earFold(1)], hair, hairStrands, brows, eyes, nose, noseSide, upperLip, lowerLip, mouthLine, scale: hs, chin: head },
    neck: neckPath,
    collarClip,
    arms: [arm(-1), right],
    trousers,
    legShade,
    creases,
    folds,
    shoes: [shoe(-1), shoe(1)],
    ground: { rx: legCenter + 11, y: altura },
    callouts: { busto: { y: bustY, edge: edgeAt(bustY) }, cintura: { y: waistY, edge: edgeAt(waistY) }, quadril: { y: hipY, edge: edgeAt(hipY) } },
  };
}

const SPRING = { type: "spring", stiffness: 110, damping: 20 } as const;

export function FitFigure({ profile, size, className = "" }: { profile: BodyProfile; size: SizeRow; className?: string }) {
  const id = useId().replace(/:/g, "");
  const figure = figureFor(profile, size);
  const top = FLOOR - figure.altura * S;
  // Everything below is drawn in cm: x from the body's centre line, y from the crown.
  const toPx = `translate(${CENTER} ${top}) scale(${S})`;
  const hs = figure.head.scale;
  const value = (field: keyof BodyProfile) => measure(profile, field);
  const altura = value("altura");
  const ref = (name: string) => `url(#${id}-${name})`;
  const morph = (d: string) => ({ initial: false as const, animate: { d }, transition: SPRING });
  const feature = (cx: number, cy: number, rx: number, ry: number) => ({ initial: false as const, animate: { cx: cx * hs, cy: cy * hs, rx: rx * hs, ry: ry * hs }, transition: SPRING });

  return <svg viewBox={`0 0 ${W} ${H}`} className={className} role="img" aria-label={`Figura com as suas medidas vestindo a camiseta Merano no tamanho ${size.size}`}>
    <defs>
      <radialGradient id={`${id}-face`} cx="40%" cy="36%" r="75%"><stop offset="0" stopColor="#f2d3b4" /><stop offset=".5" stopColor="#dcb08b" /><stop offset="1" stopColor="#ad7a59" /></radialGradient>
      <linearGradient id={`${id}-skin`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#c08c68" /><stop offset=".3" stopColor="#ecc8a5" /><stop offset=".65" stopColor="#d8aa85" /><stop offset="1" stopColor="#a5735a" /></linearGradient>
      <linearGradient id={`${id}-neck`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#b5845f" /><stop offset=".35" stopColor="#dcb08b" /><stop offset=".7" stopColor="#c99a75" /><stop offset="1" stopColor="#966548" /></linearGradient>
      <radialGradient id={`${id}-hair`} cx="34%" cy="18%" r="85%"><stop offset="0" stopColor="#6b4e3a" /><stop offset=".55" stopColor="#33251b" /><stop offset="1" stopColor="#1d140e" /></radialGradient>
      <linearGradient id={`${id}-leg`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#5a4128" stopOpacity=".34" /><stop offset=".3" stopColor="#fff8ec" stopOpacity=".2" /><stop offset=".62" stopColor="#5a4128" stopOpacity="0" /><stop offset="1" stopColor="#5a4128" stopOpacity=".38" /></linearGradient>
      <linearGradient id={`${id}-shoe`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffffff" /><stop offset="1" stopColor="#e2dccf" /></linearGradient>
      <filter id={`${id}-soft`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation=".55" /></filter>
      <filter id={`${id}-softer`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.4" /></filter>
      <filter id={`${id}-fine`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation=".18" /></filter>
      <filter id={`${id}-shadow`} x="-30%" y="-20%" width="160%" height="140%"><feDropShadow dx="0" dy="2.2" stdDeviation="2.6" floodColor="#03161a" floodOpacity=".38" /></filter>
      <clipPath id={`${id}-collar`}><motion.path {...morph(figure.collarClip)} /></clipPath>
      <clipPath id={`${id}-head`}><motion.path {...morph(figure.head.path)} /></clipPath>
      <clipPath id={`${id}-trousers`}><motion.path {...morph(figure.trousers)} /></clipPath>
      {figure.head.eyes.map((eye, index) => <clipPath key={index} id={`${id}-eye-${index}`}><motion.path {...morph(eye.shape)} /></clipPath>)}
      {figure.arms.map((arm, index) => <clipPath key={index} id={`${id}-sleeve-${index}`}><motion.path {...morph(`M${arm.clip.map(([x, y]) => `${f(x)} ${f(y)}`).join(" L")} Z`)} /></clipPath>)}
    </defs>

    <g transform={toPx}>
      <motion.ellipse initial={false} animate={{ cx: 0, cy: figure.ground.y, rx: figure.ground.rx, ry: 2.2 }} transition={SPRING} fill="#000" fillOpacity={0.32} filter={ref("softer")} />

      {figure.shoes.map((shoe, index) => <motion.ellipse key={index} initial={false} animate={shoe.contact} transition={SPRING} fill="#000" fillOpacity={0.45} filter={ref("soft")} />)}
      {/* Shoes, then the trousers over them */}
      {figure.shoes.map((shoe, index) => <g key={index}>
          <motion.path {...morph(shoe.sole)} fill="#e6dfd2" stroke="#b9ae9c" strokeWidth={0.2} />
          <motion.path {...morph(shoe.upper)} fill={ref("shoe")} />
          <motion.path {...morph(shoe.tongue)} fill="#ebe5da" />
          {shoe.laces.map((d, lace) => <motion.path key={lace} {...morph(d)} fill="none" stroke="#bdb3a3" strokeWidth={0.32} strokeLinecap="round" />)}
          <motion.path {...morph(shoe.toe)} fill="#ffffff" stroke="#d3cabb" strokeWidth={0.18} />
        </g>)}

      <g filter={ref("shadow")}>
        <motion.path {...morph(figure.trousers)} fill="#cdb692" />
        <g clipPath={ref("trousers")}>
          {figure.legShade.map((leg, index) => <motion.rect key={index} initial={false} animate={leg} transition={SPRING} fill={ref("leg")} />)}
          {figure.creases.map((d, index) => <motion.path key={index} {...morph(d)} fill="none" stroke="#f3e8d4" strokeOpacity={0.35} strokeWidth={0.35} />)}
          {figure.folds.map((d, index) => <motion.path key={index} {...morph(d)} fill="none" stroke="#7d6446" strokeOpacity={0.3} strokeWidth={0.45} strokeLinecap="round" filter={ref("soft")} />)}
          <motion.rect initial={false} animate={figure.hemShadow} transition={SPRING} fill="#3b2a1a" fillOpacity={0.35} filter={ref("softer")} />
        </g>

        {/* The tee */}
        <motion.image initial={false} animate={figure.tee} transition={SPRING} href={`${FRONT_CUTOUT.src}-${FRONT_CUTOUT.small}.webp`} preserveAspectRatio="none" />

        {/* Neck coming out of the collar */}
        <g clipPath={ref("collar")}>
          <motion.path {...morph(figure.neck)} fill={ref("neck")} />
          <motion.ellipse initial={false} animate={{ cx: 0, cy: figure.head.chin + 1.2 * hs, rx: 5.6 * hs, ry: 2.2 * hs }} transition={SPRING} fill="#6e4630" fillOpacity={0.45} filter={ref("softer")} />
        </g>

        {/* Arms leaving the sleeves */}
        {figure.arms.map((arm, index) => <g key={index} clipPath={ref(`sleeve-${index}`)}>
          <motion.path {...morph(arm.path)} fill={ref("skin")} />
          <motion.path {...morph(`M${arm.shade.map(([x, y]) => `${f(x)} ${f(y)}`).join(" L")} Z`)} fill="#3d2a1d" fillOpacity={0.4} filter={ref("softer")} />
          <motion.path {...morph(arm.palm)} fill={ref("skin")} />
          {arm.knuckles.map((d, knuckle) => <motion.path key={knuckle} {...morph(d)} fill="none" stroke="#8c5f45" strokeOpacity={0.5} strokeWidth={0.26} strokeLinecap="round" />)}
          <motion.path {...morph(arm.thumbShadow)} fill="#7a4f37" fillOpacity={0.35} filter={ref("fine")} />
          <motion.path {...morph(arm.thumb)} fill={ref("skin")} />
          <motion.path {...morph(arm.nail)} fill="#f3d9c2" fillOpacity={0.8} />
        </g>)}

        {/* Head */}
        {figure.head.ears.map((d, index) => <motion.path key={index} {...morph(d)} fill="#cf9f7b" />)}
        {figure.head.earFolds.map((d, index) => <motion.path key={index} {...morph(d)} fill="none" stroke="#9c6b4f" strokeOpacity={0.6} strokeWidth={0.4} strokeLinecap="round" />)}
        <motion.path {...morph(figure.head.path)} fill={ref("face")} />
        <g clipPath={ref("head")}>
          {/* Soft modelling in light from the upper left: eye sockets, side of the face, under the lip. */}
          <motion.ellipse {...feature(-3.15, 11.0, 2.3, 1.0)} fill="#7a4f37" fillOpacity={0.16} filter={ref("soft")} />
          <motion.ellipse {...feature(3.15, 11.0, 2.3, 1.0)} fill="#7a4f37" fillOpacity={0.22} filter={ref("soft")} />
          <motion.ellipse {...feature(6.7, 15.5, 2.4, 6.5)} fill="#7a4f37" fillOpacity={0.28} filter={ref("softer")} />
          <motion.ellipse {...feature(-5.2, 15.0, 1.5, 1.2)} fill="#e39b82" fillOpacity={0.2} filter={ref("softer")} />
          <motion.ellipse {...feature(5.2, 15.0, 1.5, 1.2)} fill="#e39b82" fillOpacity={0.14} filter={ref("softer")} />
          <motion.ellipse {...feature(0, 20.3, 1.6, 0.45)} fill="#7a4f37" fillOpacity={0.22} filter={ref("soft")} />
          <motion.ellipse {...feature(-0.2, 14.3, 0.45, 1.9)} fill="#fbe5cd" fillOpacity={0.45} filter={ref("soft")} />
          <motion.path {...morph(figure.head.noseSide)} fill="none" stroke="#8a5a3f" strokeOpacity={0.35} strokeWidth={0.5 * hs} strokeLinecap="round" filter={ref("fine")} />
        </g>
        {figure.head.eyes.map((eye, index) => <g key={index}>
          <motion.path {...morph(eye.crease)} fill="none" stroke="#8a5a3f" strokeOpacity={0.4} strokeWidth={0.18 * hs} strokeLinecap="round" />
          <motion.path {...morph(eye.shape)} fill="#f1e6dc" />
          <g clipPath={ref(`eye-${index}`)}>
            <motion.circle initial={false} animate={{ cx: eye.iris[0], cy: eye.iris[1], r: 0.56 * hs }} transition={SPRING} fill="#4a3222" />
            <motion.circle initial={false} animate={{ cx: eye.iris[0], cy: eye.iris[1], r: 0.25 * hs }} transition={SPRING} fill="#1a110b" />
            <motion.circle initial={false} animate={{ cx: eye.iris[0] - 0.18 * hs, cy: eye.iris[1] - 0.2 * hs, r: 0.11 * hs }} transition={SPRING} fill="#fff" fillOpacity={0.85} />
          </g>
          <motion.path {...morph(eye.lid)} fill="none" stroke="#2a1b12" strokeWidth={0.26 * hs} strokeLinecap="round" />
        </g>)}
        {figure.head.brows.map((d, index) => <motion.path key={index} {...morph(d)} fill="#2c1f16" fillOpacity={0.85} />)}
        {figure.head.nose.map((d, index) => <motion.path key={index} {...morph(d)} fill="none" stroke="#7a4b35" strokeOpacity={0.6} strokeWidth={0.22 * hs} strokeLinecap="round" />)}
        <motion.path {...morph(figure.head.lowerLip)} fill="#c07c66" />
        <motion.path {...morph(figure.head.upperLip)} fill="#a86452" />
        <motion.path {...morph(figure.head.mouthLine)} fill="none" stroke="#6d3d2e" strokeOpacity={0.75} strokeWidth={0.16 * hs} strokeLinecap="round" />
        <motion.path {...morph(figure.head.hair)} fill={ref("hair")} />
        {figure.head.hairStrands.map((d, index) => <motion.path key={index} {...morph(d)} fill="none" stroke="#120b07" strokeOpacity={0.3} strokeWidth={0.32} strokeLinecap="round" filter={ref("fine")} />)}
      </g>
    </g>

    {(["busto", "cintura", "quadril"] as const).map((field) => {
      const cm = value(field);
      if (!cm) return null;
      const { y, edge } = figure.callouts[field];
      const at = top + y * S;
      const label = { busto: "Busto", cintura: "Cintura", quadril: "Quadril" }[field];
      return <motion.g key={field} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <motion.line initial={false} animate={{ x1: CENTER + edge * S + 5, x2: 296, y1: at, y2: at }} transition={SPRING} stroke="#fabd4b" strokeWidth={1.2} strokeDasharray="2 4" />
        <motion.circle initial={false} animate={{ cx: 296, cy: at }} transition={SPRING} r={2.6} fill="#fabd4b" />
        <motion.text initial={false} animate={{ x: 305, y: at - 3 }} transition={SPRING} className="sans" fontSize="12" fill="#fcf5eb" fillOpacity={0.7}>{label}</motion.text>
        <motion.text initial={false} animate={{ x: 305, y: at + 15 }} transition={SPRING} className="display" fontSize="19" fill="#fcf5eb">{cm} cm</motion.text>
      </motion.g>;
    })}

    {altura && <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <motion.line initial={false} animate={{ y1: top, y2: FLOOR }} transition={SPRING} x1="30" x2="30" stroke="#fabd4b" strokeWidth={1.2} />
      <motion.line initial={false} animate={{ y1: top, y2: top }} transition={SPRING} x1="24" x2="36" stroke="#fabd4b" strokeWidth={1.2} />
      <line x1="24" x2="36" y1={FLOOR} y2={FLOOR} stroke="#fabd4b" strokeWidth={1.2} />
      <text x="18" y={(top + FLOOR) / 2} transform={`rotate(-90 18 ${(top + FLOOR) / 2})`} textAnchor="middle" className="display" fontSize="15" fill="#fcf5eb">{altura} cm</text>
    </motion.g>}
  </svg>;
}
