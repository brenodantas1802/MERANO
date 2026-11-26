// Estimated arrival, worked out from the customer's CEP (owners, 2026-11-26: "data pelo CEP", in place of the fixed
// "até 7 de dezembro"). The order is posted within POSTAGEM_DIAS_UTEIS business days after the payment, then the carrier
// takes up to its own maximum (prazoMax, in business days, from the SuperFrete quote). Weekends and national holidays
// don't count, and days are counted in Brasília time. Used by the cart, the payment page, the order page and the panel.

// Business days the team has to post a paid order once the shirts are in hand.
export const POSTAGEM_DIAS_UTEIS = 2;

// National holidays, plus Carnival and Corpus Christi (optional days on which the Correios don't run as usual), so the
// date shown is never earlier than the real one.
const FERIADOS = new Set([
  "2026-01-01", "2026-02-16", "2026-02-17", "2026-04-03", "2026-04-21", "2026-05-01", "2026-06-04", "2026-09-07",
  "2026-10-12", "2026-11-02", "2026-11-15", "2026-11-20", "2026-12-25",
  "2027-01-01", "2027-02-08", "2027-02-09", "2027-03-26", "2027-04-21", "2027-05-01", "2027-05-27", "2027-09-07",
  "2027-10-12", "2027-11-02", "2027-11-15", "2027-11-20", "2027-12-25",
]);

const DIA = 86_400_000;
const SEMANA = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];

// The calendar day ("2026-11-26") of an instant, in São Paulo.
export const diaEmSaoPaulo = (instante: Date) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" }).format(instante);

const ehDiaUtil = (data: Date) => data.getUTCDay() !== 0 && data.getUTCDay() !== 6 && !FERIADOS.has(data.toISOString().slice(0, 10));

// The day that is `dias` business days after `dia` (the day itself doesn't count).
export function somarDiasUteis(dia: string, dias: number) {
  let data = new Date(`${dia}T12:00:00Z`);
  for (let faltam = dias; faltam > 0;) {
    data = new Date(data.getTime() + DIA);
    if (ehDiaUtil(data)) faltam--;
  }
  return data.toISOString().slice(0, 10);
}

// Pre-sale (owners, 2026-11-26): the shirts aren't made yet. The pre-sale money pays the whole stock order at Remix On
// Demand, placed on Mon 30/11. Remix's site (read on 2026-11-26): "produção de até 5 dias úteis" once their design team
// validates the art, and "entrega em São Paulo em 1 dia útil". So the shirts are ready by 7/12, reach the team by 8/12
// and the pre-sale orders are posted that same day. Change these and everything follows: the cart, the payment page,
// the order page and the panel's "Postar até". Always shown as an estimate (esperaProducao).
export const PEDIDO_REMIX = "2026-11-30";
const PRODUCAO_REMIX_DIAS = 5;
const ENTREGA_REMIX_DIAS = 1;
export const PRONTAS_NA_FABRICA = somarDiasUteis(PEDIDO_REMIX, PRODUCAO_REMIX_DIAS);
export const PRIMEIRA_POSTAGEM = somarDiasUteis(PRONTAS_NA_FABRICA, ENTREGA_REMIX_DIAS);

// Last day the team has to post an order paid at `pagoEm`: never before the first posting day of the pre-sale.
export function dataPostagem(pagoEm: Date = new Date()) {
  const normal = somarDiasUteis(diaEmSaoPaulo(pagoEm), POSTAGEM_DIAS_UTEIS);
  return normal < PRIMEIRA_POSTAGEM ? PRIMEIRA_POSTAGEM : normal;
}

// While an order paid now still waits for the shirts to be made (pre-sale).
export const esperaProducao = (agora: Date = new Date()) => somarDiasUteis(diaEmSaoPaulo(agora), POSTAGEM_DIAS_UTEIS) < PRIMEIRA_POSTAGEM;

// The posting line shown next to the shipping options and on the product page. During the pre-sale it walks through
// the whole way, as an estimate (owners, 2026-11-26): factory, the team, then the carrier to the customer's door.
export const avisoPostagem = (agora: Date = new Date()) => esperaProducao(agora)
  ? `Pré-venda, por estimativa: a fábrica termina as camisetas até ${formatarDia(PRONTAS_NA_FABRICA)}, elas chegam até nós na ${formatarDia(PRIMEIRA_POSTAGEM)} e postamos no mesmo dia. A data de chegada soma também o caminho da transportadora até a sua casa.`
  : `Postamos em até ${POSTAGEM_DIAS_UTEIS} dias úteis depois do pagamento. A data de chegada já conta com isso.`;

// Latest arrival day for a carrier taking up to `prazoMax` business days; null when the quote has no deadline.
export function dataChegada(prazoMax: number | undefined, pagoEm: Date = new Date()) {
  return prazoMax && prazoMax > 0 ? somarDiasUteis(dataPostagem(pagoEm), prazoMax) : null;
}

// "quinta, 3/12", or "3/12" with { semana: false }.
export function formatarDia(dia: string, { semana = true } = {}) {
  const data = new Date(`${dia}T12:00:00Z`);
  const curto = `${data.getUTCDate()}/${data.getUTCMonth() + 1}`;
  return semana ? `${SEMANA[data.getUTCDay()]}, ${curto}` : curto;
}
