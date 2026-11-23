"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, Check, CreditCard, QrCode, X } from "lucide-react";
import { useCart, type CartItem } from "@/components/cart-provider";
import { SiteHeader } from "@/components/site-header";
import { CUPOM_KEY } from "@/components/first-purchase-popup";
import { saveOrder } from "@/lib/orders";
import { formatPrice, products, currentImage } from "@/lib/products";
import { Illustration } from "@/components/illustration";
import { CEP_KEY, prazoTexto, useFrete, type OpcaoFrete } from "@/lib/use-frete";

// Payment page. The order is created on the server (/api/pedidos), which prices everything again. With online payment
// connected (Asaas, or Mercado Pago) the customer pays on the provider's page; until then the order goes out as a
// WhatsApp message.

type Method = "pix" | "cartao";
type Cupom = { codigo: string; percentual: number };
const PIX_DISCOUNT = 0; // same as PIX_DESCONTO on the server
const centavos = (valor: number) => Math.round(valor * 100) / 100;

function lerLocal(chave: string) {
  try {
    return typeof window === "undefined" ? "" : window.localStorage.getItem(chave) ?? "";
  } catch {
    return "";
  }
}

// Salão look: soft paper fields with a wine focus ring, brass-numbered sections, wine buttons.
const field = "mt-2 block h-12 w-full rounded-[14px] border border-[var(--line)] bg-white/70 px-4 text-base text-[var(--ink)] outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-[var(--muted)]/60 focus:border-[var(--vinho)]/60 focus:shadow-[0_0_0_3px_rgba(85,30,43,.08)]";
const label = "sans block text-[12px] text-[var(--muted)]";
const titulo = "mb-5 flex items-baseline gap-3 text-[26px] leading-none display";
const numero = "secao text-[12px]";

const onlyDigits = (value: string) => value.replace(/\D/g, "");
const maskCep = (value: string) => onlyDigits(value).slice(0, 8).replace(/(\d{5})(\d)/, "$1-$2");
const maskPhone = (value: string) => onlyDigits(value).slice(0, 11).replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d{1,4})$/, "$1-$2");
const maskCpf = (value: string) => onlyDigits(value).slice(0, 11).replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2");

function CampoCupom({ cupom, email, onAplicar, onRemover }: { cupom: Cupom | null; email: string; onAplicar: (cupom: Cupom) => void; onRemover: () => void }) {
  const [codigo, setCodigo] = useState("");
  const [erro, setErro] = useState("");
  const [conferindo, setConferindo] = useState(false);

  // The welcome coupon revealed in the popup comes applied. If it no longer holds, it just waits in the field.
  useEffect(() => {
    const salvo = lerLocal(CUPOM_KEY);
    if (!salvo) return;
    let vivo = true;
    conferir(salvo)
      .then(onAplicar)
      .catch(() => { if (vivo) setCodigo(salvo); });
    return () => { vivo = false; };
    // Only once, when the page opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function conferir(valor: string): Promise<Cupom> {
    const resposta = await fetch("/api/cupom/validar", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ codigo: valor, email: email || undefined }) });
    const dados = await resposta.json();
    if (!resposta.ok) throw new Error(dados.error || "Esse cupom não vale.");
    return dados;
  }

  async function aplicar() {
    if (!codigo.trim()) return setErro("Digite o código do cupom.");
    setConferindo(true);
    setErro("");
    try {
      onAplicar(await conferir(codigo));
    } catch (problema) {
      setErro(problema instanceof Error ? problema.message : "Não deu para conferir o cupom.");
    } finally {
      setConferindo(false);
    }
  }

  if (cupom) return <div className="mt-5 flex items-center justify-between rounded-[14px] border border-dashed border-[var(--vinho)]/45 bg-white/50 px-4 py-3 text-sm">
    <span><span className="sans text-[11px] uppercase tracking-[.12em] text-[var(--muted)]">Cupom</span> <b className="ml-1 tracking-[.06em] text-[var(--vinho)]">{cupom.codigo}</b> · {cupom.percentual}% off</span>
    <button type="button" onClick={onRemover} aria-label="Tirar o cupom" className="press -mr-2 flex h-11 w-11 items-center justify-center rounded-full text-[var(--muted)] hover:text-[var(--ink)]"><X size={16} /></button>
  </div>;

  return <div className="mt-5">
    <label className={label} htmlFor="cupom">Cupom de desconto</label>
    <div className="mt-2 flex gap-2">
      <input id="cupom" value={codigo} onChange={(event) => { setCodigo(event.target.value.toUpperCase()); setErro(""); }} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); aplicar(); } }} autoCapitalize="characters" autoComplete="off" spellCheck={false} placeholder="CÓDIGO" className={`${field} mt-0 uppercase tracking-[.08em]`} />
      <button type="button" onClick={aplicar} disabled={conferindo} className="press sans h-12 shrink-0 rounded-full border border-[var(--vinho)] px-5 text-[11px] uppercase tracking-[.14em] text-[var(--vinho)] hover:bg-[var(--vinho)] hover:text-[var(--creme)] disabled:opacity-60">{conferindo ? "…" : "Aplicar"}</button>
    </div>
    {erro && <p role="alert" className="sans mt-2 text-[12px] text-[#8a3a2c]">{erro}</p>}
  </div>;
}

function Summary({ items, subtotal, shipping, cupom, descontoCupom, descontoPix, total, email, onCupom }: { items: CartItem[]; subtotal: number; shipping: OpcaoFrete | null; cupom: Cupom | null; descontoCupom: number; descontoPix: number; total: number; email: string; onCupom: (cupom: Cupom | null) => void }) {
  return <aside className="glass h-fit rounded-[28px] p-6 md:sticky md:top-28 md:p-7">
    <p className="secao mb-5 text-[12px]">Resumo do pedido</p>
    <div className="space-y-4">{items.map((item) => <div key={item.id} className="flex gap-4">
      <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-[12px] bg-white/70">{currentImage(item) && <Image src={currentImage(item)!} alt={item.name} fill sizes="64px" className="object-cover" unoptimized={currentImage(item)!.startsWith("data:")} />}<span className="sans absolute right-1 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--vinho)] px-1 text-[11px] text-[var(--creme)]">{item.quantity}</span></div>
      <div className="flex flex-1 justify-between gap-3"><div><p className="leading-tight">{item.name}</p><p className="sans mt-1 text-[11px] uppercase tracking-[.1em] text-[var(--muted)]">Tam. {item.size}{item.color ? ` · ${item.color}` : ""}</p></div><span className="sans text-sm">{formatPrice(item.price * item.quantity)}</span></div>
    </div>)}</div>
    <CampoCupom cupom={cupom} email={email} onAplicar={onCupom} onRemover={() => { onCupom(null); try { window.localStorage.removeItem(CUPOM_KEY); } catch { /* nothing kept */ } }} />
    <div className="sans mt-6 space-y-2 border-t border-black/10 pt-5 text-sm">
      <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
      {descontoCupom > 0 && <div className="flex justify-between text-[var(--vinho)]"><span>Cupom {cupom?.codigo} ({cupom?.percentual}%)</span><span>− {formatPrice(descontoCupom)}</span></div>}
      <div className="flex justify-between"><span>Frete</span><span>{shipping ? formatPrice(shipping.preco) : "—"}</span></div>
      {descontoPix > 0 && <div className="flex justify-between text-[var(--vinho)]"><span>Desconto Pix</span><span>− {formatPrice(descontoPix)}</span></div>}
    </div>
    <div className="mt-4 flex items-baseline justify-between border-t border-black/10 pt-4"><span className="text-lg">Total</span><span className="text-2xl font-semibold tabular-nums text-[var(--vinho)]">{formatPrice(total)}</span></div>
  </aside>;
}

type Feito = { id: string; numero: string; total: number; whatsapp: string };

export function Pagamento({ online, provedor, entrega }: { online: boolean; provedor: string; entrega: string }) {
  const { items, total: subtotal, count, clear } = useCart();
  const router = useRouter();
  const [cep, setCep] = useState(() => lerLocal(CEP_KEY));
  const [address, setAddress] = useState({ street: "", district: "", city: "", uf: "" });
  const [shippingId, setShippingId] = useState<number | null>(null);
  const frete = useFrete(cep, count);
  const [method, setMethod] = useState<Method>("pix");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [cpf, setCpf] = useState("");
  const [cupom, setCupom] = useState<Cupom | null>(null);
  const [status, setStatus] = useState<"form" | "processing" | "redirecting">("form");
  const [erro, setErro] = useState("");
  const [feito, setFeito] = useState<Feito | null>(null);

  // The cheapest option comes selected. These numbers are a preview: the server works them out again.
  const shipping = frete.opcoes.find((option) => option.id === shippingId) ?? frete.opcoes[0] ?? null;
  const descontoCupom = cupom ? centavos(subtotal * cupom.percentual / 100) : 0;
  const descontoPix = method === "pix" ? centavos((subtotal - descontoCupom) * PIX_DISCOUNT) : 0;
  const total = centavos(subtotal - descontoCupom - descontoPix + (shipping?.preco ?? 0));

  function updateCep(value: string) {
    const masked = maskCep(value);
    setCep(masked);
    try { window.localStorage.setItem(CEP_KEY, masked); } catch { /* the CEP just won't be remembered */ }
  }

  // Street, district and city from ViaCEP once the CEP is complete. The customer can still type over them.
  const cepDigits = onlyDigits(cep);
  useEffect(() => {
    if (cepDigits.length !== 8) return;
    const controller = new AbortController();
    fetch(`https://viacep.com.br/ws/${cepDigits}/json/`, { signal: controller.signal })
      .then((response) => response.json())
      .then((data) => { if (!data.erro) setAddress((current) => ({ street: data.logradouro || current.street, district: data.bairro || current.district, city: data.localidade || current.city, uf: data.uf || current.uf })); })
      .catch(() => {});
    return () => controller.abort();
  }, [cepDigits]);

  async function pay(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!shipping) return setErro("Digite o CEP e escolha o frete.");
    const form = new FormData(event.currentTarget);
    setStatus("processing");
    setErro("");
    // Older cart entries have no productId: recover it from the "<product>-<size>-<color>" id.
    const productIdOf = (item: CartItem) => item.productId ?? products.find((product) => item.id.startsWith(`${product.id}-`))?.id;
    try {
      const resposta = await fetch("/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cliente: { nome: String(form.get("nome") ?? ""), email, celular: phone, cpf },
          endereco: { cep, rua: address.street, numero: String(form.get("numero") ?? ""), complemento: String(form.get("complemento") ?? ""), bairro: address.district, cidade: address.city, uf: address.uf },
          itens: items.map((item) => ({ productId: item.criacaoId ? undefined : productIdOf(item), criacaoId: item.criacaoId, tamanho: item.size, cor: item.color, quantidade: item.quantity })),
          freteId: shipping.id,
          cupom: cupom?.codigo,
          metodo: method,
        }),
      });
      const dados = await resposta.json();
      if (dados.campo === "cupom") setCupom(null);
      if (!resposta.ok && !dados.id) throw new Error(dados.error || "Não deu para registrar o pedido. Tente de novo.");
      saveOrder({ id: dados.numero, date: new Date().toISOString(), total, items: items.map((item) => ({ productId: productIdOf(item) ?? item.id, criacaoId: item.criacaoId, name: item.name, size: item.size, color: item.color, price: item.price, quantity: item.quantity, image: item.image })) });
      clear();
      try { window.localStorage.removeItem(CUPOM_KEY); } catch { /* nothing kept */ }
      if (dados.pagar) {
        setStatus("redirecting");
        window.location.assign(dados.pagar);
        return;
      }
      if (dados.whatsapp) {
        setFeito({ id: dados.id, numero: dados.numero, total, whatsapp: dados.whatsapp });
        window.open(dados.whatsapp, "_blank", "noopener");
        setStatus("form");
        window.scrollTo({ top: 0 });
        return;
      }
      // Saved, but the payment link didn't open: the order page tries again.
      router.push(`/pedido/${dados.id}`);
    } catch (problema) {
      setErro(problema instanceof Error ? problema.message : "Não deu para registrar o pedido. Tente de novo.");
      setStatus("form");
    }
  }

  if (feito) return <main><SiteHeader /><div className="mx-auto max-w-5xl px-6 py-24 md:px-12">
    <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 220, damping: 16 }} className="mb-10 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--vinho)] text-[var(--creme)] ring-1 ring-[var(--latao)]/60 ring-offset-4 ring-offset-[var(--paper)]"><Check size={30} /></motion.div>
    <p className="sans mb-5 text-[11px] uppercase tracking-[.2em] text-[var(--muted)]">Pedido {feito.numero} · {formatPrice(feito.total)}</p>
    <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between"><h1 className="display text-6xl md:text-8xl">Pedido registrado.<br /><i>Falta o pagamento.</i></h1><Illustration name="laranjeira" className="w-36 shrink-0 md:w-52" /></div>
    <p className="mt-8 max-w-xl text-2xl leading-snug">Abrimos o WhatsApp com o pedido escrito. Envie a mensagem e a equipe Meranno manda o Pix ou o link do cartão para você pagar.</p>
    <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3"><a href={feito.whatsapp} target="_blank" rel="noopener noreferrer" className="press label inline-flex min-h-12 items-center gap-2 rounded-full bg-[#1f9e55] px-7 text-[12px] text-white">Abrir o WhatsApp de novo <ArrowRight size={14} /></a><Link href={`/pedido/${feito.id}`} className="sans text-[12px] uppercase tracking-[.14em] text-[var(--muted)] underline underline-offset-4 hover:text-[var(--ink)]">Acompanhar o pedido</Link></div>
    <div className="sans mt-12 grid gap-6 border-y border-[var(--line)] py-8 text-[11px] uppercase tracking-[.12em] md:grid-cols-3">
      <div><span className="text-[var(--latao)]">01 · Agora</span><p className="mt-2 normal-case tracking-normal text-[var(--muted)]">Envie a mensagem no WhatsApp</p></div>
      <div><span className="text-[var(--muted)]">02 · Pagamento</span><p className="mt-2 normal-case tracking-normal text-[var(--muted)]">Pix ou cartão, combinado na conversa</p></div>
      <div><span className="text-[var(--muted)]">03 · Envio</span><p className="mt-2 normal-case tracking-normal text-[var(--muted)]">Rastreio no seu e-mail</p></div>
    </div>
    <Link href={`/pedido/${feito.id}`} className="sans mt-8 inline-flex min-h-11 items-center gap-2 border-b border-[var(--ink)] text-[11px] uppercase tracking-[.15em]">Ver o pedido <ArrowRight size={14} /></Link>
  </div></main>;

  if (items.length === 0) return <main><SiteHeader /><div className="mx-auto max-w-3xl px-6 py-24 md:px-12"><h1 className="display text-6xl md:text-8xl">Pagamento.</h1><p className="mt-8 text-2xl">Seu carrinho está vazio.</p><Link href="/shop" className="sans mt-8 inline-flex min-h-11 items-center gap-2 border-b border-[var(--ink)] text-[11px] uppercase tracking-[.15em]">Ver coleção <ArrowRight size={14} /></Link></div></main>;

  const botao = status === "redirecting" ? "Abrindo o pagamento…" : status === "processing" ? "Registrando o pedido…" : online ? (method === "pix" ? "Pagar com Pix" : "Pagar com cartão") : "Enviar pedido pelo WhatsApp";

  return <main><SiteHeader /><div className="mx-auto max-w-360 px-6 pb-24 pt-10 md:px-12">
    <Link href="/shop" className="sans mb-10 flex min-h-11 w-fit items-center gap-2 text-[11px] uppercase tracking-[.15em] text-[var(--muted)]"><ArrowLeft size={14} /> Continuar comprando</Link>
    <div className="flex items-end gap-6"><h1 className="display text-6xl md:text-8xl">Pagamento.</h1><Illustration name="barco" className="hidden w-32 shrink-0 pb-1 sm:block md:w-48" /></div>
    <form onSubmit={pay} className="mt-10 grid gap-10 md:grid-cols-[1fr_400px] md:gap-16">
      <div className="space-y-10">
        <section>
          <h2 className={titulo}><span className={numero}>01 /</span>Seus dados</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <label className={`${label} md:col-span-2`}>Nome completo<input required name="nome" autoComplete="name" className={field} /></label>
            <label className={label}>E-mail<input required name="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className={field} /></label>
            <label className={label}>Celular<input required inputMode="tel" autoComplete="tel" value={phone} onChange={(event) => setPhone(maskPhone(event.target.value))} placeholder="(11) 90000-0000" className={field} /></label>
            <label className={label}>CPF<input required inputMode="numeric" value={cpf} onChange={(event) => setCpf(maskCpf(event.target.value))} placeholder="000.000.000-00" className={field} /></label>
          </div>
        </section>

        <section>
          <h2 className={titulo}><span className={numero}>02 /</span>Entrega</h2>
          <p className="-mt-2 mb-5 max-w-xl text-[var(--muted)]">Pré-venda: entrega prevista para <b className="font-medium text-[var(--ink)]">{entrega}</b>.</p>
          <div className="grid gap-4 md:grid-cols-[180px_1fr]">
            <label className={label}>CEP<input required inputMode="numeric" autoComplete="postal-code" value={cep} onChange={(event) => updateCep(event.target.value)} placeholder="00000-000" className={field} /></label>
            <label className={label}>Rua<input required autoComplete="address-line1" value={address.street} onChange={(event) => setAddress({ ...address, street: event.target.value })} className={field} /></label>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-[120px_1fr_1fr]">
            <label className={label}>Número<input required name="numero" className={field} /></label>
            <label className={label}>Complemento<input name="complemento" autoComplete="address-line2" className={field} /></label>
            <label className={label}>Bairro<input required value={address.district} onChange={(event) => setAddress({ ...address, district: event.target.value })} className={field} /></label>
          </div>
          <div className="mt-4 grid grid-cols-[1fr_90px] gap-4 md:grid-cols-[1fr_120px]">
            <label className={label}>Cidade<input required autoComplete="address-level2" value={address.city} onChange={(event) => setAddress({ ...address, city: event.target.value })} className={field} /></label>
            <label className={label}>UF<input required maxLength={2} autoComplete="address-level1" value={address.uf} onChange={(event) => setAddress({ ...address, uf: event.target.value.toUpperCase().replace(/[^A-Z]/g, "") })} className={`${field} uppercase`} /></label>
          </div>
          <AnimatePresence>{frete.pronto && <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-8 grid gap-3" aria-live="polite">
            {frete.carregando && [0, 1].map((index) => <div key={index} className="h-[68px] animate-pulse rounded-[18px] border border-[var(--line)] bg-white/40" />)}
            {frete.erro && <p className="rounded-[18px] border border-[var(--line)] bg-white/40 px-5 py-4 text-sm text-[var(--muted)]">{frete.erro}</p>}
            {frete.opcoes.map((option) => <label key={option.id} className={`press flex min-h-14 cursor-pointer items-center justify-between rounded-[18px] border px-5 py-4 transition-colors ${shipping?.id === option.id ? "border-[var(--vinho)] bg-white/80 shadow-[0_0_0_3px_rgba(85,30,43,.06)]" : "border-[var(--line)] bg-white/40"}`}>
              <span className="flex items-center gap-4"><input type="radio" name="frete" required checked={shipping?.id === option.id} onChange={() => setShippingId(option.id)} className="h-5 w-5 accent-[var(--vinho)]" /><span><span className="sans block text-[11px] uppercase tracking-[.12em]">{option.nome}{option.empresa && option.empresa !== "Correios" ? ` · ${option.empresa}` : ""}</span><span className="text-sm text-[var(--muted)]">{prazoTexto(option)} após o envio</span></span></span>
              <span className="sans text-sm">{formatPrice(option.preco)}</span>
            </label>)}
            {frete.exemplo && <p className="sans text-[11px] uppercase tracking-[.12em] text-[var(--latao)]">Valores de exemplo</p>}
          </motion.div>}</AnimatePresence>
        </section>

        <section>
          <h2 className={titulo}><span className={numero}>03 /</span>Pagamento</h2>
          <div role="radiogroup" aria-label="Forma de pagamento" className="grid grid-cols-2 gap-3">
            {([["pix", "Pix", "na hora, com QR Code", QrCode], ["cartao", "Cartão de crédito", "até 3x sem juros", CreditCard]] as const).map(([id, name, hint, Icon]) => <button key={id} type="button" role="radio" aria-checked={method === id} onClick={() => setMethod(id)} className={`press flex min-h-16 items-center gap-3 rounded-[18px] border px-4 py-4 text-left transition-colors ${method === id ? "border-[var(--vinho)] bg-[var(--vinho)] text-[var(--creme)]" : "border-[var(--line)] bg-white/40 hover:border-[var(--vinho)]/50"}`}><Icon size={20} strokeWidth={1.5} /><span><span className="sans block text-[11px] uppercase tracking-[.12em]">{name}</span><span className={`text-sm ${method === id ? "text-[var(--creme)]/70" : "text-[var(--muted)]"}`}>{hint}</span></span></button>)}
          </div>
          <p className="mt-5 max-w-xl text-[var(--muted)]">{online
            ? method === "pix" ? `Você paga no ambiente seguro do ${provedor}, com o QR Code ou o Pix copia e cola. A confirmação chega na hora.` : `Você paga no ambiente seguro do ${provedor}, em até 3x sem juros. Os dados do cartão não passam pelo site da Meranno.`
            : `O pedido vai para o nosso WhatsApp já escrito, e a equipe manda ${method === "pix" ? "o Pix" : "o link do cartão"} para você pagar.`}</p>
        </section>

        {/* No exchanges (owners, 2026-11-22): said plainly before paying, and the customer confirms it. */}
        <label className="flex items-start gap-3 rounded-[18px] border border-[var(--vinho)]/30 bg-[var(--vinho)]/[.05] px-5 py-4 text-sm leading-relaxed">
          <input type="checkbox" required name="sem-trocas" className="mt-1 h-5 w-5 shrink-0 accent-[var(--vinho)]" />
          <span><b className="font-medium">A Meranno não faz trocas</b> de tamanho, cor ou modelo. Conferi o tamanho na tabela de medidas. Desistência em até 7 dias e peças com defeito: veja a <Link href="/trocas" target="_blank" className="underline underline-offset-2">página Trocas</Link>.</span>
        </label>
        {erro && <p role="alert" className="rounded-[18px] border border-[#8a3a2c]/30 bg-[#8a3a2c]/5 px-5 py-4 text-sm text-[#8a3a2c]">{erro}</p>}
        <button type="submit" disabled={status !== "form"} className="press label flex h-14 w-full items-center justify-between rounded-full bg-[var(--vinho)] px-7 text-[var(--creme)] shadow-[0_14px_30px_-14px_rgba(85,30,43,.7)] transition-opacity hover:opacity-95 disabled:cursor-wait disabled:opacity-75">
          <span className="text-[12px]">{botao}<span className="ml-2 tabular-nums text-[var(--latao)]">{formatPrice(total)}</span></span>
          {status !== "form" ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--creme)] border-t-transparent" /> : <ArrowRight size={18} />}
        </button>
        <p className="sans -mt-6 text-center text-[11px] uppercase tracking-[.12em] text-[var(--muted)]">{online ? `Pagamento processado pelo ${provedor}` : "Sem cobrança automática: o pagamento é combinado no WhatsApp"}</p>
      </div>

      <Summary items={items} subtotal={subtotal} shipping={shipping} cupom={cupom} descontoCupom={descontoCupom} descontoPix={descontoPix} total={total} email={email} onCupom={setCupom} />
    </form>
  </div></main>;
}
