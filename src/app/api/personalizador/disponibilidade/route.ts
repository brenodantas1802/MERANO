import { PERSONALIZADOR_ABRE_MS, personalizadorAberto } from "@/lib/personalizador-lancamento";

export const dynamic = "force-dynamic";

export function GET() {
  const now = Date.now();
  return Response.json({ now, opensAt: PERSONALIZADOR_ABRE_MS, open: personalizadorAberto(now) }, { headers: { "Cache-Control": "private, no-store, max-age=0" } });
}
