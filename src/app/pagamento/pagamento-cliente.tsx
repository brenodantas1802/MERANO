"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, Check, ChevronDown, Lock, Search, ShoppingBag, X } from "lucide-react";
import { useCart, type CartItem } from "@/components/cart-provider";
import { SiteHeader } from "@/components/site-header";
import { LogoNome, LogoSimbolo } from "@/components/logo-meranno";
import { CUPOM_KEY } from "@/components/first-purchase-popup";
import { saveOrder } from "@/lib/orders";
import { percentualPreVenda, formatPrice, products, currentImage, parcelado } from "@/lib/products";
import { Illustration } from "@/components/illustration";
import { CEP_KEY, chegadaTexto, useFrete, type OpcaoFrete } from "@/lib/use-frete";
import { POSTAGEM_DIAS_UTEIS } from "@/lib/entrega";

// Payment page (owners, 2026-11-24: laid out like the Saint Tropez checkout, with the Ermos payment list): the brand on
// top, the form on a white column, the order on an ice column beside it with a big photo of each piece, a wine button.
// The order is created on the server (/api/pedidos), which prices everything again. With online payment connected
// (Asaas) the customer pays on the provider's secure page, so card numbers never reach this site; until then the order
// goes out as a WhatsApp message.

type Method = "pix" | "cartao";
type Cupom = { codigo: string; percentual: number };
const PIX_DISCOUNT = 0; // same as PIX_DESCONTO on the server
const centavos = (valor: number) => Math.round(valor * 100) / 100;
const UFS = ["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"];

function lerLocal(chave: string) {
  try {
    return typeof window === "undefined" ? "" : window.localStorage.getItem(chave) ?? "";
  } catch {
    return "";
  }
}

const onlyDigits = (value: string) => value.replace(/\D/g, "");
const maskCep = (value: string) => onlyDigits(value).slice(0, 8).replace(/(\d{5})(\d)/, "$1-$2");
const maskPhone = (value: string) => onlyDigits(value).slice(0, 11).replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d{1,4})$/, "$1-$2");
const maskCpf = (value: string) => onlyDigits(value).slice(0, 11).replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2");

// Checkout fields: the name sits inside the box and moves up once something is typed.
const caixa = "peer h-[52px] w-full rounded-[10px] border border-[var(--borda-campo)] bg-[var(--paper)] px-3.5 pb-1.5 pt-5 text-[15px] text-[var(--ink)] outline-none transition-[border-color,box-shadow] duration-150 focus:border-[var(--vinho)] focus:shadow-[0_0_0_1px_var(--vinho)]";
// The label sits small at the top when the field has text, and in the middle when it is empty and not focused. Whether
// it has text is tracked here, not with :placeholder-shown: iPhone Safari doesn't re-check that rule when the page fills
// a field by itself (street, district and city from the CEP), so the label stayed over the text (2026-11-25).
const rotuloFlutuante = "pointer-events-none absolute left-3.5 max-w-[calc(100%-1.75rem)] truncate leading-none text-[var(--muted)] transition-all duration-150";
const rotuloEmCima = "top-2 text-[11px]";
const rotuloNoMeio = "top-1/2 -translate-y-1/2 text-[15px] peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-[11px] peer-autofill:top-2 peer-autofill:translate-y-0 peer-autofill:text-[11px]";

function Campo({ rotulo, className = "", icone, onInput, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { rotulo: string; icone?: React.ReactNode }) {
  // Fields the page controls (value) say it themselves; the others (like "Número") are followed as the customer types.
  const [digitado, setDigitado] = useState(Boolean(props.defaultValue));
  const temTexto = props.value !== undefined ? String(props.value) !== "" : digitado;
  return <label className={`relative block ${className}`}>
    <input {...props} onInput={(event) => { setDigitado(event.currentTarget.value !== ""); onInput?.(event); }} className={`${caixa} ${icone ? "pr-11" : ""}`} />
    <span className={`${rotuloFlutuante} ${temTexto ? rotuloEmCima : rotuloNoMeio}`}>{rotulo}</span>
    {icone && <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]">{icone}</span>}
  </label>;
}

const titulo = "text-[21px] font-semibold leading-tight";
const Selo = ({ children }: { children: React.ReactNode }) => <span className="rounded-[4px] border border-black/10 bg-white/90 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[.06em] text-[var(--ink)]/75">{children}</span>;

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

  if (cupom) return <div className="flex items-center justify-between rounded-[10px] border border-dashed border-[var(--vinho)]/45 bg-[var(--paper)]/70 px-4 py-3 text-[14px]">
    <span><span className="text-[12px] text-[var(--muted)]">Cupom</span> <b className="ml-1 font-semibold tracking-[.06em] text-[var(--vinho)]">{cupom.codigo}</b> · {cupom.percentual}% off</span>
    <button type="button" onClick={onRemover} aria-label="Tirar o cupom" className="press -mr-2 flex h-11 w-11 items-center justify-center rounded-full text-[var(--muted)] hover:text-[var(--ink)]"><X size={16} /></button>
  </div>;

  return <div>
    <div className="flex gap-2.5">
      <Campo rotulo="Código de desconto" value={codigo} onChange={(event) => { setCodigo(event.target.value.toUpperCase()); setErro(""); }} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); aplicar(); } }} autoCapitalize="characters" autoComplete="off" spellCheck={false} className="flex-1" />
      <button type="button" onClick={aplicar} disabled={conferindo || !codigo.trim()} className="press h-[52px] shrink-0 rounded-[10px] border border-[var(--borda-campo)] bg-[var(--paper)] px-5 text-[14px] font-medium text-[var(--ink)] transition-colors hover:border-[var(--vinho)] hover:text-[var(--vinho)] disabled:text-[var(--muted)] disabled:hover:border-[var(--borda-campo)]">{conferindo ? "…" : "Aplicar"}</button>
    </div>
    {erro && <p role="alert" className="mt-2 text-[13px] text-[#8a3a2c]">{erro}</p>}
  </div>;
}

type Totais = { subtotal: number; shipping: OpcaoFrete | null; cupom: Cupom | null; descontoCupom: number; descontoPix: number; total: number };

// The order, on the ice column (or under "Mostrar resumo do pedido" on a phone). Big photos: the owners want to see the
// piece they are buying, where Saint Tropez's thumbnails are tiny.
function Resumo({ items, totais, email, onCupom }: { items: CartItem[]; totais: Totais; email: string; onCupom: (cupom: Cupom | null) => void }) {
  const { subtotal, shipping, cupom, descontoCupom, descontoPix, total } = totais;
  const pecas = items.reduce((soma, item) => soma + item.quantity, 0);
  const desconto = percentualPreVenda(items);
  return <div>
    <ul className="space-y-5">{items.map((item) => <li key={item.id} className="flex items-center gap-5">
      <div className="relative shrink-0">
        <div className="foto-gelo relative h-[130px] w-[104px] overflow-hidden rounded-[12px] border border-[var(--line)] md:h-[160px] md:w-[128px]">{currentImage(item) && <Image src={currentImage(item)!} alt={item.name} fill sizes="128px" className="object-cover" unoptimized={currentImage(item)!.startsWith("data:")} />}</div>
        <span className="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-[var(--ink)] px-1.5 text-[12px] font-semibold text-[var(--paper)]">{item.quantity}</span>
      </div>
      <div className="flex min-w-0 flex-1 items-start justify-between gap-3">
        <div className="min-w-0"><p className="text-[15px] font-medium uppercase leading-snug tracking-[.04em]">{item.name}</p><p className="mt-1 text-[13px] uppercase text-[var(--muted)]">{[item.color, item.size].filter(Boolean).join(" / ")}</p></div>
        <span className="shrink-0 text-[15px] tabular-nums">{formatPrice(item.price * item.quantity)}</span>
      </div>
    </li>)}</ul>
    <div className="mt-7"><CampoCupom cupom={cupom} email={email} onAplicar={onCupom} onRemover={() => { onCupom(null); try { window.localStorage.removeItem(CUPOM_KEY); } catch { /* nothing kept */ } }} /></div>
    <dl className="mt-7 space-y-2.5 text-[14px]">
      <div className="flex justify-between"><dt>Subtotal · {pecas} {pecas === 1 ? "item" : "itens"}</dt><dd className="tabular-nums">{formatPrice(subtotal)}</dd></div>
      {desconto > 0 && <p className="-mt-1 text-[12px] text-[var(--vinho)]">Já com o preço de pré-venda: {desconto}% de desconto.</p>}
      {descontoCupom > 0 && <div className="flex justify-between text-[var(--vinho)]"><dt>Cupom {cupom?.codigo} ({cupom?.percentual}%)</dt><dd className="tabular-nums">− {formatPrice(descontoCupom)}</dd></div>}
      <div className="flex justify-between"><dt>Frete</dt><dd className={shipping ? "tabular-nums" : "text-[var(--muted)]"}>{shipping ? formatPrice(shipping.preco) : "Insira o CEP de entrega"}</dd></div>
      {descontoPix > 0 && <div className="flex justify-between text-[var(--vinho)]"><dt>Desconto Pix</dt><dd className="tabular-nums">− {formatPrice(descontoPix)}</dd></div>}
    </dl>
    <div className="mt-5 flex items-baseline justify-between"><span className="text-[19px] font-semibold">Total</span><span className="flex items-baseline gap-2"><span className="text-[12px] text-[var(--muted)]">BRL</span><span className="text-[22px] font-semibold tabular-nums">{formatPrice(total)}</span></span></div>
    <p className="mt-1 text-right text-[13px] text-[var(--muted)]">ou {parcelado(total)} no cartão</p>
  </div>;
}

type Feito = { id: string; numero: string; total: number; whatsapp: string };

export function Pagamento({ online, provedor }: { online: boolean; provedor: string }) {
  const { items, total: subtotal, count, clear, openDrawer } = useCart();
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
  const [resumoAberto, setResumoAberto] = useState(false);

  // The cheapest option comes selected. These numbers are a preview: the server works them out again.
  const shipping = frete.opcoes.find((option) => option.id === shippingId) ?? frete.opcoes[0] ?? null;
  const descontoCupom = cupom ? centavos(subtotal * cupom.percentual / 100) : 0;
  const descontoPix = method === "pix" ? centavos((subtotal - descontoCupom) * PIX_DISCOUNT) : 0;
  const total = centavos(subtotal - descontoCupom - descontoPix + (shipping?.preco ?? 0));
  const totais: Totais = { subtotal, shipping, cupom, descontoCupom, descontoPix, total };

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
    const nome = `${String(form.get("nome") ?? "").trim()} ${String(form.get("sobrenome") ?? "").trim()}`.trim();
    try {
      const resposta = await fetch("/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cliente: { nome, email, celular: phone, cpf },
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

  const botao = status === "redirecting" ? "Abrindo o pagamento…" : status === "processing" ? "Registrando o pedido…" : online ? "Pagar agora" : "Enviar pedido pelo WhatsApp";
  const formas: { id: Method; nome: string; selos: string[]; texto: string }[] = [
    { id: "pix", nome: "Pix", selos: ["Pix"], texto: online ? `O QR Code e o Pix copia e cola aparecem na página segura do ${provedor}. A confirmação chega na hora.` : "O pedido vai para o nosso WhatsApp já escrito, e a equipe manda o Pix para você pagar." },
    { id: "cartao", nome: "Cartão de crédito", selos: ["Visa", "Master", "Elo", "+3"], texto: online ? `Você digita o cartão na página segura do ${provedor}, à vista ou em ${parcelado(total)}. Os dados do cartão não passam pelo site da Meranno.` : "O pedido vai para o nosso WhatsApp já escrito, e a equipe manda o link do cartão para você pagar." },
  ];
  const freteSelecionado = (option: OpcaoFrete) => shipping?.id === option.id;

  // A white column and an ice one, split down the middle of the screen like the Saint Tropez checkout.
  return <main className="sans min-h-svh bg-[var(--paper)] text-[var(--ink)] md:bg-[linear-gradient(90deg,var(--paper)_50%,var(--line)_50%,var(--line)_calc(50%_+_1px),var(--gelo)_calc(50%_+_1px))]">
    <div className="mx-auto max-w-[1180px] md:grid md:grid-cols-2">
      <div className="md:pb-16 md:pr-12 md:pt-10 lg:pr-20">
        <div className="md:ml-auto md:max-w-[560px]">
          <header className="flex items-center justify-between border-b border-[var(--line)] px-5 py-3.5 md:border-0 md:px-0 md:pb-8 md:pt-0">
            <Link href="/" aria-label="Meranno, página inicial" className="flex items-center gap-2.5 text-[var(--ink)]"><LogoSimbolo className="h-7 w-auto" /><LogoNome className="h-auto w-[128px]" /></Link>
            <button type="button" onClick={openDrawer} aria-label="Abrir carrinho" className="press flex h-11 w-11 items-center justify-center rounded-full text-[var(--vinho)] hover:bg-[var(--gelo)]"><ShoppingBag size={22} strokeWidth={1.5} /></button>
          </header>

          <div className="md:hidden">
            <button type="button" onClick={() => setResumoAberto((aberto) => !aberto)} aria-expanded={resumoAberto} className="flex w-full items-center justify-between border-b border-[var(--line)] bg-[var(--gelo)] px-5 py-4">
              <span className="flex items-center gap-1.5 text-[14px] text-[var(--vinho)]">{resumoAberto ? "Ocultar" : "Mostrar"} resumo do pedido <ChevronDown size={16} className={`transition-transform ${resumoAberto ? "rotate-180" : ""}`} /></span>
              <span className="text-[17px] font-semibold tabular-nums">{formatPrice(total)}</span>
            </button>
            {resumoAberto && <div className="border-b border-[var(--line)] bg-[var(--gelo)] px-5 py-6"><Resumo items={items} totais={totais} email={email} onCupom={setCupom} /></div>}
          </div>

          <form onSubmit={pay} className="space-y-10 px-5 pb-16 pt-8 md:px-0 md:pb-0 md:pt-0">
            <section>
              <div className="mb-4 flex items-baseline justify-between"><h2 className={titulo}>Contato</h2><Link href="/conta?next=/pagamento" className="text-[14px] underline underline-offset-2 hover:text-[var(--vinho)]">Fazer login</Link></div>
              <Campo rotulo="E-mail" required name="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} />
            </section>

            <section>
              <h2 className={`${titulo} mb-4`}>Entrega</h2>
              <div className="grid grid-cols-2 gap-3">
                <Campo rotulo="Nome" required name="nome" autoComplete="given-name" />
                <Campo rotulo="Sobrenome" required name="sobrenome" autoComplete="family-name" />
                <Campo rotulo="CPF" required inputMode="numeric" value={cpf} onChange={(event) => setCpf(maskCpf(event.target.value))} className="col-span-2" />
                <Campo rotulo="CEP" required inputMode="numeric" autoComplete="postal-code" value={cep} onChange={(event) => updateCep(event.target.value)} icone={<Search size={17} />} className="col-span-2" />
              </div>
              <div className="mt-3 grid grid-cols-[1fr_120px] gap-3">
                <Campo rotulo="Endereço" required autoComplete="address-line1" value={address.street} onChange={(event) => setAddress({ ...address, street: event.target.value })} />
                <Campo rotulo="Número" required name="numero" />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <Campo rotulo="Complemento" name="complemento" autoComplete="address-line2" />
                <Campo rotulo="Bairro" required value={address.district} onChange={(event) => setAddress({ ...address, district: event.target.value })} />
                <Campo rotulo="Cidade" required autoComplete="address-level2" value={address.city} onChange={(event) => setAddress({ ...address, city: event.target.value })} />
                <label className="relative block">
                  <select required value={address.uf} onChange={(event) => setAddress({ ...address, uf: event.target.value })} autoComplete="address-level1" className={`${caixa} appearance-none pr-10`}>
                    <option value="" disabled>Selecione</option>
                    {UFS.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
                  </select>
                  <span className="pointer-events-none absolute left-3.5 top-2 text-[11px] leading-none text-[var(--muted)]">Estado</span>
                  <ChevronDown size={16} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                </label>
                <Campo rotulo="Celular com DDD" required type="tel" inputMode="tel" autoComplete="tel" value={phone} onChange={(event) => setPhone(maskPhone(event.target.value))} className="col-span-2" />
              </div>
            </section>

            <section>
              <h2 className={`${titulo} mb-4`}>Forma de frete</h2>
              {!frete.pronto ? <p className="rounded-[10px] bg-[var(--gelo)] px-5 py-5 text-center text-[14px] text-[var(--muted)]">Insira o CEP de entrega para ver as formas de frete disponíveis.</p>
                : <div aria-live="polite">
                  {frete.carregando && <div className="h-[60px] animate-pulse rounded-[10px] bg-[var(--gelo)]" />}
                  {frete.erro && <p className="rounded-[10px] bg-[var(--gelo)] px-5 py-4 text-[14px] text-[var(--muted)]">{frete.erro}</p>}
                  {frete.opcoes.length > 0 && <div className="overflow-hidden rounded-[10px] border border-[var(--borda-campo)]">
                    {frete.opcoes.map((option, indice) => <label key={option.id} className={`flex min-h-[60px] cursor-pointer items-center justify-between gap-4 px-4 py-3 transition-colors ${indice ? "border-t border-[var(--borda-campo)]" : ""} ${freteSelecionado(option) ? "bg-[var(--vinho)]/[.05] shadow-[inset_0_0_0_1px_var(--vinho)]" : ""}`}>
                      <span className="flex items-center gap-3.5"><input type="radio" name="frete" required checked={freteSelecionado(option)} onChange={() => setShippingId(option.id)} className="h-[18px] w-[18px] accent-[var(--vinho)]" /><span><span className="block text-[14px] font-medium">{option.nome}{option.empresa && option.empresa !== "Correios" ? ` · ${option.empresa}` : ""}</span><span className="block text-[13px] text-[var(--muted)]">{chegadaTexto(option)}</span></span></span>
                      <span className="text-[14px] font-medium tabular-nums">{formatPrice(option.preco)}</span>
                    </label>)}
                  </div>}
                  {frete.exemplo && <p className="mt-2 text-[12px] uppercase tracking-[.12em] text-[var(--latao)]">Valores de exemplo</p>}
                </div>}
              <p className="mt-3 text-[13px] text-[var(--muted)]">Postamos em até {POSTAGEM_DIAS_UTEIS} dias úteis depois do pagamento; a data de chegada já conta com isso.</p>
            </section>

            <section>
              <h2 className={titulo}>Pagamento</h2>
              <p className="mb-4 mt-1 flex items-center gap-1.5 text-[14px] text-[var(--muted)]"><Lock size={13} /> Todas as transações são seguras e criptografadas.</p>
              <div role="radiogroup" aria-label="Forma de pagamento" className="overflow-hidden rounded-[10px] border border-[var(--borda-campo)]">
                {formas.map((forma, indice) => {
                  const ativa = method === forma.id;
                  return <div key={forma.id} className={indice ? "border-t border-[var(--borda-campo)]" : ""}>
                    <button type="button" role="radio" aria-checked={ativa} onClick={() => setMethod(forma.id)} className={`flex min-h-[56px] w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors ${ativa ? "bg-[var(--vinho)]/[.05] shadow-[inset_0_0_0_1px_var(--vinho)]" : "hover:bg-[var(--gelo)]/60"}`}>
                      <span className="flex items-center gap-3.5"><span className={`flex h-[18px] w-[18px] items-center justify-center rounded-full border ${ativa ? "border-[var(--vinho)] bg-[var(--vinho)]" : "border-[var(--borda-campo)] bg-[var(--paper)]"}`}>{ativa && <span className="h-1.5 w-1.5 rounded-full bg-[var(--paper)]" />}</span><span className="text-[15px] font-medium">{forma.nome}</span></span>
                      <span className="flex gap-1">{forma.selos.map((selo) => <Selo key={selo}>{selo}</Selo>)}</span>
                    </button>
                    {ativa && <p className="border-t border-[var(--borda-campo)] bg-[var(--gelo)]/70 px-5 py-4 text-[14px] leading-relaxed text-[var(--ink)]/80">{forma.texto}</p>}
                  </div>;
                })}
              </div>
            </section>

            {/* No exchanges (owners, 2026-11-22): said plainly before paying, and the customer confirms it. */}
            <label className="flex cursor-pointer items-start gap-3 text-[14px] leading-relaxed">
              <input type="checkbox" required name="sem-trocas" className="mt-0.5 h-[18px] w-[18px] shrink-0 accent-[var(--vinho)]" />
              <span><b className="font-semibold">A Meranno não faz trocas</b> de tamanho, cor ou modelo. Confira o tamanho na tabela de medidas. Desistência em até 7 dias e peças com defeito: veja a <Link href="/trocas" target="_blank" className="underline underline-offset-2">página Trocas</Link>.</span>
            </label>

            {erro && <p role="alert" className="rounded-[10px] border border-[#8a3a2c]/30 bg-[#8a3a2c]/5 px-5 py-4 text-[14px] text-[#8a3a2c]">{erro}</p>}

            <div>
              <button type="submit" disabled={status !== "form"} className="press flex h-[58px] w-full items-center justify-center gap-3 rounded-[10px] bg-[var(--vinho)] text-[17px] font-semibold text-[var(--creme)] shadow-[0_14px_30px_-16px_rgba(85,30,43,.8)] transition-opacity hover:opacity-95 disabled:cursor-wait disabled:opacity-75">
                {status !== "form" && <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--creme)] border-t-transparent" />}{botao}
              </button>
              <p className="mt-3 text-center text-[12px] text-[var(--muted)]">{online ? `Pagamento processado pelo ${provedor}` : "Sem cobrança automática: o pagamento é combinado no WhatsApp"}</p>
            </div>

            <nav aria-label="Políticas" className="flex flex-wrap gap-x-5 gap-y-2 border-t border-[var(--line)] pt-5 text-[13px]">
              {[["/trocas", "Trocas"], ["/entrega", "Entrega"], ["/privacidade", "Privacidade"], ["/termos", "Termos"]].map(([href, nome]) => <Link key={href} href={href} target="_blank" className="underline underline-offset-2 hover:text-[var(--vinho)]">{nome}</Link>)}
            </nav>
          </form>
        </div>
      </div>

      <aside aria-label="Resumo do pedido" className="hidden md:block md:pl-12 md:pt-10 lg:pl-20">
        <div className="sticky top-10 max-w-[460px] pb-16"><Resumo items={items} totais={totais} email={email} onCupom={setCupom} /></div>
      </aside>
    </div>
  </main>;
}
