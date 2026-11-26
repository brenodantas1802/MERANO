"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";
import { contagemPersonalizador, PERSONALIZADOR_ABRE_MS, personalizadorAberto } from "@/lib/personalizador-lancamento";
import { PersonalizadorFrame } from "./personalizador-frame";
import styles from "./personalizador-abertura.module.css";

export function PersonalizadorAbertura({ agoraServidor }: { agoraServidor: number }) {
  const [agora, setAgora] = useState(agoraServidor);
  const [aberto, setAberto] = useState(personalizadorAberto(agoraServidor));

  useEffect(() => {
    let ativo = true;
    let baseServidor = agoraServidor;
    let baseMonotona = performance.now();
    let ultimaSincronia = -Infinity;
    let consultando = false;
    let liberado = personalizadorAberto(agoraServidor);
    let pedido: AbortController | null = null;
    const horario = () => baseServidor + performance.now() - baseMonotona;

    async function sincronizar() {
      if (consultando || !ativo || liberado) return;
      consultando = true;
      ultimaSincronia = performance.now();
      const inicio = performance.now();
      pedido = new AbortController();
      const timeout = window.setTimeout(() => pedido?.abort(), 8000);
      try {
        const response = await fetch("/api/personalizador/disponibilidade", { cache: "no-store", signal: pedido.signal });
        if (!response.ok) return;
        const data: { now?: unknown; opensAt?: unknown; open?: unknown } = await response.json();
        if (!ativo || typeof data.now !== "number" || !Number.isFinite(data.now) || data.opensAt !== PERSONALIZADOR_ABRE_MS) return;
        const fim = performance.now();
        baseServidor = data.now + (fim - inicio) / 2;
        baseMonotona = fim;
        setAgora(baseServidor);
        // A browser clock reaching zero cannot unlock the editor: the server must confirm.
        if (data.open === true && personalizadorAberto(data.now)) {
          liberado = true;
          setAberto(true);
        }
      } catch { /* Keep the countdown and retry; never unlock on a network error. */ }
      finally { window.clearTimeout(timeout); consultando = false; }
    }

    void sincronizar();
    const tick = window.setInterval(() => {
      if (!ativo || liberado) return;
      const valor = horario();
      setAgora(valor);
      const intervalo = valor >= PERSONALIZADOR_ABRE_MS ? 2000 : 30000;
      if (performance.now() - ultimaSincronia >= intervalo) void sincronizar();
    }, 1000);
    const retomar = () => { if (document.visibilityState === "visible") { setAgora(horario()); void sincronizar(); } };
    document.addEventListener("visibilitychange", retomar);
    window.addEventListener("focus", retomar);
    return () => { ativo = false; pedido?.abort(); window.clearInterval(tick); document.removeEventListener("visibilitychange", retomar); window.removeEventListener("focus", retomar); };
  }, [agoraServidor]);

  if (aberto) return <PersonalizadorFrame />;
  const contagem = contagemPersonalizador(agora);
  const zerou = agora >= PERSONALIZADOR_ABRE_MS;
  return <section className={styles.hero} aria-labelledby="personalizador-coming-soon">
    <p className={styles.overline}>Uma nova forma de criar</p>
    <h1 id="personalizador-coming-soon" className={styles.title}>Coming soon<span>.</span></h1>
    <h2 className={styles.subtitle}>Personalizador de estampas MERANNO</h2>
    <p className={styles.description}>Sua ideia. Sua estampa. Sua MERANNO.<br />Estamos preparando os últimos detalhes.</p>
    <div className={styles.countdownWrap}>
      <p className={styles.countdownLabel}>{zerou ? "Confirmando abertura…" : "O personalizador abre em"}</p>
      <div className={styles.countdown} role="timer" aria-live="off" aria-label="Tempo restante para a abertura do Personalizador MERANNO">
        {([ ["dias", "Dias"], ["horas", "Horas"], ["minutos", "Minutos"], ["segundos", "Segundos"] ] as const).map(([key, label]) => <div key={key} className={styles.unit}><span className={styles.value} data-countdown={key}>{String(contagem[key]).padStart(2, "0")}</span><small>{label}</small></div>)}
      </div>
      <p className={styles.opening}><CalendarDays size={15} aria-hidden /><time dateTime="2026-12-07T12:00:00-03:00">07 de dezembro de 2026</time><span>·</span>12h — Brasília</p>
    </div>
    <Link className={styles.cta} href="/shop">Conhecer a pré-venda <ArrowRight size={16} aria-hidden /></Link>
    <div className={styles.rule} />
    <p className={styles.signature}>Feito para quem entende de exclusividade<span />MERANNO</p>
    <noscript>Ative o JavaScript para acompanhar os segundos. A abertura será em 7 de dezembro de 2026, às 12h de Brasília.</noscript>
  </section>;
}
