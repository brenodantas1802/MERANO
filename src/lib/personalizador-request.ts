// Next.js may expose an internal hostname in request.url (e.g. localhost), while the browser sends the public
// Host/Origin (e.g. 127.0.0.1). Keep the destination's public authority when adapting the worker route.
// Never derive the destination from Origin: the worker must still reject requests from other websites.
export function personalizadorUrl(request: Request, rota: string[]): URL {
  const original = new URL(request.url);
  const host = request.headers.get("host");
  const protocol = request.headers.get("x-forwarded-proto");
  const scheme = protocol === "http" || protocol === "https" ? protocol + ":" : original.protocol;
  // Build a fresh authority so an internal port cannot leak into a public hostname without a port.
  const url = host ? new URL(`${scheme}//${host}`) : new URL(original);
  url.pathname = `/api/${rota.join("/")}`;
  url.search = original.search;
  return url;
}
