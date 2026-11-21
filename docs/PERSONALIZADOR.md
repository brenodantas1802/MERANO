# Personalizador MERANNO

Desde 15/11/2026 o Personalizador do site é o protótipo do programador da equipe, com o código dele sem alterações de lógica. Original e editor: https://meranno-personalizador-spina.shimojofamilia.chatgpt.site (`/editar`). Documentação dele: `LEIA-ME-PRIMEIRO.md` e `README.md` da entrega.

## Onde está cada parte

| Parte | Onde |
|---|---|
| Página (HTML, CSS, JS e imagens dele) | `public/personalizador/` |
| Servidor dele (OpenRouter, aprovação assinada, criações salvas) | `src/lib/personalizador/worker/` |
| Endereço da API no site | `src/app/api/personalizador/[...rota]/route.ts` (`/api/personalizador/chat` chega ao `/api/chat` dele) |
| Página do site | `src/app/personalizar-estampa/page.tsx`: cabeçalho do site e o personalizador num iframe |
| Visual do site sobre o dele | `public/personalizador/css/meranno-site.css` (só estilos) |

Todos os arquivos copiados conferem com o SHA-256 do `MANIFESTO-ARQUIVOS.json` dele, exceto estas mudanças de encaixe:

- `js/ai-client.js` e `js/creations-client.js`: a API passou de `/api/...` para `/api/personalizador/...` (o site já usa `/api/generate` no provador).
- `worker/creations.js`: os dois `import` apontam para `public/personalizador/js/`.
- `index.html`: duas linhas a mais, uma carrega `css/meranno-site.css` e a outra `js/meranno-compra.js` (a última do arquivo).

## O que a rota do site acrescenta

- A chave da OpenRouter do servidor (o botão "Conectar OpenRouter" some): `PERSONALIZADOR_OPENROUTER_API_KEY` quando existe (saldo próprio do Personalizador), senão a `OPENROUTER_API_KEY` do provador.
- Limite por cliente, como no personalizador anterior: 40 mensagens e 4 gerações a cada 10 minutos.
- Remove o cabeçalho `oai-authenticated-user-id` vindo do visitante: no servidor dele esse cabeçalho vale como conta logada.
- `maxDuration = 300`: a geração da imagem pode levar até 4 minutos.

## Comprar a peça (desde 21/11/2026)

Arquivo da loja, fora da entrega dele: `public/personalizador/js/meranno-compra.js`. Ele não muda nenhum arquivo do programador; só usa o que ele já expõe (`MerannoStudio`, `MerannoProduction.build`, `MERANNO.colorById`).

1. **Botões**: "Comprar esta peça · R$ 189" na barra de cima (no celular, fixo embaixo da tela) e no chat, no lugar de "Baixar para produção". Fica apagado enquanto não há estampa.
2. **Tamanho**: P, M, G, GG ou XXG (os mesmos que a ficha de produção aceita).
3. **Arquivos**: `MerannoProduction.build` gera a arte a 300 DPI no tamanho da prévia, a marca do peito e os mockups. A arte vai direto do navegador para o Storage (`estampas`) por links de envio de uso único, criados pelo servidor em `/api/estampa/envio` (a arte passa dos 4,5 MB que uma requisição ao site aceita). Se a arte a 300 DPI passar de 25 MB, vai a original e a ficha avisa para ampliar na confecção.
4. **Registro**: `/api/estampa/registrar` grava a criação (`criacoes_estampa`, status `no_carrinho`) com a chave secreta e devolve o id.
5. **Carrinho**: o iframe manda `{ tipo: "meranno:carrinho", item }` para a página (`src/app/personalizar-estampa/personalizador-frame.tsx`), que confere a origem e põe no carrinho com uma miniatura.
6. **Pedido**: `/api/pedidos` cobra `PRECO_PERSONALIZADA` (`src/lib/estampa.ts`) e marca a criação como `pedida`, com o número do pedido e o cliente. No `/admin`, "Estampas criadas" mostra o mockup e os links da arte 300 DPI, da marca e dos mockups.

O visual fica em `css/meranno-site.css` (só estilos). Ali também ficam escondidos, para o cliente: "Salvar na conta" e "Minhas criações" (dependem da hospedagem dele), os dois "Baixar para produção" (o pacote vai para a equipe com o pedido) e o custo de cada imagem gerada.

Desde 21/11 o banco não aceita mais gravações anônimas de estampas: as funções `registrar_criacao` e `marcar_criacoes_pedidas` só rodam com a chave secreta, e o envio direto ao bucket sem link assinado foi fechado.

Testado em 21/11/2026 no computador e no celular: estampa da casa e estampa gerada pela IA (conversa → revisão → aprovação → prévia em 19 s, US$ 0,04) → comprar → carrinho → pagamento → pedido.

## Pendências

- **Salvar na conta / Minhas criações**: o servidor dele usa D1 e R2 (hospedagem dele). Aqui não existem; os botões estão escondidos e o rascunho continua salvo no aparelho (IndexedDB). Para ligar: adaptar `DB`/`BUCKET` ao Supabase e passar o id do usuário logado no lugar do cabeçalho.
- Para atualizar com uma versão nova do programador: copiar de novo `public/` e `worker/`, conferir com o manifesto e refazer as mudanças de encaixe acima (as duas linhas do `index.html` inclusive).
