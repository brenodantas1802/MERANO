# MERANNO: o que falta fazer

Atualizado em **26/11/2026, à noite**. Só o que ainda falta; o que já foi feito, as ferramentas e o passo a passo de como o site foi construído estão em [`docs/COMO-FIZEMOS-O-SITE.md`](docs/COMO-FIZEMOS-O-SITE.md).

A lista para os sócios (https://claude.ai/artifact/RY1MhFLonRU9TCcXNYsbQ7) ainda está na versão de 24/11: este arquivo é o mais novo.

O site está no ar em https://merannoclothing.com.br, com pagamento (Asaas), frete (SuperFrete) e e-mail de confirmação funcionando e testados. E-mail oficial de tudo da Meranno: `contato.meranno@gmail.com`. Senhas, tokens e chaves nunca vão por WhatsApp ou chat: vão direto no site onde são usados.

## Nota da revisão (26/11)

Revisão do site inteiro, primeiro no celular e depois no computador: cada página e cada botão, forçando os limites (33 peças no carrinho, CEP do Acre, cupom errado, medidas absurdas no Meranno Fit, página que não existe). O que quebrou foi corrigido e já está no ar.

| Parte do site | Celular | Computador | Por quê |
|---|:-:|:-:|---|
| Visual e marca | 92 | 92 | Limpo e no estilo da marca; nenhuma página passa da largura da tela |
| Menu, busca e navegação | 92 | 90 | Tudo funcionou, inclusive busca sem resultado e página que não existe |
| Produto e tamanhos | 90 | 90 | Trava sem tamanho, avisa peça repetida, Meranno Fit recusa medidas absurdas |
| Carrinho | 88 | 90 | Era 70: deixava pôr 33 peças e o pagamento recusava; cortava o nome. Corrigido |
| Frete | 78 | 78 | Cota o Brasil todo e esconde a opção pior; mas a promessa "até 7/12" não bate com os prazos longos |
| Pagamento (formulário) | 82 | 85 | CEP preenche o endereço, cupom errado avisa, campos validam. Pagamento real não foi refeito nesta revisão |
| Pré-venda (cadeado + WhatsApp) | 85 | 85 | Testada no banco de verdade; o número não é confirmado por SMS |
| Cancelamento e estorno | 65 | 65 | Existe e está no ar, mas nunca foi usado com dinheiro de verdade |
| Termos e Privacidade | 55 | 55 | Falta razão social e endereço, que a lei exige |
| Velocidade | 80 | 88 | Fotos chegam leves (25 a 47 KB), mas a biblioteca de animação carrega em todas as páginas |
| **Média** | **81** | **82** | |

Não deu para testar nesta revisão: entrar com uma conta de verdade, o e-mail de confirmação, o Provador (gasta crédito) e o visual novo do `/admin` (precisa do login Google). Estão na lista abaixo.

## Para matar hoje ou amanhã (27/11)

Pontos da revisão, na ordem que eu faria.

- [ ] **Decidir a promessa de entrega** · Breno decide, Claude faz (10 min a opção a, uns 40 min a b)
  - O site diz "entrega prevista até 7 de dezembro" no produto, no pagamento e no pedido (`ENTREGA_PRE_VENDA` em `src/lib/pedidos.ts`). Pelo frete de hoje, Fortaleza leva 7 dias úteis no Jadlog e Rio Branco 12 (9 no PAC): quem pagar a partir de 28/11 pode não receber até 7/12.
  - Opções: (a) trocar para "**enviamos até X**" e deixar o prazo do frete à parte; (b) mostrar no pagamento a **data estimada para o CEP** da pessoa; (c) manter "até 7/12" e mandar por SEDEX quem estiver longe (a Meranno paga a diferença).
- [ ] **Testar um estorno de verdade** · Breno · 10 min
  1. `/admin` → **Cupons** → criar um de 90%.
  2. Comprar uma camiseta no Pix com ele (R$ 16 mais o frete).
  3. No `/admin`, abrir o pedido → **Cancelar e estornar** → conferir se o Pix volta na sua conta e no Asaas. Apagar o cupom depois.
- [ ] **Abrir o `/admin` e conferir a lista nova** · Breno · 5 min
  - Aba **Pré-venda**: a lista separada em Amigos (17) e Familiares (12). Aba **Quem entrou**: o nome e o grupo de cada conta. Aba **Pedidos**: o selo com o nome. Se algo estiver estranho, mandar print ao Claude.
- [ ] **Mandar o link da pré-venda nos dois grupos** · Breno · 5 min
  - A lista já está cadastrada (29 números). `/admin` → **Pré-venda** → **Copiar link**. Quem entrar precisa pôr o WhatsApp: número da lista entra na hora; número fora da lista aparece em **Pedidos de acesso** para **Liberar** ou **Recusar**.
- [ ] **Testar a conta de ponta a ponta** · Breno · 10 min, com um e-mail que não seja o seu de dono
  - Abrir o link da pré-venda no celular → **Criar conta** → confirmar o e-mail → ver se entra direto com o WhatsApp. Depois, **Esqueci minha senha**.
- [ ] **Gerar uma prova no Provador** · Breno · 2 min (gasta 1 crédito)
- [ ] **Ver a cobrança da Vercel** · Breno · 3 min
  - Debitaram R$ 3 no cartão, mas o relatório da Vercel mostra **zero cobrado** de 23 a 26/11. Os registros só começam em 23/11 e têm uma assinatura que bate com o plano **Pro** (US$ 20/mês): https://vercel.com → **Settings** → **Billing** → ver o **plano** e as **Invoices**. Se for o teste do Pro e ninguém pediu, voltar para o **Hobby** (grátis dá conta). Aproveitar e ligar o **aviso de gastos** (item abaixo).
- [ ] **CEP que a transportadora não aceita** · Claude · 15 min
  - Um CEP genérico (ex.: 69900-000) mostra "Não deu para calcular o frete agora. Tente de novo", como se fosse instabilidade. Trocar para "Confira o CEP".
- [ ] **Animações mais leves no celular** · Claude · 1 h, só se sobrar tempo antes da pré-venda
  - Refazer em CSS as animações do menu, do carrinho e dos favoritos, para a biblioteca `motion` sair do carregamento inicial de todas as páginas.

## Antes da pré-venda (esta semana)
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
- [ ] **Abrir a venda** · decidir o **prazo de entrega** da venda aberta e confirmar a **data** (hoje 1º/12, `ABERTURA_VENDA` em `src/lib/financeiro.ts`); no dia o Claude desliga o `PRE_VENDA`, volta o preço de R$ 160 para R$ 180 (`PRECO_PRE_VENDA` em `src/lib/products.ts`; a faixa do topo e o preço riscado somem sozinhos), ajusta o prazo (`ENTREGA_PRE_VENDA` em `src/lib/pedidos.ts`), publica e testa.

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
| Confirmar o WhatsApp | Hoje quem digita primeiro um número da lista fica com a vaga (o `/admin` mostra qual conta usou). Dá para confirmar por código no WhatsApp | Claude, se virar problema |

## Como enviar um pedido (a etiqueta)

1. `/admin` → pedido **Pago** → **copiar envio** e ver o frete escolhido (PAC, SEDEX ou Jadlog).
2. https://web.superfrete.com → nova etiqueta → colar o endereço, peso e caixa, o **mesmo** frete do cliente → pagar com o saldo.
3. Imprimir o PDF e colar na caixa.
4. Levar à agência dos Correios (PAC/SEDEX) ou ao ponto da Jadlog; lá não se paga nada.
5. Colar o código de rastreio no pedido, no `/admin`.
