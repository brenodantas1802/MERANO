# Como fizemos o site da Meranno

Registro de tudo o que foi usado para construir a loja **https://merannoclothing.com.br**: cada ferramenta, para que serve, quanto custa, onde se configura e o passo a passo, na ordem, para repetir num próximo site ou negócio. Atualizado em **24/11/2026**.

O que ainda falta fazer está em [`PENDENCIAS-LEIA-ME.md`](../PENDENCIAS-LEIA-ME.md). O mapa visual de tudo (negócios, ferramentas, custos e lições) é o Jarvis: https://claude.ai/artifact/1ogUdK5h5LddQMDwuufhpg

## As ferramentas e o que cada uma faz

| Ferramenta | Para que usamos | Custo | Onde se configura |
|---|---|---|---|
| **Claude Code** (Claude Pro) | Escreveu, testou e publicou todo o código; também mexe no banco, na Vercel e nos documentos | R$ 110/mês | App do Claude (aba Code), na pasta do projeto |
| **Next.js 16 + React 19 + Tailwind 4** | A estrutura do site: cada pasta em `src/app` é uma página; as rotas `src/app/api` são o servidor | Grátis | Código no projeto |
| **GitHub** | Guarda o código e cada versão (repositório privado `brenodantas1802/MERANO`) | Grátis | github.com |
| **Vercel** (plano Pro) | Hospeda o site; recebe as chaves secretas; ligou o domínio e o cadeado (HTTPS) | US$ 20/mês | vercel.com → projeto **merano** → Settings |
| **Supabase** | Banco de dados (pedidos, cupons, lista da pré-venda, financeiro) e login (Google e e-mail) | Grátis hoje; Pro US$ 25/mês | supabase.com/dashboard → projeto **MERANO** |
| **Google Cloud** | O botão "Continuar com Google" | Grátis | console.cloud.google.com |
| **Gmail da loja** | E-mail oficial e remetente dos e-mails do site (confirmação de conta, nova senha) | Grátis | contato.meranno@gmail.com (antes servico.merano, renomeado) |
| **Asaas** | Recebe os pagamentos (Pix e cartão até 3x) e avisa o site quando o cliente paga | Taxa por venda | asaas.com, conta PJ do MEI |
| **SuperFrete** | Calcula o frete real (PAC, SEDEX, Jadlog) e vende as etiquetas mais baratas | Etiqueta por envio | web.superfrete.com |
| **Registro.br** | Domínio `merannoclothing.com.br` | R$ 40/ano | registro.br |
| **OpenRouter** | A IA do provador virtual e do Personalizador | Por uso (≈ US$ 0,04 a 0,08 por prova) | openrouter.ai |
| **Playwright e Lighthouse** | Robô que abre o site como cliente (celular e computador) e mede a velocidade | Grátis | Rodados pelo Claude no computador |
| **ViaCEP** | Preenche rua e bairro pelo CEP | Grátis | Nada a configurar |
| **Documentos e páginas do Claude** | Listas para os sócios (o que falta), páginas de opções, o Jarvis | Incluído no Claude Pro | claude.ai |

## Passo a passo para um próximo site

1. **Marca e nome.** Antes de tudo, confira se o nome está livre no Registro.br (`.com.br`) e no Instagram. O `meranno.com.br` já era de outro CNPJ; por isso a loja ficou `merannoclothing.com.br`, igual ao Instagram. Crie um Gmail da marca com verificação em duas etapas: ele vai ser o e-mail de tudo.
2. **Referência visual.** Escolha 2 ou 3 lojas de referência antes de começar e mostre ao Claude (a Meranno usou Aimé Leon Dore, Saint Tropez e Ermos). Trocar de direção no meio custou dias.
3. **Site.** Peça ao Claude Code o site em Next.js, descrevendo páginas, produtos e a referência. Teste num servidor local e no celular. Guarde no GitHub desde o primeiro dia.
4. **Hospedagem.** Publique na Vercel cedo, para os sócios testarem pelo link. Quando for vender, assine o **Vercel Pro**: o plano grátis proíbe uso comercial. Fixe o servidor em São Paulo (região `gru1`).
5. **Banco e login.** Crie um projeto no Supabase na região São Paulo. Todas as tabelas com RLS ligada e sem regras públicas: só o servidor, com a chave secreta, lê e grava. Login com Google (Google Cloud) e com e-mail.
6. **E-mails do site.** No Supabase, ligue o SMTP próprio com o Gmail da marca (senha de app, `smtp.gmail.com`, porta 465). Sem isso, só a equipe recebe o e-mail de confirmação. Suba o limite para 100 a 200 por hora e traduza os modelos de e-mail.
7. **Domínio.** Compre no Registro.br, espere a "transição" (umas 2 horas) e adicione na Vercel (Settings → Domains). No Registro.br, em DNS → Modo avançado: dois registros **A** (`216.150.1.1` e `216.150.16.1`) com o Nome vazio (ele não aceita `@`) e um **CNAME** `www` para o endereço que a Vercel mostrar. Depois troque o Site URL no Supabase e faça o endereço antigo redirecionar.
8. **Pagamento.** Conta PJ no Asaas com o CNPJ, aprovada com documentos. Cadastre o site em Minha conta → Informações (sem isso o cliente não volta para a loja depois de pagar) e uma chave Pix. A chave de API sai só pelo site do Asaas, com o usuário administrador (Integrações → Chaves de API). Crie o webhook (Integrações → Webhooks) com o token gerado lá. As duas chaves vão direto para a Vercel, nunca pelo chat.
9. **Frete.** Conta na SuperFrete com o endereço de onde saem os pacotes. Token em Integrações → Desenvolvedores; na Vercel, o token e o CEP de origem. Meça peso e caixa reais. Não ofereça Mini Envios se o produto passa de R$ 100 declarados.
10. **Teste de verdade.** Cupom de 90%, uma compra no Pix e outra abrindo o cartão; confira se o pedido vira Pago sozinho no painel. Estorne no Asaas e cancele os pedidos de teste.
11. **Revisão antes de abrir.** Robô em todas as páginas (sem erro, sem rolagem lateral), Lighthouse no celular e uma lista de pendências para os sócios.
12. **Parte legal.** Razão social, CNPJ, endereço e contato no site (Decreto 7.962/2013); Privacidade dizendo quem recebe os dados (LGPD); direito de arrependimento de 7 dias (CDC, art. 49).
13. **Abrir.** Pré-venda fechada para uma lista primeiro; depois a venda aberta.

**Regra de ouro das chaves:** senha, token ou chave nunca vão por chat, WhatsApp ou print. Vão direto do serviço para a Vercel (Settings → Environment Variables, tipo Secret, ambiente Production). Mudou uma variável? Publique de novo.

## Decisões e por quê

- **Site próprio em vez de Shopify (24/11):** na Shopify o cartão também é digitado numa página dela; no Brasil ela cobra até 2% por venda além do gateway e mensalidade em dólar; e o provador, o Personalizador, o Meranno Fit e a lista da pré-venda teriam que ser refeitos.
- **Asaas em vez de Mercado Pago:** conta PJ simples e checkout pronto com Pix e cartão; o código do Mercado Pago foi retirado em 24/11. Para ter o cartão dentro da própria página no futuro, o caminho é o checkout transparente do Mercado Pago (campos seguros dele).
- **SuperFrete em vez de Melhor Envio:** API simples, sem mensalidade, etiquetas com desconto.
- **Vercel Pro:** obrigatório para loja; inclui 1 TB de transferência e 10 milhões de requisições por mês.
- **Supabase:** banco e login prontos no mesmo lugar; o Pro entra antes da venda aberta por causa do backup.

## Erros que custaram tempo

- Várias trocas de direção visual: decidir a referência antes.
- Nome de domínio já registrado por outro CNPJ: conferir antes de escolher a marca.
- Plano grátis da Vercel não permite loja.
- Chave colada no terminal da Vercel ficou vazia: colar pelo painel.
- Variável nova na Vercel só vale depois de publicar de novo.
- O Supabase sem SMTP próprio só manda e-mail para a equipe.
- Um print com o token do webhook visível obrigou a gerar outro.
- "Comprar agora" somava a mesma peça de novo no carrinho; o certo é perguntar antes.
- Medir velocidade num computador com antivírus que inspeciona a rede (Avast) dá números instáveis.
- Projeto dentro do OneDrive: o build trava a pasta `.next`; o Claude publica a partir de uma cópia limpa fora dela.

## Como publicar uma mudança

Desde 26/11: commit no `main` e push para o GitHub. A integração da Vercel publica sozinha em uns 30 segundos; o Claude confere no site no ar depois. (Antes era `vercel --prod --yes` a partir de uma cópia limpa com `git worktree`, que ainda funciona se precisar.)

## Histórico detalhado

O que entrou em cada rodada (texto que estava no PENDENCIAS).

### O que entrou em 26/11, o dia em que a pré-venda abriu (tudo publicado)

- **Pré-venda aberta** nos grupos: WhatsApp obrigatório para entrar, lista com 31 pessoas em Amigos e Familiares; no fim do dia, 16 já tinham entrado e 3 pedidos estavam pagos.
- **Tamanho GG** em todas as camisetas (medidas da Remix: 59 × 79 cm), no produto, carrinho, tabela, Meranno Fit, Provador, Personalizador e painel.
- **Entrega como estimativa:** pedido do estoque inteiro na Remix em 30/11, prontas até 7/12, com a equipe em 8/12 e postadas no mesmo dia. O site diz "Estimamos a entrega até ..." em cada frete, sem prometer.
- **Pagamento:** o CEP preenche rua, bairro, cidade e estado pelo servidor (ViaCEP e, se falhar, BrasilAPI) e o cursor vai para "Número"; quem já comprou encontra os dados da última compra preenchidos; CEP que a SuperFrete recusa explica o que fazer.
- **Painel:** "Falta o WhatsApp" em quem entrou sem dar o número; "como o cliente pagou" (Pix ou cartão, parcelas, quando o dinheiro cai no Asaas); excluir pedido cancelado.
- **Cadastro:** campo "Número de telefone"; aviso próprio para senha que já vazou na internet.
- **Supabase Pro** na organização nova "Meranno" (backup diário, 2FA obrigatório, segundo dono, SSL obrigatório, senhas vazadas bloqueadas).
- **Segurança:** revisão completa (nota 86/100, documento "Segurança do site Meranno"), Next.js 16.4.6 sem falhas conhecidas, cabeçalhos de segurança e firewall da Vercel registrando excessos.

### O que entrou em 24/11 (tudo publicado)

- **Domínio** `merannoclothing.com.br`, com cadeado; o endereço antigo redireciona.
- **Pagamento** pelo Asaas (Pix e cartão em até 3x), testado; **frete real** pela SuperFrete (PAC, SEDEX e Jadlog; sem Mini Envios); **e-mail de confirmação** saindo de "Meranno".
- **Preço:** todas as camisetas a R$ 180, inclusive a personalizada; embaixo de cada camiseta, preço e "3x R$ 60,00 sem juros".
- **Visual:** modo claro como padrão, fundo branco e fotos sobre um gelo off-white (como a Saint Tropez); carrinho no estilo Ermos, com "Talvez você goste" que passa para o lado; pagamento no estilo Saint Tropez, com botão bordô.
- **Compra:** sem "Comprar agora" (só pelo carrinho); se a mesma camiseta no mesmo tamanho já está no carrinho, o site pergunta antes de somar.
- **Amore Black e Amore White:** separadas na loja, mas na página do produto aparecem as cores Preto e Branco.
- **Meus pedidos** no menu; **cupom** até 99%; entrega "até 7 de dezembro"; testes cancelados.

- **Site no ar** (https://merannoclothing.com.br; o antigo merano-xi.vercel.app redireciona): versão de 24/11, com o cadeado da pré-venda ligado.
- **Trabalho novo**: no branch `lancamento-pre-venda`. O de 22/11 foi testado no computador (produto → tamanho → carrinho com duas peças → pagamento → pedido) e o build de produção passa.
- **Banco (Supabase)**: tabelas de pedidos, cupons, lista da pré-venda e pedidos de acesso prontas. Os 4 pedidos de teste (`MR-FFHAK2`, `MR-LJSWJG`, `MR-5AAVYQ`, `MR-6HU7NK`) estão **cancelados**; podem ser apagados.

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
| `ASAAS_API_KEY` | já existe (24/11) | Pagamento on-line; sem ela, pedido pelo WhatsApp |
| `ASAAS_WEBHOOK_TOKEN` | já existe (24/11) | Confere que o aviso de pagamento veio do Asaas |
| `SUPERFRETE_TOKEN`, `FRETE_CEP_ORIGEM` | já existem (24/11) | Frete real |
| `PRE_VENDA_GRUPO_URL` | opcional | Botão do grupo no "Coming soon" |
| `SUPERFRETE_CONTATO`, `SUPERFRETE_URL` | opcionais | Contato técnico (sem ela, vai `contato.meranno@gmail.com`) e ambiente de teste da SuperFrete |
| `PRE_VENDA_SEGREDO` | opcional | Assina o cookie da pré-venda (sem ela, usa a `SUPABASE_SECRET_KEY`) |
| `NEXT_PUBLIC_CLARITY_ID` | opcional (item 3.2) | Mapa de calor |

Depois de cadastrar ou mudar qualquer variável, é preciso publicar de novo.

## Notas técnicas (para o Claude ou um programador)

- **Publicação**: push no `main` publica sozinho pela integração Git da Vercel. Segurança: cabeçalhos em `next.config.ts` (`headers()`), firewall da Vercel com 4 regras de limite por IP (cupom, pedidos, Provador/estampas, envio de avaliação), em modo de registro desde 26/11.
- **Pedidos**: `src/lib/pedidos.ts` (validação, preço, cupom, frete, totais, mensagem do WhatsApp, `registrarPagamento`, `ENTREGA_PRE_VENDA`), `src/app/api/pedidos/` (criar e "pagar agora"), `src/app/pagamento/`, `src/app/pedido/[id]/`. Tabelas `pedidos` e `cupons` (RLS ligada, sem políticas: só a chave secreta lê e grava).
- **Pagamento**: `src/lib/pagamento.ts` liga o Asaas quando há `ASAAS_API_KEY` (o Mercado Pago saiu em 24/11). Asaas: `src/lib/asaas.ts` (Checkout com `externalReference` = id do pedido; cada checkout aberto fica em `pedidos.pagamento.checkouts`) e o webhook `src/app/api/pagamento/asaas/`, que lê as cobranças do checkout (`GET /payments?checkoutSession=`) e só marca pago com o valor inteiro. A chave do sandbox (`_hmlg_`) usa `api-sandbox.asaas.com` sozinha.
- **Frete**: `src/lib/frete.ts` (`SERVICOS` = PAC, SEDEX e Jadlog; `PACOTE_CAMISETA` com o peso e a caixa estimados, trocar pelos reais; `CepRecusado` quando a SuperFrete recusa o CEP). **Entrega**: `src/lib/entrega.ts` (`PEDIDO_REMIX`, `PRONTAS_NA_FABRICA`, `PRIMEIRA_POSTAGEM`, `POSTAGEM_DIAS_UTEIS`; enquanto a pré-venda espera a produção, as datas são estimativa). **CEP e dados salvos**: `src/app/api/cep/[cep]/route.ts` e `src/lib/dados-salvos.ts`. **Cores da mesma camiseta**: campo `familia` em `src/lib/products.ts` (Amore). **Parcelas**: `parcelado()` e `PARCELAS_MAX` em `src/lib/products.ts`, também usados no Asaas.
- **Tamanhos e Fit**: `TAMANHOS_LOJA` (P, M, G, GG), `REMIX_REGULAR` (tabela inteira da Remix), `SIZE_CHART` (só o que a loja vende), `MATERIAL`, `PRECO_LANCAMENTO` e `PRECO_PRE_VENDA` em `src/lib/products.ts`. O ombro não está na tabela da Remix: `ombroDa` em `src/lib/body-model.ts` estima 86% do tórax (trocar pelo valor medido numa peça real).
- **Financeiro**: `src/lib/financeiro.ts` (contas e plano), `src/app/admin/financeiro-admin.tsx`, `financeiro-acoes.ts`. Tabelas `financeiro_config` (uma linha) e `despesas`. O lucro conta produção + acessórios por camiseta vendida, taxas do Asaas e despesas lançadas; o frete é repasse e fica de fora.
- **Funções antigas do banco**: `enviar_avaliacao` e `registrar_email_cupom` já estão fechadas para o público (conferido em 24/11). Recomendação de tamanho: `src/lib/size-recommendation.ts` com `AMPLE_EASE` em `src/lib/body-model.ts` (10 cm de folga no busto).
- **Cupom de primeira compra**: recusa o e-mail que já tem pedido pago, separado, enviado ou entregue.
- **Admin**: `src/app/admin/` (`dono.ts` confere o dono em cada ação; `pedidos-acoes.ts`, `pedidos-admin.tsx`, `cupons-admin.tsx`, `lista-acoes.ts`).
- **Personalizador**: ver `docs/PERSONALIZADOR.md` (compra em `public/personalizador/js/meranno-compra.js`, rotas `/api/estampa/envio` e `/api/estampa/registrar`).
- **Pré-venda**: `src/proxy.ts`, `src/lib/pre-venda.ts`, `src/lib/pre-venda-lista.ts` (lista e pedidos de acesso, tabela `pre_venda_pedidos`), `src/app/pre-venda/`, `src/components/entrada-pre-venda.tsx`. A `/em-breve` e a `/pre-venda` precisam continuar dinâmicas.
- **Sem uso**: a tabela `convites_pre_venda` e a função `usar_convite_pre_venda` (primeiro modelo da pré-venda) e `src/lib/estampa-schema.ts` (Personalizador anterior). Podem ser apagadas.
- **Recortes das camisetas e cartas do topo**: `public/imagens/merano-assets/recortes/` (as cartas são os `*-carta.webp`). A vitrine lê `src/lib/shirt-stories.ts`; o topo, `src/components/hero-topo.tsx`.


### Fotos do catálogo — revisão Arancia

O verso da Arancia usa agora `/imagens/merano-assets/produtos/arancia-verso-v2.png`, cópia sem alterações do novo original enviado pelo responsável (1122 × 1402 px). As referências de catálogo, galeria, provador e carrinho vêm do produto atualizado. Novos derivados `arancia-v2-*` substituem a arte antiga na vitrine, miniaturas e coleção. A vitrine apresenta esta referência como foto de estúdio, sem fingir transparência nem usar a máscara/brilho do recorte antigo. A foto de frente foi mantida, pois não houve um novo original de frente.

Next Image permite qualidade 75/90/95: cards e sugestões de produtos usam 90, galeria 95. A lupa solicita o dobro da largura exibida enquanto ativa, em vez de apenas ampliar uma imagem pequena. As demais fotos oficiais existentes continuam como fontes originais; aumentar a qualidade da entrega reduz nova perda por compressão, mas não inventa resolução ausente do arquivo. Nenhuma arte foi redesenhada ou modificada por geração de imagem.
