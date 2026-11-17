// Pre-sale lock (asked for by the owners on 2026-11-17).
//   PRE_VENDA=1             locks the site: without a valid invite cookie every page shows "Coming soon" (/em-breve).
//   Invites are created in /admin (table convites_pre_venda). Each has its own link <site>/convite/<codigo>, a use
//   counter and an optional limit; switching one off stops new entries through it.
//   The invite cookie is signed with PRE_VENDA_SEGREDO, or with SUPABASE_SECRET_KEY when that isn't set (the panel
//   needs that key anyway). Changing the secret sends everyone back to "Coming soon".
//   PRE_VENDA_GRUPO_URL     optional; WhatsApp group link for the "Quero entrar no grupo" button on the locked page

export const COOKIE_CONVITE = "meranno_convite";
// Short-lived and readable by the page: it plays the opening animation once, right after the invite link.
export const COOKIE_ENTRADA = "meranno_entrada";
// Runs in <body> before anything paints: marks <html> so the felt veil covers the page from the first frame.
export const SCRIPT_ENTRADA = `if(document.cookie.indexOf("${COOKIE_ENTRADA}=1")>-1)document.documentElement.classList.add("entrada")`;
export const DIAS_CONVITE = 90;

// Open even while locked: the locked page itself, the invite, sign-in (an invited customer signs in to order; the
// e-mail and Google links land on /auth), the owners' panel (it has its own check) and the legal pages.
export const ROTAS_LIVRES = ["/em-breve", "/convite", "/conta", "/auth", "/admin", "/privacidade", "/termos"];

const segredo = () => process.env.PRE_VENDA_SEGREDO || process.env.SUPABASE_SECRET_KEY || "";

export const preVendaAtiva = () => process.env.PRE_VENDA === "1" && Boolean(segredo());

export const rotaLivre = (path: string) => ROTAS_LIVRES.some((rota) => path === rota || path.startsWith(`${rota}/`));

const texto = (valor: string) => new TextEncoder().encode(valor);

let chaveGuardada: { segredo: string; chave: Promise<CryptoKey> } | null = null;
function chave() {
  const atual = segredo();
  if (chaveGuardada?.segredo !== atual) chaveGuardada = { segredo: atual, chave: crypto.subtle.importKey("raw", texto(`meranno-pre-venda|${atual}`), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]) };
  return chaveGuardada.chave;
}

// Cookie value: "<invite id>.<expiry in unix seconds>.<HMAC>". Checked in the proxy without touching the database.
export async function assinarConvite(id: string) {
  const corpo = `${id}.${Math.floor(Date.now() / 1000) + DIAS_CONVITE * 86400}`;
  const assinatura = await crypto.subtle.sign("HMAC", await chave(), texto(corpo));
  return `${corpo}.${Buffer.from(assinatura).toString("base64url")}`;
}

export async function conviteValido(cookie?: string) {
  if (!cookie || !segredo()) return false;
  const partes = cookie.split(".");
  if (partes.length !== 3) return false;
  const [id, expira, assinatura] = partes;
  if (!/^\d{9,12}$/.test(expira) || Number(expira) * 1000 < Date.now()) return false;
  try {
    return await crypto.subtle.verify("HMAC", await chave(), Buffer.from(assinatura, "base64url"), texto(`${id}.${expira}`));
  } catch {
    return false;
  }
}

// Invite codes: 10 characters without look-alikes (no 0/o, 1/l/i), about 49 bits — not guessable.
const LETRAS = "abcdefghjkmnpqrstuvwxyz23456789";
export function gerarCodigo() {
  return Array.from(crypto.getRandomValues(new Uint8Array(10)), (byte) => LETRAS[byte % LETRAS.length]).join("");
}
export const codigoValido = (codigo: string) => /^[a-z0-9]{6,40}$/.test(codigo);
