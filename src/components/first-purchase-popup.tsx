"use client";

import { X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { avisoDeCookiesPendente, EVENTO_CONSENTIMENTO } from "@/lib/consentimento";

const SEEN_KEY = "merano-discount-popup-seen";
const ACCOUNT_KEY = "merano-account-exists";

export function FirstPurchasePopup() {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [consent, setConsent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const seen = window.localStorage.getItem(SEEN_KEY);
    const hasAccount = window.localStorage.getItem(ACCOUNT_KEY);
    if (seen || hasAccount) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    // Never over the pre-sale padlock animation (<html class="entrada">): after it, the visitor gets a few seconds
    // with the site before the coupon shows.
    const start = (espera = 1800) => {
      timer = setTimeout(() => (document.documentElement.classList.contains("entrada") ? start(6000) : setVisible(true)), espera);
    };
    // Waits for the cookie banner to be answered, so two notices never stack.
    const aoConsentir = () => start();
    if (!avisoDeCookiesPendente()) start();
    else window.addEventListener(EVENTO_CONSENTIMENTO, aoConsentir, { once: true });
    return () => { clearTimeout(timer); window.removeEventListener(EVENTO_CONSENTIMENTO, aoConsentir); };
  }, []);

  function close() {
    setVisible(false);
    window.localStorage.setItem(SEEN_KEY, "1");
  }

  // The e-mail goes to the team (Supabase, listed in /admin) only with the visitor's consent (LGPD).
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!consent) return setError("Marque a caixa para receber o cupom.");
    setError("");
    setSending(true);
    try {
      const response = await fetch("/api/cupom", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, consentimento: true }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não consegui guardar seu e-mail agora.");
      window.localStorage.setItem(SEEN_KEY, "1");
      setSent(true);
      setTimeout(() => setVisible(false), 2600);
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : "Não consegui guardar seu e-mail agora.");
    } finally {
      setSending(false);
    }
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 p-4 backdrop-blur-sm md:items-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-md overflow-hidden rounded-3xl bg-[var(--creme)] p-8 shadow-2xl md:p-10"
          >
            <button onClick={close} aria-label="Fechar" className="absolute right-2 top-2 flex h-11 w-11 items-center justify-center text-[var(--muted)] transition-colors hover:text-[var(--ink)]"><X size={18} strokeWidth={1.5} /></button>
            <div className="mb-6 h-1 w-12" style={{ background: "linear-gradient(to right, #551E2B, #BA9654)" }} />
            {sent ? (
              <div>
                <h2 className="display text-4xl">Combinado.</h2>
                <p className="mt-4 text-[var(--muted)]">Recebemos seu e-mail. A equipe Meranno envia o cupom de 10% para ele. Obrigado por chegar cedo.</p>
              </div>
            ) : (
              <>
                <p className="sans mb-3 text-[11px] uppercase tracking-[.2em] text-[var(--muted)]">Só para quem está chegando agora</p>
                <h2 className="display text-4xl leading-none md:text-5xl">10% na sua<br />primeira compra.</h2>
                <p className="mt-4 text-[var(--muted)]">Deixe seu e-mail e a gente envia o cupom. Sem spam, só as novidades da coleção.</p>
                <form onSubmit={submit} className="sans mt-7 flex flex-col gap-3 sm:flex-row">
                  <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="seu@email.com" className="h-11 w-full border-b border-[var(--ink)] bg-transparent text-sm outline-none" />
                  <button type="submit" disabled={sending} className="min-h-11 shrink-0 rounded-full bg-[var(--vinho)] px-6 text-[11px] uppercase tracking-[.15em] text-[var(--creme)] transition-opacity hover:opacity-85 disabled:opacity-60">{sending ? "Enviando…" : "Quero o cupom"}</button>
                </form>
                <label className="sans mt-3 flex min-h-11 cursor-pointer items-start gap-3 text-[12px] leading-snug text-[var(--muted)]">
                  <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--vinho)]" />
                  <span>Aceito receber o cupom e novidades da Meranno por e-mail. Posso cancelar quando quiser. <a href="/privacidade" className="underline underline-offset-2">Privacidade</a></span>
                </label>
                {error && <p role="alert" className="sans mt-2 text-[12px] text-[#8a3a2c]">{error}</p>}
                <button onClick={close} className="sans mt-3 min-h-11 text-[11px] uppercase tracking-[.14em] text-[var(--muted)] underline underline-offset-4">Agora não</button>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
