# MERANNO: o que falta fazer

Atualizado em **17/11/2026**. O site no ar (https://merano-xi.vercel.app) já tem tudo o que foi feito até agora. Esta lista é só o que depende de vocês, em ordem de prioridade, com o passo a passo de cada item.

> Dica: abra o Claude Code na pasta do site e diga "faça o item X do PENDENCIAS-LEIA-ME.md".

Links úteis:
- Opções do topo e antes/depois da rodada 2: https://claude.ai/artifact/95NRWaUtmySMzCogGxKrbk
- Antes/depois da rodada 1: https://claude.ai/artifact/14rXsCZ4TE39SsZnkKAPmy

---

## ⚠️ Antes de tudo: o pagamento ainda é simulado

A tela de pagamento **não cobra nada e não guarda o pedido em lugar nenhum**. Ela espera 2 segundos e mostra "Pix aprovado" ou "Cartão aprovado". O pedido fica salvo só no navegador do cliente.

Se vocês ligarem a pré-venda antes de resolver isso, quem entrar pode achar que comprou sem ter pago, e vocês não ficam sabendo do pedido. Veja o **item 8**.

---

## 1. Ligar o cadeado da pré-venda

Com o cadeado ligado, quem não está na lista vê só "Coming soon" em qualquer página. Hoje ele está **desligado** porque faltam duas variáveis na Vercel (o Claude não tem permissão para cadastrar segredos lá).

1. Abra a Vercel, entre no projeto **merano** e vá em **Settings → Environment Variables**.
2. Cadastre, marcando só **Production**:
   - **`SUPABASE_SECRET_KEY`**: a chave secreta do Supabase. Dois jeitos de pegar:
     - no Supabase, projeto **MERANO** → **Project Settings → API Keys** → copie a chave **secret**; ou
     - no arquivo `.env.local` da pasta do site, copie o que vem depois de `SUPABASE_SECRET_KEY=`.
     Sem essa chave o cadeado não liga, a lista de autorizados não funciona e o `/admin` não mostra estampas nem cupons. **Nunca** coloque essa chave no código, no chat ou no WhatsApp.
   - **`PRE_VENDA`** com o valor **`1`**.
3. Vá em **Deployments**, abra os três pontinhos da publicação mais recente e toque em **Redeploy**. Variável nova só vale depois de publicar de novo. Se preferir, peça ao Claude: "publique o site de novo".
4. Teste numa **janela anônima**: o site tem que mostrar "Coming soon" com o cadeado.

## 2. Liberar os sócios

Os cinco donos (os e-mails em `OWNER_EMAILS`) já estão liberados. Cada um faz uma vez em cada aparelho:

1. Abrir **https://merano-xi.vercel.app/pre-venda**.
2. Tocar em **Continuar com Google** com o Gmail de dono.
3. Tocar em **Abrir o cadeado**. O cadeado abre e o site aparece pela fechadura em forma de espada.

## 3. Montar a lista e mandar o link no grupo

1. Entre em **https://merano-xi.vercel.app/admin** com o Google. A primeira seção é **"Quem pode entrar"**.
2. No campo grande, cole as pessoas, **uma por linha**, com e-mail ou WhatsApp. O nome é opcional. Exemplos que funcionam:
   ```
   Ana Souza, 11 98765-4321
   pedro@gmail.com
   Mateus - (21) 99999-0000 - mateus@hotmail.com
   ```
3. Toque em **Adicionar à lista**. Quem já estava é ignorado, e as linhas sem e-mail nem número aparecem num aviso.
4. A lista mostra quem **já entrou** e quem **ainda não entrou**. O **X** tira a pessoa da lista.
5. Toque em **Copiar link** e mande no grupo. Sugestão de mensagem:
   > Pré-venda da Meranno aberta só pra este grupo. Entra por aqui: merano-xi.vercel.app/pre-venda
   > Use o Google ou crie sua conta com o mesmo e-mail ou WhatsApp que está aqui no grupo.

**O que a pessoa do grupo faz:**
1. Abre o link e entra com o **Google** ou toca em **Criar conta** (nome, e-mail, senha e WhatsApp).
2. Se o e-mail ou o WhatsApp do cadastro estiver na lista, aparece **"Você está na lista"** → **Abrir o cadeado**.
3. Se não estiver, o site pede o **WhatsApp que está no grupo**. Com o número certo, libera.
4. A conta fica liberada **para sempre**. Em outro celular ou computador, é só entrar com a mesma conta pelo mesmo link.

## 4. Conferir o e-mail de confirmação (antes de mandar o link)

Quem cria conta com e-mail (sem Google) recebe um e-mail para confirmar a conta. Em outubro ficou combinado mandar esses e-mails pelo Gmail da Meranno (`Servico.merano@gmail.com`). **Ninguém confirmou se isso foi salvo.** Sem isso, o Supabase só manda e-mail para a própria equipe, e o pessoal do grupo nunca recebe a confirmação.

1. Supabase → projeto **MERANO** → **Authentication** → configurações de e-mail / **SMTP**. O nome do menu pode variar.
2. Confira se o SMTP próprio está ligado, com o Gmail e a senha de app.
3. Teste: crie uma conta em `/conta/criar` com um e-mail que **não** seja de nenhum sócio e veja se o e-mail chega.

Enquanto isso não estiver confirmado, peça para o pessoal entrar com o **Google**.

## 5. Desligar o cadeado no lançamento aberto

Na Vercel, apague a variável `PRE_VENDA` (ou troque para `0`) e faça **Redeploy**. O site volta a abrir para todo mundo, e a lista fica guardada.

## 6. Botão "Quero entrar no grupo" (opcional)

A tela "Coming soon" pode ter um botão que leva para o grupo do WhatsApp. Para ligar, cadastre na Vercel **`PRE_VENDA_GRUPO_URL`** com o link de convite do grupo e faça **Redeploy**.

## 7. Frete de verdade pela SuperFrete

Hoje o carrinho e o pagamento mostram o frete com **valores de exemplo** (aparece escrito "valores de exemplo"). Para virar o frete real:

1. Crie a conta em https://web.superfrete.com.
2. Vá em **Integrações → Desenvolvedores** e gere o **token**. Ele aparece **uma vez só**: copie na hora.
3. Na Vercel (Production), cadastre:
   - **`SUPERFRETE_TOKEN`**: o token;
   - **`FRETE_CEP_ORIGEM`**: o CEP de onde as camisetas vão sair;
   - **`SUPERFRETE_CONTATO`** (opcional): um e-mail da Meranno para contato técnico. A SuperFrete pede isso.
4. **Redeploy** e teste: ponha uma camiseta no carrinho e digite um CEP.
5. **Pesem uma camiseta embalada** e meçam o envelope. Hoje o site usa 300 g e 30 × 25 × 4 cm. Passem os números ao Claude: "o pacote da camiseta pesa X g e mede A × B × C cm".

Para testar sem gastar: a SuperFrete tem um ambiente de teste (https://sandbox.superfrete.com, com outro token). Cadastre também `SUPERFRETE_URL` = `https://sandbox.superfrete.com` e, depois do teste, apague.

O site só **calcula** o frete. Comprar e imprimir a etiqueta continua sendo pelo painel da SuperFrete.

## 8. Pagamento de verdade (Pix e cartão)

Para a pré-venda vender de verdade:
1. **Escolham o meio de pagamento.** Os mais usados no Brasil: **Mercado Pago**, **Pagar.me**, **Stripe**. Comparem taxa do Pix, taxa do cartão, prazo para cair o dinheiro e se aceita conta de pessoa física.
2. **Criem a conta** no escolhido, em nome de quem vai receber (CPF ou CNPJ).
3. Peçam ao Claude: "integre o pagamento com o [nome] e salve os pedidos no Supabase". Ele vai pedir as chaves da conta, que vão na Vercel, nunca no chat.

Enquanto isso não fica pronto, um provisório possível é trocar o fim da compra por **"Enviar pedido pelo WhatsApp"**, com os itens já escritos, e combinar o pagamento na conversa.

## 9. Decisões que estão com vocês

| Decisão | Situação |
|---|---|
| **Topo do site**: o ás de hoje ou o **Royal flush** (cartas com as 5 camisetas) | Ver a página das opções (link no começo) |
| Colocar a **Va tutto bene** na vitrine da home (ficariam as 5) | O recorte já está pronto |
| **Personalizador** continua? Ele é sob demanda por natureza | Hoje continua no site |
| **Data de envio da pré-venda** | Para escrever no site e no pagamento |
| **Tabela de medidas** nova | Um dos sócios vai mandar |
| **Fotos novas** das camisetas | As da frente foram corrigidas para MERANNO no computador; trocar pelas fotos reais quando chegarem |
| **Textos do Sobre nós** | O capítulo "O tempo é seu" está com texto provisório; outro capítulo ainda fala de "o mar no fim da rua" |
| **Vitrine que troca as camisetas** (opção B) em outra parte do site | Ideia: Categorias ou Sobre nós |

## 10. Itens antigos que continuam valendo

- **Testar o Personalizador com a IA de verdade:** siga `docs/TESTES-PERSONALIZADOR.md`. Se algo falhar: Vercel → **Logs**, filtrando por `/api/estampa`.
- **Avaliações de clientes:** só aparecem depois de aprovadas. Para aprovar: Supabase → **Table Editor → avaliacoes** → troque `status` de `pendente` para `aprovada` (ou `recusada`). Nunca inventar avaliações.
- **Mapa de calor (Microsoft Clarity, opcional):** crie o projeto em clarity.microsoft.com, cadastre `NEXT_PUBLIC_CLARITY_ID` na Vercel e faça **Redeploy**. Ele só carrega para quem aceitar os cookies.
- **Segurança:** no Supabase, ligue a proteção contra senhas vazadas (**Authentication → Providers → Email → Leaked password protection**; o nome pode variar).
- **Arquivo de teste:** em Supabase → **Storage → estampas** sobrou `604cfb35-af8a-414e-b11d-f08389376418.png` (quadrado vinho escrito TESTE). Pode apagar.
- **Nome antigo:** o Instagram `@meranoclothing` e o e-mail `equipe@merano.com` continuam com MERANO porque são endereços reais. Se mudarem, atualizar em `src/components/whatsapp-button.tsx` e `src/app/privacidade/page.tsx`.

## 11. Limites da pré-venda que é bom saber

- **O WhatsApp não é confirmado por SMS.** Alguém que saiba o número de um membro do grupo poderia usá-lo. Para limitar, cada número só libera **uma** conta.
- **Tirar alguém da lista** impede novas entradas, mas não expulsa um aparelho que já entrou.
- O acesso de cada aparelho dura até **400 dias**. Depois disso, é só entrar de novo pelo link.

---

## Todas as variáveis da Vercel (Settings → Environment Variables → Production)

| Variável | Situação | Para quê |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | já existem | Banco e login |
| `OWNER_EMAILS` | já existe | Quem entra no `/admin` e é liberado na pré-venda |
| `OPENROUTER_API_KEY` e `PERSONALIZADOR_OPENROUTER_API_KEY` | já existem | IA do Provador e do Personalizador |
| `SUPABASE_SECRET_KEY` | **falta** (item 1) | Lista da pré-venda, cadeado, estampas e cupons no `/admin` |
| `PRE_VENDA` | **falta** (item 1) | `1` liga o cadeado |
| `PRE_VENDA_GRUPO_URL` | opcional (item 6) | Botão do grupo no "Coming soon" |
| `SUPERFRETE_TOKEN` e `FRETE_CEP_ORIGEM` | **falta** (item 7) | Frete real |
| `SUPERFRETE_CONTATO`, `SUPERFRETE_URL` | opcionais (item 7) | Contato técnico e ambiente de teste |
| `NEXT_PUBLIC_CLARITY_ID` | opcional (item 10) | Mapa de calor |

Depois de cadastrar ou mudar qualquer variável: **Deployments → Redeploy**.

## Notas técnicas (para o Claude ou um programador)

- **Publicação:** a Vercel **não** publica sozinha quando o GitHub muda. Publicar com `vercel --prod --yes` a partir de um `git worktree` limpo (sem `.env.local` e sem os arquivos soltos da pasta).
- **Pré-venda:** `src/proxy.ts` tranca as páginas e lê o cookie assinado `meranno_convite`. A lógica fica em:
  - `src/lib/pre-venda.ts`: cadeado, cookie e rotas livres;
  - `src/lib/pre-venda-lista.ts`: confere a conta contra a tabela `pre_venda_autorizados`;
  - `src/app/pre-venda/`: página de entrada;
  - `src/app/admin/lista-*`: lista no painel;
  - `src/components/entrada-pre-venda.tsx`: animação.

  A `/em-breve` e a `/pre-venda` precisam continuar **dinâmicas**. Se forem pré-geradas no build, o cadeado entra em loop.
- **Tabela sem uso:** `convites_pre_venda` e a função `usar_convite_pre_venda` são do primeiro modelo (convite por código), que saiu. Têm um convite de teste e podem ser apagadas.
- **Frete:** `src/lib/frete.ts` (o pacote fica em `PACOTE_CAMISETA`), `src/app/api/frete/route.ts` e `src/lib/use-frete.ts`.
- **Recortes das camisetas:** foram feitos com o BiRefNet (`rembg`, modelo `birefnet-general-lite`). Ficam em `public/imagens/merano-assets/recortes/`, e a vitrine da home lê `src/lib/shirt-stories.ts`.
