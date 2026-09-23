"use client";

import { Send } from "lucide-react";
import { useState } from "react";
import { AnimatedIcon } from "@/components/ui/animated-icon";

export function ShareButton({ title, className }: { title: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // usuário cancelou o compartilhamento
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // navegador negou acesso à área de transferência
    }
  }

  return (
    <button type="button" onClick={share} className={`sans flex items-center gap-2 text-[10px] uppercase tracking-[.12em] text-[var(--muted)] transition-colors hover:text-[var(--ink)] ${className ?? ""}`}>
      <AnimatedIcon icon={Send} variant="fly" size={14} />
      {copied ? "Link copiado" : "Enviar para um amigo"}
    </button>
  );
}
