// The owners allowed into /admin: OWNER_EMAILS, comma-separated. Server-side only (the list never reaches the browser).
export function isOwner(email?: string | null) {
  if (!email) return false;
  const owners = (process.env.OWNER_EMAILS ?? "").split(",").map((owner) => owner.trim().toLowerCase()).filter(Boolean);
  return owners.includes(email.trim().toLowerCase());
}
