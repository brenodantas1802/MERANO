"use client";

import { useSyncExternalStore } from "react";

import { EMPTY_PROFILE, type BodyProfile, type ProfileField } from "./body-measure";

// Client-side body profile until accounts and the database are wired up; mirrors the BodyProfile model in
// prisma/schema.prisma so it can be synced to the customer's account later. The shape and the readers live in
// body-measure.ts, shared with the server.
export { EMPTY_PROFILE, measure, RANGES, type BodyProfile, type ProfileField } from "./body-measure";

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
