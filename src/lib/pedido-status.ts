// Order statuses and their names, shared by the server (lib/pedidos) and the owners' panel in the browser.
export const STATUS_PEDIDO = { aguardando_pagamento: "Aguardando pagamento", pago: "Pago", em_separacao: "Em separação", enviado: "Enviado", entregue: "Entregue", cancelado: "Cancelado" } as const;
export type StatusPedido = keyof typeof STATUS_PEDIDO;
