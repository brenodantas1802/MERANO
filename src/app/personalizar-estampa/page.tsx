"use client";

import { Download, Maximize2, Minus, Plus } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { Camiseta, type ArteVerso } from "@/components/personalizador/camiseta";
import { ChatCriacao, SUGESTOES_INICIAIS, type Mensagem } from "@/components/personalizador/chat";
import { Confirmacao } from "@/components/personalizador/confirmacao";
import { Finalizar } from "@/components/personalizador/finalizar";
import { ProgressoCriacao } from "@/components/personalizador/progresso";
import { PainelPeca, type Referencia } from "@/components/personalizador/painel";
import { FICHA_VAZIA, PAINEL_PADRAO, type Ficha, type Painel } from "@/lib/estampa";

// Generations a customer can start in one visit. The server's rate limit is the real guard; this keeps the page honest.
const CRIACOES_POR_SESSAO = 3;

type Camada = "casa" | "esboco" | "arte";

// One side of the tee on the wine stage, with its own zoom. The drawing scales by height so both sides fit any screen.
function Vista({ titulo, children, extra, rodape, className = "" }: { titulo: string; children: React.ReactNode; extra?: React.ReactNode; rodape?: React.ReactNode; className?: string }) {
  const [zoom, setZoom] = useState(100);
  const botao = "hidden rounded p-1.5 text-[var(--pz-creme)]/85 hover:bg-white/10 hover:text-[var(--pz-creme)] sm:block";
  const canto = "pointer-events-none absolute h-[22px] w-[22px] border-[var(--pz-ouro)]/70";
  return <div className={`relative flex min-h-0 flex-1 flex-col overflow-hidden ${className}`}>
    <div className="absolute inset-x-3 top-3 z-10 flex items-center justify-between gap-2 text-[var(--pz-creme)] md:inset-x-6 md:top-[18px]">
      <span className="pz-serif text-[22px] italic md:text-[26px]">{titulo}</span>
      <div className="flex items-center gap-1 text-[13px]">
        {extra}
        <button type="button" aria-label={`Diminuir ${titulo}`} onClick={() => setZoom((z) => Math.max(60, z - 20))} className={botao}><Minus size={14} /></button>
        <span className="hidden w-10 text-center tabular-nums sm:block">{zoom}%</span>
        <button type="button" aria-label={`Aumentar ${titulo}`} onClick={() => setZoom((z) => Math.min(220, z + 20))} className={botao}><Plus size={14} /></button>
        <button type="button" aria-label={`Ajustar ${titulo}`} onClick={() => setZoom(100)} className={botao}><Maximize2 size={14} /></button>
      </div>
    </div>
    <span className={`${canto} left-3 top-12 border-l border-t md:left-6 md:top-[58px]`} />
    <span className={`${canto} right-3 top-12 border-r border-t md:right-6 md:top-[58px]`} />
    <span className={`${canto} bottom-3 left-3 border-b border-l md:bottom-5 md:left-6`} />
    <span className={`${canto} bottom-3 right-3 border-b border-r md:bottom-5 md:right-6`} />
    <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto px-4 pb-9 pt-12 md:px-8 md:pt-14">
      <div className={`flex items-center justify-center [&>svg]:h-full [&>svg]:w-auto ${zoom <= 100 ? "max-w-full [&>svg]:max-w-full" : "[&>svg]:max-w-none"}`} style={{ height: `${zoom}%` }}>{children}</div>
    </div>
    {rodape && <div className="pointer-events-none absolute inset-x-0 bottom-2 z-10 flex flex-col items-center gap-1 px-3 text-center [&>*]:pointer-events-auto">{rodape}</div>}
  </div>;
}

export default function PersonalizadorPage() {
  const [painel, setPainel] = useState<Painel>(PAINEL_PADRAO);
  const [referencias, setReferencias] = useState<Referencia[]>([]);
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [ficha, setFicha] = useState<Ficha>(FICHA_VAZIA);
  const [sugestoes, setSugestoes] = useState<string[]>(SUGESTOES_INICIAIS);
  const [pronto, setPronto] = useState(false);
  const [esboco, setEsboco] = useState("");
  const [arte, setArte] = useState("");
  const [camada, setCamada] = useState<Camada | null>(null);
  const [conversando, setConversando] = useState(false);
  const [erroChat, setErroChat] = useState("");
  const [confirmando, setConfirmando] = useState(false);
  const [gerando, setGerando] = useState(false);
  const [erroArte, setErroArte] = useState("");
  const [criacoes, setCriacoes] = useState(0);
  const [aba, setAba] = useState<"criacao" | "peca">("criacao");

  const palco = useRef<HTMLElement>(null);
  const verPeca = () => palco.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  const pendentes = referencias.filter((r) => !r.enviada);
  const malha = painel.paleta[0];

  // What the back shows: the newest layer the customer has, unless they picked another one.
  const disponiveis: Camada[] = [...(painel.estampaCasa ? ["casa" as const] : []), ...(esboco ? ["esboco" as const] : []), ...(arte ? ["arte" as const] : [])];
  const ativa = camada && disponiveis.includes(camada) ? camada : disponiveis[disponiveis.length - 1] ?? null;
  const arteVerso: ArteVerso = ativa === "arte" ? { tipo: "arte", src: arte } : ativa === "esboco" ? { tipo: "esboco", svg: esboco } : ativa === "casa" && painel.estampaCasa ? { tipo: "casa", id: painel.estampaCasa, cor: painel.paleta[1] ?? painel.corEscrita } : null;

  function mudarPainel(novo: Painel) {
    if (novo.estampaCasa && novo.estampaCasa !== painel.estampaCasa) setCamada("casa");
    setPainel(novo);
  }

  async function enviar(texto: string) {
    const anexos = pendentes;
    const nova: Mensagem = { papel: "cliente", texto: anexos.length ? `${texto}\n(Anexei ${anexos.length} imagem(ns) de referência.)` : texto };
    const historico = [...mensagens, nova];
    setMensagens(historico);
    setErroChat("");
    setConversando(true);
    try {
      const response = await fetch("/api/estampa/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mensagens: historico, painel, ficha, referencias: anexos.map((r) => r.url), totalReferencias: referencias.length }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não consegui responder agora.");
      setMensagens([...historico, { papel: "assistente", texto: data.resposta }]);
      setFicha(data.ficha);
      setSugestoes(data.sugestoes ?? []);
      setPronto(!!data.pronto);
      if (data.esboco) { setEsboco(data.esboco); setCamada("esboco"); }
      if (anexos.length) setReferencias((atual) => atual.map((r) => (anexos.some((a) => a.id === r.id) ? { ...r, enviada: true } : r)));
    } catch (error) {
      setErroChat(error instanceof Error ? error.message : "Não consegui responder agora.");
      // The message stays in the box's history only if it was answered; otherwise the customer can resend it.
      setMensagens(mensagens);
    } finally {
      setConversando(false);
    }
  }

  function recomecar() {
    setMensagens([]);
    setFicha(FICHA_VAZIA);
    setSugestoes(SUGESTOES_INICIAIS);
    setPronto(false);
    setEsboco("");
    setErroChat("");
    setReferencias((atual) => atual.map((r) => ({ ...r, enviada: false })));
  }

  const fechar = useCallback(() => setConfirmando(false), []);

  async function criar(fichaFinal: Ficha) {
    setFicha(fichaFinal);
    setGerando(true);
    setErroArte("");
    setConfirmando(false);
    setCriacoes((n) => n + 1);
    try {
      const response = await fetch("/api/estampa/gerar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ painel, ficha: fichaFinal, referencias: fichaFinal.usarReferencias ? referencias.map((r) => r.url) : [] }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Falha ao criar a estampa.");
      setArte(data.imagem);
      setCamada("arte");
      if (window.matchMedia("(max-width: 1023px)").matches) verPeca();
    } catch (error) {
      setErroArte(error instanceof Error ? error.message : "Falha ao criar a estampa.");
    } finally {
      setGerando(false);
    }
  }

  const seletorCamada = disponiveis.length > 1 && <div className="mr-1 flex overflow-hidden rounded-full border border-[var(--pz-creme)]/40">
    {disponiveis.map((c) => <button key={c} type="button" onClick={() => setCamada(c)} aria-pressed={ativa === c} className={`px-2.5 py-1 text-[11px] ${ativa === c ? "bg-[var(--pz-creme)] text-[var(--pz-vinho)]" : "hover:bg-white/10"}`}>{c === "casa" ? "Casa" : c === "esboco" ? "Esboço" : "Arte"}</button>)}
  </div>;

  const aviso = "rounded-full bg-black/35 px-3 py-1 text-[11px] text-[var(--pz-creme)]";
  const rodapeVerso = (gerando || erroArte || ativa === "esboco" || (ativa === "arte" && arte)) && <>
    {gerando && <ProgressoCriacao />}
    {!gerando && erroArte && <span className={`${aviso} max-w-xs rounded-md`}>{erroArte}</span>}
    {!gerando && ativa === "esboco" && <span className={aviso}>Esboço rápido · a arte final é criada depois</span>}
    {!gerando && ativa === "arte" && arte && <a href={arte} download="estampa-meranno.png" className={`${aviso} inline-flex items-center gap-1.5 hover:bg-black/50`}><Download size={12} /> Baixar arte</a>}
  </>;

  return <main className="pz-tema min-h-screen bg-[var(--pz-creme)] text-[var(--pz-tinta)]">
    <SiteHeader />
    <div className="flex items-center justify-between gap-4 border-b border-[var(--pz-linha)] px-5 py-3 md:px-8 md:py-4">
      <span className="text-[13px] text-[var(--pz-suave)] md:text-[15px]">Personalizador</span>
      <span className="pz-serif hidden justify-self-end text-[18px] italic text-[#5B4C47] md:block">Pra quem entende de exclusividade</span>
    </div>

    <div className="lg:grid lg:h-[calc(100dvh-var(--header-h,64px)-57px)] lg:grid-cols-[minmax(300px,360px)_1fr_minmax(360px,414px)]">
      {/* Chat — left on desktop */}
      <aside className="hidden min-h-0 border-r border-[var(--pz-linha)] lg:block">
        <ChatCriacao mensagens={mensagens} sugestoes={sugestoes} carregando={conversando} erro={erroChat} pronto={pronto} referenciasPendentes={pendentes.length} onEnviar={enviar} onRecomecar={recomecar} onRevisar={() => setConfirmando(true)} />
      </aside>

      {/* The tee: back on top (where the creation goes), front below */}
      <section ref={palco} className="pz-palco scroll-mt-[var(--header-h,64px)] grid h-[52dvh] min-h-[340px] grid-cols-2 lg:h-auto lg:min-h-0 lg:grid-cols-1 lg:grid-rows-2" aria-label="Prévia da camiseta">
        <Vista titulo="Verso" extra={seletorCamada} rodape={rodapeVerso} className="border-r border-[var(--pz-creme)]/20 lg:border-b lg:border-r-0">
          <Camiseta lado="verso" modelagem={painel.modelagem} corMalha={malha} fonte={painel.fonte} corEscrita={painel.corEscrita} arte={arteVerso} textoVerso={ficha.texto} carregando={gerando} />
        </Vista>
        <Vista titulo="Frente">
          <Camiseta lado="frente" modelagem={painel.modelagem} corMalha={malha} fonte={painel.fonte} corEscrita={painel.corEscrita} />
        </Vista>
      </section>

      {/* Mobile: once there is art, buying sits right under the tee */}
      {arte && <Finalizar painel={painel} ficha={ficha} arte={arte} referencias={referencias.length} className="lg:hidden" />}

      {/* Mobile: chat and panel share the space under the tee */}
      <div className="sticky top-[var(--header-h,64px)] z-20 flex border-b border-[var(--pz-linha)] bg-[var(--pz-creme)] lg:hidden">
        {(["criacao", "peca"] as const).map((t) => <button key={t} type="button" onClick={() => setAba(t)} aria-pressed={aba === t} className={`pz-serif flex-1 py-3 text-[19px] ${aba === t ? "border-b-[1.5px] border-[var(--pz-vinho)] text-[var(--pz-vinho)]" : "text-[var(--pz-suave)]"}`}>{t === "criacao" ? "Criação" : "Sua peça"}</button>)}
      </div>
      <div className={`h-[75dvh] lg:hidden ${aba === "criacao" ? "block" : "hidden"}`}>
        <ChatCriacao mensagens={mensagens} sugestoes={sugestoes} carregando={conversando} erro={erroChat} pronto={pronto} referenciasPendentes={pendentes.length} onEnviar={enviar} onRecomecar={recomecar} onRevisar={() => setConfirmando(true)} onVerPeca={verPeca} />
      </div>

      <aside className={`min-h-0 flex-col border-l border-[var(--pz-linha)] lg:flex ${aba === "peca" ? "flex" : "hidden"}`}>
        <div className="min-h-0 flex-1 lg:overflow-y-auto">
          <PainelPeca painel={painel} onChange={mudarPainel} onReset={() => { setPainel(PAINEL_PADRAO); setCamada(null); }} referencias={referencias} onReferencias={setReferencias} />
        </div>
        <Finalizar painel={painel} ficha={ficha} arte={arte} referencias={referencias.length} className="hidden lg:block" />
      </aside>
    </div>

    {confirmando && <Confirmacao ficha={ficha} painel={painel} referencias={referencias.length} restantes={CRIACOES_POR_SESSAO - criacoes} gerando={gerando} onFechar={fechar} onConfirmar={criar} />}
  </main>;
}
