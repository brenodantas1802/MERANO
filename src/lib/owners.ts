// The owners allowed into /admin: OWNER_EMAILS, comma-separated. Server-side only (the list never reaches the browser).
export function isOwner(email?: string | null) {
  if (!email) return false;
  const owners = (process.env.OWNER_EMAILS ?? "").split(",").map((owner) => owner.trim().toLowerCase()).filter(Boolean);
  return owners.includes(email.trim().toLowerCase());
}

type Amr = { method: string } | string;

// An owner signed in through Google in this session. Google has checked that the address is theirs; a password
// sign-up has not, so an account made with an owner's e-mail and a password never reaches the panel.
export function isOwnerSession(email?: string | null, amr?: readonly Amr[] | null) {
  return isOwner(email) && !!amr?.some((entry) => (typeof entry === "string" ? entry : entry.method) === "oauth");
}
