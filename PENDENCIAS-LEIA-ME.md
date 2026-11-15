# MERANNO: o que fazer quando estiver no computador

Lista do que ficou pendente, em ordem de prioridade, com o passo a passo de cada item.
Todo o trabalho está no GitHub, no branch `claude/virtual-taster-openrouter-89fmt8`, **PR #1**: https://github.com/brenodantas1802/MERANO/pull/1

Prévia das telas: https://claude.ai/artifact/QKt6Ave9X9MDecRgX49GTR
Relatório da pesquisa: https://claude.ai/artifact/FFUKDzoUfWuKGEU7ESJJyP

> Dica: em cada item, você pode abrir o Claude Code no projeto e dizer "faça o item X do PENDENCIAS-LEIA-ME.md".

---

## ⚠️ Antes de tudo: o pagamento do site é simulado

Hoje a tela de pagamento **não cobra nada e não guarda o pedido em lugar nenhum**.
- Ela espera 2 segundos e mostra "Pix aprovado" ou "Cartão aprovado".
- O pedido fica salvo só no navegador do próprio cliente.

Se o site estiver aberto ao público, um cliente pode achar que pagou sem ter pago, e vocês não ficam sabendo do pedido.

**O que fazer (escolha um):**
- **A. Provisório:** trocar o fim da compra por "Enviar pedido pelo WhatsApp". Isso abre uma conversa com os itens já escritos, e o pagamento é combinado com a equipe.
- **B. Definitivo:** integrar um meio de pagamento (Mercado Pago, Pagar.me, Stripe etc.) e salvar os pedidos no Supabase. Exige uma conta no meio de pagamento escolhido.

Peça ao Claude: "implemente a opção A (ou B) do aviso de pagamento".

---

## 1. Publicar o site com todas as mudanças

**1.1 Mesclar o PR**
1. Abra https://github.com/brenodantas1802/MERANO/pull/1
2. Toque em **Merge pull request** e depois em **Confirm merge**.

**1.2 Publicar na Vercel**

O projeto da Vercel **não está ligado ao GitHub**, então mesclar não publica sozinho. Escolha um caminho:

- **Caminho A, ligar a Vercel ao GitHub (recomendado, uma vez só):**
  1. Na Vercel, abra o projeto **merano** e vá em **Settings → Git → Connect Git Repository**.
  2. Escolha GitHub e o repositório **brenodantas1802/MERANO**. Se o GitHub pedir autorização, aceite.
  3. Confira que a **Production Branch** é `main`.
  4. A partir daí, cada mesclagem no `main` publica o site, e cada PR ganha um link de prévia.
- **Caminho B, publicar pelo terminal:**
  ```bash
  git checkout main
  git pull
  npm install
  npx vercel --prod
  ```
  Na primeira vez, `npx vercel` pede login e pergunta qual projeto usar: escolha **merano** do time **brenodantas1802-2440's projects**.

**1.3 Se algo der errado:** na Vercel, vá em **Deployments**, abra a versão anterior e use **Promote to Production** (ou **Instant Rollback**).

## 2. Variáveis na Vercel (Settings → Environment Variables → Production)

| Variável | Situação | Para quê |
|---|---|---|
| `OPENROUTER_API_KEY` | já existe | IA do provador e do Personalizador |
| `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | já existem | Banco e login |
| `OWNER_EMAILS` | já existe | Quem entra em `/admin` |
| `SUPABASE_SECRET_KEY` | **falta** | Ver em `/admin` as estampas criadas e os e-mails do cupom |
| `NEXT_PUBLIC_CLARITY_ID` | **opcional** | Liga o mapa de calor (ver item 6) |

**Como pegar a `SUPABASE_SECRET_KEY`:**
1. No Supabase, abra o projeto **MERANO** e vá em **Project Settings → API Keys**.
2. Copie a chave **secret**.
3. Cadastre na Vercel com o nome `SUPABASE_SECRET_KEY`, só em **Production**.
4. Publique de novo.

**Nunca** coloque essa chave no código nem no chat.

Sem ela, as estampas continuam salvas e visíveis no Supabase, em **Table Editor → criacoes_estampa** e **Storage → estampas**.

## 3. Testar o Personalizador com a IA de verdade

**Já testado aqui (15/11), com a IA simulada:** a página abre no celular, a estampa da casa é usada, o chat e a conferência levam o painel e a ficha certos, a arte vai para o verso, a criação é salva no Supabase e, depois do pagamento, fica **pedida** com o número do pedido. Os dados do teste foram apagados.
- Sobrou só o arquivo de teste `604cfb35-af8a-414e-b11d-f08389376418.png` em **Storage → estampas** (um quadrado vinho escrito TESTE). Pode apagar pelo painel do Supabase.
- Ponto a conferir: no teste, trocar a cor da escrita no painel **não mudou** a prévia da frente. Pode ser só o teste ter clicado no botão errado; confira no teste 2.

**Falta, porque precisa da IA de verdade (só existe na Vercel):** a qualidade das respostas, a recusa de marcas e o uso das referências. Siga `docs/TESTES-PERSONALIZADOR.md` depois de publicar.
Se algo falhar: Vercel → projeto **merano** → **Logs**, filtrando por `/api/estampa`.

## 4. Aviso de cupom de 10% ✅ feito

- O e-mail só é guardado se a pessoa marcar a caixa de consentimento. Fica no Supabase, tabela `cadastros_cupom`.
- A lista aparece em `/admin` (precisa da `SUPABASE_SECRET_KEY`). **O envio do cupom é manual:** vocês mandam o código para cada e-mail.
- Se o aviso de cookies estiver ligado, o do cupom só aparece depois dele, para não abrir dois avisos juntos.

## 5. Decisões de negócio (o código já está pronto para receber)

| Decisão | Onde mudar |
|---|---|
| ~~Preço da personalizada~~: **decidido, fica R$ 189** | `src/lib/estampa.ts` → `PRECO_PERSONALIZADA` |
| ~~Frete grátis~~: **decidido, sem frete grátis** (a barra continua desligada) | `src/components/cart-drawer.tsx` → `FRETE_GRATIS_ACIMA` |
| Cores de malha disponíveis de verdade | `src/lib/estampa.ts` → `CORES_MALHA` |
| Estampas da casa (hoje 3; o protótipo tinha 6) | Coloque as imagens em `public/imagens/merano-assets/ilustracoes/` e adicione em `ESTAMPAS_CASA` (`src/lib/estampa.ts`) |
| Ordem da vitrine "Mais desejadas" (hoje é a do catálogo; o ideal é pelas mais vendidas) | `src/app/page.tsx` → `products.slice(0, 8)` |

## 6. Melhorias que a pesquisa indicou

- ✅ **Visual do pagamento:** campos, cartões de entrega e pagamento, resumo e botão no visual Salão (vinho e latão). O pagamento continua **simulado** (ver o aviso no topo).
- ✅ **Ondas do rodapé:** agora em latão, vinho e nogueira.
- ✅ **Avaliações de clientes:** na página de cada produto. A avaliação só aparece depois de aprovada por vocês. Para aprovar, enquanto não houver tela no `/admin`:
  1. Supabase → **Table Editor → avaliacoes**.
  2. Na avaliação, troque `status` de `pendente` para `aprovada` (ou `recusada`).
  - Nunca inventar avaliações; peçam a quem já comprou.
- ✅ **Mapa de calor (Microsoft Clarity), com aviso de cookies:** pronto e **desligado** até vocês cadastrarem o código.
  1. Crie a conta grátis em clarity.microsoft.com e um projeto para o site.
  2. Copie o **ID do projeto** (uma sequência curta de letras e números).
  3. Na Vercel, cadastre `NEXT_PUBLIC_CLARITY_ID` com esse ID, em **Production**, e publique de novo.
  4. Aparece o aviso de cookies; o Clarity só carrega para quem tocar em **Aceitar**.
  5. Recomendo deixar o mascaramento de dados do Clarity no modo mais restrito, para não gravar o que é digitado no pagamento. Confira o nome exato da opção nas configurações do Clarity; não verifiquei.
- **Menos escolhas no Personalizador:** esconder a paleta livre e as referências atrás de "Mais opções". Foi mantido igual ao protótipo de propósito; mudar só se vocês quiserem.

## 7. Topo e imagens

- O topo agora é o **ás gigante** fixo, no celular e no computador.
- **Pendente:** buscar fotos reais com licença livre para uso comercial (feltro, fichas, cartas, praia), caso queiram fotos junto com o ás. Pedir ao Claude: "busque fotos com licença livre para o topo".
- Algumas fotos de produto e a foto da etiqueta ainda mostram **MERANO** impresso. Precisam ser fotos novas.

## 8. Marca: endereços que ainda usam MERANO

- Instagram `@meranoclothing` e e-mail `equipe@merano.com` continuam com o nome antigo de propósito, porque são endereços reais.
- Se mudarem o Instagram ou o e-mail, atualize em:
  - `src/components/whatsapp-button.tsx` (Instagram);
  - `src/app/privacidade/page.tsx` (e-mail).

## 9. Provador (por último, como combinado)

A pesquisa mostra que o maior ganho do provador é ajudar a **acertar o tamanho**. A ideia combinada é permitir "provar no corpo" a peça criada no Personalizador. Pedir ao Claude quando chegar a hora.

## 10. Segurança (opcional, rápido)

O Supabase avisa que a **proteção contra senhas vazadas** está desligada.
- Para ligar: **Authentication → Providers → Email → Leaked password protection**. O nome do menu pode variar.
- O mesmo painel mostra um aviso sobre as duas funções do Personalizador (`registrar_criacao` e `marcar_criacoes_pedidas`). Esse aviso é **esperado**: as funções são públicas de propósito e só permitem gravar uma criação nova e marcá-la como pedida.

---

### Onde está cada coisa
- Código do Personalizador: `src/app/personalizar-estampa`, `src/components/personalizador`, `src/lib/estampa.ts`, `src/app/api/estampa`
- Como o Personalizador funciona: `docs/PERSONALIZADOR.md`
- Testes: `docs/TESTES-PERSONALIZADOR.md`
- Pesquisa de uso: `docs/PESQUISA-UX.md`
