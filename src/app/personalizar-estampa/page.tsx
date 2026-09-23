"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { ScrollReveal } from "@/components/scroll-reveal";
import { Countdown } from "@/components/countdown";
import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collision";

const LAUNCH_DATE = "2026-11-22T00:00:00";

export default function CustomPrintPage() {
  const [email, setEmail] = useState("");
  const [notified, setNotified] = useState(false);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    window.localStorage.setItem("merano-notify-personalizar", email);
    setNotified(true);
  }

  return <main className="min-h-screen bg-[var(--terra-dark)] text-[var(--creme)]">
    <SiteHeader />
    <BackgroundBeamsWithCollision className="h-auto min-h-[calc(100vh-5rem)] py-16">
      <div className="mx-auto max-w-3xl px-6 text-center md:px-12">
        <Link href="/" className="sans mb-16 inline-flex items-center gap-2 text-[10px] uppercase tracking-[.15em] text-[var(--creme)]/70"><ArrowLeft size={14} /> Voltar para o início</Link>
        <ScrollReveal>
          <p className="sans mb-5 text-[10px] uppercase tracking-[.2em]" style={{ color: "#FABD4B" }}>Em breve</p>
          <h1 className="display relative z-20 text-6xl md:text-8xl">Personalizar<br /><i>estampa.</i></h1>
          <p className="relative z-20 mx-auto mt-8 max-w-xl text-xl leading-snug text-[var(--creme)]/85">Estamos construindo uma forma de você criar a sua própria estampa, do jeito que só a Merano poderia entregar.</p>
        </ScrollReveal>

        <ScrollReveal delay={0.1} className="relative z-20 mx-auto mt-16 max-w-xl"><Countdown target={LAUNCH_DATE} /></ScrollReveal>

        <ScrollReveal delay={0.15} className="relative z-20 mx-auto mt-16 max-w-sm">
          {notified ? (
            <p className="text-lg">Combinado — avisamos você assim que abrir.</p>
          ) : (
            <form onSubmit={submit} className="sans flex flex-col gap-3 sm:flex-row">
              <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="seu@email.com" className="w-full border-b border-[var(--creme)]/40 bg-transparent py-3 text-sm text-[var(--creme)] outline-none placeholder:text-[var(--creme)]/50" />
              <button type="submit" className="shrink-0 bg-[var(--creme)] px-6 py-3 text-[11px] uppercase tracking-[.15em] text-[var(--terra-dark)] transition-opacity hover:opacity-85">Avise-me</button>
            </form>
          )}
        </ScrollReveal>
      </div>
    </BackgroundBeamsWithCollision>
  </main>;
}
