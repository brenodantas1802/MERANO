// Pre-sale lock (asked for by the owners on 2026-11-17).
//   PRE_VENDA=1             locks the site: without the access cookie every page shows "Coming soon" (/em-breve).
//   Who gets in: the people on the pre-sale list (/admin → "Pré-venda", table pre_venda_autorizados) and the owners.
//   They sign in on /pre-venda (the link sent to the WhatsApp group); the site checks the account against the list
//   and gives that browser the access cookie. On another device they just sign in again.
//   The cookie is signed with PRE_VENDA_SEGREDO, or with SUPABASE_SECRET_KEY when that isn't set (the list needs that
//   key anyway). Changing the secret sends everyone back to "Coming soon" until they sign in again.
//   PRE_VENDA_GRUPO_URL     optional; WhatsApp group link for the "Quero entrar no grupo" button on the locked page

export const COOKIE_ACESSO = "meranno_convite";
// Short-lived and readable by the page: it plays the opening animation once, right after access is granted.
export const COOKIE_ENTRADA = "meranno_entrada";
// Runs in <body> before anything paints: marks <html> so the felt veil covers the page from the first frame.
export const SCRIPT_ENTRADA = `if(document.cookie.indexOf("${COOKIE_ENTRADA}=1")>-1)document.documentElement.classList.add("entrada")`;
// Browsers keep a cookie for at most 400 days; after that a sign-in on /pre-venda renews it.
export const DIAS_ACESSO = 400;

// Open even while locked: the locked page, the pre-sale sign-in, the account pages (and /auth, where the e-mail and
// Google links land), the owners' panel (it has its own check) and the legal pages.
export const ROTAS_LIVRES = ["/em-breve", "/pre-venda", "/conta", "/auth", "/admin", "/privacidade", "/termos"];

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

// Cookie value: "<account id>.<expiry in unix seconds>.<HMAC>". Checked in the proxy without touching the database.
export async function assinarAcesso(id: string) {
  const corpo = `${id}.${Math.floor(Date.now() / 1000) + DIAS_ACESSO * 86400}`;
  const assinatura = await crypto.subtle.sign("HMAC", await chave(), texto(corpo));
  return `${corpo}.${Buffer.from(assinatura).toString("base64url")}`;
}

export async function acessoValido(cookie?: string) {
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

export const opcoesCookieAcesso = (secure: boolean) => ({ httpOnly: true, secure, sameSite: "lax" as const, path: "/", maxAge: DIAS_ACESSO * 86400 });
export const opcoesCookieEntrada = (secure: boolean) => ({ secure, sameSite: "lax" as const, path: "/", maxAge: 120 });
