import { NextResponse } from "next/server";
import { z } from "zod";
import { FICHA_JSON_SCHEMA, SYSTEM_CHAT, limparEsboco, resumoPainel } from "@/lib/estampa";
import { fichaSchema, normalizarFicha, painelSchema, referenciasSchema, respostaChatSchema } from "@/lib/estampa-schema";
import { clientKey, createRateLimiter } from "@/lib/rate-limit";

// Text models with image input and structured output, tried in order (the same pair the try-on already relies on).
const CHAT_MODELS = ["google/gemini-2.5-flash", "openai/gpt-5.4-mini"];
// Cheap calls, but a conversation has many: per client and a per-instance daily safety net, like the try-on.
const isRateLimited = createRateLimiter(40);
const DAILY_LIMIT = 2000;
let daily = { day: "", count: 0 };

function isOverDailyLimit() {
  const today = new Date().toISOString().slice(0, 10);
  if (daily.day !== today) daily = { day: today, count: 0 };
  if (daily.count >= DAILY_LIMIT) return true;
  daily.count += 1;
  return false;
}

const chatSchema = z.object({
  mensagens: z
    .array(z.object({ papel: z.enum(["cliente", "assistente"]), texto: z.string().min(1).max(1500) }))
    .min(1)
    .max(40, "A conversa ficou longa demais. Recomece a criação para continuar."),
  painel: painelSchema,
  ficha: fichaSchema,
  // Only the images new since the last message: the model describes them once and the ficha carries that forward.
  referencias: referenciasSchema.optional(),
  totalReferencias: z.number().int().min(0).max(3),
});

function extractJson(text: string): unknown {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end <= start) throw new Error("Resposta sem JSON.");
  return JSON.parse(text.slice(start, end + 1));
}

type Content = string | ({ type: "text"; text: string } | { type: "image_url"; image_url: { url: string } })[];

async function ask(model: string, apiKey: string, messages: { role: string; content: Content }[]) {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json", "X-OpenRouter-Title": "Personalizador MERANNO" },
    body: JSON.stringify({
      model,
      messages,
      response_format: { type: "json_schema", json_schema: { name: "ficha_estampa", strict: true, schema: FICHA_JSON_SCHEMA } },
      reasoning: { effort: "low" },
      // Room for the reply, the ficha and a small SVG sketch.
      max_tokens: 5000,
    }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error?.message || `HTTP ${response.status}`);
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== "string" || !content.trim()) throw new Error(`Resposta vazia (finish_reason: ${data?.choices?.[0]?.finish_reason ?? "?"}).`);
  return { answer: respostaChatSchema.parse(extractJson(content)), cost: Number(data?.usage?.cost || 0), model };
}

export async function POST(request: Request) {
  if (isRateLimited(clientKey(request))) {
    return NextResponse.json({ error: "Muitas mensagens seguidas. Aguarde alguns minutos e continue." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo da requisição inválido." }, { status: 400 });
  }
  const parsed = chatSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Dados inválidos." }, { status: 400 });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "OPENROUTER_API_KEY não configurada no servidor." }, { status: 500 });
  if (isOverDailyLimit()) return NextResponse.json({ error: "A criação atingiu o limite de uso de hoje. Tente novamente amanhã." }, { status: 429 });

  const { mensagens, painel, ficha, referencias = [], totalReferencias } = parsed.data;
  const ultima = mensagens[mensagens.length - 1];
  if (ultima.papel !== "cliente") return NextResponse.json({ error: "A última mensagem deve ser do cliente." }, { status: 400 });

  // The panel and the current ficha ride along with the newest message, so the model always answers about the latest state.
  const contexto = `[Painel do cliente agora]\n${resumoPainel(painel, totalReferencias)}\n\n[Ficha atual]\n${JSON.stringify(ficha)}\n\n[Mensagem do cliente]\n${ultima.texto}${referencias.length ? `\n\n(O cliente anexou ${referencias.length} imagem(ns) de referência nesta mensagem.)` : ""}`;
  const messages = [
    { role: "system", content: SYSTEM_CHAT as Content },
    ...mensagens.slice(0, -1).map((m) => ({ role: m.papel === "cliente" ? "user" : "assistant", content: m.texto as Content })),
    { role: "user", content: [{ type: "text" as const, text: contexto }, ...referencias.map((url) => ({ type: "image_url" as const, image_url: { url } }))] },
  ];

  const failures: string[] = [];
  for (const model of CHAT_MODELS) {
    try {
      const { answer, cost } = await ask(model, apiKey, messages);
      return NextResponse.json({
        resposta: answer.resposta.trim() || "Pode me contar um pouco mais da sua ideia?",
        ficha: normalizarFicha(answer.ficha),
        sugestoes: answer.sugestoes.map((s) => s.trim()).filter(Boolean).slice(0, 3).map((s) => s.slice(0, 60)),
        pronto: answer.pronto,
        esboco: limparEsboco(answer.esboco),
        cost,
        model,
      });
    } catch (error) {
      failures.push(`${model}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  console.error("Estampa chat failed:", failures.join(" | "));
  return NextResponse.json({ error: "Não consegui responder agora. Tente enviar de novo em instantes." }, { status: 502 });
}
