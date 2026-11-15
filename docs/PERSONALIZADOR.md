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
- `index.html`: uma linha a mais carrega `css/meranno-site.css`.

## O que a rota do site acrescenta

- A chave `OPENROUTER_API_KEY` do servidor (o botão "Conectar OpenRouter" some).
- Limite por cliente, como no personalizador anterior: 40 mensagens e 4 gerações a cada 10 minutos.
- Remove o cabeçalho `oai-authenticated-user-id` vindo do visitante: no servidor dele esse cabeçalho vale como conta logada.
- `maxDuration = 300`: a geração da imagem pode levar até 4 minutos.

## Pendências

- **Salvar na conta / Minhas criações**: o servidor dele usa D1 e R2 (hospedagem dele). Aqui não existem, então a resposta é "O salvamento na conta está sendo ativado"; o rascunho continua salvo no aparelho (IndexedDB). Para ligar: adaptar `DB`/`BUCKET` ao Supabase e passar o id do usuário logado no lugar do cabeçalho.
- **Comprar a peça**: o protótipo ainda não tem tamanho, preço nem carrinho (está no roteiro dele). As rotas `/api/estampa/salvar` e `/api/estampa/pedido` do personalizador anterior continuam no site para essa ligação.
- Para atualizar com uma versão nova do programador: copiar de novo `public/` e `worker/`, conferir com o manifesto e refazer as três mudanças de encaixe acima.
