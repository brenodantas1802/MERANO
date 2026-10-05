"use client";

import { useId } from "react";
import { motion } from "motion/react";
import { measure, type BodyProfile } from "@/lib/body-profile";
import { bodyModel, wearTee } from "@/lib/body-model";
import type { SizeRow } from "@/lib/products";

// A smooth anatomy-chart silhouette built from the customer's measurements, wearing our tee in the chosen size.
// Body and tee come from the same model the size recommendation uses (src/lib/body-model.ts) and are laid out in
// centimetres — x from the centre line, y down from the crown — so the shoulder seams, the width and the hem land
// where they would on this body. The tee is drawn around the body: the neck rises out of the collar and the
// forearms leave the sleeves.
const W = 400;
const H = 580;
const CENTER = 160;
const FLOOR = 552;
const SCALE = 2.62; // px per cm: a taller body stands taller next to the ruler
const MAX_FIGURE = 520; // px, for the very tall
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

type Vec = [number, number];
type Pt = readonly [number, number] | readonly [number, number, 1]; // a third value marks a sharp corner

const f = (value: number) => value.toFixed(2);
const add = (a: Vec, b: Vec): Vec => [a[0] + b[0], a[1] + b[1]];
const sub = (a: Vec, b: Vec): Vec => [a[0] - b[0], a[1] - b[1]];
const scale = (a: Vec, k: number): Vec => [a[0] * k, a[1] * k];
const dot = (a: Vec, b: Vec) => a[0] * b[0] + a[1] * b[1];
const unit = (a: Vec): Vec => scale(a, 1 / (Math.hypot(a[0], a[1]) || 1));
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const lerp = (a: Vec, b: Vec, t: number): Vec => [mix(a[0], b[0], t), mix(a[1], b[1], t)];
const sharp = (p: Vec): Pt => [p[0], p[1], 1];
const flip = (p: Pt): Pt => (p[2] ? [-p[0], p[1], 1] : [-p[0], p[1]]);

// Smooth curve through the points (Catmull-Rom as cubic Béziers); every call with the same number of points yields
// the same commands, so motion can morph one body into another.
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
const mirrored = (right: Pt[]): Pt[] => [...right, ...right.slice(1, -1).reverse().map(flip)];

// Rightmost point where a closed outline crosses the height y (on its control polygon), for the callout lines.
function reachAt(points: Pt[], y: number) {
  let reach = -Infinity;
  points.forEach((a, i) => {
    const b = points[(i + 1) % points.length];
    if ((a[1] - y) * (b[1] - y) > 0 || a[1] === b[1]) return;
    reach = Math.max(reach, a[0] + ((b[0] - a[0]) * (y - a[1])) / (b[1] - a[1]));
  });
  return reach;
}

// Head outline on a 23.3 cm tall, 16 cm wide reference, crown to jaw, with the ear.
const HEAD: Pt[] = [[0, 0], [2.9, 0.55], [5.3, 2.1], [7.0, 4.3], [7.85, 6.9], [8.1, 8.9], [8.0, 9.9, 1], [8.75, 9.6], [9.25, 10.6], [9.2, 12.8], [8.75, 14.6], [8.0, 15.5, 1], [7.85, 16.6], [7.35, 18.4], [6.55, 19.9]];
// A relaxed hand seen from the front, palm toward the thigh, in cm for a 175 cm body: u runs wrist → fingertips
// (18.6), v away from the body. Seen this way the wrist shows its thickness, the palm and the thumb in front of it
// widen the hand, and the notch on the inner side is where the thumb tip parts from the index finger.
const HAND: Pt[] = [[0.6, 2.0], [2.8, 2.25], [5.6, 2.6], [8.6, 2.7], [11.4, 2.4], [13.9, 1.85], [16.1, 1.05], [17.5, 0.25], [18.0, -0.45], [17.6, -1.05], [16.0, -1.5], [13.8, -1.75], [12.2, -1.75], [11.3, -1.45, 1], [10.9, -2.05], [10.1, -2.55], [8.5, -2.85], [6.2, -2.8], [3.8, -2.4], [1.8, -2.05], [0.4, -2.0]];

function figureFor(profile: BodyProfile, row: SizeRow) {
  const body = bodyModel(profile);
  const tee = wearTee(body, row);
  const { w, altura } = body;
  const Y = (height: number) => altura - height;
  const y = Object.fromEntries(Object.entries(body.y).map(([key, height]) => [key, Y(height)])) as typeof body.y;
  const neck = w.neck / 2;
  const sh = w.shoulders / 2;
  const dl = Math.max(w.deltoids / 2, sh + 2);
  const chest = w.chest / 2;
  const waist = w.waist / 2;
  const hip = w.hip / 2;
  const torsoAt = (height: number) => (height < y.chest ? chest : height < y.waist ? mix(chest, waist, (height - y.chest) / (y.waist - y.chest)) : mix(waist, hip, clamp((height - y.waist) / (y.hip - y.waist), 0, 1)));

  // Head and neck.
  const hx = w.head / 2 / 8.1;
  const hy = body.head / 23.3;
  const head = HEAD.map(([x, yy, corner]) => (corner ? [x * hx, yy * hy, 1] : [x * hx, yy * hy]) as Pt);

  // Legs: thighs together at the crotch, knees nearly touching, feet a little apart and turned out.
  const kneeHalf = w.knee / 2;
  const calfHalf = w.calf / 2;
  const ankleHalf = w.ankle / 2;
  const footHalf = w.foot / 2;
  const kneeX = Math.max(kneeHalf + 0.7, hip * 0.46);
  const ankleX = Math.max(hip * 0.6, kneeX + 1.5);
  const calfY = mix(y.knee, y.ankle, 0.3);
  const calfX = mix(kneeX, ankleX, 0.3);
  const leg: Pt[] = [
    [hip, y.hip], [hip + 0.2, y.crotch + 5], [mix(hip, kneeX + kneeHalf, 0.6) + 0.9, mix(y.crotch + 5, y.knee, 0.6)], [kneeX + kneeHalf + 0.3, y.knee - 3], [kneeX + kneeHalf - 0.3, y.knee + 2],
    [calfX + calfHalf * 1.1, calfY - 1], [mix(calfX + calfHalf, ankleX + ankleHalf, 0.55), mix(calfY, y.ankle, 0.55)], [ankleX + ankleHalf + 0.15, y.ankle - 1.5], [ankleX + ankleHalf + 0.3, y.ankle + 0.6],
    [ankleX + footHalf * 0.95 + 0.6, altura - 1.8], [ankleX + footHalf + 0.75, altura - 0.55], [ankleX + footHalf * 0.55 + 0.4, altura + 0.05], [ankleX - footHalf * 0.35, altura + 0.05], [ankleX - footHalf * 0.82, altura - 0.5], [ankleX - footHalf * 0.72, altura - 2],
    [ankleX - ankleHalf - 0.2, y.ankle + 0.2], [ankleX - ankleHalf + 0.1, y.ankle - 4], [calfX - calfHalf * 1.0, calfY - 3], [kneeX - kneeHalf + 0.4, y.knee + 3], [kneeX - kneeHalf, y.knee - 2],
    [kneeX - kneeHalf + 0.9, y.knee - 10], [0.45, y.crotch + 7], [0, y.crotch + 0.6, 1],
  ];
  const silhouette = mirrored([
    ...head,
    [neck * 1.02, body.head * 0.9, 1], [neck * 0.99, body.head + 1.5], [neck * 1.04, y.hps - 1.6],
    [neck * 1.5, y.hps + 0.2], [mix(neck, sh, 0.5), y.hps + 1.7], [sh * 0.94, y.acromion - 0.4], [mix(sh, dl, 0.6), y.acromion + 0.8], [dl * 0.97, y.acromion + 4.4],
    [chest + 0.9, y.axilla], [chest, y.chest + 1.5], [mix(chest, waist, 0.55), mix(y.chest, y.waist, 0.5)], [waist, y.waist], [mix(waist, hip, 0.7), mix(y.waist, y.hip, 0.5)],
    ...leg,
  ]);

  // Arms hang a few degrees out, the forearm a little more (the carrying angle), opening further only when the elbow
  // would touch the waist or the hand the hip.
  const upperHalf = w.upperArm / 2;
  const foreHalf = w.forearm / 2;
  const wristHalf = w.wrist / 2;
  const joint: Vec = [sh - 1.6, y.acromion + 3.4];
  const drop1 = y.elbow - joint[1];
  const a1 = Math.max((5 * Math.PI) / 180, Math.atan2(torsoAt(y.elbow) + upperHalf * 0.9 + 1.4 - joint[0], drop1));
  const elbow: Vec = [joint[0] + Math.tan(a1) * drop1, y.elbow];
  const drop2 = y.wrist - y.elbow;
  const a2 = Math.max(a1 + (5 * Math.PI) / 180, Math.atan2(Math.max(hip, torsoAt(y.wrist)) + wristHalf + 2 - elbow[0], drop2));
  const wrist: Vec = [elbow[0] + Math.tan(a2) * drop2, y.wrist];
  const d1 = unit(sub(elbow, joint));
  const d2 = unit(sub(wrist, elbow));
  const n1: Vec = [d1[1], -d1[0]]; // outward
  const n2: Vec = [d2[1], -d2[0]];
  const nElbow = unit(add(n1, n2));
  const upperLength = Math.hypot(...sub(elbow, joint));
  const along1 = (s: number) => add(joint, scale(d1, s));
  const at1 = (t: number) => lerp(joint, elbow, t);
  const at2 = (t: number) => lerp(elbow, wrist, t);
  const off = (p: Vec, n: Vec, k: number) => add(p, scale(n, k));
  const handLength = altura * 0.108;
  const a3 = a2 + (2 * Math.PI) / 180;
  const u: Vec = [Math.sin(a3), Math.cos(a3)];
  const v: Vec = [Math.cos(a3), -Math.sin(a3)];
  const hand = HAND.map(([uu, vv, corner]) => {
    const p = add(wrist, add(scale(u, (uu * handLength) / 18.6), scale(v, (vv * w.wrist) / 4.0)));
    return corner ? sharp(p) : p;
  });
  const rightArm: Pt[] = [
    [sh * 0.62, y.acromion - 1.6], [mix(sh, dl, 0.5), y.acromion - 0.1], [Math.max(dl, at1(0.12)[0] + upperHalf * 1.08), y.acromion + 4.2],
    off(at1(0.5), n1, upperHalf), off(at1(0.86), n1, upperHalf * 0.86), off(elbow, nElbow, foreHalf * 0.86), off(at2(0.2), n2, foreHalf * 1.02), off(at2(0.6), n2, foreHalf * 0.78), off(wrist, n2, wristHalf),
    ...hand,
    off(wrist, n2, -wristHalf), off(at2(0.55), n2, -foreHalf * 0.8), off(at2(0.16), n2, -foreHalf * 0.96), off(elbow, nElbow, -foreHalf * 0.82), off(at1(0.55), n1, -upperHalf * 0.9),
    [chest + 0.4, y.axilla + 1], [chest - 2.5, y.axilla - 4],
  ];

  // The tee. Shoulder seams sit on the body's shoulder line at the chart's width: on top of the deltoid for a small
  // size, falling down the arm as the size grows (the dropped shoulder of the cut).
  const teeHalf = tee.width / 2;
  const hemHalf = tee.hemWidth / 2;
  const hemY = Y(tee.hem);
  const collar = neck + 1.5; // half width of the neck opening
  const surface = (x: number) => {
    const [x0, x1] = [neck * 1.5, sh * 0.94];
    if (x <= x0) return y.hps + 0.2;
    if (x <= x1) return mix(y.hps + 0.2, y.acromion - 0.4, (x - x0) / (x1 - x0));
    if (x <= dl) return y.acromion - 0.4 + (1 - Math.sqrt(1 - ((x - x1) / (dl - x1)) ** 2)) * 4.6;
    return y.acromion + 4.2 + (x - dl) * 1.5;
  };
  const onShoulder = (x: number): Vec => [x, surface(x) - 0.6];
  const seam = onShoulder(Math.min(tee.shoulder / 2, dl + 3));
  const underarm: Vec = [Math.max(teeHalf, chest + 0.8), y.hps + tee.armhole];
  // A tee side that would only peek out beside the arm as a sliver tucks behind it.
  const tuck = (x: number, yy: number) => {
    const edge = reachAt(rightArm, yy);
    return x > edge - 1.6 && x < edge + 1.2 ? edge - 1.6 : x;
  };
  const side = (t: number): Pt => {
    const yy = mix(underarm[1], hemY, t);
    return [tuck(Math.max(mix(underarm[0], hemHalf, t), torsoAt(yy) + 1), yy), yy];
  };
  const hemCorner = tuck(hemHalf, hemY);
  const panel = mirrored([
    [0, y.hps + 0.9], [collar * 0.6, y.hps + 0.3], [collar, y.hps - 1.2, 1], [collar + 1.6, y.hps - 0.85],
    ...[0.35, 0.62, 0.82, 0.94].map((t) => onShoulder(mix(collar + 1.6, seam[0], t))), sharp(seam),
    [mix(seam[0], underarm[0], 0.5) + 0.8, mix(seam[1], underarm[1], 0.5)], underarm, side(0.4), side(0.8),
    [hemCorner, hemY - 0.2, 1], [hemCorner * 0.55, hemY + 0.55], [0, hemY + 0.75],
  ]);

  // Sleeve: from the seam down the arm to the opening, loose around the arm, its inner edge folding into the armpit.
  const s0 = dot(sub(seam, joint), d1);
  const seamOffset = dot(sub(seam, joint), n1);
  const hemAlong = Math.min(s0 + tee.sleeve.length * 0.96, upperLength + 4);
  const opening = tee.sleeve.width / 2;
  const cuff = along1(hemAlong);
  const cuffOuter = off(cuff, n1, opening + 0.5);
  const cuffInner = off(cuff, n1, -(opening - 0.5));
  const armOuter = (s: number) => upperHalf * (s < upperLength * 0.5 ? 1 : mix(1, 0.86, clamp((s / upperLength - 0.5) / 0.36, 0, 1)));
  const sleeveOuter = (t: number) => {
    const s = mix(s0, hemAlong, t);
    return off(along1(s), n1, Math.max(armOuter(s) + 0.6, mix(seamOffset, opening + 0.5, t)));
  };
  const armpitAlong = (y.axilla + 1.5 - joint[1]) / d1[1];
  const armpit = off(along1(armpitAlong), n1, -(upperHalf * 0.9 + 0.3));
  const sleeveInner = off(along1((hemAlong + armpitAlong) / 2), n1, -mix(opening - 0.5, upperHalf * 0.9 + 0.3, 0.5));
  const armholeMid: Vec = [mix(seam[0], armpit[0], 0.5) - 0.6, mix(seam[1], armpit[1], 0.5)];
  const rightSleeve: Pt[] = [sharp(seam), sleeveOuter(0.3), sleeveOuter(0.65), sharp(cuffOuter), off(cuff, d1, 0.3), sharp(cuffInner), sleeveInner, armpit, armholeMid];
  // Only the arm below the sleeve opening is drawn; the sleeve covers the joint.
  const cuffAway = add(cuff, scale(d1, -0.6));
  const armClip = [off(cuffAway, n1, 25), off(cuffAway, n1, -25), add(off(cuffAway, n1, -25), scale(d1, 160)), add(off(cuffAway, n1, 25), scale(d1, 160))];

  // Collar: a ribbed band dipping in front, the inside of the back band showing beside the neck.
  const bandOuter: Pt[] = [[collar + 1.6, y.hps - 0.85, 1], [collar + 1.1, y.hps + 2.2], [neck, y.hps + 6.4], [neck * 0.55, y.hps + 8.3], [0, y.hps + 8.9]];
  const bandInner: Pt[] = [[0, y.hps + 6.6], [neck * 0.55, y.hps + 6.0], [neck * 0.95, y.hps + 4.0], [collar - 0.1, y.hps + 0.5], [collar, y.hps - 1.2, 1]];
  const band = [...bandOuter, ...bandOuter.slice(0, -1).reverse().map(flip), ...bandInner.slice(1).reverse().map(flip), ...bandInner];
  const bandMiddle = bandOuter.map((p, i) => lerp([p[0], p[1]], [bandInner[4 - i][0], bandInner[4 - i][1]], 0.5));
  const neckClip = curve([[-60, -60, 1], [60, -60, 1], [60, y.hps - 1.2, 1], ...bandMiddle.map((p, i) => (i === 0 ? sharp(p) : p)), ...bandMiddle.slice(0, -1).reverse().map((p, i, all) => flip(i === all.length - 1 ? sharp(p) : p)), [-60, y.hps - 1.2, 1]]);
  const backBand = curve([[-collar, y.hps - 1.2, 1], [-collar * 0.6, y.hps + 0.3], [0, y.hps + 0.9], [collar * 0.6, y.hps + 0.3], [collar, y.hps - 1.2, 1], [collar - 0.1, y.hps + 2.5], [0, y.hps + 6.8], [-(collar - 0.1), y.hps + 2.5]]);
  const neckFront = curve(mirrored([[0, body.head * 0.8], [neck * 1.02, body.head * 0.9, 1], [neck * 0.99, body.head + 1.5], [neck * 1.04, y.hps - 1.6], [neck * 1.06, y.hps + 4], [neck * 1.06, y.hps + 10, 1], [0, y.hps + 10, 1]]));
  const ribs = Array.from({ length: 29 }, (_, i) => {
    const t = i / 28;
    const outerAt = (k: number) => { const fk = k * 8; const j = Math.min(7, Math.floor(fk)); const full = [...bandOuter, ...bandOuter.slice(0, -1).reverse().map(flip)]; return lerp([full[j][0], full[j][1]], [full[j + 1][0], full[j + 1][1]], fk - j); };
    const innerAt = (k: number) => { const fk = k * 8; const j = Math.min(7, Math.floor(fk)); const full = [...bandInner.slice().reverse(), ...bandInner.slice(1).map(flip)]; return lerp([full[j][0], full[j][1]], [full[j + 1][0], full[j + 1][1]], fk - j); };
    const [a, b] = [outerAt(t), innerAt(t)];
    return `M${f(a[0])} ${f(a[1])}L${f(b[0])} ${f(b[1])}`;
  }).join("");

  // Fabric: drag folds from the armpits, long drape lines when the tee falls loose, strain lines when it's tight.
  const loose = clamp((tee.ease - 8) / 20, 0.04, 0.32);
  const tight = clamp((8 - tee.ease) / 12, 0, 0.55);
  const sides = [1, -1] as const;
  const at = (s: 1 | -1, p: Vec): Vec => [p[0] * s, p[1]];
  const folds = sides.flatMap((s) => [
    curve([at(s, add(armpit, [-0.6, 0.8])), at(s, [mix(armpit[0], 0, 0.3), armpit[1] + 3.5]), at(s, [mix(armpit[0], 0, 0.5), armpit[1] + 8])], false),
    curve([at(s, add(armpit, [-0.2, 2.6])), at(s, [mix(armpit[0], 0, 0.22), armpit[1] + 7]), at(s, [mix(armpit[0], 0, 0.36), armpit[1] + 12])], false),
  ]);
  const drapes = sides.flatMap((s) => [0.5, 0.8].map((k) => curve([at(s, [teeHalf * k, y.chest + 1]), at(s, [teeHalf * (k + 0.03), mix(y.chest, hemY, 0.55)]), at(s, [hemHalf * (k + 0.05), hemY - 0.6])], false)));
  const strains = sides.flatMap((s) => [y.chest + 2, y.waist - 1].map((yy) => curve([at(s, [torsoAt(yy) + 0.4, yy - 2.5]), at(s, [torsoAt(yy) * 0.55, yy - 0.4]), at(s, [torsoAt(yy) * 0.12, yy + 0.4])], false)));
  const hemStitch = curve([[-hemCorner + 0.5, hemY - 2.1], [-hemCorner * 0.55, hemY - 1.5], [0, hemY - 1.3], [hemCorner * 0.55, hemY - 1.5], [hemCorner - 0.5, hemY - 2.1]], false);
  const cuffStitch = curve([off(lerp(cuffInner, cuffOuter, 0.05), d1, -1.7), off(cuff, d1, -1.45), off(lerp(cuffInner, cuffOuter, 0.95), d1, -1.7)], false);
  const armholeSeam = curve([seam, armholeMid, armpit], false);

  const right = { arm: rightArm, sleeve: rightSleeve };
  const reach = (yy: number) => Math.max(reachAt(panel, yy), reachAt(right.sleeve, yy), reachAt(right.arm, yy), reachAt(silhouette, yy));
  return {
    altura,
    silhouette: curve(silhouette),
    arms: sides.map((s) => curve(s > 0 ? right.arm : right.arm.map(flip))),
    armClips: sides.map((s) => `M${armClip.map((p) => `${f(p[0] * s)} ${f(p[1])}`).join(" L")} Z`),
    cuffShade: sides.map((s) => curve([at(s, off(cuffInner, d1, -0.4)), at(s, off(cuffOuter, d1, -0.4)), at(s, off(cuffOuter, d1, 2.2)), at(s, off(cuffInner, d1, 2.2))].map(sharp))),
    sleeves: sides.map((s) => curve(s > 0 ? right.sleeve : right.sleeve.map(flip))),
    armholes: sides.map((s) => (s > 0 ? armholeSeam : curve([flip(seam), flip(armholeMid), flip(armpit)], false))),
    cuffStitches: sides.map((s) => (s > 0 ? cuffStitch : curve([off(lerp(cuffInner, cuffOuter, 0.05), d1, -1.7), off(cuff, d1, -1.45), off(lerp(cuffInner, cuffOuter, 0.95), d1, -1.7)].map(flip), false))),
    panel: curve(panel),
    backBand,
    band: curve(band),
    bandShadow: curve([...bandOuter, ...bandOuter.slice(0, -1).reverse().map(flip)].map((p) => [p[0], p[1] + 0.6] as Pt), false),
    ribs,
    neckFront,
    neckClip,
    folds,
    drapes,
    strains,
    hemStitch,
    loose,
    tight,
    hemShadow: { x: -hemCorner, y: hemY - 0.4, width: hemCorner * 2, height: 3 },
    chestLight: { cx: -teeHalf * 0.22, cy: y.chest - 2, rx: teeHalf * 0.45, ry: 10 },
    mark: { x: teeHalf * 0.5, y: y.hps + 13.5 },
    ground: { cx: 0, cy: altura, rx: ankleX + footHalf + 6, ry: 1.8 },
    callouts: { busto: { y: y.chest, edge: reach(y.chest) }, cintura: { y: y.waist, edge: reach(y.waist) }, quadril: { y: y.hip, edge: reach(y.hip) } },
  };
}

const SPRING = { type: "spring", stiffness: 110, damping: 20 } as const;

export function FitFigure({ profile, size, className = "" }: { profile: BodyProfile; size: SizeRow; className?: string }) {
  const id = useId().replace(/:/g, "");
  const figure = figureFor(profile, size);
  const S = Math.min(SCALE, MAX_FIGURE / figure.altura);
  const top = FLOOR - figure.altura * S;
  // Everything below is drawn in cm: x from the body's centre line, y from the crown.
  const toPx = `translate(${CENTER} ${top}) scale(${S})`;
  const value = (field: keyof BodyProfile) => measure(profile, field);
  const altura = value("altura");
  const ref = (name: string) => `url(#${id}-${name})`;
  const morph = (d: string) => ({ initial: false as const, animate: { d }, transition: SPRING });

  return <svg viewBox={`0 0 ${W} ${H}`} className={className} role="img" aria-label={`Figura com as suas medidas vestindo a camiseta Merano no tamanho ${size.size}`}>
    <defs>
      {/* The silhouette's sea-blue, deep at the head and lighter toward the feet, continuous across body and arms. */}
      <linearGradient id={`${id}-body`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2={figure.altura}><stop offset="0" stopColor="#3a6fb4" /><stop offset=".5" stopColor="#4d95c9" /><stop offset="1" stopColor="#7fd6f5" /></linearGradient>
      <linearGradient id={`${id}-tee`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#cfc6b7" /><stop offset=".12" stopColor="#e2dbce" /><stop offset=".42" stopColor="#f2ede5" /><stop offset=".7" stopColor="#ebe5db" /><stop offset=".9" stopColor="#dcd4c7" /><stop offset="1" stopColor="#cbc1b2" /></linearGradient>
      <linearGradient id={`${id}-tee-fall`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity=".22" /><stop offset=".45" stopColor="#fff" stopOpacity="0" /><stop offset="1" stopColor="#5b4a34" stopOpacity=".1" /></linearGradient>
      <linearGradient id={`${id}-sleeve`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#d2c9bb" /><stop offset=".4" stopColor="#ede7de" /><stop offset=".75" stopColor="#e6dfd4" /><stop offset="1" stopColor="#ccc2b3" /></linearGradient>
      <filter id={`${id}-soft`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation=".45" /></filter>
      <filter id={`${id}-softer`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.3" /></filter>
      <filter id={`${id}-lift`} x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy=".5" stdDeviation=".7" floodColor="#2b2116" floodOpacity=".28" /></filter>
      <filter id={`${id}-glow`} x="-30%" y="-10%" width="160%" height="120%"><feDropShadow dx="0" dy="1.2" stdDeviation="2.4" floodColor="#03161a" floodOpacity=".45" /></filter>
      <clipPath id={`${id}-panel`}><motion.path {...morph(figure.panel)} /></clipPath>
      <clipPath id={`${id}-neck`}><motion.path {...morph(figure.neckClip)} /></clipPath>
      {figure.armClips.map((d, index) => <clipPath key={index} id={`${id}-arm-${index}`}><motion.path {...morph(d)} /></clipPath>)}
    </defs>

    <g transform={toPx}>
      <motion.ellipse initial={false} animate={figure.ground} transition={SPRING} fill="#000" fillOpacity={0.35} filter={ref("softer")} />

      <g filter={ref("glow")}>
        <motion.path {...morph(figure.silhouette)} fill={ref("body")} />
        <motion.rect initial={false} animate={figure.hemShadow} transition={SPRING} fill="#0b2340" fillOpacity={0.35} filter={ref("softer")} />

        {/* The tee's body, with the inside of the back band showing beside the neck */}
        <motion.path {...morph(figure.panel)} fill={ref("tee")} />
        <g clipPath={ref("panel")}>
          <motion.path {...morph(figure.panel)} fill={ref("tee-fall")} />
          <motion.ellipse initial={false} animate={figure.chestLight} transition={SPRING} fill="#fff" fillOpacity={0.28} filter={ref("softer")} />
          {figure.drapes.map((d, index) => <motion.path key={index} initial={false} animate={{ d, strokeOpacity: figure.loose }} transition={SPRING} fill="none" stroke="#6f5e47" strokeWidth={0.9} strokeLinecap="round" filter={ref("soft")} />)}
          {figure.folds.map((d, index) => <motion.path key={index} {...morph(d)} fill="none" stroke="#6f5e47" strokeOpacity={0.22} strokeWidth={0.75} strokeLinecap="round" filter={ref("soft")} />)}
          {figure.strains.map((d, index) => <motion.path key={index} initial={false} animate={{ d, strokeOpacity: figure.tight }} transition={SPRING} fill="none" stroke="#6f5e47" strokeWidth={0.6} strokeLinecap="round" filter={ref("soft")} />)}
          <motion.path {...morph(figure.hemStitch)} fill="none" stroke="#a69a87" strokeWidth={0.14} strokeDasharray=".55 .4" />
          <motion.path {...morph(figure.bandShadow)} fill="none" stroke="#4a3b28" strokeOpacity={0.3} strokeWidth={0.9} filter={ref("soft")} />
        </g>
        <motion.path {...morph(figure.backBand)} fill="#b9ad9c" />

        {/* Neck rising out of the collar */}
        <g clipPath={ref("neck")}><motion.path {...morph(figure.neckFront)} fill={ref("body")} /></g>

        {/* Forearms leaving the sleeves, then the sleeves over them */}
        {figure.arms.map((d, index) => <g key={index} clipPath={ref(`arm-${index}`)} filter={ref("lift")}>
          <motion.path {...morph(d)} fill={ref("body")} />
          <motion.path {...morph(figure.cuffShade[index])} fill="#0b2340" fillOpacity={0.45} filter={ref("soft")} />
        </g>)}
        {figure.sleeves.map((d, index) => <g key={index} filter={ref("lift")}>
          <motion.path {...morph(d)} fill={ref("sleeve")} />
          <motion.path {...morph(figure.cuffStitches[index])} fill="none" stroke="#a69a87" strokeWidth={0.14} strokeDasharray=".55 .4" />
          <motion.path {...morph(figure.armholes[index])} fill="none" stroke="#9c907c" strokeOpacity={0.55} strokeWidth={0.14} />
        </g>)}

        <motion.path {...morph(figure.band)} fill="#e7e1d6" />
        <motion.path {...morph(figure.ribs)} fill="none" stroke="#9d927f" strokeOpacity={0.28} strokeWidth={0.07} />
        <motion.text initial={false} animate={figure.mark} transition={SPRING} textAnchor="middle" fontSize={1.25} letterSpacing={0.14} fill="#22201c" style={{ fontFamily: "var(--font-serif), Georgia, serif" }}>MERANO</motion.text>
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
