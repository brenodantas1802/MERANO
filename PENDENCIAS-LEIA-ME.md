# MERANNO: o que falta fazer

Atualizado em **22/11/2026, domingo à noite**. O lançamento é **segunda, 23/11**.

> Dica: abra o Claude Code na pasta do site e diga "faça o item X do PENDENCIAS-LEIA-ME.md".

## Checklist do lançamento (em ordem)

| # | O que | Quem | Situação |
|---|---|---|---|
| 1 | Chaves na Vercel (`SUPABASE_SECRET_KEY`, `PRE_VENDA=1`) | vocês | **falta** |
| 2 | Colocar os e-mails/WhatsApp do grupo na lista da pré-venda (`/admin`) | vocês | **falta: a lista está vazia** |
| 3 | Frete real: conta e token da SuperFrete, CEP de saída, peso do pacote | vocês | **falta** (o site mostra valores de exemplo) |
| 4 | Pagamento: chave de API e webhook do **Asaas** | vocês | **falta** (o código já está pronto) |
| 5 | Publicar e testar no ar | Claude | depois de 1 a 4 |

Sem os itens 3 e 4 o site funciona assim mesmo: o frete aparece como "valores de exemplo" e o pedido fecha pelo WhatsApp. Dá para lançar assim e ligar o Asaas e a SuperFrete depois, sem mudar nada no código.

## Onde as coisas estão agora

- **Site no ar** (https://merano-xi.vercel.app): ainda é a versão de 17/11. **Nada do que foi feito de 20 a 22/11 está publicado.**
- **Trabalho novo**: no branch `lancamento-pre-venda`. O de 22/11 foi testado no computador (produto → tamanho → carrinho com duas peças → pagamento → pedido) e o build de produção passa.
- **Banco (Supabase)**: tabelas de pedidos, cupons, lista da pré-venda e pedidos de acesso prontas. Ficou um pedido de teste, `MR-FFHAK2` ("Teste Claude"), marcado como **cancelado**. Pode apagar.

### O que entrou em 22/11

| Parte | O que mudou |
|---|---|
| **Tamanhos** | Só **P, M e G** (decisão dos sócios em 22/11), no catálogo, no Personalizador, no Provador e no Meranno Fit. A Remix também faz GG e XXG: para vender, é só o Claude acrescentar em `TAMANHOS_LOJA`. |
| **Modelagem** | **Só regular** (decisão de 22/11, sem oversized). Tabela da **Remix On Demand, Camiseta Algodão Unissex** (P 50/51/70, M 53/54/73, G 56/57/76: tórax, barra e comprimento em cm, tolerância de 2 cm). O Personalizador só oferece a regular. |
| **Composição** | "Camiseta regular unissex, 100% algodão penteado, malha de 180 g/m²". |
| **Preço** | **R$ 180**, por **R$ 160 na pré-venda** (aparece "R$ 180" riscado). Depois da pré-venda, apagar `salePrice` dos produtos em `src/lib/products.ts`. A peça do Personalizador continua R$ 189 (`PRECO_PERSONALIZADA`). |
| **Provador** | O pedido à IA agora diz que a peça é **regular** (ombro na ponta do ombro, manga até o meio do braço, corpo reto) e usa as medidas da Remix. **Atenção:** as fotos das camisetas no site ainda são mockups de oversized; o Provador ignora o corte delas, mas o ideal é trocar por fotos da regular. |
| **Menu do topo** | Último item "Painel da equipe", que só aparece para os e-mails dos donos (o servidor confere; clientes nunca veem). |
| **Painel `/admin`** | Agora abre no **Financeiro**: faturamento, custos, lucro, caixa estimado, a receber, para despachar, enviados, entregues, metas da pré-venda (20) e do lançamento (60), comparação com o planejamento e lançamento de despesas (já tem caixas R$ 805 e MEI R$ 92). Custos e taxas editáveis em "Ajustar custos, taxas e metas". **Modo claro e noturno** (segue o celular; botão de lua/sol para trocar). |
| **Segurança** | Nenhuma tabela é acessível pela chave pública do site (RLS ligado em todas, sem permissões para a API pública). Avaliações e cadastro de e-mail do cupom passam pelo servidor. Tabelas novas já nascem fechadas. |
| **Meranno Fit** | Recomenda pelo busto (medido, ou estimado pela altura e pelo peso), calibrado na tabela da Remix regular: P até 94 cm de busto, M até 100, G até 106. Acima disso recomenda o G e avisa que é o maior tamanho e veste mais justo. Os resultados "aleatórios" vinham da medida do ombro (quem errava a fita pulava de P para GG) e da altura digitada em metros ("1,75" era ignorada). As duas coisas foram corrigidas. O ombro virou medida opcional. |
| **Data de entrega** | "Entrega prevista para 7 de dezembro" no produto, no pagamento e no pedido. Para mudar: `ENTREGA_PRE_VENDA` em `src/lib/pedidos.ts`. |
| **Mensagem VIP** | Quando o pagamento é confirmado, a página do pedido mostra: "Obrigado pela preferência. Você comprou na pré-venda, garantiu R$ X de desconto e agora é cliente VIP da Meranno. Entrega prevista: 7/12". O "garantiu R$ X de desconto" soma o desconto da pré-venda (R$ 180 → R$ 160), do Pix e do cupom. |
| **Pagamento pelo Asaas** | Pronto no código. Com a chave do Asaas na Vercel, o cliente paga na página segura do Asaas: Pix ou cartão em até 3x, pelo mesmo preço (sem desconto no Pix, decisão de 22/11). O pedido só vira "Pago" depois que o site **consulta o próprio Asaas** e confere o valor. Sem a chave, o pedido continua fechando pelo WhatsApp. |
| **Pedidos de acesso** | Quem entra no `/pre-venda` sem estar na lista digita o WhatsApp e cai em "Pedidos de acesso" no `/admin`, para vocês liberarem ou recusarem. |

---

## 1. Cadastrar as chaves na Vercel (obrigatório antes de publicar)

Sem a **`SUPABASE_SECRET_KEY`**, a versão nova **não registra pedidos** (o cliente vê "indisponível"), o Personalizador não compra e o `/admin` fica vazio.

1. Vercel → projeto **merano** → **Settings → Environment Variables**. Marque só **Production** em cada uma.
2. Cadastre:
   - **`SUPABASE_SECRET_KEY`**: Supabase → projeto **MERANO** → **Project Settings → API Keys** → chave **secret** (ou copie do `.env.local`, o que vem depois de `SUPABASE_SECRET_KEY=`). **Nunca** coloque essa chave no código, no chat ou no WhatsApp.
   - **`PRE_VENDA`** = **`1`**: liga o cadeado da pré-venda.
   - **`PRE_VENDA_GRUPO_URL`** (opcional): o link de convite do grupo do WhatsApp, para o botão da tela "Coming soon".
   - As do Asaas (item 2) e da SuperFrete (item 7), quando tiverem.
3. Diga ao Claude: **"pode publicar"**. Ele publica a partir do branch e testa o site no ar.
4. Teste numa **janela anônima**: o site tem que mostrar "Coming soon" com o cadeado.

## 2. Pagamento: Asaas

O site já está pronto para o Asaas. Falta ligar a conta.

1. **Conta aprovada**: no app ou no site do Asaas, confira se a conta está aprovada (documentos enviados e aceitos). Sem isso, o Asaas não libera a cobrança de verdade.
2. **Chave Pix**: cadastre uma chave Pix na conta do Asaas (sem ela, o Pix não funciona).
3. **Chave de API**: Asaas → menu da conta (canto de cima) → **Integrações** → **Chaves de API** → **Gerar chave de API**. Ela aparece **uma vez só** e começa com `$aact_prod_`. Copie inteira, com o `$`.
4. Na Vercel, cadastre **`ASAAS_API_KEY`** com essa chave.
5. **Aviso de pagamento (webhook)**: Asaas → **Integrações** → **Webhooks** → **Adicionar**:
   - Nome: `Site Meranno`
   - URL: `https://merano-xi.vercel.app/api/pagamento/asaas` (ou o domínio novo, quando tiver)
   - E-mail: o da Meranno (o Asaas avisa se o webhook falhar)
   - Versão da API: **v3** · Tipo de envio: **Sequencial** · Ativo: **sim** · Fila: **não interrompida**
   - Token de autenticação: invente uma senha longa, só com letras e números (no mínimo 32). Este comando no PowerShell gera uma:
     ```powershell
     -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 40 | ForEach-Object { [char]$_ })
     ```
   - Eventos: **Checkout pago** (`CHECKOUT_PAID`), **Cobrança confirmada** (`PAYMENT_CONFIRMED`) e **Cobrança recebida** (`PAYMENT_RECEIVED`).
6. Na Vercel, cadastre **`ASAAS_WEBHOOK_TOKEN`** com o mesmo token do passo 5.
7. Peça ao Claude para publicar de novo.
8. Teste com uma compra real de valor baixo: crie um cupom de 90% no `/admin` só para o teste, pague com Pix e veja o pedido virar **Pago** no `/admin`. Desligue o cupom depois.

**Bom saber**
- O "3x sem juros" quer dizer que a taxa do parcelamento é da Meranno. Confiram as taxas de Pix e de cartão no plano de vocês no Asaas.
- Mesmo se o webhook falhar, o pedido é conferido no Asaas quando o cliente volta para a página do pedido depois de pagar.
- **Testar antes, sem dinheiro de verdade (opcional)**: crie uma conta em https://sandbox.asaas.com, gere a chave lá (começa com `$aact_hmlg_`) e cadastre-a numa publicação de teste (Vercel → **Preview**). O site percebe sozinho que é a chave de teste.
- O Mercado Pago continua no código como alternativa: ele só é usado se não houver chave do Asaas.

**Enquanto o Asaas não estiver ligado:** o pedido fica registrado como "Aguardando pagamento" e o cliente manda a mensagem pronta no WhatsApp da Meranno (11 98646-4056). Vocês mandam o Pix ou o link do cartão e, quando o dinheiro cair, mudam o pedido para **Pago** no `/admin`.

## 3. Domínio

| Domínio | Situação | Preço |
|---|---|---|
| `meranno.com.br` | **Registrado em 15/11/2026** pelo CNPJ 70.145.517/0001-54, com o DNS automático do Registro.br | — |
| `meranno.com` | Livre | US$ 12,03 por ano (renova pelo mesmo valor) |
| `meranno.store` / `meranno.shop` | Livres | US$ 1,49 / US$ 2,99 no 1º ano, mas renovam por US$ 44 / US$ 38,39 |

- **Se o `.com.br` é de vocês** (o CNPJ é de algum sócio?): na Vercel, **Settings → Domains → Add** `meranno.com.br` e `www.meranno.com.br`. A Vercel mostra os registros. No https://registro.br → domínio → **DNS → Editar zona**, crie os registros que ela pedir (normalmente um `A` para `@` e um `CNAME` para `www`). Leva de minutos a algumas horas. Depois avise o Claude para trocar `merano-xi.vercel.app` pelo domínio nos textos e no link da pré-venda.
- **Se não é de vocês**: a sugestão é o `meranno.com`, que dá para comprar direto pela Vercel. Diga ao Claude "pode comprar o meranno.com"; ele confirma o valor antes de comprar.
- Com domínio novo: troque a URL do webhook no Asaas (item 2) e, no Supabase, acrescente o domínio em **Authentication → URL Configuration** (Site URL e Redirect URLs).

## 4. Cupom do amigo

No `/admin` → **Cupons** → preencha o código (ex.: `NOMEDOAMIGO15`), o desconto, para que é, e se vale só na primeira compra → **Criar cupom**. Ele vale na hora. Para parar de valer: **Desligar**.

## 5. Liberar os sócios e montar a lista da pré-venda

**A lista está vazia hoje.** Sem ela, só os donos entram.
1. Cada sócio abre `/pre-venda`, entra com o **Google** e toca em **Abrir o cadeado** (uma vez por aparelho).
2. No `/admin` → **Quem pode entrar**: cole as pessoas, uma por linha, com e-mail ou WhatsApp (nome opcional) → **Adicionar à lista**.
3. **Copiar link** e mandar no grupo.

O que a pessoa do grupo faz: abre o link, entra com o Google ou cria a conta (com o mesmo e-mail ou WhatsApp do grupo) e toca em **Abrir o cadeado**. Fica liberada para sempre naquela conta. Quem não estiver na lista digita o WhatsApp e aparece em **Pedidos de acesso** no `/admin`; vocês tocam em **Liberar** ou **Recusar**, e a página da pessoa abre sozinha quando liberada.

## 6. Conferir o e-mail de confirmação de conta

Quem cria conta com e-mail (sem Google) precisa receber um e-mail de confirmação. Confira no Supabase → **Authentication** → **SMTP** se o Gmail da Meranno está configurado, e teste criando uma conta com um e-mail que não seja de sócio. Enquanto não estiver confirmado, peçam para o pessoal entrar com o **Google**.

## 7. Frete de verdade pela SuperFrete

O código já está pronto. Hoje o frete mostra **valores de exemplo** (marcados assim na tela). Para o real:
1. Conta em https://web.superfrete.com → **Integrações → Desenvolvedores** → gere o **token** (aparece uma vez só).
2. Na Vercel: **`SUPERFRETE_TOKEN`**, **`FRETE_CEP_ORIGEM`** (CEP de onde sai) e, opcional, **`SUPERFRETE_CONTATO`** (e-mail técnico).
3. **Pesem uma camiseta embalada** e meçam o envelope (hoje o site usa 300 g e 30 × 25 × 4 cm) e passem ao Claude.
4. Combinem: com entrega prevista para 7/12, o frete cobrado é o do envio normal (PAC, SEDEX, Mini Envios) a partir do dia em que vocês despacharem.

Frete e pagamento não dependem um do outro: podem ligar qualquer um primeiro. O da SuperFrete é mais rápido (o token sai na hora); o Asaas pode depender da aprovação da conta.

## 8. Conteúdo que falta (com vocês)

| Item | Situação |
|---|---|
| **Data de entrega da pré-venda** | **Feito**: 7/12. |
| **Tabela de medidas** | **Feito**: Remix Oversized (confirmar o modelo, ver acima). |
| **Desconto da pré-venda** | **Feito**: R$ 180 por R$ 160 na pré-venda. Sem desconto no Pix. |
| **Fotos reais das camisetas** | Mandar quando tiver; hoje são os mockups corrigidos para MERANNO. |
| **Sobre nós** | Texto provisório ("O tempo é seu"; outro capítulo fala de "o mar no fim da rua"). |
| **Política de troca** | Refazer juntos. A página `/trocas` hoje tem o texto antigo. |
| **Estoque** | Não aparece no site (decidido em 20/11). Pode entrar depois do sorteio. |

## 9. Itens menores

- **Segurança do login**: Supabase → **Authentication** → ligar **Leaked password protection** (bloqueia senhas vazadas). Pode precisar do plano Pro.
- **Avaliações**: só aparecem depois de aprovadas (Supabase → **Table Editor → avaliacoes** → `status` = `aprovada`). Nunca inventar avaliações.
- **Mapa de calor (opcional)**: Microsoft Clarity → `NEXT_PUBLIC_CLARITY_ID` na Vercel.
- **Nome antigo**: Instagram `@meranoclothing` e e-mail `equipe@merano.com` continuam com MERANO porque são endereços reais.
- **Sócio novo no código**: ele precisa ser convidado no GitHub (repositório → **Settings → Collaborators → Add people**) e receber o `.env.local` por canal seguro. O `README.md` tem o passo a passo.
- **Cores da Remix**: a Remix vende Off White (não branco puro). Confiram se o "Coração · Branco" e o "Va tutto bene" saem em Off White e, se for, o Claude troca o nome da cor.

## 10. Limites da pré-venda que é bom saber

- O WhatsApp não é confirmado por SMS. Cada número só libera **uma** conta.
- Tirar alguém da lista impede novas entradas, mas não expulsa um aparelho que já entrou.
- O acesso de cada aparelho dura até 400 dias.

---

## Todas as variáveis da Vercel (Settings → Environment Variables → Production)

| Variável | Situação | Para quê |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | já existem | Banco e login |
| `OWNER_EMAILS` | já existe | Quem entra no `/admin` e é liberado na pré-venda |
| `OPENROUTER_API_KEY`, `PERSONALIZADOR_OPENROUTER_API_KEY` | já existem | IA do Provador e do Personalizador |
| `SUPABASE_SECRET_KEY` | **falta, obrigatória** (item 1) | Pedidos, cupons, compra do Personalizador, lista da pré-venda, `/admin` |
| `PRE_VENDA` | **falta** (item 1) | `1` liga o cadeado |
| `ASAAS_API_KEY` | falta (item 2) | Pagamento on-line; sem ela, pedido pelo WhatsApp |
| `ASAAS_WEBHOOK_TOKEN` | falta (item 2) | Confere que o aviso de pagamento veio do Asaas |
| `SUPERFRETE_TOKEN`, `FRETE_CEP_ORIGEM` | faltam (item 7) | Frete real |
| `PRE_VENDA_GRUPO_URL` | opcional | Botão do grupo no "Coming soon" |
| `SUPERFRETE_CONTATO`, `SUPERFRETE_URL` | opcionais | Contato técnico e ambiente de teste da SuperFrete |
| `MERCADOPAGO_ACCESS_TOKEN` | opcional | Só se um dia trocarem o Asaas pelo Mercado Pago |
| `PRE_VENDA_SEGREDO` | opcional | Assina o cookie da pré-venda (sem ela, usa a `SUPABASE_SECRET_KEY`) |
| `NEXT_PUBLIC_CLARITY_ID` | opcional | Mapa de calor |

Depois de cadastrar ou mudar qualquer variável, é preciso publicar de novo.

## Notas técnicas (para o Claude ou um programador)

- **Publicação**: a Vercel não publica sozinha. `vercel --prod --yes` a partir de um `git worktree` limpo, com a pasta `.vercel` copiada (passo a passo no `README.md`).
- **Pedidos**: `src/lib/pedidos.ts` (validação, preço, cupom, frete, totais, mensagem do WhatsApp, `registrarPagamento`, `ENTREGA_PRE_VENDA`), `src/app/api/pedidos/` (criar e "pagar agora"), `src/app/pagamento/`, `src/app/pedido/[id]/`. Tabelas `pedidos` e `cupons` (RLS ligada, sem políticas: só a chave secreta lê e grava).
- **Pagamento**: `src/lib/pagamento.ts` escolhe o provedor (Asaas se `ASAAS_API_KEY`, senão Mercado Pago se `MERCADOPAGO_ACCESS_TOKEN`). Asaas: `src/lib/asaas.ts` (Checkout com `externalReference` = id do pedido; cada checkout aberto fica em `pedidos.pagamento.checkouts`) e o webhook `src/app/api/pagamento/asaas/`, que lê as cobranças do checkout (`GET /payments?checkoutSession=`) e só marca pago com o valor inteiro. Mercado Pago: `src/lib/mercado-pago.ts` e `src/app/api/pagamento/webhook/`. A chave do sandbox (`_hmlg_`) usa `api-sandbox.asaas.com` sozinha.
- **Tamanhos e Fit**: `TAMANHOS_LOJA` (P, M, G), `REMIX_REGULAR` (tabela inteira da Remix), `SIZE_CHART` (só o que a loja vende), `MATERIAL`, `PRECO_LANCAMENTO` e `PRECO_PRE_VENDA` em `src/lib/products.ts`. O ombro não está na tabela da Remix: `ombroDa` em `src/lib/body-model.ts` estima 86% do tórax (trocar pelo valor medido numa peça real).
- **Financeiro**: `src/lib/financeiro.ts` (contas e plano), `src/app/admin/financeiro-admin.tsx`, `financeiro-acoes.ts`. Tabelas `financeiro_config` (uma linha) e `despesas`. O lucro conta produção + acessórios por camiseta vendida, taxas do Asaas e despesas lançadas; o frete é repasse e fica de fora.
- **Ao publicar**: depois que a versão nova estiver no ar (com a `SUPABASE_SECRET_KEY`), fechar as duas funções que a versão antiga ainda usa: `revoke execute on function public.enviar_avaliacao(text,text,integer,text,text), public.registrar_email_cupom(text,boolean) from public, anon, authenticated;` Recomendação: `src/lib/size-recommendation.ts` com `AMPLE_EASE` em `src/lib/body-model.ts` (10 cm de folga no busto).
- **Cupom de primeira compra**: recusa o e-mail que já tem pedido pago, separado, enviado ou entregue.
- **Admin**: `src/app/admin/` (`dono.ts` confere o dono em cada ação; `pedidos-acoes.ts`, `pedidos-admin.tsx`, `cupons-admin.tsx`, `lista-acoes.ts`).
- **Personalizador**: ver `docs/PERSONALIZADOR.md` (compra em `public/personalizador/js/meranno-compra.js`, rotas `/api/estampa/envio` e `/api/estampa/registrar`).
- **Pré-venda**: `src/proxy.ts`, `src/lib/pre-venda.ts`, `src/lib/pre-venda-lista.ts` (lista e pedidos de acesso, tabela `pre_venda_pedidos`), `src/app/pre-venda/`, `src/components/entrada-pre-venda.tsx`. A `/em-breve` e a `/pre-venda` precisam continuar dinâmicas.
- **Sem uso**: a tabela `convites_pre_venda` e a função `usar_convite_pre_venda` (primeiro modelo da pré-venda) e `src/lib/estampa-schema.ts` (Personalizador anterior). Podem ser apagadas.
- **Recortes das camisetas e cartas do topo**: `public/imagens/merano-assets/recortes/` (as cartas são os `*-carta.webp`). A vitrine lê `src/lib/shirt-stories.ts`; o topo, `src/components/hero-topo.tsx`.
