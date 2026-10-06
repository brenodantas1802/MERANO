// The body profile's shape and how its fields are read, with no browser code, so the server (the try-on route) and
// the client (Merano Fit, the size recommendation) share them. Values stay as strings, as typed in the form.
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

// Parsed measurement in cm/kg, or null when empty or out of a plausible human range.
export function measure(profile: BodyProfile, field: ProfileField): number | null {
  const value = Number(String(profile[field] ?? "").replace(",", "."));
  if (!Number.isFinite(value) || value <= 0) return null;
  const [min, max] = RANGES[field];
  return value >= min && value <= max ? value : null;
}
