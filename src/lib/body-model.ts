import { measure, type BodyProfile } from "./body-profile";
import type { SizeRow } from "./products";

// The customer's body as the size recommendation and the Merano Fit figure both see it, so the size we suggest and
// the tee we draw always agree. Whatever wasn't measured comes from average human proportions (ANSUR II, men and
// women alike once scaled by height): heights are shares of stature measured from the floor.
const HEIGHT = { hps: 0.845, acromion: 0.82, axilla: 0.745, chest: 0.72, waist: 0.62, hip: 0.5, crotch: 0.475, knee: 0.285, ankle: 0.045, elbow: 0.63, wrist: 0.485 };

export type Body = {
  altura: number;
  // Circumferences, and the shoulder measured over the back from point to point (cm).
  busto: number;
  cintura: number;
  quadril: number;
  ombro: number;
  // True when the chest was guessed from height and weight rather than measured.
  bustoEstimated: boolean;
  head: number;
  // Heights from the floor (cm). hps is the side of the neck, where a tee's length is measured from.
  y: Record<keyof typeof HEIGHT, number>;
  // Full widths seen from the front (cm).
  w: { chest: number; waist: number; hip: number; shoulders: number; deltoids: number; neck: number; head: number; upperArm: number; forearm: number; wrist: number; thigh: number; knee: number; calf: number; ankle: number; foot: number };
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

// Chest from height and weight when it wasn't measured (fits average men and women within a couple of cm).
export const estimateBusto = (altura: number, peso: number) => clamp(0.55 * peso + 0.15 * altura + 28.5, 70, 160);

export function bodyModel(profile: BodyProfile): Body {
  const altura = measure(profile, "altura") ?? 175;
  const peso = measure(profile, "peso");
  const measuredBusto = measure(profile, "busto");
  const bustoEstimated = !measuredBusto && !!peso;
  const busto = measuredBusto ?? (peso ? estimateBusto(altura, peso) : 96);
  const bmi = peso ? peso / (altura / 100) ** 2 : 23;
  const cintura = measure(profile, "cintura") ?? busto * clamp(0.8 + (bmi - 23) * 0.012, 0.72, 0.98);
  const quadril = measure(profile, "quadril") ?? busto * 1.01;
  const ombro = measure(profile, "ombro") ?? busto * 0.455;
  const braco = measure(profile, "braco");
  const tronco = measure(profile, "tronco");
  const entrepernas = measure(profile, "entrepernas");

  const y = Object.fromEntries(Object.entries(HEIGHT).map(([key, share]) => [key, share * altura])) as Body["y"];
  // The optional measurements move the landmarks they describe, within what a human body allows.
  if (tronco) y.waist = clamp(y.hps - tronco, altura * 0.56, altura * 0.67);
  if (entrepernas) y.crotch = clamp(y.ankle + entrepernas, altura * 0.42, altura * 0.53);
  else if (tronco) y.crotch = clamp(y.waist - altura * 0.145, altura * 0.42, altura * 0.53);
  y.hip = Math.min(y.hip, y.crotch + altura * 0.04);
  if (braco) y.wrist = clamp(y.acromion - braco, altura * 0.44, altura * 0.53);
  y.elbow = y.acromion - (y.acromion - y.wrist) * 0.56;

  const build = clamp(1 + (bmi - 23) * 0.025, 0.85, 1.45);
  const shoulders = ombro * 0.87;
  const w = {
    chest: busto * 0.325,
    waist: cintura * 0.33,
    hip: quadril * 0.35,
    shoulders,
    deltoids: shoulders * 1.18 * build ** 0.25,
    neck: busto * 0.115 * build ** 0.2,
    head: 16 * (altura / 175) ** 0.3 * build ** 0.12,
    // The arms hang with the palms toward the thighs, so from the front the forearm and wrist show their thickness.
    upperArm: busto * 0.1 * build ** 0.35,
    forearm: busto * 0.077 * build ** 0.25,
    wrist: busto * 0.041 * build ** 0.15,
    thigh: quadril * 0.185 * build ** 0.2,
    knee: quadril * 0.11 * build ** 0.1,
    calf: quadril * 0.118 * build ** 0.15,
    ankle: 7 * (altura / 175) ** 0.5,
    foot: 9.6 * (altura / 175) ** 0.8,
  };
  return { altura, busto, cintura, quadril, ombro, bustoEstimated, head: 23.3 * (altura / 175) ** 0.5, y, w };
}

// How a tee of the given flat measurements hangs on this body, seen from the front.
export type WornTee = {
  // Garment circumference minus the body's at the chest (cm): the ease, negative when it stretches.
  ease: number;
  width: number; // visible width below the sleeves
  hemWidth: number;
  hem: number; // height of the hem from the floor
  // Hem height over the crotch: positive when the tee ends above it.
  hemOverCrotch: number;
  shoulder: number; // visible distance between the shoulder seams
  sleeve: { length: number; width: number }; // visible width at the opening
  armhole: number; // depth of the armhole below the side of the neck
  stretched: boolean;
};

// The chart only gives the body of the tee; the sleeve and armhole of the brand's dropped-shoulder cut follow from it.
const SLEEVE_PER_LENGTH = 0.31;
const OPENING_PER_WIDTH = 0.34;
const ARMHOLE_PER_LENGTH = 0.34;

export function wearTee(body: Body, row: SizeRow): WornTee {
  const circumference = row.largura * 2;
  const ease = circumference - body.busto;
  // Front panel spans the chest; the fabric left over hangs at the sides, and past a point it falls in folds
  // instead of spreading further.
  const width = clamp(body.w.chest + ease * 0.9, body.w.chest + 1, row.largura * 0.86);
  const hemWidth = Math.max(width * 0.96, body.w.hip + 2, body.w.waist + 2);
  // Going over the chest (and around it, when tight) uses up some of the length.
  const drape = 2 + clamp((body.busto - 90) * 0.06, 0, 2.5) + clamp((12 - ease) * 0.08, 0, 1.5);
  const hem = body.y.hps - row.comprimento + drape;
  return {
    ease,
    width,
    hemWidth,
    hem,
    hemOverCrotch: hem - body.y.crotch,
    shoulder: Math.max(row.ombro * 0.92, body.w.shoulders + 1),
    // Hanging along the body, the sleeve is seen almost edge-on: about 70% of its flat opening shows.
    sleeve: { length: row.comprimento * SLEEVE_PER_LENGTH, width: Math.max(row.largura * OPENING_PER_WIDTH * 0.7, body.w.upperArm + 2) },
    armhole: row.comprimento * ARMHOLE_PER_LENGTH,
    stretched: ease < 0,
  };
}

// Ease the brand's wide cut is drawn around: with 16 cm the chart lands on the usual Brazilian sizes
// (PP up to 88 cm of chest, P 94, M 100, G 106, GG 112) and the tee still falls loose.
export const AMPLE_EASE = 16;
// The hem may end this far above the crotch before the tee reads as short.
export const HEM_ABOVE_CROTCH = 5;

// How this size sits on the chest and in length, completing "No M, a camiseta ...".
export function fitNote(body: Body, row: SizeRow) {
  const tee = wearTee(body, row);
  const chest = tee.ease < 6 ? "fica justa" : tee.ease < AMPLE_EASE - 2 ? "fica mais rente que o pensado" : tee.ease <= 26 ? "cai ampla, como foi pensada" : "fica bem solta";
  const length = tee.hemOverCrotch > HEM_ABOVE_CROTCH ? "fica curta no comprimento" : tee.hemOverCrotch < -11 ? "fica bem comprida" : tee.hemOverCrotch < -5 ? "fica um pouco mais comprida" : null;
  if (!length) return chest;
  return chest.startsWith("fica ") ? `${chest} e ${length.slice(5)}` : `${chest}, e ${length}`;
}
