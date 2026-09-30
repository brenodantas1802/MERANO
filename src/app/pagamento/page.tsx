"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, Check, Copy, CreditCard, QrCode } from "lucide-react";
import { useCart, type CartItem } from "@/components/cart-provider";
import { SiteHeader } from "@/components/site-header";
import { ProductCard } from "@/components/product-card";
import { saveOrder } from "@/lib/orders";
import { formatPrice, products, similarProducts } from "@/lib/products";
import { BeachArt } from "@/components/beach-art";

// Demo checkout for presentations: nothing here is sent anywhere or charged.

type Method = "pix" | "cartao";
type Shipping = { id: string; label: string; days: string; price: number };

const SHIPPING: Shipping[] = [
  { id: "pac", label: "PAC", days: "5 a 8 dias úteis após a produção", price: 19.9 },
  { id: "sedex", label: "SEDEX", days: "2 a 3 dias úteis após a produção", price: 34.9 },
];
const PIX_DISCOUNT = 0.05;

const field = "mt-2 block w-full border-b border-[var(--ink)]/40 bg-transparent py-2.5 text-base outline-none transition-colors focus:border-[var(--ink)]";
const label = "sans block text-[10px] uppercase tracking-[.14em] text-[var(--muted)]";

const onlyDigits = (value: string) => value.replace(/\D/g, "");
const maskCep = (value: string) => onlyDigits(value).slice(0, 8).replace(/(\d{5})(\d)/, "$1-$2");
const maskPhone = (value: string) => onlyDigits(value).slice(0, 11).replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d{1,4})$/, "$1-$2");
const maskCpf = (value: string) => onlyDigits(value).slice(0, 11).replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2");
const maskCard = (value: string) => onlyDigits(value).slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ");
const maskExpiry = (value: string) => onlyDigits(value).slice(0, 4).replace(/(\d{2})(\d)/, "$1/$2");

function FakeQr() {
  // Deterministic pseudo-QR pattern, purely decorative.
  const size = 25;
  const cells: [number, number][] = [];
  let seed = 7;
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    seed = (seed * 9301 + 49297) % 233280;
    const finder = (x < 7 && y < 7) || (x > 17 && y < 7) || (x < 7 && y > 17);
    if (!finder && seed / 233280 > 0.52) cells.push([x, y]);
  }
  const finder = (x: number, y: number) => <g key={`${x}-${y}`}><rect x={x} y={y} width="7" height="7" fill="currentColor" /><rect x={x + 1} y={y + 1} width="5" height="5" fill="#fff" /><rect x={x + 2} y={y + 2} width="3" height="3" fill="currentColor" /></g>;
  return <svg viewBox={`-1 -1 ${size + 2} ${size + 2}`} className="h-44 w-44 rounded-2xl bg-white p-2 text-[var(--ink)]" shapeRendering="crispEdges" aria-label="QR Code Pix">{cells.map(([x, y]) => <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="currentColor" />)}{finder(0, 0)}{finder(18, 0)}{finder(0, 18)}</svg>;
}

function Summary({ items, subtotal, shipping, discount, total }: { items: CartItem[]; subtotal: number; shipping: Shipping | null; discount: number; total: number }) {
  return <aside className="h-fit rounded-3xl bg-[var(--creme)] p-7 shadow-[0_20px_50px_-30px_rgba(32,28,23,.35)] md:sticky md:top-28">
    <p className="sans mb-5 text-[10px] uppercase tracking-[.2em] text-[var(--muted)]">Resumo do pedido</p>
    <div className="space-y-4">{items.map((item) => <div key={item.id} className="flex gap-4">
      <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-xl bg-[var(--cream)]">{item.image && <Image src={item.image} alt={item.name} fill sizes="64px" className="object-cover" />}<span className="sans absolute right-0 top-0 flex h-5 min-w-5 items-center justify-center bg-[var(--ink)] px-1 text-[10px] text-[var(--creme)]">{item.quantity}</span></div>
      <div className="flex flex-1 justify-between gap-3"><div><p className="leading-tight">{item.name}</p><p className="sans mt-1 text-[10px] uppercase tracking-[.1em] text-[var(--muted)]">Tam. {item.size} · {item.color}</p></div><span className="sans text-sm">{formatPrice(item.price * item.quantity)}</span></div>
    </div>)}</div>
    <div className="sans mt-6 space-y-2 border-t border-[var(--line)] pt-5 text-sm">
      <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
      <div className="flex justify-between"><span>Frete</span><span>{shipping ? formatPrice(shipping.price) : "—"}</span></div>
      {discount > 0 && <div className="flex justify-between text-[var(--moss)]"><span>Desconto Pix (5%)</span><span>− {formatPrice(discount)}</span></div>}
    </div>
    <div className="mt-4 flex items-baseline justify-between border-t border-[var(--ink)] pt-4"><span className="text-xl">Total</span><span className="text-2xl">{formatPrice(total)}</span></div>
  </aside>;
}

export default function PaymentPage() {
  const { items, total: subtotal, clear } = useCart();
  const [cep, setCep] = useState("");
  const [address, setAddress] = useState({ street: "", district: "", city: "" });
  const [shippingId, setShippingId] = useState<string | null>(null);
  const [method, setMethod] = useState<Method>("pix");
  const [installments, setInstallments] = useState(1);
  const [card, setCard] = useState({ number: "", name: "", expiry: "", cvv: "" });
  const [phone, setPhone] = useState("");
  const [cpf, setCpf] = useState("");
  const [status, setStatus] = useState<"form" | "processing" | "paid">("form");
  const [order, setOrder] = useState<{ id: string; total: number; method: Method; productIds: string[] } | null>(null);
  const [copied, setCopied] = useState(false);

  const shipping = cep.length === 9 ? SHIPPING.find((option) => option.id === shippingId) ?? null : null;
  const discount = method === "pix" ? Math.round(subtotal * PIX_DISCOUNT * 100) / 100 : 0;
  const total = subtotal + (shipping?.price ?? 0) - discount;

  async function updateCep(value: string) {
    const masked = maskCep(value);
    setCep(masked);
    if (masked.length !== 9) return;
    setShippingId((current) => current ?? "pac");
    try {
      const response = await fetch(`https://viacep.com.br/ws/${onlyDigits(masked)}/json/`);
      const data = await response.json();
      if (!data.erro) setAddress({ street: data.logradouro ?? "", district: data.bairro ?? "", city: data.localidade && data.uf ? `${data.localidade} / ${data.uf}` : "" });
    } catch {
      // Autofill is a convenience; the customer can still type the address.
    }
  }

  function pay(event: React.FormEvent) {
    event.preventDefault();
    setStatus("processing");
    setTimeout(() => {
      const id = `MR-${Math.floor(1000 + Math.random() * 9000)}`;
      // Older cart entries have no productId: recover it from the "<product>-<size>-<color>" id.
      const productIdOf = (item: CartItem) => item.productId ?? products.find((product) => item.id.startsWith(`${product.id}-`))?.id ?? item.id;
      const records = items.map((item) => ({ productId: productIdOf(item), name: item.name, size: item.size, color: item.color, price: item.price, quantity: item.quantity, image: item.image }));
      saveOrder({ id, date: new Date().toISOString(), total, items: records });
      setOrder({ id, total, method, productIds: [...new Set(records.map((record) => record.productId))] });
      clear();
      setStatus("paid");
      window.scrollTo({ top: 0 });
    }, 2200);
  }

  if (status === "paid" && order) return <main><SiteHeader /><div className="mx-auto max-w-5xl px-6 py-24 md:px-12">
    <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 220, damping: 16 }} className="mb-10 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--moss)] text-white"><Check size={30} /></motion.div>
    <p className="sans mb-5 text-[10px] uppercase tracking-[.2em] text-[var(--muted)]">Pedido {order.id} · {order.method === "pix" ? "Pix aprovado" : "Cartão aprovado"}</p>
    <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between"><h1 className="display text-6xl md:text-8xl">Obrigado.<br /><i>Sua peça começa agora.</i></h1><BeachArt scene="sunset" className="w-48 shrink-0 md:w-64" /></div>
    <p className="mt-8 max-w-lg text-2xl leading-snug">Recebemos {formatPrice(order.total)}. Sua camiseta entra na fila do ateliê hoje e você recebe o código de rastreio por e-mail assim que ela sair.</p>
    <div className="sans mt-12 grid gap-6 border-y border-[var(--line)] py-8 text-[11px] uppercase tracking-[.12em] md:grid-cols-3">
      <div><span className="text-[var(--sol-1)]">01 · Hoje</span><p className="mt-2 normal-case tracking-normal text-[var(--muted)]">Pedido confirmado</p></div>
      <div><span className="text-[var(--muted)]">02 · Até 7 dias úteis</span><p className="mt-2 normal-case tracking-normal text-[var(--muted)]">Produção no ateliê</p></div>
      <div><span className="text-[var(--muted)]">03 · Envio</span><p className="mt-2 normal-case tracking-normal text-[var(--muted)]">Rastreio no seu e-mail</p></div>
    </div>
    <Link href="/shop" className="sans mt-10 inline-flex items-center gap-2 border-b border-[var(--ink)] pb-2 text-[11px] uppercase tracking-[.15em]">Continuar explorando <ArrowRight size={14} /></Link>
    {similarProducts(order.productIds, 3).length > 0 && <section className="mt-20 border-t border-[var(--line)] pt-12">
      <div className="mb-10 flex flex-wrap items-end gap-x-4 gap-y-1"><h2 className="display text-4xl md:text-5xl">Parecidas com o que você comprou.</h2><span className="script -rotate-2 pb-1 text-2xl text-[var(--sol-1)]">pra próxima</span></div>
      <div className="grid gap-8 md:grid-cols-3 md:gap-x-10">{similarProducts(order.productIds, 3).map((product) => <ProductCard key={product.id} product={product} />)}</div>
    </section>}
  </div></main>;

  if (items.length === 0) return <main><SiteHeader /><div className="mx-auto max-w-3xl px-6 py-24 md:px-12"><h1 className="display text-6xl md:text-8xl">Pagamento.</h1><p className="mt-8 text-2xl">Seu carrinho está vazio.</p><Link href="/shop" className="sans mt-8 inline-flex items-center gap-2 border-b border-[var(--ink)] pb-2 text-[11px] uppercase tracking-[.15em]">Ver coleção <ArrowRight size={14} /></Link></div></main>;

  return <main><SiteHeader /><div className="mx-auto max-w-360 px-6 pb-24 pt-10 md:px-12">
    <Link href="/shop" className="sans mb-10 flex w-fit items-center gap-2 text-[10px] uppercase tracking-[.15em] text-[var(--muted)]"><ArrowLeft size={14} /> Continuar comprando</Link>
    <div className="flex items-end gap-6"><h1 className="display text-6xl md:text-8xl">Pagamento.</h1><BeachArt scene="boat" className="w-24 shrink-0 pb-1 md:w-36" /></div>
    <form onSubmit={pay} className="mt-12 grid gap-12 md:grid-cols-[1fr_400px] md:gap-20">
      <div className="space-y-14">
        <section>
          <h2 className="mb-6 flex items-baseline gap-4 text-2xl"><span className="sans text-xs text-[var(--sol-1)]">01</span>Seus dados</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <label className={`${label} md:col-span-2`}>Nome completo<input required autoComplete="name" className={field} /></label>
            <label className={label}>E-mail<input required type="email" autoComplete="email" className={field} /></label>
            <label className={label}>Celular<input required inputMode="tel" autoComplete="tel" value={phone} onChange={(event) => setPhone(maskPhone(event.target.value))} placeholder="(11) 90000-0000" className={field} /></label>
            <label className={label}>CPF<input required inputMode="numeric" value={cpf} onChange={(event) => setCpf(maskCpf(event.target.value))} placeholder="000.000.000-00" className={field} /></label>
          </div>
        </section>

        <section>
          <h2 className="mb-6 flex items-baseline gap-4 text-2xl"><span className="sans text-xs text-[var(--sol-1)]">02</span>Entrega</h2>
          <div className="grid gap-6 md:grid-cols-[180px_1fr]">
            <label className={label}>CEP<input required inputMode="numeric" autoComplete="postal-code" value={cep} onChange={(event) => updateCep(event.target.value)} placeholder="00000-000" className={field} /></label>
            <label className={label}>Rua<input required value={address.street} onChange={(event) => setAddress({ ...address, street: event.target.value })} className={field} /></label>
          </div>
          <div className="mt-6 grid gap-6 md:grid-cols-[120px_1fr_1fr]">
            <label className={label}>Número<input required className={field} /></label>
            <label className={label}>Complemento<input className={field} /></label>
            <label className={label}>Bairro<input required value={address.district} onChange={(event) => setAddress({ ...address, district: event.target.value })} className={field} /></label>
          </div>
          {address.city && <p className="sans mt-4 text-xs text-[var(--muted)]">{address.city}</p>}
          <AnimatePresence>{cep.length === 9 && <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-8 grid gap-3">
            {SHIPPING.map((option) => <label key={option.id} className={`flex cursor-pointer items-center justify-between rounded-2xl border px-5 py-4 transition-colors ${shippingId === option.id ? "border-[var(--ink)] bg-[var(--creme)]" : "border-[var(--line)]"}`}>
              <span className="flex items-center gap-4"><input type="radio" name="frete" checked={shippingId === option.id} onChange={() => setShippingId(option.id)} className="accent-[var(--ink)]" /><span><span className="sans block text-[11px] uppercase tracking-[.12em]">{option.label}</span><span className="text-sm text-[var(--muted)]">{option.days}</span></span></span>
              <span className="sans text-sm">{formatPrice(option.price)}</span>
            </label>)}
          </motion.div>}</AnimatePresence>
        </section>

        <section>
          <h2 className="mb-6 flex items-baseline gap-4 text-2xl"><span className="sans text-xs text-[var(--sol-1)]">03</span>Pagamento</h2>
          <div role="radiogroup" aria-label="Forma de pagamento" className="grid grid-cols-2 gap-3">
            {([["pix", "Pix", "5% de desconto", QrCode], ["cartao", "Cartão de crédito", "até 3x sem juros", CreditCard]] as const).map(([id, name, hint, Icon]) => <button key={id} type="button" role="radio" aria-checked={method === id} onClick={() => setMethod(id)} className={`flex items-center gap-3 rounded-2xl border px-4 py-4 text-left transition-colors ${method === id ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--creme)]" : "border-[var(--line)] hover:border-[var(--ink)]"}`}><Icon size={20} strokeWidth={1.5} /><span><span className="sans block text-[11px] uppercase tracking-[.12em]">{name}</span><span className={`text-sm ${method === id ? "text-[var(--creme)]/70" : "text-[var(--muted)]"}`}>{hint}</span></span></button>)}
          </div>

          {method === "pix" ? <div className="mt-8 flex flex-col items-start gap-6 rounded-3xl bg-[var(--creme)] p-6 md:flex-row md:items-center">
            <FakeQr />
            <div>
              <p className="text-xl">Pague {formatPrice(total)} com Pix</p>
              <p className="mt-2 text-[var(--muted)]">Abra o app do seu banco, escaneie o código ou use o Pix copia e cola. A confirmação é instantânea.</p>
              <button type="button" onClick={() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="sans mt-5 inline-flex items-center gap-2 rounded-full border border-[var(--ink)] px-5 py-2.5 text-[10px] uppercase tracking-[.14em] hover:bg-[var(--ink)] hover:text-[var(--creme)]">{copied ? <><Check size={14} /> Código copiado</> : <><Copy size={14} /> Copiar código Pix</>}</button>
            </div>
          </div> : <div className="mt-8 grid gap-8 md:grid-cols-[1fr_260px]">
            <div className="grid gap-6">
              <label className={label}>Número do cartão<input required inputMode="numeric" autoComplete="off" value={card.number} onChange={(event) => setCard({ ...card, number: maskCard(event.target.value) })} placeholder="0000 0000 0000 0000" className={field} /></label>
              <label className={label}>Nome impresso no cartão<input required autoComplete="off" value={card.name} onChange={(event) => setCard({ ...card, name: event.target.value.toUpperCase() })} className={field} /></label>
              <div className="grid grid-cols-2 gap-6">
                <label className={label}>Validade<input required inputMode="numeric" autoComplete="off" value={card.expiry} onChange={(event) => setCard({ ...card, expiry: maskExpiry(event.target.value) })} placeholder="MM/AA" className={field} /></label>
                <label className={label}>CVV<input required inputMode="numeric" autoComplete="off" value={card.cvv} onChange={(event) => setCard({ ...card, cvv: onlyDigits(event.target.value).slice(0, 4) })} placeholder="000" className={field} /></label>
              </div>
              <label className={label}>Parcelas<select value={installments} onChange={(event) => setInstallments(Number(event.target.value))} className={field}>{[1, 2, 3].map((n) => <option key={n} value={n}>{n}x de {formatPrice(total / n)} sem juros</option>)}</select></label>
            </div>
            <div className="relative hidden aspect-[1.586] w-full overflow-hidden rounded-xl bg-gradient-to-br from-[var(--terra-dark)] via-[var(--terra)] to-[var(--sol-1)] p-5 text-[var(--creme)] shadow-xl md:flex md:flex-col md:justify-between">
              <span className="sans text-[10px] uppercase tracking-[.3em]">Merano</span>
              <span className="sans text-base tracking-[.12em]">{card.number || "•••• •••• •••• ••••"}</span>
              <span className="sans flex justify-between text-[10px] uppercase tracking-[.12em]"><span className="truncate">{card.name || "Seu nome"}</span><span>{card.expiry || "MM/AA"}</span></span>
            </div>
          </div>}
        </section>

        <button type="submit" disabled={status === "processing"} className="flex w-full items-center justify-between rounded-full bg-[var(--ink)] px-7 py-5 text-[var(--creme)] transition-opacity hover:opacity-90 disabled:cursor-wait disabled:opacity-70">
          <span className="sans text-[12px] uppercase tracking-[.15em]">{status === "processing" ? "Processando pagamento..." : method === "pix" ? `Já paguei · ${formatPrice(total)}` : `Pagar ${formatPrice(total)}`}</span>
          {status === "processing" ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--creme)] border-t-transparent" /> : <ArrowRight size={18} />}
        </button>
        <p className="sans -mt-10 text-[10px] uppercase tracking-[.12em] text-[var(--muted)]">Ambiente de demonstração · nenhum valor é cobrado</p>
      </div>

      <Summary items={items} subtotal={subtotal} shipping={shipping} discount={discount} total={total} />
    </form>
  </div></main>;
}
