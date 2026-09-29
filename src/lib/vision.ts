import type { z } from "zod";

// Tried in order per call: if a model errors out or answers something unparseable, the next one takes over.
const VISION_MODELS = ["google/gemini-2.5-flash", "openai/gpt-5.4-mini"];

export type VisionAnswer<T> = { value: T; model: string; cost: number };

function extractJson(text: string): unknown {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end <= start) throw new Error("Resposta sem JSON.");
  return JSON.parse(text.slice(start, end + 1));
}

async function askModel<T>(model: string, apiKey: string, photoUrl: string, prompt: string, schemaName: string, schema: object, answer: z.ZodType<T>): Promise<VisionAnswer<T>> {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: photoUrl } },
          ],
        },
      ],
      response_format: { type: "json_schema", json_schema: { name: schemaName, strict: true, schema } },
      // Reasoning models spend the token budget on thinking first; keep it small but leave room for the answer.
      reasoning: { effort: "low" },
      max_tokens: 1500,
    }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error?.message || `HTTP ${response.status}`);
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== "string" || !content.trim()) {
    throw new Error(`Resposta vazia (finish_reason: ${data?.choices?.[0]?.finish_reason ?? "?"}).`);
  }
  return { value: answer.parse(extractJson(content)), model, cost: Number(data?.usage?.cost || 0) };
}

// Throws instead of guessing: silently defaulting is what used to hide a detector that never answered.
export async function askVision<T>(apiKey: string, photoUrl: string, prompt: string, schemaName: string, schema: object, answer: z.ZodType<T>): Promise<VisionAnswer<T>> {
  const failures: string[] = [];
  for (const model of VISION_MODELS) {
    try {
      return await askModel(model, apiKey, photoUrl, prompt, schemaName, schema, answer);
    } catch (error) {
      failures.push(`${model}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  throw new Error(`Falha na análise da foto (${failures.join(" | ")}).`);
}
