"use client";

import { X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

const SEEN_KEY = "merano-discount-popup-seen";
const ACCOUNT_KEY = "merano-account-exists";

export function FirstPurchasePopup() {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const seen = window.localStorage.getItem(SEEN_KEY);
    const hasAccount = window.localStorage.getItem(ACCOUNT_KEY);
    if (seen || hasAccount) return;
    const timer = setTimeout(() => setVisible(true), 1800);
    return () => clearTimeout(timer);
  }, []);

  function close() {
    setVisible(false);
    window.localStorage.setItem(SEEN_KEY, "1");
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    window.localStorage.setItem("merano-discount-email", email);
    window.localStorage.setItem(SEEN_KEY, "1");
    setSent(true);
    setTimeout(() => setVisible(false), 2200);
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
            className="relative w-full max-w-md overflow-hidden bg-[var(--creme)] p-8 shadow-2xl md:p-10"
          >
            <button onClick={close} aria-label="Fechar" className="absolute right-4 top-4 text-[var(--muted)] transition-colors hover:text-[var(--ink)]"><X size={18} strokeWidth={1.5} /></button>
            <div className="mb-6 h-1 w-12" style={{ background: "linear-gradient(to right, #F37C22, #FABD4B)" }} />
            {sent ? (
              <div>
                <h2 className="display text-4xl">Combinado.</h2>
                <p className="mt-4 text-[var(--muted)]">Seu cupom de 10% chega em breve no e-mail cadastrado. Obrigado por chegar cedo.</p>
              </div>
            ) : (
              <>
                <p className="sans mb-3 text-[10px] uppercase tracking-[.2em] text-[var(--muted)]">Só para quem está chegando agora</p>
                <h2 className="display text-4xl leading-none md:text-5xl">10% na sua<br />primeira compra.</h2>
                <p className="mt-4 text-[var(--muted)]">Deixe seu e-mail e a gente envia o cupom. Sem spam, só as novidades da coleção.</p>
                <form onSubmit={submit} className="sans mt-7 flex flex-col gap-3 sm:flex-row">
                  <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="seu@email.com" className="w-full border-b border-[var(--ink)] bg-transparent py-3 text-sm outline-none" />
                  <button type="submit" className="shrink-0 bg-[var(--ink)] px-6 py-3 text-[11px] uppercase tracking-[.15em] text-[var(--creme)] transition-opacity hover:opacity-85">Quero o cupom</button>
                </form>
                <button onClick={close} className="sans mt-5 text-[10px] uppercase tracking-[.14em] text-[var(--muted)] underline underline-offset-4">Agora não</button>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
