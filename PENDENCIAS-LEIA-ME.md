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
| `SUPABASE_SECRET_KEY` | **falta** | Ver as estampas criadas em `/admin` |

**Como pegar a `SUPABASE_SECRET_KEY`:**
1. No Supabase, abra o projeto **MERANO** e vá em **Project Settings → API Keys**.
2. Copie a chave **secret**.
3. Cadastre na Vercel com o nome `SUPABASE_SECRET_KEY`, só em **Production**.
4. Publique de novo.

**Nunca** coloque essa chave no código nem no chat.

Sem ela, as estampas continuam salvas e visíveis no Supabase, em **Table Editor → criacoes_estampa** e **Storage → estampas**.

## 3. Testar o Personalizador com a IA de verdade

Siga `docs/TESTES-PERSONALIZADOR.md`. São 5 testes, com o que conferir em cada um.
Se algo falhar: Vercel → projeto **merano** → **Logs**, filtrando por `/api/estampa`.

## 4. Aviso de cupom de 10% (promete e não entrega)

O aviso diz "seu cupom chega no e-mail", mas o e-mail é guardado só no navegador do cliente e nunca chega até vocês.

Escolha uma:
- **A.** Salvar os e-mails no Supabase (tabela nova) e mostrar a lista em `/admin` para vocês enviarem os cupons. Precisa de um texto de consentimento por causa da LGPD.
- **B.** Mudar o texto para não prometer envio, por exemplo mostrando um código de cupom fixo na hora.
- **C.** Desligar o aviso.

Arquivo: `src/components/first-purchase-popup.tsx`.

## 5. Decisões de negócio (o código já está pronto para receber)

| Decisão | Onde mudar |
|---|---|
| Preço da camiseta personalizada (hoje R$ 189; a pesquisa indica que pode ser maior) | `src/lib/estampa.ts` → `PRECO_PERSONALIZADA` |
| Frete grátis a partir de quanto (a barra está pronta e desligada) | `src/components/cart-drawer.tsx` → `FRETE_GRATIS_ACIMA` (troque `null` pelo valor, ex.: `399`) |
| Cores de malha disponíveis de verdade | `src/lib/estampa.ts` → `CORES_MALHA` |
| Estampas da casa (hoje 3; o protótipo tinha 6) | Coloque as imagens em `public/imagens/merano-assets/ilustracoes/` e adicione em `ESTAMPAS_CASA` (`src/lib/estampa.ts`) |
| Ordem da vitrine "Mais desejadas" (hoje é a do catálogo; o ideal é pelas mais vendidas) | `src/app/page.tsx` → `products.slice(0, 8)` |

## 6. Melhorias que a pesquisa indicou e ficaram para depois

- **Visual do pagamento:** é a página menos trabalhada. Aplicar vidro, pílulas e a paleta, como no resto do site.
- **Avaliações de clientes:** criar a seção e pedir avaliação a quem já comprou. Nunca inventar avaliações.
- **Mapa de calor dos cliques** (Microsoft Clarity, gratuito, ou Vercel Analytics):
  1. Crie a conta e pegue o código de instalação.
  2. Peça ao Claude para instalar **com aviso de consentimento** (LGPD).
- **Ondas azuis do rodapé:** ainda são do tema de mar. Trocar para vinho e latão (`src/components/site-footer.tsx`).
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
