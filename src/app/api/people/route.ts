import { NextResponse } from "next/server";
import { z } from "zod";
import { detectPeople } from "@/lib/people";
import { clientKey, createRateLimiter } from "@/lib/rate-limit";

// Cheap call made when a photo is picked, so it gets a much higher limit than the paid image generation.
const isRateLimited = createRateLimiter(30);

const peopleSchema = z.object({
  personPhoto: z.string("Adicione a sua foto.").startsWith("data:image/", "Foto inválida. Envie uma imagem."),
});

export async function POST(request: Request) {
  if (isRateLimited(clientKey(request))) {
    return NextResponse.json({ error: "Muitas fotos analisadas. Aguarde alguns minutos e tente novamente." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo da requisição inválido." }, { status: 400 });
  }

  const parsed = peopleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Dados inválidos." }, { status: 400 });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "OPENROUTER_API_KEY não configurada no servidor." }, { status: 500 });
  }

  try {
    const { people, total } = await detectPeople(parsed.data.personPhoto, apiKey);
    return NextResponse.json({ people, total });
  } catch (error) {
    console.error("People detection failed:", error);
    return NextResponse.json({ error: "Não conseguimos analisar a foto agora." }, { status: 502 });
  }
}
