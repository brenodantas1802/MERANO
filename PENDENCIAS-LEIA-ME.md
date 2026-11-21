# MERANNO: o que falta fazer

Atualizado em **21/11/2026, de madrugada**. O lançamento é **segunda, 23/11**.

> Dica: abra o Claude Code na pasta do site e diga "faça o item X do PENDENCIAS-LEIA-ME.md".

## Onde as coisas estão agora

- **Site no ar** (https://merano-xi.vercel.app): ainda é a versão de 17/11. **Nada do que foi feito em 20 e 21/11 está publicado.**
- **Trabalho novo**: no branch `lancamento-pre-venda` do GitHub, testado no computador e no celular, com o build de produção passando.
- **Banco (Supabase)**: já tem as tabelas de pedidos e cupons e o cupom `BEMVINDO10`. O site no ar não usa nada disso ainda, então não muda nada para quem visita hoje.

### O que entrou em 20 e 21/11

| Parte | O que mudou |
|---|---|
| **Topo do site** | Royal flush: as cinco camisetas abrem em leque, em cartas, na frente do ás. Cada carta leva à peça. |
| **Vitrine da home** | Va tutto bene entrou (ficaram as 5). |
| **Busca** | Entende acento, plural, feminino e cor ("camisetas pretas" acha Coração · Preto e Wine not). |
| **Pagamento** | O pedido agora é **guardado no banco**, com preço, cupom e frete recalculados no servidor (ninguém consegue mudar o preço pelo navegador). Com o Mercado Pago ligado, o cliente paga lá (Pix com 5% de desconto, ou cartão em até 3x). Sem o Mercado Pago, o pedido é registrado e abre o WhatsApp da Meranno com tudo escrito. |
| **Página do pedido** | Cada pedido tem um link próprio (`/pedido/...`) com o andamento: pedido feito → pago → separação → enviado (com rastreio) → entregue. |
| **Cupom** | Campo de cupom no pagamento. O pop-up pede o e-mail e mostra o código na hora (`BEMVINDO10`, 10%), que já entra aplicado no pagamento. Cupom de primeira compra recusa e-mail que já comprou. |
| **Personalizador** | Botão **"Comprar esta peça · R$ 189"**: escolhe o tamanho (P a XXG), gera os arquivos de produção (arte em 300 DPI, marca do peito, mockups), guarda no Supabase e põe no carrinho. Testado com a IA de verdade. Para o cliente, sumiram "Salvar na conta", "Minhas criações", "Baixar para produção" e o custo de cada imagem. |
| **/admin** | Pedidos de verdade (filtros, busca, mudar status, rastreio, copiar dados de envio, baixar planilha), **cupons** (criar, ligar/desligar, escolher o do pop-up) e estampas do Personalizador com os arquivos para a confecção. |
| **Segurança** | O banco não aceita mais gravações anônimas de estampas. Tudo passa pelo servidor. |

---

## 1. Cadastrar as chaves na Vercel (obrigatório antes de publicar)

Sem a **`SUPABASE_SECRET_KEY`**, a versão nova **não registra pedidos** (o cliente vê "indisponível"), o Personalizador não compra e o `/admin` fica vazio. Por isso o Claude não publicou.

1. Vercel → projeto **merano** → **Settings → Environment Variables**. Marque só **Production** em cada uma.
2. Cadastre:
   - **`SUPABASE_SECRET_KEY`**: Supabase → projeto **MERANO** → **Project Settings → API Keys** → chave **secret** (ou copie do `.env.local`, o que vem depois de `SUPABASE_SECRET_KEY=`). **Nunca** coloque essa chave no código, no chat ou no WhatsApp.
   - **`PRE_VENDA`** = **`1`**: liga o cadeado da pré-venda.
   - **`MERCADOPAGO_ACCESS_TOKEN`**: veja o item 2. Se ainda não tiver, pode publicar sem; os pedidos saem pelo WhatsApp.
   - **`PRE_VENDA_GRUPO_URL`** (opcional): o link de convite do grupo do WhatsApp, para o botão da tela "Coming soon".
3. Diga ao Claude: **"pode publicar"**. Ele publica a partir do branch e testa o site no ar.
4. Teste numa **janela anônima**: o site tem que mostrar "Coming soon" com o cadeado.

## 2. Pagamento: Mercado Pago

O site já está pronto para o Mercado Pago. Falta a conta.

1. Crie (ou use) a conta do Mercado Pago em nome de quem vai receber (CPF ou CNPJ).
2. Entre em https://www.mercadopago.com.br/developers/panel/app → **Criar aplicação** → tipo **Pagamentos on-line / Checkout Pro**.
3. Em **Credenciais de produção**, copie o **Access Token** (começa com `APP_USR-`).
4. Cadastre na Vercel como **`MERCADOPAGO_ACCESS_TOKEN`** e peça ao Claude para publicar de novo.
5. Não precisa configurar aviso de pagamento (webhook) no painel: cada pedido já informa ao Mercado Pago o endereço `/api/pagamento/webhook`. O site só marca como pago depois de **consultar o pagamento no próprio Mercado Pago** e conferir o valor.
6. Teste com uma compra real de valor baixo (ex.: crie um cupom de 90% no `/admin` só para o teste e desligue depois).

**Enquanto o Mercado Pago não estiver ligado:** o pedido fica registrado como "Aguardando pagamento" e o cliente manda a mensagem pronta no WhatsApp da Meranno (11 98646-4056). Vocês mandam o Pix ou o link do cartão e, quando o dinheiro cair, mudam o pedido para **Pago** no `/admin`.

## 3. Domínio

| Domínio | Situação | Preço |
|---|---|---|
| `meranno.com.br` | **Registrado em 15/11/2026** pelo CNPJ 70.145.517/0001-54, com o DNS automático do Registro.br | — |
| `meranno.com` | Livre | US$ 12,03 por ano (renova pelo mesmo valor) |
| `meranno.store` / `meranno.shop` | Livres | US$ 1,49 / US$ 2,99 no 1º ano, mas renovam por US$ 44 / US$ 38,39 |

- **Se o `.com.br` é de vocês** (o CNPJ é de algum sócio?): na Vercel, **Settings → Domains → Add** `meranno.com.br` e `www.meranno.com.br`. A Vercel mostra os registros. No https://registro.br → domínio → **DNS → Editar zona**, crie os registros que ela pedir (normalmente um `A` para `@` e um `CNAME` para `www`). Leva de minutos a algumas horas. Depois avise o Claude para trocar `merano-xi.vercel.app` pelo domínio nos textos e no link da pré-venda.
- **Se não é de vocês**: a sugestão é o `meranno.com`, que dá para comprar direto pela Vercel. Diga ao Claude "pode comprar o meranno.com"; ele confirma o valor antes de comprar.
- O Mercado Pago e o login do Google continuam funcionando no domínio novo. No Supabase, acrescente o domínio em **Authentication → URL Configuration** (Site URL e Redirect URLs).

## 4. Cupom do amigo

No `/admin` → **Cupons** → preencha o código (ex.: `NOMEDOAMIGO15`), o desconto, para que é, e se vale só na primeira compra → **Criar cupom**. Ele vale na hora. Para parar de valer: **Desligar**.

## 5. Liberar os sócios e montar a lista da pré-venda

Igual ao combinado em 17/11:
1. Cada sócio abre `/pre-venda`, entra com o **Google** e toca em **Abrir o cadeado** (uma vez por aparelho).
2. No `/admin` → **Quem pode entrar**: cole as pessoas, uma por linha, com e-mail ou WhatsApp (nome opcional) → **Adicionar à lista**.
3. **Copiar link** e mandar no grupo.

O que a pessoa do grupo faz: abre o link, entra com o Google ou cria a conta (com o mesmo e-mail ou WhatsApp do grupo) e toca em **Abrir o cadeado**. Fica liberada para sempre naquela conta.

## 6. Conferir o e-mail de confirmação de conta

Quem cria conta com e-mail (sem Google) precisa receber um e-mail de confirmação. Confira no Supabase → **Authentication** → **SMTP** se o Gmail da Meranno está configurado, e teste criando uma conta com um e-mail que não seja de sócio. Enquanto não estiver confirmado, peçam para o pessoal entrar com o **Google**.

## 7. Frete de verdade pela SuperFrete

Hoje o frete mostra **valores de exemplo**. Para o real:
1. Conta em https://web.superfrete.com → **Integrações → Desenvolvedores** → gere o **token** (aparece uma vez só).
2. Na Vercel: **`SUPERFRETE_TOKEN`**, **`FRETE_CEP_ORIGEM`** (CEP de onde sai) e, opcional, **`SUPERFRETE_CONTATO`** (e-mail técnico).
3. **Pesem uma camiseta embalada** e meçam o envelope (hoje o site usa 300 g e 30 × 25 × 4 cm) e passem ao Claude.

## 8. Conteúdo que falta (com vocês)

| Item | Situação |
|---|---|
| **Data de envio da pré-venda** | Ainda não definida. Quando tiver, o Claude coloca no produto, no pagamento e na página do pedido. Hoje a página do pedido diz "avisamos pelo WhatsApp quando o pedido for despachado". |
| **Tabela de medidas** | Um dos sócios vai mandar. |
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
| `MERCADOPAGO_ACCESS_TOKEN` | falta (item 2) | Pagamento on-line; sem ela, pedido pelo WhatsApp |
| `SUPERFRETE_TOKEN`, `FRETE_CEP_ORIGEM` | faltam (item 7) | Frete real |
| `PRE_VENDA_GRUPO_URL` | opcional | Botão do grupo no "Coming soon" |
| `SUPERFRETE_CONTATO`, `SUPERFRETE_URL` | opcionais | Contato técnico e ambiente de teste da SuperFrete |
| `PRE_VENDA_SEGREDO` | opcional | Assina o cookie da pré-venda (sem ela, usa a `SUPABASE_SECRET_KEY`) |
| `NEXT_PUBLIC_CLARITY_ID` | opcional | Mapa de calor |

Depois de cadastrar ou mudar qualquer variável, é preciso publicar de novo.

## Notas técnicas (para o Claude ou um programador)

- **Publicação**: a Vercel não publica sozinha. `vercel --prod --yes` a partir de um `git worktree` limpo, com a pasta `.vercel` copiada (passo a passo no `README.md`).
- **Pedidos**: `src/lib/pedidos.ts` (validação, preço, cupom, frete, totais, mensagem do WhatsApp, `registrarPagamento`), `src/app/api/pedidos/` (criar e "pagar agora"), `src/app/pagamento/`, `src/app/pedido/[id]/`. Mercado Pago: `src/lib/mercado-pago.ts` e `src/app/api/pagamento/webhook/`. Tabelas `pedidos` e `cupons` (RLS ligada, sem políticas: só a chave secreta lê e grava).
- **Cupom de primeira compra**: recusa o e-mail que já tem pedido pago, separado, enviado ou entregue.
- **Admin**: `src/app/admin/` (`dono.ts` confere o dono em cada ação; `pedidos-acoes.ts`, `pedidos-admin.tsx`, `cupons-admin.tsx`).
- **Personalizador**: ver `docs/PERSONALIZADOR.md` (compra em `public/personalizador/js/meranno-compra.js`, rotas `/api/estampa/envio` e `/api/estampa/registrar`).
- **Pré-venda**: `src/proxy.ts`, `src/lib/pre-venda.ts`, `src/lib/pre-venda-lista.ts`, `src/app/pre-venda/`, `src/components/entrada-pre-venda.tsx`. A `/em-breve` e a `/pre-venda` precisam continuar dinâmicas.
- **Sem uso**: a tabela `convites_pre_venda` e a função `usar_convite_pre_venda` (primeiro modelo da pré-venda) e `src/lib/estampa-schema.ts` (Personalizador anterior). Podem ser apagadas.
- **Recortes das camisetas e cartas do topo**: `public/imagens/merano-assets/recortes/` (as cartas são os `*-carta.webp`). A vitrine lê `src/lib/shirt-stories.ts`; o topo, `src/components/hero-topo.tsx`.
