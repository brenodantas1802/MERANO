const WINDOW_MS = 10 * 60 * 1000;

// In-memory, per server instance: enough to stop a single client from hammering a paid API.
export function createRateLimiter(max: number) {
  const hits = new Map<string, number[]>();
  return function isRateLimited(key: string) {
    const now = Date.now();
    const recent = (hits.get(key) ?? []).filter((timestamp) => now - timestamp < WINDOW_MS);
    if (recent.length >= max) {
      hits.set(key, recent);
      return true;
    }
    recent.push(now);
    hits.set(key, recent);
    return false;
  };
}

export function clientKey(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}
