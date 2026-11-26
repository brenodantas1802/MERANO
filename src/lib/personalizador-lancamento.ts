/** One launch instant for the UI, proxy, and expensive editor endpoints. Brasília = UTC−03. */
export const PERSONALIZADOR_ABRE_EM = "2026-12-07T12:00:00-03:00";
export const PERSONALIZADOR_ABRE_MS = Date.parse(PERSONALIZADOR_ABRE_EM);

export function personalizadorAberto(agora = Date.now()) {
  return agora >= PERSONALIZADOR_ABRE_MS;
}

export function contagemPersonalizador(agora: number) {
  const total = Math.max(0, Math.ceil((PERSONALIZADOR_ABRE_MS - agora) / 1000));
  return { dias: Math.floor(total / 86400), horas: Math.floor(total % 86400 / 3600), minutos: Math.floor(total % 3600 / 60), segundos: total % 60 };
}

export function bloqueioPersonalizador(agora = Date.now()): Response | null {
  if (personalizadorAberto(agora)) return null;
  return Response.json({ error: "O Personalizador MERANNO abre em 7 de dezembro de 2026, às 12h de Brasília.", opensAt: PERSONALIZADOR_ABRE_EM }, {
    status: 503,
    headers: { "Cache-Control": "private, no-store, max-age=0", "Retry-After": String(Math.max(1, Math.ceil((PERSONALIZADOR_ABRE_MS - agora) / 1000))) },
  });
}

export function destinoLancamento(path: string, agora = Date.now()): "pagina" | "redirecionar" | "api" | null {
  if (personalizadorAberto(agora)) return null;
  const clean = path.replace(/\/+$/, "");
  if (clean === "/personalizar-estampa") return "pagina";
  if (clean === "/personalizador" || clean.startsWith("/personalizador/") && /\.html$/i.test(clean)) return "redirecionar";
  if ((clean === "/api/personalizador" || clean.startsWith("/api/personalizador/")) && clean !== "/api/personalizador/disponibilidade") return "api";
  if (["/api/estampa/envio", "/api/estampa/registrar"].includes(clean)) return "api";
  return null;
}
