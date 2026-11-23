// The owners allowed into /admin: OWNER_EMAILS, comma-separated. Server-side only (the list never reaches the browser).
export function isOwner(email?: string | null) {
  if (!email) return false;
  const owners = (process.env.OWNER_EMAILS ?? "").split(",").map((owner) => owner.trim().toLowerCase()).filter(Boolean);
  return owners.includes(email.trim().toLowerCase());
}

export type Amr = { method: string } | string;

// Signed in through Google in this session. Google has checked that the address is theirs; a password sign-up has not,
// so an account made with an owner's e-mail and a password never reaches the panel.
export const viaGoogle = (amr?: readonly Amr[] | null) => !!amr?.some((entry) => (typeof entry === "string" ? entry : entry.method) === "oauth");

// A fixed owner (OWNER_EMAILS) signed in through Google. Administrators made in the panel: see lib/admins (ehAdmin).
export function isOwnerSession(email?: string | null, amr?: readonly Amr[] | null) {
  return isOwner(email) && viaGoogle(amr);
}
