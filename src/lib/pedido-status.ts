// Order statuses and their names, shared by the server (lib/pedidos) and the owners' panel in the browser.
export const STATUS_PEDIDO = { aguardando_pagamento: "Aguardando pagamento", pago: "Pago", em_separacao: "Em separação", enviado: "Enviado", entregue: "Entregue", cancelado: "Cancelado" } as const;
export type StatusPedido = keyof typeof STATUS_PEDIDO;

// Cancelling (owners, 2026-11-25). The customer can cancel on their own, with the money back automatically, for 24 hours
// after the order and while it hasn't been shipped. After that, they talk to the team; and after delivery the law's
// 7-day right of withdrawal (CDC, art. 49) still applies, handled by the team from the panel.
export const PRAZO_CANCELAMENTO_HORAS = 24;
const CANCELAVEIS_PELO_CLIENTE: StatusPedido[] = ["aguardando_pagamento", "pago", "em_separacao"];
export function clientePodeCancelar(pedido: { status: StatusPedido; criado_em: string }, agora = Date.now()) {
  return CANCELAVEIS_PELO_CLIENTE.includes(pedido.status) && agora - Date.parse(pedido.criado_em) < PRAZO_CANCELAMENTO_HORAS * 3600e3;
}
