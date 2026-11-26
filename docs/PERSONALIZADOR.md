# Personalizador MERANNO

Desde 15/11/2026 o Personalizador do site é o protótipo do programador da equipe, como base; o fluxo de criação, a moderação e o editor foram evoluídos pela loja em 24/11/2026. Original e editor: https://meranno-personalizador-spina.shimojofamilia.chatgpt.site (`/editar`). Documentação dele: `LEIA-ME-PRIMEIRO.md` e `README.md` da entrega.

## Onde está cada parte

| Parte | Onde |
|---|---|
| Página (HTML, CSS, JS e imagens dele) | `public/personalizador/` |
| Servidor dele (OpenRouter, aprovação assinada, criações salvas) | `src/lib/personalizador/worker/` |
| Endereço da API no site | `src/app/api/personalizador/[...rota]/route.ts` (`/api/personalizador/chat` chega ao `/api/chat` dele) |
| Página do site | `src/app/personalizar-estampa/page.tsx`: cabeçalho do site e o personalizador num iframe |
| Visual do site sobre o dele | `public/personalizador/css/meranno-site.css` (só estilos) |

A entrega original é a referência histórica. O manifesto não descreve mais os arquivos modificados pela loja. As primeiras adaptações foram:

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
2. **Tamanho**: P, M ou G.
3. **Arquivos**: `MerannoProduction.build` gera a arte a 300 DPI no tamanho da prévia, a marca do peito e os mockups. A arte vai direto do navegador para o Storage (`estampas`) por links de envio de uso único, criados pelo servidor em `/api/estampa/envio` (a arte passa dos 4,5 MB que uma requisição ao site aceita). Se a arte a 300 DPI passar de 25 MB, vai a original e a ficha avisa para ampliar na confecção.
4. **Registro**: `/api/estampa/registrar` grava a criação (`criacoes_estampa`, status `no_carrinho`) com a chave secreta e devolve o id.
5. **Carrinho**: o iframe manda `{ tipo: "meranno:carrinho", item }` para a página (`src/app/personalizar-estampa/personalizador-frame.tsx`), que confere a origem e põe no carrinho com uma miniatura.
6. **Pedido**: `/api/pedidos` cobra `PRECO_PERSONALIZADA` (`src/lib/estampa.ts`) e marca a criação como `pedida`, com o número do pedido e o cliente. No `/admin`, "Estampas criadas" mostra o mockup e os links da arte 300 DPI, da marca e dos mockups.

O visual fica em `css/meranno-site.css` (só estilos). Ali também ficam escondidos, para o cliente: "Salvar na conta" e "Minhas criações" (dependem da hospedagem dele), os dois "Baixar para produção" (o pacote vai para a equipe com o pedido) e o custo de cada imagem gerada.

Desde 21/11 o banco não aceita mais gravações anônimas de estampas: as funções `registrar_criacao` e `marcar_criacoes_pedidas` só rodam com a chave secreta, e o envio direto ao bucket sem link assinado foi fechado.

Testado em 21/11/2026 no computador e no celular: estampa da casa e estampa gerada pela IA (conversa → revisão → aprovação → prévia em 19 s, US$ 0,04) → comprar → carrinho → pagamento → pedido.

## Criação, posicionamento e revisão (24/11/2026)

- Chat de direção artística: GPT-4.1, configurável por OPENROUTER_CHAT_MODEL. Uma direção completa já pode ir para revisão na primeira mensagem; contexto, texto literal e correções são preservados. É uma integração própria via OpenRouter, não os componentes internos do produto ChatGPT.
- O servidor envolve todo prompt de imagem em regras fixas: somente arte, canal alfa, sem camiseta, corpo, tecido ou mockup. Referências de camisetas servem para extrair a arte; não viram outra peça sobreposta. Uma avaliação visual independente bloqueia retornos com mockup. O navegador confere transparência antes de aplicar a imagem.
- Frente, costas e marca têm layouts independentes em cm. Arrastar, setas e controles de tamanho usam a mesma área de 36 × 45 cm; os arquivos guardam posições e escalas. A mesma arte pode ser aplicada na frente e nas costas com tamanhos diferentes.
- Marca frontal: nome MERANNO ou PNG transparente enviado. A logo é preservada no rascunho e enviada como arquivo separado, sem ser redesenhada pela IA. A logo oficial precisa ser fornecida pelo responsável; não foi inventado um símbolo substituto.
- Moderação independente em texto, referências, upload, revisão editada, geração e nos arquivos efetivamente salvos no Storage antes do registro do pedido. Bloqueia ódio/discriminação, extremismo, sexual explícito/genitais, violência gráfica, incentivo a crimes/exploração e reprodução sem autorização. A explicação inclui uma direção segura. Falha de verificação bloqueia a liberação; detecção por IA não é garantia de conformidade legal.
- /api/personalizador/moderate tem limite de 12 verificações por cliente a cada 10 minutos. As credenciais continuam somente no servidor.
- Todo registro recebe ficha.revisao.humana=pendente no servidor. No painel, um responsável autenticado precisa marcar que conferiu os arquivos e aprovar ou recusar a arte. A revisão guarda responsável e data; não marca pagamento, não inicia produção e não envia arquivos. A produção continua manual e a decisão humana é obrigatória.
- Não há migração de banco: layouts, tipo da marca e revisão usam os campos JSON painel/ficha existentes. Não reenviar a antiga entrega por cima destes arquivos sem reconciliar as alterações.
- Testes: node --test tests/personalizador-*.test.mjs (moderação, arte isolada, assinatura da aprovação, origem, persistência e posicionamento).

## Pendências

- **Salvar na conta / Minhas criações**: o servidor dele usa D1 e R2 (hospedagem dele). Aqui não existem; os botões estão escondidos e o rascunho continua salvo no aparelho (IndexedDB). Para ligar: adaptar `DB`/`BUCKET` ao Supabase e passar o id do usuário logado no lugar do cabeçalho.
- Para atualizar com uma versão nova do programador: copiar de novo `public/` e `worker/`, conferir com o manifesto e refazer as mudanças de encaixe acima (as duas linhas do `index.html` inclusive).

## Direção artística por referências (24/11/2026)

A skill do projeto fica em `.agents/skills/meranno-direcao-estampas/`. Seu guia visual interpreta as 25 referências da equipe sem publicar as imagens no site. O comportamento em produção é carregado de `src/lib/personalizador/worker/art-direction.js`: briefing acumulativo, sugestões contextuais, convite opcional a referências e até 3 perguntas úteis por rodada, sem mínimo obrigatório. Pedidos completos ou escolhas delegadas vão para revisão; uma palavra como “gerar” num pedido vago não encerra a conversa sozinha. Alterar a ideia pode iniciar outra rodada de refinamento.

O briefing guarda tema, estilo, cores, composição, texto, uso das referências, itens a preservar/evitar e suposições, inclusive ao retomar um rascunho. O formato da imagem acompanha a composição, em vez de ser sempre vertical. A lista de proporções foi conferida no endpoint público de capacidades do modelo: https://openrouter.ai/api/v1/images/models/openai/gpt-image-2.5-sunburst/endpoints. Referências de outras lojas podem orientar uma linguagem autoral, mas não autorizam reproduzir marcas ou estampas identificáveis.


## Editor manual e enquadramento

A navegação agora prioriza Adicionar, Editar, Sua criação e Criar com IA. Frente/costas alternam uma prévia grande. A paleta de tintas foi retirada da interface; cor só aparece para texto selecionado. Barlow e Barlow Condensed acompanham as fontes da loja, com vinho, latão e superfícies claras.

A posição inicial usa os pixels visíveis e preserva a proporção em até 32 × 36 cm dentro da área de 36 × 45 cm. Novas artes são centralizadas no eixo horizontal, com margem superior mínima de 2 cm dentro da área imprimível. Não se trata de distância física garantida da gola: confirmar o gabarito com a confecção. Artes existentes preservam ajustes salvos.

O editor guarda até 12 camadas de imagem PNG ou texto. Largura, rotação e centro em cm são ajustáveis, com limites que consideram a caixa girada; há duplicação, ocultação, ordenação, exclusão e 20 passos de desfazer/refazer por sessão. A alça redimensiona proporcionalmente e o arraste move a camada selecionada. Textos novos/editados e imagens passam pela moderação; transformações preservam o conteúdo. As camadas são compostas em um único PNG transparente para o fluxo de produção existente. Rascunhos guardam os dados editáveis por allowlist; histórico de desfazer fica só na sessão.

O nome frontal MERANNO é fixado no estado da loja, inclusive ao restaurar rascunhos antigos. Camadas manuais editam as costas; as escolhas de frente/ambas do fluxo IA continuam disponíveis para a arte principal, sem alterar a marca fixa. Nenhuma estampa é produzida sem revisão humana.


## Refinamento de navegação e modelagens — 25/11/2026

Esta revisão substitui a marca frontal obrigatória: o controle “Mostrar MERANNO na frente” e o botão na lista de elementos permitem mostrar/ocultar a marca. A escolha é preservada em rascunhos e ao aplicar estampas da casa.

Regular oferece as nove cores cadastradas; Oversized oferece off white, preto, marinho, army e marrom; Boxy acrescenta chumbo estonada a essas cinco. Ao trocar o corte, uma cor incompatível é substituída por uma disponível e a interface avisa. A restauração agora recupera o corte salvo, sem forçar Regular.

A Paleta da malha abre/fecha as cores da modelagem atual e nunca recolore a estampa. A paleta do texto pertence ao elemento selecionado e é aplicada pelo formulário de edição; imagens preservam suas cores. Estampas da casa têm apenas navegação livre, com setas e deslize horizontal; aplicar uma arte preserva corte e malha escolhidos.

Branco/gelo e o degradê fosco `season-wash` do carrinho substituem os painéis bege. A interface usa Barlow/Barlow Condensed; opções da camiseta e adição manual permanecem disponíveis. Cada corte tem enquadramento inicial próprio para preservar mangas, gola e barra.


## Interface simplificada — marca obrigatória

Substitui as decisões anteriores de marca opcional e quatro abas: ficam somente Sua criação e Criar com IA. O nome ou a logo oficial são escolhas exclusivas, sempre com uma ativa. Enquanto a logo oficial não for fornecida, somente o nome fica habilitado. `MERANNO.BRAND_LOGO` em garments.js é o ponto de configuração da futura logo oficial; não há upload de marca pelo cliente. A assinatura usa deslocamento horizontal de 10,5 cm, antes 8 cm, na mesma referência da produção. Rascunhos antigos sem marca são migrados.

A edição prioriza clicar e arrastar, redimensionar pela alça, aumentar/diminuir, centralizar e excluir. Campos de posição, largura e rotação e o painel técnico de impressão não são mostrados ao cliente. Camadas manuais têm alvos individuais sobre a camiseta e prévia durante o movimento. A restrição de 36 × 45 cm já existia no código e permanece como limite conservador; não foi confirmada como especificação do fornecedor. Para deslocamentos maiores, reduza a arte pelos controles simples, sem ultrapassar automaticamente costuras ou barras.


## Edição direta de texto e exclusão

Delete e Backspace, fora de campos de digitação e diálogos, removem apenas a camada selecionada; estampas únicas podem ser apagadas por inteiro sem restaurar preferências. A exclusão participa do histórico de desfazer/refazer. Em frente/costas, uma arte principal aplicada em ambos preserva o outro lado. A marca frontal permanece obrigatória.

Textos manuais atualizam após uma breve pausa ou ao sair do campo, sem botão Salvar. Dois cliques na camada de texto da camiseta focam e selecionam o conteúdo da caixa de edição. O campo aceita ficar vazio durante uma reescrita; a camada fica oculta até receber texto novamente. Alterações de texto passam pela moderação antes de substituir a arte salva. Rejeições mantêm a última versão aprovada e mostram a explicação; a digitação continua disponível durante a atualização. Letras e detalhes embutidos em um PNG não são camadas editáveis e não são automaticamente separados.


## Abertura programada — Coming Soon

Até **7 de dezembro de 2026, às 12h de Brasília** (15:00 UTC), `/personalizar-estampa` exibe a tela Coming Soon aprovada. O instante único é `PERSONALIZADOR_ABRE_MS` em `src/lib/personalizador-lancamento.ts`. A página é dinâmica, sem congelar a decisão no build.

O componente `personalizador-abertura.tsx` renderiza números reais em React, atualizados a cada segundo. Ele sincroniza com `/api/personalizador/disponibilidade` (resposta sem cache), usa relógio monotônico durante a sessão e confirma novamente ao voltar para a aba. Ao zerar, só monta o editor após confirmação do servidor. Falha de rede mantém a tela aguardando e provoca novas tentativas; não libera antecipadamente.

O proxy redireciona o HTML direto do editor para a página oficial e bloqueia chat/geração/moderação e novos registros/envios para produção enquanto fechado. As próprias rotas de escrita repetem a verificação. O endpoint de horário continua acessível. As restrições expiram automaticamente no servidor; não é necessário um novo deploy no dia 7. A trava geral de pré-venda existente continua independente, sem ser removida por este lançamento.

Os arquivos do editor, os rascunhos do navegador e os registros salvos não foram substituídos nem apagados. O iframe não é montado enquanto fechado. Antes de publicar, executar os testes de lançamento, TypeScript/lint e verificar `/personalizar-estampa`, o redirecionamento de `/personalizador/index.html` e o 503 das APIs de criação.
