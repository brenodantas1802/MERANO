import { NextResponse } from "next/server";
import { clientKey, createRateLimiter } from "@/lib/rate-limit";
import { createSecretClient } from "@/lib/supabase/publico";
import { createClient } from "@/lib/supabase/server";
import { criarPreferencia, pagamentoOnline } from "@/lib/mercado-pago";
import { escolherFrete, linkWhatsApp, mensagemWhatsApp, novoNumero, pedidoSchema, precificarItens, totais, validarCupom, type Pedido } from "@/lib/pedidos";
import { origemDe } from "@/lib/origem";

// Creates an order from the payment page. Prices, coupon, shipping and total are worked out here. Then either the
// Mercado Pago payment link (when MERCADOPAGO_ACCESS_TOKEN is set) or a WhatsApp message to close the sale by hand.
const isRateLimited = createRateLimiter(12);

export async function POST(request: Request) {
  if (isRateLimited(clientKey(request))) return NextResponse.json({ error: "Muitas tentativas seguidas. Aguarde alguns minutos." }, { status: 429 });
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo da requisição inválido." }, { status: 400 });
  }
  const parsed = pedidoSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Confira os dados." }, { status: 400 });
  const entrada = parsed.data;

  const admin = createSecretClient();
  if (!admin) {
    console.error("Pedido sem SUPABASE_SECRET_KEY no servidor.");
    return NextResponse.json({ error: "Não consegui registrar o pedido agora. Fale com a gente pelo WhatsApp." }, { status: 503 });
  }

  const precificado = await precificarItens(admin, entrada.itens);
  if ("erro" in precificado) return NextResponse.json({ error: precificado.erro }, { status: 409 });
  const pecas = precificado.itens.reduce((soma, item) => soma + item.quantidade, 0);
  const escolhido = await escolherFrete(entrada.endereco.cep, pecas, entrada.freteId);
  if ("erro" in escolhido) return NextResponse.json({ error: escolhido.erro }, { status: 409 });

  const email = entrada.cliente.email.trim().toLowerCase();
  let cupom = null;
  if (entrada.cupom?.trim()) {
    const resultado = await validarCupom(admin, entrada.cupom, email);
    if ("erro" in resultado) return NextResponse.json({ error: resultado.erro, campo: "cupom" }, { status: 409 });
    cupom = resultado.cupom;
  }

  const online = pagamentoOnline();
  const valores = totais(precificado.itens, escolhido.frete, cupom, entrada.metodo);
  const { data: { user } } = await (await createClient()).auth.getUser().catch(() => ({ data: { user: null } }));

  let criado: Pedido | null = null;
  for (let tentativa = 0; tentativa < 3 && !criado; tentativa++) {
    const { data, error } = await admin.from("pedidos").insert({
      numero: novoNumero(),
      metodo: online ? entrada.metodo : "whatsapp",
      email,
      cliente: { ...entrada.cliente, email },
      endereco: entrada.endereco,
      itens: precificado.itens,
      frete: escolhido.frete,
      cupom: cupom?.codigo ?? null,
      ...valores,
      pagamento: { forma: entrada.metodo },
      usuario_id: user?.id ?? null,
    }).select("*").single();
    if (data) criado = data as Pedido;
    else if (error && !error.message.includes("numero")) {
      console.error("Pedido insert failed:", error.message);
      return NextResponse.json({ error: "Não consegui registrar o pedido agora. Tente de novo." }, { status: 502 });
    }
  }
  if (!criado) return NextResponse.json({ error: "Não consegui registrar o pedido agora. Tente de novo." }, { status: 502 });

  // Personalizador art now belongs to this order.
  const criacoes = precificado.itens.flatMap((item) => (item.criacaoId ? [item.criacaoId] : []));
  if (criacoes.length) await admin.from("criacoes_estampa").update({ status: "pedida", pedido: criado.numero, cliente: { nome: criado.cliente.nome, email, celular: criado.cliente.celular, cidade: `${criado.endereco.cidade}/${criado.endereco.uf}` }, pedida_em: new Date().toISOString() }).in("id", criacoes);

  if (!online) return NextResponse.json({ id: criado.id, numero: criado.numero, whatsapp: linkWhatsApp(mensagemWhatsApp(criado, entrada.metodo)) }, { status: 201 });

  try {
    const { link, preferencia } = await criarPreferencia(criado, origemDe(request));
    await admin.from("pedidos").update({ pagamento: { forma: entrada.metodo, preferencia, link } }).eq("id", criado.id);
    return NextResponse.json({ id: criado.id, numero: criado.numero, pagar: link }, { status: 201 });
  } catch (error) {
    console.error("Mercado Pago preference failed:", error instanceof Error ? error.message : error);
    // The order is saved: its page offers to try the payment again.
    return NextResponse.json({ id: criado.id, numero: criado.numero, error: "O pedido foi registrado, mas o pagamento não abriu. Tente de novo na página do pedido." }, { status: 502 });
  }
}
