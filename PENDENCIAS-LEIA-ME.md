# MERANNO: o que falta fazer

Atualizado em **26/11/2026, à noite**, no dia em que a pré-venda abriu. Só o que ainda falta. O que já foi feito (inclusive tudo de 26/11), as ferramentas e o passo a passo de como o site foi construído estão em [`docs/COMO-FIZEMOS-O-SITE.md`](docs/COMO-FIZEMOS-O-SITE.md).

O site está no ar em https://merannoclothing.com.br, trancado para a lista da pré-venda, com pagamento (Asaas), frete (SuperFrete) e e-mail de confirmação funcionando. Todas as camisetas custam **R$ 180**, de P a GG. E-mail oficial de tudo da Meranno: `contato.meranno@gmail.com`. Senhas, tokens e chaves nunca vão por WhatsApp ou chat: vão direto no site onde são usados.

**Pré-venda no fim de 26/11:** 16 das 31 pessoas da lista já entraram, 3 pedidos pagos (R$ 881,40) e 1 esperando pagamento.

**Segurança:** nota 86/100 na revisão de 26/11. O detalhe, com o que cada sócio faz, está no documento [Segurança do site Meranno](https://claude.ai/artifact/ThxoFbNNAT8fGGZHao59hv) (o Breno compartilha com os sócios).

## Esta semana (até 30/11)

- [ ] **Mandar as artes para a Remix antes de 30/11** · sócios
  - Os 5 dias úteis de produção só começam depois que a equipe da Remix aprova a arte.
- [ ] **Pedido do estoque inteiro na Remix em 30/11** · sócios
  - O site estima: prontas até 7/12, com vocês em 8/12, postagem no mesmo dia. Se alguma data mudar, avisar o Claude: é uma linha em `src/lib/entrega.ts` (`PEDIDO_REMIX`).
- [ ] **Confirmar o 2FA do Google de cada sócio** · cada sócio · 1 min
  - myaccount.google.com/security → "Verificação em duas etapas" tem que estar **ativada**. O painel confia no login do Google.
- [ ] **Combinar quem guarda o estoque e embala** · todos
  - O frete sai do CEP de origem (`FRETE_CEP_ORIGEM` na Vercel). Se mudar o endereço, trocar lá e publicar de novo.

## Quando o estoque chegar (8/12)

- [ ] **Pesar e medir o pacote** · quem receber · 5 min
  - Pesar uma camiseta já embalada (g) e medir a caixa (comprimento × largura × altura, cm). O Claude troca o `PACOTE_CAMISETA` em `src/lib/frete.ts` (hoje 300 g e 28 × 20 × 5 cm) e publica.
- [ ] **Postar os pedidos da pré-venda** · quem embala
  - No `/admin`, cada pedido pago mostra "Postar até". Passo a passo da etiqueta no fim deste arquivo.

## Com o Claude, sem pressa

- [ ] **Ligar o bloqueio do firewall da Vercel** · Claude · por volta de 1/12
  - Desde 26/11, 4 regras só registram quem passa do limite (cupom, pedidos, Provador e estampas, envio de avaliação). Depois de uns dias, se nenhum cliente de verdade aparecer nos registros, o Claude liga o bloqueio. Custo estimado: menos de US$ 0,05 por mês.
- [ ] **Testar um estorno com dinheiro de verdade** · Breno · 10 min
  - Contado como funcionando, mas nunca usado com dinheiro real: cupom de 90% no `/admin` → compra no Pix → **Cancelar e estornar** no pedido → conferir se o Pix volta. Apagar o cupom depois.
- [ ] **Animações mais leves no celular** · Claude · 1 h, opcional
  - Refazer em CSS as animações do menu, do carrinho e dos favoritos, para a biblioteca `motion` sair do carregamento inicial.

## Antes da venda aberta

- [ ] **Confirmar a data de abertura** (hoje 1/12, `ABERTURA_VENDA` em `src/lib/financeiro.ts`) · sócios
  - No dia, o Claude desliga o cadeado (`PRE_VENDA` na Vercel), publica e testa. Quem comprar já vê a estimativa de entrega certa, sem mudar nada.
- [ ] **Recarga automática do OpenRouter** (paga o Provador e o Personalizador) · Breno
  - https://openrouter.ai → **Settings** → **Credits** → **Auto top-up** (ex.: US$ 20 quando cair abaixo de US$ 5).
- [ ] **Limite de provas do Provador contado no banco** · Claude
- [ ] **Antecipação do cartão no Asaas** (se precisarem do dinheiro antes) · sócios
  - Cartão cai uns 32 dias depois do pagamento; o Asaas adianta a partir de 1,25% ao mês. Pix cai na hora.

## Depois do lançamento (sem pressa)

| Melhoria | O que muda | Quem |
|---|---|---|
| Etiqueta com um clique | Botão "Gerar etiqueta" no `/admin`: compra a etiqueta pela API da SuperFrete e preenche o rastreio | Claude (precisa do peso real) |
| Remix enviando direto ao cliente | A Remix manda direto para o cliente com a etiqueta da SuperFrete: uns 3 dias a menos na entrega | Sócios decidem |
| Regra de scripts (CSP) | Último cabeçalho de segurança que falta; precisa testar com Personalizador, Provador e Clarity | Claude |
| Cartão digitado no próprio site | Campos do cartão na nossa página (Mercado Pago Card Payment Brick); comparar taxas com o Asaas | Claude + decisão |
| Mapa de calor | Microsoft Clarity (grátis): `NEXT_PUBLIC_CLARITY_ID` na Vercel | Breno + Claude |
| Conteúdo | Estampa nova, número de contato (Yuri), detalhes do produto, nome da cor branca (Off White?) | Sócios mandam |
| Provador em duas etapas | Vestir uma camiseta regular lisa antes da estampa (cada prova custa o dobro) | Claude |
| XXG e estoque visível | `TAMANHOS_LOJA` em `src/lib/products.ts` (a Remix tem XXG) | Claude, quando decidirem |
| Revisão jurídica dos Termos e da Privacidade | Seguem o CDC, o Decreto 7.962/2013 e a LGPD, mas sem revisão de advogado | Sócios, se quiserem |
| Confirmar o WhatsApp | Hoje quem digita primeiro um número da lista fica com a vaga (o `/admin` mostra qual conta usou). Dá para confirmar por código | Claude, se virar problema |

## Se algo der errado (vazamento, conta invadida)

1. Trocar a senha da conta atacada, sair de todas as sessões e tirar a pessoa de administradores.
2. Trocar as chaves secretas na Vercel (Supabase, Asaas, pré-venda) e publicar de novo. O Claude ajuda.
3. Se dados de clientes vazaram com risco para eles: avisar a ANPD e os clientes em até **3 dias úteis** (Resolução CD/ANPD nº 15/2024). Detalhes no documento de segurança.

## Como enviar um pedido (a etiqueta)

1. `/admin` → pedido **Pago** → **copiar envio** e ver o frete escolhido (PAC, SEDEX ou Jadlog).
2. https://web.superfrete.com → nova etiqueta → colar o endereço, peso e caixa, o **mesmo** frete do cliente → pagar com o saldo (R$ 100 dão para uns 6 a 9 pacotes).
3. Imprimir o PDF e colar na caixa.
4. Levar à agência dos Correios (PAC/SEDEX) ou ao ponto da Jadlog; lá não se paga nada.
5. Colar o código de rastreio no pedido, no `/admin`.
