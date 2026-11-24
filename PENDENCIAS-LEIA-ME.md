# MERANNO: o que falta fazer

Atualizado em **24/11/2026, à noite**. Só o que ainda falta; o que já foi feito, as ferramentas e o passo a passo de como o site foi construído estão em [`docs/COMO-FIZEMOS-O-SITE.md`](docs/COMO-FIZEMOS-O-SITE.md).

A mesma lista, para mandar aos sócios: https://claude.ai/artifact/RY1MhFLonRU9TCcXNYsbQ7

O site está no ar em https://merannoclothing.com.br, com pagamento (Asaas), frete (SuperFrete) e e-mail de confirmação funcionando e testados. E-mail oficial de tudo da Meranno: `contato.meranno@gmail.com`. Senhas, tokens e chaves nunca vão por WhatsApp ou chat: vão direto no site onde são usados.

## Antes da pré-venda (esta semana)

- [ ] **Cadastrar a lista da pré-venda e mandar o link no grupo** · Breno · 15 min
  1. `/admin` → **Quem pode entrar** → colar as pessoas, uma por linha, com e-mail ou WhatsApp (o nome é opcional) → **Adicionar à lista**.
  2. **Copiar link** e mandar no grupo.
  3. Quem não estiver na lista e tentar entrar aparece em **Pedidos de acesso**: **Liberar** ou **Recusar**.
- [ ] **Pesar e medir o pacote** · quem receber as camisetas (25/11) · 5 min
  - Pesar uma camiseta já embalada (g) e medir a caixa (comprimento × largura × altura, cm). Mandar ao Claude: ele troca o `PACOTE_CAMISETA` em `src/lib/frete.ts` (hoje 300 g e 28 × 20 × 5 cm) e publica.
- [ ] **Combinar quem guarda o estoque e embala** · todos
  - O frete sai do CEP de origem (`FRETE_CEP_ORIGEM` na Vercel). Se mudar o endereço, trocar lá e publicar de novo.
- [ ] **Colocar saldo na SuperFrete** · 5 min
  - https://web.superfrete.com/#/account/credits → **Recarregue com Pix**. R$ 100 compram umas 5 a 8 etiquetas.
- [ ] **Ligar o aviso de gastos da Vercel** · Breno · 2 min
  - https://vercel.com → **brenodantas1802-2440's projects** → **Settings** → **Billing** → **Spend Management** → ligar o **aviso** (ex.: US$ 40). **Não** ligar a pausa automática.

## Antes da venda aberta (semana que vem)

- [ ] **Dados da empresa, Privacidade e Termos** (obrigatório: Decreto 7.962/2013 e LGPD) · sócios mandam a **razão social** e o **endereço**; o Claude reescreve; vocês aprovam.
- [ ] **Recarga automática do OpenRouter** · https://openrouter.ai → **Settings** → **Credits** → **Auto top-up** (ex.: US$ 20 quando cair abaixo de US$ 5).
- [ ] **Supabase Pro** (~US$ 25/mês, backup diário) · antes, se o projeto campos-del-plata não for da Meranno, transferir o MERANO para uma organização só dele (**Project Settings** → **General** → **Transfer project**); depois **Billing** → **Change subscription plan** → **Pro**.
- [ ] **Limite de provas contado no banco** · Claude.
- [ ] **Abrir a venda** · decidir o **prazo de entrega** da venda aberta e confirmar a **data** (hoje 1º/12, `ABERTURA_VENDA` em `src/lib/financeiro.ts`); no dia o Claude desliga o `PRE_VENDA`, ajusta o prazo (`ENTREGA_PRE_VENDA` em `src/lib/pedidos.ts`), publica e testa.

## Depois do lançamento (sem pressa)

| Melhoria | O que muda | Quem |
|---|---|---|
| Etiqueta com um clique | Botão "Gerar etiqueta" no `/admin`: compra a etiqueta pela API da SuperFrete, abre o PDF e preenche o rastreio | Claude (precisa do peso real) |
| Cartão digitado no próprio site | Campos do cartão na nossa página pelo Mercado Pago (Card Payment Brick); comparar taxas com o Asaas | Claude + decisão |
| Bloquear senhas vazadas | Supabase → **Authentication** → **Attack Protection** (precisa do Pro) | Breno, 2 min |
| Mapa de calor | Microsoft Clarity (grátis): `NEXT_PUBLIC_CLARITY_ID` na Vercel | Breno + Claude |
| Conteúdo | Estampa nova, número de contato (Yuri), detalhes do produto, conferir o vídeo da capa, nome da cor branca (Off White?) | Sócios mandam |
| Provador em duas etapas | Vestir uma camiseta regular lisa antes da estampa (cada prova custa o dobro) | Claude |
| GG/XXG e estoque visível | `TAMANHOS_LOJA` em `src/lib/products.ts` | Claude, quando decidirem |
| Animações mais leves | Refazer em CSS as animações do menu, do carrinho e dos favoritos, para a biblioteca `motion` sair do carregamento inicial de todas as páginas (home e loja ficam mais leves no celular) | Claude |

## Como enviar um pedido (a etiqueta)

1. `/admin` → pedido **Pago** → **copiar envio** e ver o frete escolhido (PAC, SEDEX ou Jadlog).
2. https://web.superfrete.com → nova etiqueta → colar o endereço, peso e caixa, o **mesmo** frete do cliente → pagar com o saldo.
3. Imprimir o PDF e colar na caixa.
4. Levar à agência dos Correios (PAC/SEDEX) ou ao ponto da Jadlog; lá não se paga nada.
5. Colar o código de rastreio no pedido, no `/admin`.
