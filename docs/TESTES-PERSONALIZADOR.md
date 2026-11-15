# Testes do Personalizador (rodar logo depois de publicar)

Rode no site publicado, de preferência no celular. Em cada teste, anote o que aconteceu e se houve erro (print da tela ajuda).
Se algo falhar, veja os erros em Vercel → projeto **merano** → **Logs** (procure por `/api/estampa`).

## Antes de começar
- [ ] A página `/personalizar-estampa` abre sem erro, no celular e no computador.
- [ ] Na Vercel existe a variável `OPENROUTER_API_KEY` no ambiente de produção (o provador usa a mesma).

## 1. Ideia simples, do começo ao fim
1. Escreva: **"Quero uma carta de baralho, sete de copas"**.
2. Responda às perguntas da IA até aparecer **"Revisar e criar a estampa"**.

Confira:
- [ ] A IA responde em português, com uma pergunta por vez.
- [ ] Aparecem sugestões de resposta (botões).
- [ ] O **esboço** aparece no verso da camiseta.
- [ ] A tela de conferência mostra ideia, elementos, estilo, cores e o pedido completo.
- [ ] **Criar estampa** gera a arte em até ~1 minuto e ela aparece no verso.
- [ ] O texto (se houver) aparece **abaixo** da arte, com a fonte escolhida, sem letras erradas.

## 2. Mudando o painel no meio da conversa
1. Escolha a malha **Off White** e adicione uma cor nova na Paleta.
2. Peça: **"use só as cores da minha paleta"**.

Confira:
- [ ] A ficha passa a usar as cores do painel.
- [ ] A escrita MERANNO da frente muda de fonte e de cor quando você troca no painel.

## 3. Com referências
1. Envie 1 a 3 imagens em **Referências** (ex.: foto de um disco, de uma carta).
2. Escreva: **"Use minhas referências como base"**.

Confira:
- [ ] A IA comenta o que aproveitou das imagens.
- [ ] Na conferência aparece a opção **"Usar minhas referências como inspiração"** marcada.
- [ ] A arte gerada lembra as referências, sem copiar marcas.

## 4. Pedido que deve ser recusado
1. Escreva: **"Quero o escudo do Flamengo"** (ou o logo de uma marca famosa).

Confira:
- [ ] A IA recusa com educação e propõe uma alternativa autoral.

## 5. Estampa da casa como base + compra
1. Em **Estampas da casa**, toque em **Usar esta estampa** (ex.: Mares tranquilos).
2. Peça uma adaptação: **"Deixe o barco em vinho e acrescente um sol"**.
3. Crie a estampa, escolha o tamanho **M** e toque em **Adicionar ao carrinho**.
4. Finalize o pagamento de teste.

Confira:
- [ ] A estampa da casa aparece no verso antes da criação.
- [ ] A sacola abre com a miniatura da arte, tamanho e preço.
- [ ] No Supabase, tabela `criacoes_estampa`: aparece a criação com status **no_carrinho** e, depois do pagamento, **pedida** com o número do pedido e o contato.
- [ ] No Supabase, Storage → pasta `estampas`: o arquivo da arte está lá.

## Limites (só para saber)
- Chat: 40 mensagens a cada 10 minutos por pessoa.
- Criar arte: 4 a cada 10 minutos por pessoa, 60 por dia; a página permite 3 criações por visita.
