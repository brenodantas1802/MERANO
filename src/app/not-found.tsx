import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Illustration } from "@/components/illustration";
export default function NotFound() { return <main className="grain flex min-h-screen items-center justify-center px-6"><div><p className="sans text-[10px] uppercase tracking-[.2em]">MERANO · 404</p><h1 className="display mt-8 text-8xl">Nada<br /><i>aqui.</i></h1><Illustration name="barco" className="mt-6 w-64" /><p className="script -rotate-2 text-2xl text-[var(--terra)]">essa página foi com a maré.</p><Link href="/" className="sans mt-10 flex items-center gap-2 border-b border-[var(--ink)] pb-2 text-[11px] uppercase tracking-[.15em]"><ArrowLeft size={14} /> Voltar para o início</Link></div></main>; }
