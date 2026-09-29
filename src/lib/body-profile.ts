"use client";

import { useSyncExternalStore } from "react";

// Client-side body profile until accounts and the database are wired up; mirrors the BodyProfile model in
// prisma/schema.prisma so it can be synced to the customer's account later. Values stay as strings (form input).
export type BodyProfile = {
  altura: string;
  peso: string;
  busto: string;
  cintura: string;
  quadril: string;
  ombro: string;
  braco: string;
  tronco: string;
  entrepernas: string;
  idade: string;
};

export type ProfileField = keyof BodyProfile;

export const EMPTY_PROFILE: BodyProfile = { altura: "", peso: "", busto: "", cintura: "", quadril: "", ombro: "", braco: "", tronco: "", entrepernas: "", idade: "" };

const STORAGE_KEY = "merano-body-profile";
// Measurements saved by the first version of Meu Merano Fit, picked up so nobody has to type them again.
const LEGACY_KEY = "merano-fit-measurements";

const listeners = new Set<() => void>();
let cached: BodyProfile = EMPTY_PROFILE;
let initialized = false;

function readStorage(): BodyProfile {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY) ?? window.localStorage.getItem(LEGACY_KEY);
    return raw ? { ...EMPTY_PROFILE, ...JSON.parse(raw) } : EMPTY_PROFILE;
  } catch {
    return EMPTY_PROFILE;
  }
}

function write(profile: BodyProfile) {
  cached = profile;
  initialized = true;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // Private mode or blocked storage: the profile still works for this visit.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  if (!initialized) {
    cached = readStorage();
    initialized = true;
  }
  return cached;
}

const getServerSnapshot = () => EMPTY_PROFILE;

export function useBodyProfile() {
  const profile = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return {
    profile,
    update: (field: ProfileField, value: string) => write({ ...getSnapshot(), [field]: value }),
    reset: () => write(EMPTY_PROFILE),
    hasAny: Object.values(profile).some(Boolean),
  };
}

// Parsed measurement in cm/kg, or null when empty or out of a plausible human range.
export function measure(profile: BodyProfile, field: ProfileField): number | null {
  const value = Number(String(profile[field]).replace(",", "."));
  if (!Number.isFinite(value) || value <= 0) return null;
  const [min, max] = RANGES[field];
  return value >= min && value <= max ? value : null;
}

export const RANGES: Record<ProfileField, [number, number]> = {
  altura: [100, 230],
  peso: [30, 250],
  busto: [60, 180],
  cintura: [45, 180],
  quadril: [60, 190],
  ombro: [28, 65],
  braco: [40, 90],
  tronco: [30, 70],
  entrepernas: [55, 110],
  idade: [10, 110],
};
