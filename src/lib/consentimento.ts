// Shared by the cookie banner and the coupon popup, so the two never open at the same time.
export const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID && /^[a-z0-9]{6,20}$/i.test(process.env.NEXT_PUBLIC_CLARITY_ID) ? process.env.NEXT_PUBLIC_CLARITY_ID : null;
export const CHAVE_CONSENTIMENTO = "meranno-consentimento-analise";
export const EVENTO_CONSENTIMENTO = "meranno-consentimento-decidido";

export function lerConsentimento(): "sim" | "nao" | null {
  try {
    const valor = window.localStorage.getItem(CHAVE_CONSENTIMENTO);
    return valor === "sim" || valor === "nao" ? valor : null;
  } catch {
    return null;
  }
}

// True while the cookie banner is on screen waiting for an answer.
export const avisoDeCookiesPendente = () => CLARITY_ID !== null && lerConsentimento() === null;
