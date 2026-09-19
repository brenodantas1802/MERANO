import { NextResponse } from "next/server";
import { z } from "zod";

const orderSchema = z.object({ name: z.string().min(2), email: z.string().email(), phone: z.string().min(8), street: z.string().min(3), zipCode: z.string().min(4), city: z.string().min(2), state: z.string().min(2), items: z.array(z.object({ productVariantId: z.string(), quantity: z.number().int().positive(), customizationData: z.record(z.string(), z.unknown()).optional() })).min(1) });

export async function POST(request: Request) {
  const parsed = orderSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos", details: parsed.error.flatten() }, { status: 400 });
  return NextResponse.json({ status: "RECEBIDO", message: "Pedido recebido para confirmação manual." }, { status: 201 });
}
