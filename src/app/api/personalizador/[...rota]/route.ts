import type { NextRequest } from "next/server";
import { handleApi } from "@/lib/personalizador/worker/api.js";
import { clientKey, createRateLimiter } from "@/lib/rate-limit";

// The programmer's Personalizador server (src/lib/personalizador/worker, kept as delivered) behind the site's address:
// /api/personalizador/chat reaches his /api/chat, and so on.

// Image generation streams progress for up to four minutes.
export const maxDuration = 300;

// His server has no request limits of its own; these are the same ones the site's earlier personalizer used.
const isChatLimited = createRateLimiter(40);
const isImageLimited = createRateLimiter(4);

async function handle(request: NextRequest, ctx: RouteContext<"/api/personalizador/[...rota]">) {
  const { rota } = await ctx.params;
  if (request.method === "POST") {
    const limited = rota[0] === "generate" ? isImageLimited : rota[0] === "chat" ? isChatLimited : null;
    if (limited?.(clientKey(request))) {
      return Response.json({ error: rota[0] === "generate" ? "Limite de criações atingido. Aguarde alguns minutos e tente novamente." : "Muitas mensagens seguidas. Aguarde alguns minutos e continue." }, { status: 429 });
    }
  }

  const url = new URL(request.url);
  url.pathname = `/api/${rota.join("/")}`;
  const headers = new Headers(request.headers);
  // His server treats this header as a signed-in account set by his hosting; here a visitor could forge it.
  headers.delete("oai-authenticated-user-id");
  const body = ["GET", "HEAD"].includes(request.method) ? undefined : await request.arrayBuffer();
  const forwarded = new Request(url, { method: request.method, headers, body });

  // No D1/R2 here, so "Salvar na conta" answers that saving is being set up; drafts stay on the device.
  return handleApi(forwarded, { OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY, OPENROUTER_CHAT_MODEL: process.env.OPENROUTER_CHAT_MODEL });
}

export { handle as GET, handle as POST };
