"use client";

import { usePathname } from "next/navigation";

const WHATSAPP_URL = `https://wa.me/5511986464056?text=${encodeURIComponent("Olá, Merano! Vim pelo site e queria tirar uma dúvida.")}`;

export function WhatsAppButton() {
  if (usePathname().startsWith("/admin")) return null;
  return <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" aria-label="Falar com a Merano no WhatsApp" className="group fixed bottom-5 right-5 z-[80] flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_10px_30px_-8px_rgba(0,0,0,.45)] transition-transform hover:scale-105 md:bottom-8 md:right-8">
    <svg viewBox="0 0 32 32" width="28" height="28" fill="currentColor" aria-hidden><path d="M16.04 3C8.86 3 3.04 8.8 3.04 15.95c0 2.29.6 4.52 1.75 6.49L3 29l6.73-1.76a13.1 13.1 0 0 0 6.3 1.6h.01c7.17 0 13-5.8 13-12.95C29.04 8.8 23.21 3 16.04 3Zm0 23.64h-.01c-1.94 0-3.85-.52-5.51-1.51l-.4-.23-4 1.04 1.07-3.88-.26-.4a10.7 10.7 0 0 1-1.65-5.71c0-5.94 4.85-10.77 10.8-10.77 2.89 0 5.6 1.12 7.64 3.16a10.7 10.7 0 0 1 3.16 7.62c0 5.94-4.85 10.78-10.8 10.78Zm5.92-8.06c-.32-.16-1.92-.95-2.22-1.06-.3-.11-.51-.16-.73.16-.22.32-.84 1.06-1.03 1.27-.19.22-.38.24-.7.08-.32-.16-1.37-.5-2.6-1.6-.96-.86-1.61-1.91-1.8-2.23-.19-.32-.02-.5.14-.66.15-.14.32-.38.49-.57.16-.19.21-.32.32-.54.11-.21.05-.4-.03-.56-.08-.16-.73-1.75-1-2.4-.26-.63-.53-.54-.73-.55h-.62c-.22 0-.57.08-.86.4-.3.32-1.14 1.11-1.14 2.7 0 1.6 1.16 3.14 1.33 3.36.16.21 2.29 3.49 5.55 4.9.78.33 1.38.53 1.86.68.78.25 1.49.21 2.05.13.63-.09 1.92-.78 2.19-1.54.27-.76.27-1.4.19-1.54-.08-.13-.29-.21-.62-.37Z" /></svg>
    <span className="sans pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap bg-[var(--ink)] px-3 py-2 text-[10px] uppercase tracking-[.12em] text-[var(--creme)] opacity-0 transition-opacity group-hover:opacity-100 md:block">Fale com a gente</span>
  </a>;
}
