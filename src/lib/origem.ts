// This site's own address (production, preview or local), for links that leave and come back (payment pages).
export function origemDe(request: Request) {
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? new URL(request.url).host;
  const protocolo = request.headers.get("x-forwarded-proto") ?? (host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https");
  return `${protocolo}://${host}`;
}
