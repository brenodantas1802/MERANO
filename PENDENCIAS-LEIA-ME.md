# MERANNO: o que falta fazer

Atualizado em **24/11/2026**. **Pré-venda: esta semana. Venda aberta: semana que vem.** Depois disso, a loja segue aberta normalmente.

> **Como ler:** a lista está em ordem de **prioridade** (o que precisa estar pronto primeiro) e, dentro de cada prioridade, do **mais fácil para o mais difícil**. Cada item diz para que serve, o que agrega ao site, o que acontece sem ele, quem faz e o passo a passo.
> Para pedir ao Claude: "faça o item 2.4 do PENDENCIAS-LEIA-ME.md".

## Resumo

| # | O que | Quem | Facilidade | Tempo | Situação (24/11) |
|---|---|---|---|---|---|
| | **PRIORIDADE 1: antes da pré-venda (esta semana)** | | | | |
| 1.1 | Montar a lista da pré-venda | vocês | muito fácil | 15 min | **lista pronta com vocês**: falta cadastrar (hoje tem 1 pessoa) |
| 1.2 | Assinar a Vercel Pro | vocês | muito fácil | 5 min | **feito** (24/11) |
| 1.3 | Criar o e-mail da Meranno | vocês + Claude | fácil | 15 min | **feito** (24/11): `contato.meranno@gmail.com` |
| 1.4 | Frete de verdade (SuperFrete) | vocês + Claude | fácil | 30 min | **falta**: o site mostra frete de exemplo |
| 1.5 | E-mail de confirmação de conta (SMTP) | vocês | médio | 20 min | **conferir** |
| 1.6 | Pagamento on-line (Asaas) | vocês + Claude | o mais difícil | 1 h, mais a aprovação da conta (pode levar dias) | **funcionando (24/11)**: Pix testado de ponta a ponta (pedido virou Pago sozinho pelo aviso do Asaas) |
| 1.7 | Compra de teste, do começo ao fim | vocês + Claude | fácil | 20 min | **Pix ok (24/11, MR-5AAVYQ)**; falta testar o cartão e refazer o frete depois do 1.4 |
| | **PRIORIDADE 2: antes da venda aberta (semana que vem)** | | | | |
| 2.1 | Recarga automática do OpenRouter (IA do Provador e do Personalizador) | vocês | muito fácil | 5 min | conferir |
| 2.2 | Assinar o Supabase Pro | vocês | fácil | 10 min | **falta** |
| 2.3 | Limite de provas contado no banco | Claude | nada para vocês | — | **falta** |
| 2.4 | Dados da empresa, Privacidade e Termos | vocês + Claude | médio | 30 min | **falta** |
| 2.5 | Domínio `merannoclothing.com.br` | vocês + Claude | médio | 30 min, mais algumas horas de espera | **no ar (24/11)**: DNS, cadeado, Supabase e endereço antigo redirecionando; falta só o Asaas usar o domínio novo |
| 2.6 | Abrir a venda para todos | Claude (vocês decidem preço e prazo) | fácil | 15 min | no dia |
| | **PRIORIDADE 3: depois do lançamento** | | | | |
| 3.1 | Bloquear senhas vazadas | vocês | muito fácil | 2 min | depois do 2.2 |
| 3.2 | Mapa de calor (Microsoft Clarity) | vocês + Claude | fácil | 10 min | opcional |
| 3.3 | Conteúdo que falta | vocês | fácil | — | falta |
| 3.4 | Provador em duas etapas | Claude | nada para vocês | — | ideia |
| 3.5 | Mais tamanhos (GG e XXG) e estoque no site | Claude | nada para vocês | — | quando decidirem |

**Já está pronto** (não precisa fazer): chave secreta do Supabase e cadeado da pré-venda na Vercel, as duas funções antigas do banco fechadas, fotos oficiais, provador, tabela da Remix, painel `/admin` com financeiro, cupons e pedidos.

### Como cadastrar uma variável na Vercel (vários itens usam)

1. https://vercel.com → projeto **merano** → **Settings** → **Environment Variables**.
2. Em **Key**, o nome (por exemplo `SUPERFRETE_TOKEN`); em **Value**, o valor; em **Environments**, marque **só Production**. **Save**.
3. A variável só vale depois de publicar de novo: diga ao Claude "pode publicar".

Chaves e senhas **nunca** vão no chat, no WhatsApp ou no código: só na Vercel.

---

## PRIORIDADE 1: antes da pré-venda (esta semana)

### 1.1 Montar a lista da pré-venda · vocês · muito fácil · 15 min

> **24/11:** a lista está pronta com vocês. Mandem para o Claude e ele cadastra no banco, ou colem vocês mesmos no `/admin` (passo 2).

- **Para que serve:** o site está trancado ("Coming soon"). Só entra quem está nessa lista.
- **O que agrega:** a pré-venda fica exclusiva para o grupo, com o desconto de R$ 180 por R$ 160.
- **Sem isso:** ninguém do grupo consegue entrar. Hoje a lista tem **uma** pessoa.
- **Passo a passo:**
  1. Cada sócio abre `/pre-venda`, entra com o **Google** e toca em **Abrir o cadeado** (uma vez por aparelho).
  2. No `/admin` → **Quem pode entrar**: cole as pessoas, uma por linha, com e-mail ou WhatsApp (o nome é opcional) → **Adicionar à lista**.
  3. **Copiar link** e mandar no grupo.
  4. Quem não estiver na lista e tentar entrar aparece em **Pedidos de acesso** no `/admin`: toquem em **Liberar** ou **Recusar**.

### 1.2 Assinar a Vercel Pro · vocês · muito fácil · 5 min · US$ 20 por mês

> **Feito em 24/11.** A conta está no Pro, ativa, com o ciclo de 23/11 a 23/12. Os R$ 3 cobrados na hora são o teste do cartão (cerca de US$ 0,50), que a Vercel faz ao assinar. Os US$ 20 vêm na fatura (Vercel → **Settings** → **Billing** → **Invoices**), que sai no começo de cada ciclo. Falta só o passo 3 (aviso de gastos).

- **Para que serve:** a Vercel é onde o site fica hospedado.
- **O que agrega:** autoriza o uso comercial e cresce sozinha com o acesso. Inclui por mês 1 TB de transferência e 10 milhões de requisições, o que dá para muitas dezenas de milhares de visitas. Acima disso, cobra pelo uso, com aviso por e-mail.
- **Sem isso:** o plano grátis (Hobby) **proíbe loja ou qualquer uso comercial**. A Vercel pode suspender o site, e o pior momento para isso é o lançamento.
- **Passo a passo:**
  1. https://vercel.com → no topo, a equipe **brenodantas1802-2440's projects** → **Settings** → **Billing**.
  2. **Upgrade to Pro** → cartão → confirmar. Deixem **uma pessoa só** com permissão de publicar: a Vercel cobra US$ 20 por pessoa que publica.
  3. Em **Billing** → **Spend Management**: ligue o **aviso** (por exemplo em US$ 40). **Não** ligue a pausa automática: numa loja, pausar tira o site do ar.

### 1.3 Criar o e-mail da Meranno · vocês + Claude · fácil · 15 min

> **Feito em 24/11:** `contato.meranno@gmail.com` entrou nas páginas Contato e Privacidade. Falta ligar a verificação em duas etapas nesse Gmail (passo 1), porque o item 1.5 precisa dela.

- **Para que serve:** é o contato oficial da loja. Também vai ser o remetente dos e-mails de confirmação de conta (item 1.5).
- **O que agrega:** o cliente tem a quem escrever e recebe os e-mails da loja.
- **Sem isso:** as páginas **Contato** e **Privacidade** mostram `equipe@merano.com`, um endereço que não existe. Ninguém recebe o que o cliente manda, e a lei de dados (LGPD) exige um canal de contato que funcione.
- **Passo a passo:**
  1. Criem um Gmail da loja (por exemplo, `meranno.contato@gmail.com`) e ativem a **verificação em duas etapas** (https://myaccount.google.com → **Segurança**).
  2. Mandem o endereço ao Claude, que troca nas páginas Contato e Privacidade.
  3. Quando o domínio estiver ligado (item 2.5), dá para ter `contato@meranno.com.br` pelo Google Workspace (pago, cerca de R$ 30 por mês) ou pelo Zoho Mail (grátis).

### 1.4 Frete de verdade pela SuperFrete · vocês + Claude · fácil · 30 min

- **Para que serve:** calcular o frete real (PAC e SEDEX; Mini Envios não serve, porque só aceita até R$ 100 declarados) pelo CEP do cliente.
- **O que agrega:** o cliente vê o preço e o prazo certos, e vocês não perdem dinheiro no envio.
- **Sem isso:** o site mostra **valores de exemplo** (marcados assim na tela). O cliente paga um frete que não é o real: ou vocês pagam a diferença, ou cobram a mais.
- **Passo a passo (conferido na documentação da SuperFrete em 24/11):**
  1. **Conta:** https://web.superfrete.com → **Criar conta**, com o CNPJ do MEI e o e-mail `contato.meranno@gmail.com`. Cadastrem o endereço de onde as camisetas saem.
  2. **Token:** abram https://web.superfrete.com/#/integrations → no cartão **Desenvolvedores**, cliquem em **Integrar** → **Confirmar**. O token aparece na tela: copiem na hora e colem direto na Vercel (não mandem no chat).
  3. **Na Vercel** (https://vercel.com/brenodantas1802-2440s-projects/merano/settings/environment-variables → **Add Environment Variable**, ambiente **Production**):
     - `SUPERFRETE_TOKEN` (tipo **Secret**): o token do passo 2.
     - `FRETE_CEP_ORIGEM` (tipo **Config**): o CEP de onde as camisetas saem, só os números.
     - O e-mail de contato que a SuperFrete exige já vai pelo código (`contato.meranno@gmail.com`): não precisa cadastrar.
  4. **Medidas do pacote:** pesem uma camiseta já embalada e meçam a caixa (comprimento × largura × altura, em cm). Hoje o site usa 300 g e 28 × 20 × 5 cm. Se for diferente, passem os números ao Claude: a transportadora cobra pelo maior entre o peso real e o volume da caixa.
  5. Digam ao Claude "pode publicar". Ele publica e testa o frete com um CEP real (o "Valores de exemplo" some da tela).
  6. **No dia a dia:** quando um pedido for pago, comprem a etiqueta no painel da SuperFrete (com saldo, recarga por Pix), imprimam, postem e colem o código de rastreio no pedido, no `/admin`.

### 1.5 E-mail de confirmação de conta (SMTP) · vocês · médio · 20 min

- **Para que serve:** quem cria conta com e-mail e senha (sem o Google) recebe um e-mail para confirmar a conta.
- **O que agrega:** qualquer pessoa consegue criar conta, não só quem usa o Google.
- **Sem isso:** o envio que já vem no Supabase só manda e-mail para os membros da equipe do Supabase, e poucos por hora. O cliente comum não recebe a confirmação e não consegue entrar. Enquanto isso não estiver pronto, peçam para todo mundo entrar com o **Google**.
- **Passo a passo:**
  1. No Gmail da loja (item 1.3): https://myaccount.google.com → **Segurança** → **Senhas de app** → crie uma chamada "Supabase" e copie a senha de 16 letras.
  2. https://supabase.com/dashboard → projeto **MERANO** → **Authentication** → **Emails** → **SMTP Settings** → ligue **Enable Custom SMTP**:
     - Sender email: o Gmail da loja · Sender name: `Meranno`
     - Host: `smtp.gmail.com` · Port: `465`
     - Username: o Gmail da loja · Password: a senha de app do passo 1
  3. **Save**. Depois, em **Authentication** → **Rate Limits**, aumentem o limite de e-mails por hora (por exemplo, para 100).
  4. Testem: criem uma conta com um e-mail que **não** seja de sócio e vejam se a confirmação chega (olhem o spam também).
  - O Gmail envia até cerca de 500 e-mails por dia, o que basta no começo.

### 1.6 Pagamento on-line pelo Asaas · vocês + Claude · o mais difícil · 1 h, mais a aprovação da conta

- **Para que serve:** o cliente paga no próprio site, com Pix ou cartão em até 3 vezes, na página segura do Asaas.
- **O que agrega:** o pedido vira **Pago** sozinho no `/admin`, sem ninguém conferir extrato. O site confere o valor no próprio Asaas antes de marcar pago. A loja vende de madrugada e em escala.
- **Sem isso:** todo pedido fecha pelo WhatsApp (11 98646-4056). Vocês mandam o Pix ou o link do cartão para cada pessoa e marcam o pedido como **Pago** à mão. Funciona na pré-venda, com pouca gente, mas não aguenta a venda aberta.
- **Por que é o mais difícil:** a conta precisa estar **aprovada** pelo Asaas (documentos), e isso pode levar alguns dias. **Comecem hoje.**
- **Tenham em mãos:** o CNPJ do MEI, o documento com foto (RG ou CNH) de quem responde pelo MEI, o celular dessa pessoa, o e-mail `contato.meranno@gmail.com` e os dados da conta bancária para onde o dinheiro vai.
- **Passo a passo:**

  **Parte A: a conta (15 min, mais a aprovação)**
  1. Em https://www.asaas.com → **Criar conta** → **Pessoa Jurídica** → CNPJ do MEI, e-mail `contato.meranno@gmail.com`, celular e senha. Confirmem o código que chega no e-mail e no celular.
  2. Enviem os documentos que o Asaas pedir (documento com foto e selfie do responsável) pelo app ou pelo site. Esperem o e-mail de **conta aprovada**. Sem a aprovação, o Asaas não libera receber de verdade.
  3. **Site nos dados comerciais (obrigatório):** **Configurações da conta** → aba **Informações** → campo **Site**: `https://merannoclothing.com.br`. O Asaas só devolve o cliente para o site depois do pagamento se o endereço for do domínio cadastrado aqui.
  4. **Chave Pix:** menu **Pix** → **Minhas chaves** → **Cadastrar chave** (o CNPJ ou uma chave aleatória). Sem chave Pix, o Pix do site não funciona.
  5. **Conta para saque:** cadastrem a conta bancária da Meranno, para transferir o dinheiro que entrar.

  **Parte B: a chave de API (5 min)**
  6. No Asaas, com o usuário **administrador**: menu do usuário (canto de cima, à direita) → **Integrações** → **Chaves de API** → **Gerar chave de API** → nome `Site Meranno`.
  7. A chave aparece **uma vez só** e começa com `$aact_prod_`. Copiem **inteira, com o `$`**.
  8. Na Vercel (veja "Como cadastrar uma variável", no começo): Key `ASAAS_API_KEY`, Value a chave, só **Production** → **Save**.

  **Parte C: o aviso de pagamento, ou webhook (10 min)**
  9. No Asaas → **Integrações** → **Webhooks** → **Adicionar webhook** (ou **Criar webhook**) e preencham:
     - Nome: `Site Meranno`
     - URL: `https://merannoclothing.com.br/api/pagamento/asaas`
     - E-mail: `contato.meranno@gmail.com` (o Asaas avisa ali se o webhook falhar)
     - Versão da API: **v3** · Webhook ativo: **sim** · Fila de sincronização: **ativada** · Tipo de envio: **Sequencial**
     - Token de autenticação: toquem em **Gerar token** e **copiem antes de salvar** (ele não aparece de novo). Se não tiver o botão, gerem um no PowerShell (de 32 a 255 letras e números, sem espaço):
       ```powershell
       -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 40 | ForEach-Object { [char]$_ })
       ```
     - Eventos: marquem **só** estes três: **Checkout pago** (`CHECKOUT_PAID`), **Cobrança confirmada** (`PAYMENT_CONFIRMED`) e **Cobrança recebida** (`PAYMENT_RECEIVED`).
     - **Salvar**.
  10. Na Vercel: Key `ASAAS_WEBHOOK_TOKEN`, Value o token do passo 9, só **Production** → **Save**.

  **Parte D: publicar e testar (20 min)**
  11. Digam ao Claude "pode publicar o Asaas". Ele publica e confere que o site abre a página de pagamento do Asaas.
  12. Façam a compra de teste do item 1.7 (cupom de 90%, pagando com Pix) e vejam o pedido virar **Pago** sozinho no `/admin`. Para devolver o dinheiro do teste: Asaas → **Cobranças** → a cobrança → **Estornar**.
- **Bom saber:**
  - O "3x sem juros" quer dizer que a taxa do parcelamento é da Meranno. Confiram as taxas de Pix e de cartão do plano de vocês no Asaas.
  - Mesmo se o aviso falhar, o site confere o pagamento quando o cliente volta para a página do pedido.
  - O dinheiro cai no saldo do Asaas. Para levar para o banco: **Transferir** → a conta cadastrada no passo 5.
  - Se a página de pagamento não abrir depois de publicar, a causa mais comum é o passo 3 (site nos dados comerciais).

### 1.7 Compra de teste, do começo ao fim · vocês + Claude · fácil · 20 min

- **Para que serve:** garantir que tudo funciona junto antes de um cliente de verdade comprar.
- **O que agrega:** pega qualquer erro antes do grupo da pré-venda.
- **Sem isso:** o primeiro cliente vira o teste.
- **Passo a passo:**
  1. No `/admin` → **Cupons**: criem um cupom de 90% só para o teste.
  2. Comprem uma camiseta com o cupom, com um CEP real, e paguem com Pix.
  3. Confiram: o frete apareceu certo? O pedido virou **Pago** no `/admin`? A página do pedido mostrou a mensagem de cliente VIP?
  4. **Desliguem o cupom** e cancelem o pedido de teste.

---

## PRIORIDADE 2: antes da venda aberta (semana que vem)

### 2.1 Recarga automática do OpenRouter · vocês · muito fácil · 5 min

- **Para que serve:** o OpenRouter é quem cobra pela IA do **Provador** e do **Personalizador**. Cada prova custa cerca de US$ 0,04 a 0,08.
- **O que agrega:** o provador nunca para por falta de saldo.
- **Sem isso:** quando o saldo acaba, o provador e o personalizador param de funcionar, com uma mensagem de erro para o cliente.
- **Passo a passo:** https://openrouter.ai → **Settings** → **Credits** → ligar **Auto top-up** (por exemplo, recarregar US$ 20 quando o saldo cair abaixo de US$ 5).

### 2.2 Assinar o Supabase Pro · vocês · fácil · 10 min · cerca de US$ 25 por mês

- **Para que serve:** o Supabase é o banco do site: pedidos, contas, cupons e a lista da pré-venda.
- **O que agrega:** **backup diário** dos pedidos (7 dias), banco que nunca pausa, limites bem maiores (8 GB de banco, 100 mil contas ativas por mês) e o bloqueio de senhas vazadas (item 3.1).
- **Sem isso:** no plano grátis não há backup: se algo apagar os pedidos, não tem volta. O banco também pausa depois de uma semana parado; o site evita isso com uma visita diária automática, mas é um remendo.
- **Atenção ao preço:** a conta de vocês no Supabase tem **dois projetos**: o **MERANO** e o **campos-del-plata**. No Pro, cada projeto a mais custa cerca de US$ 10 por mês. Se o campos-del-plata não for da Meranno, antes de assinar levem o MERANO para uma organização só dele (projeto **MERANO** → **Project Settings** → **General** → **Transfer project**) e assinem o Pro nela.
- **Passo a passo:** https://supabase.com/dashboard → a organização do projeto MERANO → **Billing** → **Change subscription plan** → **Pro** → cartão. Depois, confiram em **Database** → **Backups** que o backup diário aparece.

### 2.3 Limite de provas contado no banco · Claude · nada para vocês

- **Para que serve:** o provador limita cada pessoa a 5 provas a cada 10 minutos e o site a 100 por dia, para a conta da IA não explodir.
- **O que agrega:** o limite passa a valer para o site inteiro, com qualquer volume de acesso.
- **Sem isso:** hoje o limite é contado em cada servidor separado. Com muito acesso, a Vercel abre vários servidores, e o "100 por dia" vira 100 por servidor.
- **Passo a passo:** digam ao Claude "faça o item 2.3".

### 2.4 Dados da empresa, Privacidade e Termos · vocês + Claude · médio · 30 min

- **Para que serve:** as páginas legais da loja e o rodapé com os dados da empresa.
- **O que agrega:** passa confiança e cumpre a lei.
- **Sem isso:**
  - A lei do comércio eletrônico (Decreto 7.962/2013) obriga a loja on-line a mostrar o **nome empresarial, o CNPJ, um endereço e um contato**. Hoje o site não mostra nenhum deles.
  - A **Privacidade** ainda diz que "a confirmação é manual" e não conta quem recebe os dados do cliente: o Asaas (pagamento), a SuperFrete e os Correios (envio), o Google (login) e a IA do provador (a foto da pessoa). A LGPD exige isso.
  - Os **Termos** ainda falam de "pagamento futuro".
- **Passo a passo:**
  1. Mandem ao Claude: razão social, CNPJ (o do MEI de vocês), endereço que pode aparecer no site (pode ser comercial) e o e-mail do item 1.3.
  2. O Claude reescreve Privacidade e Termos de acordo com o que o site faz de verdade (pagamento, envio, provador, "sem trocas" com os 7 dias de arrependimento e a garantia contra defeito do Código do Consumidor) e põe os dados no rodapé.
  3. Vocês leem e aprovam antes de publicar.

### 2.5 Domínio `merannoclothing.com.br` · vocês + Claude · médio · 30 min, mais algumas horas de espera

> **24/11:** o `meranno.com.br` é de outro CNPJ, então vocês registraram o **`merannoclothing.com.br`** (igual ao Instagram), no CNPJ do MEI, válido até 24/11/2027. O Claude já ligou o domínio ao projeto na Vercel (o `www` manda para o endereço sem `www`).
> **Feito (24/11):** os registros abaixo foram salvos no Registro.br e o Claude conferiu: a Vercel marca os dois endereços como configurados certo, e o Google e a Cloudflare já enxergam. O código não precisa de mudança (login, pagamento e link da pré-venda usam o endereço de onde a pessoa está). Para refazer, é em **Meus domínios → merannoclothing.com.br → DNS → Configurar endereçamento → MODO AVANÇADO** (lá o Nome aparece completo: `merannoclothing.com.br` e `www.merannoclothing.com.br`):
>
> | Tipo | Nome | Dados |
> |---|---|---|
> | A | *(vazio: o Registro.br não aceita `@`)* | `216.150.1.1` |
> | A | *(vazio)* | `216.150.16.1` |
> | CNAME | `www` | `f0c769b53e28843e.vercel-dns-017.com` |
>
> **Também feito (24/11):**
> - **Cadeado (HTTPS):** certificado emitido pela Vercel para os dois endereços, renova sozinho.
> - **Supabase:** Site URL `https://merannoclothing.com.br` e o domínio novo (com e sem `www`) aceitos no login. O Claude conferiu.
> - **Endereço antigo:** o `merano-xi.vercel.app` manda para o `merannoclothing.com.br` (redirecionamento 308 na Vercel, em Settings → Domains), mantendo o caminho. Links antigos da pré-venda continuam funcionando.
>
> **Falta:** **Asaas (item 1.6)**: campo **Site** = `https://merannoclothing.com.br` e webhook = `https://merannoclothing.com.br/api/pagamento/asaas`.
>
> O texto antigo abaixo (sobre o `meranno.com.br`) fica como referência.

- **Para que serve:** o endereço oficial da loja, no lugar de `merano-xi.vercel.app`.
- **O que agrega:** confiança (endereço de marca), fácil de lembrar e de divulgar, e e-mail com o domínio (`contato@meranno.com.br`).
- **Sem isso:** o site funciona, mas com um endereço técnico, com "merano" escrito errado, o que afasta quem compra pela primeira vez.
- **Passo a passo:**
  1. Confirmem que o `meranno.com.br` (registrado em 15/11/2026 pelo CNPJ 70.145.517/0001-54) é de vocês e que têm o login do https://registro.br. Se não for, a alternativa é o `meranno.com` (cerca de US$ 12 por ano, comprado pela Vercel; o Claude confirma o valor antes).
  2. Vercel → projeto **merano** → **Settings** → **Domains** → **Add**: `meranno.com.br` e depois `www.meranno.com.br`. A Vercel mostra os registros que precisa.
  3. https://registro.br → o domínio → **DNS** → **Editar zona** → criem os registros que a Vercel pediu (normalmente um `A` para `@` e um `CNAME` para `www`). Leva de minutos a algumas horas.
  4. Supabase → **Authentication** → **URL Configuration**: troquem o **Site URL** para `https://meranno.com.br` e acrescentem `https://meranno.com.br/**` em **Redirect URLs** (sem isso, o login volta para o endereço antigo).
  5. No Asaas, troquem a URL do webhook (item 1.6, passo 6) para `https://meranno.com.br/api/pagamento/asaas`.
  6. Digam ao Claude, que troca o endereço nos textos e no link da pré-venda e publica.

### 2.6 Abrir a venda para todos · Claude · fácil · 15 min, no dia

- **Para que serve:** tirar o cadeado e vender para qualquer pessoa.
- **O que agrega:** é o lançamento.
- **Sem isso:** o site continua em "Coming soon" para quem não está na lista.
- **O que vocês decidem antes:**
  1. ~~Preço depois da pré-venda~~ **decidido (24/11):** todas as camisetas a R$ 180 desde já, inclusive a personalizada, sem preço riscado.
  2. **Prazo de entrega** de quem comprar na venda aberta (hoje está "até 7 de dezembro", que é o da pré-venda).
  3. **Data da abertura:** o painel Financeiro conta como pré-venda os pedidos feitos antes de 1º/12 (`ABERTURA_VENDA` em `src/lib/financeiro.ts`). Se a venda abrir em outro dia, avisem o Claude.
- **Passo a passo:** no dia, digam ao Claude "abre a venda": ele desliga o `PRE_VENDA` na Vercel, ajusta preço e prazo, publica e testa numa janela anônima.

---

## PRIORIDADE 3: depois do lançamento

### 3.1 Bloquear senhas vazadas · vocês · muito fácil · 2 min (precisa do 2.2)

- **Para que serve e o que agrega:** impede que alguém crie conta com uma senha que já vazou na internet.
- **Sem isso:** contas de clientes com senhas fracas ficam mais fáceis de invadir.
- **Passo a passo:** Supabase → **Authentication** → **Attack Protection** (ou **Policies**) → ligar **Prevent use of leaked passwords**.

### 3.2 Mapa de calor (Microsoft Clarity) · vocês + Claude · fácil · 10 min · opcional, grátis

- **Para que serve e o que agrega:** mostra onde os clientes clicam e até onde rolam as páginas, para melhorar a loja com dados reais. Só roda para quem aceitar no aviso de cookies.
- **Sem isso:** as melhorias são no palpite.
- **Passo a passo:** criem a conta em https://clarity.microsoft.com, criem o projeto com o endereço do site e passem ao Claude o **ID do projeto**. Ele cadastra `NEXT_PUBLIC_CLARITY_ID` e publica.

### 3.3 Conteúdo que falta · vocês

| Item | O que preciso |
|---|---|
| Estampa nova | Qual estampa troca e o arquivo. |
| Contato | O número duplo (Yuri). |
| Detalhes do produto | O que exatamente ajustar. |
| Vídeo da capa | Conferir se a qualidade HD (720p) ficou boa. |
| Cor das camisetas brancas | A Remix vende **Off White** (não branco puro). Se a Amore White e a Riviera saem em Off White, o Claude troca o nome da cor no site. |

### 3.4 Provador em duas etapas · Claude

- **Para que serve e o que agrega:** quando a pessoa manda uma foto com roupa larga, a IA ainda puxa um pouco desse caimento. Vestir primeiro uma camiseta regular lisa e depois a estampa resolve, como foi feito nas fotos do modelo.
- **Custo:** cada prova passa a custar o dobro (cerca de US$ 0,08) e demora uns 40 segundos.

### 3.5 Mais tamanhos e estoque no site · Claude

- **GG e XXG:** a Remix também faz. Quando decidirem vender, o Claude acrescenta em `TAMANHOS_LOJA` (e no Meranno Fit).
- **Estoque visível:** hoje não aparece (decisão de 20/11). Pode entrar quando quiserem.

---

## Como fazer (consulta)

- **Cupom do amigo:** `/admin` → **Cupons** → código (ex.: `NOMEDOAMIGO15`), desconto, para que é, e se vale só na primeira compra → **Criar cupom**. Vale na hora. Para parar: **Desligar**.
- **Avaliações:** só aparecem depois de aprovadas (Supabase → **Table Editor** → `avaliacoes` → `status` = `aprovada`). Nunca inventar avaliações.
- **Sócio novo no código:** convite no GitHub (repositório → **Settings** → **Collaborators** → **Add people**) e o `.env.local` por canal seguro. O `README.md` tem o passo a passo.
- **Limites da pré-venda:** o WhatsApp não é confirmado por SMS e cada número só libera **uma** conta. Tirar alguém da lista impede novas entradas, mas não expulsa um aparelho que já entrou. O acesso de cada aparelho dura até 400 dias.

---

## Histórico: onde as coisas estão e o que já foi feito

- **Site no ar** (https://merannoclothing.com.br; o antigo merano-xi.vercel.app redireciona): versão de 24/11 (fotos oficiais e provador com caimento regular), com o cadeado da pré-venda ligado.
- **Trabalho novo**: no branch `lancamento-pre-venda`. O de 22/11 foi testado no computador (produto → tamanho → carrinho com duas peças → pagamento → pedido) e o build de produção passa.
- **Banco (Supabase)**: tabelas de pedidos, cupons, lista da pré-venda e pedidos de acesso prontas. Ficou um pedido de teste, `MR-FFHAK2` ("Teste Claude"), marcado como **cancelado**. Pode apagar.

### O que entrou em 22/11

| Parte | O que mudou |
|---|---|
| **Tamanhos** | Só **P, M e G** (decisão dos sócios em 22/11), no catálogo, no Personalizador, no Provador e no Meranno Fit. A Remix também faz GG e XXG: para vender, é só o Claude acrescentar em `TAMANHOS_LOJA`. |
| **Modelagem** | **Só regular** (decisão de 22/11, sem oversized). Tabela da **Remix On Demand, Camiseta Algodão Unissex** (P 50/51/70, M 53/54/73, G 56/57/76: tórax, barra e comprimento em cm, tolerância de 2 cm). O Personalizador só oferece a regular. |
| **Composição** | "Camiseta regular unissex, 100% algodão penteado, malha de 180 g/m²". |
| **Preço** | **R$ 180**, por **R$ 160 na pré-venda** (aparece "R$ 180" riscado). Depois da pré-venda, apagar `salePrice` dos produtos em `src/lib/products.ts`. A peça do Personalizador continua R$ 189 (`PRECO_PERSONALIZADA`). |
| **Provador** | O pedido à IA agora diz que a peça é **regular** (ombro na ponta do ombro, manga até o meio do braço, corpo reto) e usa as medidas da Remix. (As fotos oficiais da regular entraram em 23/11.) |
| **Menu do topo** | Último item "Painel da equipe", que só aparece para os e-mails dos donos (o servidor confere; clientes nunca veem). |
| **Painel `/admin`** | Agora abre no **Financeiro**: faturamento, custos, lucro, caixa estimado, a receber, para despachar, enviados, entregues, metas da pré-venda (20) e do lançamento (60), comparação com o planejamento e lançamento de despesas (já tem caixas R$ 805 e MEI R$ 92). Custos e taxas editáveis em "Ajustar custos, taxas e metas". **Modo claro e noturno** (segue o celular; botão de lua/sol para trocar). |
| **Segurança** | Nenhuma tabela é acessível pela chave pública do site (RLS ligado em todas, sem permissões para a API pública). Avaliações e cadastro de e-mail do cupom passam pelo servidor. Tabelas novas já nascem fechadas. |
| **Meranno Fit** | Recomenda pelo busto (medido, ou estimado pela altura e pelo peso), calibrado na tabela da Remix regular: P até 94 cm de busto, M até 100, G até 106. Acima disso recomenda o G e avisa que é o maior tamanho e veste mais justo. Os resultados "aleatórios" vinham da medida do ombro (quem errava a fita pulava de P para GG) e da altura digitada em metros ("1,75" era ignorada). As duas coisas foram corrigidas. O ombro virou medida opcional. |
| **Data de entrega** | "Entrega prevista para 7 de dezembro" no produto, no pagamento e no pedido. Para mudar: `ENTREGA_PRE_VENDA` em `src/lib/pedidos.ts`. |
| **Mensagem VIP** | Quando o pagamento é confirmado, a página do pedido mostra: "Obrigado pela preferência. Você comprou na pré-venda, garantiu R$ X de desconto e agora é cliente VIP da Meranno. Entrega prevista: 7/12". O "garantiu R$ X de desconto" soma o desconto da pré-venda (R$ 180 → R$ 160), do Pix e do cupom. |
| **Pagamento pelo Asaas** | Pronto no código. Com a chave do Asaas na Vercel, o cliente paga na página segura do Asaas: Pix ou cartão em até 3x, pelo mesmo preço (sem desconto no Pix, decisão de 22/11). O pedido só vira "Pago" depois que o site **consulta o próprio Asaas** e confere o valor. Sem a chave, o pedido continua fechando pelo WhatsApp. |
| **Pedidos de acesso** | Quem entra no `/pre-venda` sem estar na lista digita o WhatsApp e cai em "Pedidos de acesso" no `/admin`, para vocês liberarem ou recusarem. |

---

### Reunião de 22/11 (noite)

**Feito:**
- **Capa nova**: só o vídeo do crupiê dando cartas (escurecido, sem som), os dois botões embaixo e a logo branca no topo. Vídeo em `public/imagens/capa/` (1 MB no computador; no celular um recorte vertical próprio de 0,4 MB).
- **Logo nova** (o M com a taça) no topo, no menu e no rodapé, vetorizada a partir da arte de vocês: branca sobre a capa, na cor do texto no resto.
- **Modo escuro** (preto e bordô) como principal, com botão para o claro (lua/sol no topo do computador; no menu do celular). A escolha fica salva no aparelho.
- **Vitrine**: Wine not?, Verão em boa companhia (no meio) e Va tutto bene; os Corações ficam no carrossel 3D logo abaixo. A Why Not You? saiu do site inteiro (peça única para um influenciador, não vende).
- **Carrossel 3D**: troca mais rápida (mesma animação) e a camiseta não corta mais em tela de notebook.
- **Banner das 3 cartas** trocado por um banner limpo (camiseta regular sobre preto).
- **Medidas no Meranno Fit**: camiseta regular de verdade com só os centímetros.
- **Sem trocas**: página Trocas reescrita, FAQ, Entrega e Sobre nós ajustados, e no pagamento um aviso com caixinha obrigatória. A lei ainda garante 7 dias para desistir de compras pela internet (art. 49 do CDC) e cobre defeitos: está escrito na página Trocas.
- **Administradores pelo painel**: em Pré-venda → Quem pode entrar, botão "Tornar admin" ao lado de cada pessoa. A pessoa precisa entrar com o Google, com o mesmo e-mail que está na lista.
- **Instagram** corrigido para `@merannoclothing`.
- Vídeos antigos do site anterior: já tinham saído na otimização.

**Ajustes da revisão (23/11):**
- **Vídeo sem travar**: ele tinha um único quadro-chave para os 10 segundos inteiros, então toda vez que voltava a tocar (ao subir a página) o navegador decodificava tudo desde o início e congelava. Agora tem um quadro-chave por segundo, só toca enquanto está na tela, e a imagem de espera é o primeiro quadro dele (a troca não aparece). As fotos do carrossel 3D só baixam quando a seção chega perto, para não disputar a internet com o vídeo.
- **Vídeo no celular** com menos zoom (refeito depois do teste no celular dos sócios): no iPhone a barra do Safari deixa a tela com ~660 px de altura, então o primeiro ajuste quase não mudou nada. Agora o celular tem um vídeo próprio, recortado em 4:5 (as mãos do crupiê, as cartas e as fichas, 576×720, 0,4 MB), e a capa no celular é um quadro 4:5 com a vitrine logo abaixo.
- **Vídeo só toca inteiro**: ele baixa em segundo plano (prioridade baixa, depois dos arquivos da página) e só começa quando chegou todo, então não engasga no meio. Até lá aparece o primeiro quadro parado, idêntico, e a troca não se vê. Com "economia de dados" ligada, fica só a imagem parada.
- **Bolinhas do carrossel 3D** no celular: as cinco cabem inteiras numa fileira (sem as setas), nenhuma cortada na borda.
- **Vitrine no celular** sem carrossel: só Wine not? e Verão em boa companhia, paradas. No computador continuam as três.
- **Toque no celular**: botões, links e fotos não são mais "arrastados" sem querer e o toque responde na hora.
- **Minha conta e páginas da conta** abrem na hora com um aviso de carregando, e o servidor da Vercel passou para São Paulo (`gru1`, no `vercel.json`), ao lado do banco: tudo que consulta o banco ficou mais rápido para quem está no Brasil.
- **Va tutto bene no 3D**: a ponta da manga esquerda estava cortada na borda da foto; refeita espelhando a manga direita.
- **Banner**: estampa Match Point maior nas costas.
- **Categorias**: fundo do cartão da Summer Collection em bordô forte.
- **Sobre nós**: a história de vocês cinco (Breno, Yuri, Mateus, Pedro e Enzo); as camisetas que giravam com a rolagem saíram (pesavam no celular).
- **Mais leve ao abrir**: os cards da vitrine não "sobem" mais ao aparecer e o pop-up do cupom carrega depois da página. No teste de celular lento, o tempo travado ao abrir a inicial caiu de 600 ms para ~170 ms (nota 71 → 82).
- **Bolinha da Vercel** desligada nas prévias (variável `VERCEL_PREVIEW_FEEDBACK_ENABLED=0` em Preview). No site oficial ela não aparece.

**Nomes novos (23/11)**: Arancia (a da laranja, azul-marinho), Amore Black e Amore White (as do coração), Riviera (a do café no terraço, antiga Va tutto bene) e Why not (a do vinho). Os endereços também mudaram (`/produto/arancia`, `/produto/amore-black`, `/produto/amore-white`, `/produto/riviera`, `/produto/why-not`); os antigos redirecionam, e carrinhos, favoritos e pedidos de antes continuam valendo (`IDS_ANTIGOS` em `src/lib/products.ts`).

**Fotos oficiais e ajustes (23/11, tarde):**
- **Fotos novas** (modelagem regular, fundo branco de estúdio) no lugar das antigas, em todas as peças: verso e frente da Amore Black, Riviera, Arancia (que ganhou foto de frente), Why not e Amore White (o verso chegou à noite). Todas reenquadradas para a camiseta ficar do mesmo tamanho e na mesma posição nos cards e na página do produto (sem recortar a manga). O verso da Arancia veio em fundo cinza-lavanda e foi passado para o mesmo branco.
- **Carrossel 3D**: recortes novos das cinco (Amore Black, Amore White, Riviera, Arancia e Why not), feitos contra o fundo liso da foto em 4x (borda no meio do contraste da própria camiseta, sem halo branco nas escuras, gola da Riviera lisa), em 1200 px. O script fica fora do site; para refazer com fotos novas, é só pedir ao Claude.
- **Sobre nós**: texto novo de vocês, palavra por palavra, fechando com "Meranno. Vista suas ideias.".
- **Categorias virou Coleções** (`/colecoes`; o endereço antigo redireciona). No menu: Coleções, Meranno Fit e Sobre nós, nessa ordem.
- **Voltar para a página inicial**: no topo do menu (fora da inicial) e, no celular, uma seta discreta "Voltar para o início" logo abaixo da barra (a barra do celular não tem espaço para mais um botão).
- **Cadeado** (Coming soon, pré-venda e a abertura do convite): bordô forte e liso (`#39000F`, sem a textura e a luz que apagavam a cor), dourado mais vivo no cadeado, no botão e no nome, texto do botão em bordô quase preto, e as barras do Safari na mesma cor.
- **Provador** (noite): o modelo do lookbook foi vestido com as cinco camisetas pelo próprio provador do site (cerca de US$ 0,23 no OpenRouter, contando uma geração que se perdeu na conexão) e alinhado à foto original. No passo 3 do topo, metade original e metade Amore Black; no "o seu resultado aparece aqui", as cinco passam uma a uma com o nome, ou fica a que a pessoa escolheu. O passo 2 continua com a foto original. O pedido à IA deixou de chamar as fotos de referência de "mockups com ombro caído": agora diz que são a própria peça regular, com as proporções medidas nas fotos oficiais (ombro na ponta do ombro, manga curta, estreita e rente ao braço, largura de costas pouco mais da metade do comprimento, malha leve de 180 g/m² que cai acompanhando o corpo) e o tamanho e a posição de cada estampa de costas (`printScale` em `src/lib/products.ts`). Também manda descartar o contorno da roupa que a pessoa veste na foto, que antes "vazava" para o resultado (uma camiseta larga virava ombro caído). O tamanho segue a tabela da Remix (P 50/70, M 53/73, G 56/76 cm de tórax/comprimento; conferida no site da Remix em 23/11). As fotos do modelo no provador foram refeitas com esse pedido no P, que é o tamanho dele (é magro; no M a camiseta fica folgada nele, como ficaria na vida real), e em duas etapas: primeiro ele vestido com a Riviera e, a partir dessa foto já com camiseta regular, as outras (partindo da camiseta larga original, a IA ainda deixava um caimento de oversized).
- **Provas sem limite** (24/11): o Breno, entrando no site com a conta Google dele, e o servidor de teste local (o Claude) não têm limite de provas. Todo o resto continua com 5 provas a cada 10 minutos e 100 por dia (`src/app/api/generate/route.ts`).

---

## Todas as variáveis da Vercel (Settings → Environment Variables → Production)

| Variável | Situação | Para quê |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | já existem | Banco e login |
| `OWNER_EMAILS` | já existe | Quem entra no `/admin` e é liberado na pré-venda |
| `OPENROUTER_API_KEY`, `PERSONALIZADOR_OPENROUTER_API_KEY` | já existem | IA do Provador e do Personalizador |
| `SUPABASE_SECRET_KEY` | já existe | Pedidos, cupons, compra do Personalizador, lista da pré-venda, `/admin` |
| `PRE_VENDA` | já existe | `1` liga o cadeado (sai no dia da venda aberta, item 2.6) |
| `ASAAS_API_KEY` | **falta** (item 1.6) | Pagamento on-line; sem ela, pedido pelo WhatsApp |
| `ASAAS_WEBHOOK_TOKEN` | **falta** (item 1.6) | Confere que o aviso de pagamento veio do Asaas |
| `SUPERFRETE_TOKEN`, `FRETE_CEP_ORIGEM` | **faltam** (item 1.4) | Frete real |
| `PRE_VENDA_GRUPO_URL` | opcional | Botão do grupo no "Coming soon" |
| `SUPERFRETE_CONTATO`, `SUPERFRETE_URL` | opcionais | Contato técnico e ambiente de teste da SuperFrete |
| `MERCADOPAGO_ACCESS_TOKEN` | opcional | Só se um dia trocarem o Asaas pelo Mercado Pago |
| `PRE_VENDA_SEGREDO` | opcional | Assina o cookie da pré-venda (sem ela, usa a `SUPABASE_SECRET_KEY`) |
| `NEXT_PUBLIC_CLARITY_ID` | opcional (item 3.2) | Mapa de calor |

Depois de cadastrar ou mudar qualquer variável, é preciso publicar de novo.

## Notas técnicas (para o Claude ou um programador)

- **Publicação**: a Vercel não publica sozinha. `vercel --prod --yes` a partir de um `git worktree` limpo, com a pasta `.vercel` copiada (passo a passo no `README.md`).
- **Pedidos**: `src/lib/pedidos.ts` (validação, preço, cupom, frete, totais, mensagem do WhatsApp, `registrarPagamento`, `ENTREGA_PRE_VENDA`), `src/app/api/pedidos/` (criar e "pagar agora"), `src/app/pagamento/`, `src/app/pedido/[id]/`. Tabelas `pedidos` e `cupons` (RLS ligada, sem políticas: só a chave secreta lê e grava).
- **Pagamento**: `src/lib/pagamento.ts` escolhe o provedor (Asaas se `ASAAS_API_KEY`, senão Mercado Pago se `MERCADOPAGO_ACCESS_TOKEN`). Asaas: `src/lib/asaas.ts` (Checkout com `externalReference` = id do pedido; cada checkout aberto fica em `pedidos.pagamento.checkouts`) e o webhook `src/app/api/pagamento/asaas/`, que lê as cobranças do checkout (`GET /payments?checkoutSession=`) e só marca pago com o valor inteiro. Mercado Pago: `src/lib/mercado-pago.ts` e `src/app/api/pagamento/webhook/`. A chave do sandbox (`_hmlg_`) usa `api-sandbox.asaas.com` sozinha.
- **Tamanhos e Fit**: `TAMANHOS_LOJA` (P, M, G), `REMIX_REGULAR` (tabela inteira da Remix), `SIZE_CHART` (só o que a loja vende), `MATERIAL`, `PRECO_LANCAMENTO` e `PRECO_PRE_VENDA` em `src/lib/products.ts`. O ombro não está na tabela da Remix: `ombroDa` em `src/lib/body-model.ts` estima 86% do tórax (trocar pelo valor medido numa peça real).
- **Financeiro**: `src/lib/financeiro.ts` (contas e plano), `src/app/admin/financeiro-admin.tsx`, `financeiro-acoes.ts`. Tabelas `financeiro_config` (uma linha) e `despesas`. O lucro conta produção + acessórios por camiseta vendida, taxas do Asaas e despesas lançadas; o frete é repasse e fica de fora.
- **Funções antigas do banco**: `enviar_avaliacao` e `registrar_email_cupom` já estão fechadas para o público (conferido em 24/11). Recomendação de tamanho: `src/lib/size-recommendation.ts` com `AMPLE_EASE` em `src/lib/body-model.ts` (10 cm de folga no busto).
- **Cupom de primeira compra**: recusa o e-mail que já tem pedido pago, separado, enviado ou entregue.
- **Admin**: `src/app/admin/` (`dono.ts` confere o dono em cada ação; `pedidos-acoes.ts`, `pedidos-admin.tsx`, `cupons-admin.tsx`, `lista-acoes.ts`).
- **Personalizador**: ver `docs/PERSONALIZADOR.md` (compra em `public/personalizador/js/meranno-compra.js`, rotas `/api/estampa/envio` e `/api/estampa/registrar`).
- **Pré-venda**: `src/proxy.ts`, `src/lib/pre-venda.ts`, `src/lib/pre-venda-lista.ts` (lista e pedidos de acesso, tabela `pre_venda_pedidos`), `src/app/pre-venda/`, `src/components/entrada-pre-venda.tsx`. A `/em-breve` e a `/pre-venda` precisam continuar dinâmicas.
- **Sem uso**: a tabela `convites_pre_venda` e a função `usar_convite_pre_venda` (primeiro modelo da pré-venda) e `src/lib/estampa-schema.ts` (Personalizador anterior). Podem ser apagadas.
- **Recortes das camisetas e cartas do topo**: `public/imagens/merano-assets/recortes/` (as cartas são os `*-carta.webp`). A vitrine lê `src/lib/shirt-stories.ts`; o topo, `src/components/hero-topo.tsx`.
