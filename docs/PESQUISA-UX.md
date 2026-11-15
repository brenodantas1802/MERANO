# Pesquisa: como as pessoas usam sites (e o que isso muda na MERANNO)

Levantamento feito em 10/11/2026 a partir de artigos de universidades e conferências científicas (ACM CHI, MobileHCI, SIGIR, CSCW, revistas acadêmicas).
Onde a fonte é de mercado (empresa ou consultoria) e não acadêmica, isso está marcado como **[mercado]**.
Não li o texto completo de todos os artigos: em vários casos me baseei no resumo e em descrições confiáveis. Isso está indicado em cada item.

---

## 1. Onde os botões devem ficar (celular)

**O que a pesquisa diz**
- **Tamanho mínimo dos alvos de toque.** Parhi, Karlson e Bederson (Universidade de Maryland, MobileHCI 2006) testaram o uso com uma mão só, pelo polegar. Recomendam alvos de **9,2 mm** para toques isolados e **9,6 mm** para toques em sequência (como digitar).
- **A área que o polegar alcança é limitada e previsível.** Bergstrom-Lehtovirta e Oulasvirta (CHI 2014) criaram um modelo da "área funcional do polegar". Ela depende do tamanho da tela, do tamanho da mão e de onde o indicador apoia atrás do aparelho. Na prática, os cantos mais distantes do polegar, sobretudo o **canto superior oposto à mão**, ficam fora do alcance confortável.
- **Telas maiores obrigam a mudar a pegada.** Eardley, Roudaut, Gill e Thompson (CHI 2017) mostraram que, quanto maior o celular, mais a pessoa precisa inclinar, girar ou reposicionar o aparelho para alcançar certos pontos. Li só o resumo; os números detalhados estão no artigo.
- **Existe um "ponto ideal" de toque.** Mayer, Le, Funk e Henze (ISS 2019) estudaram onde as pessoas tocam quando podem tocar em qualquer lugar da tela. Não li o artigo completo, então não cito os números.

**O que fazer na MERANNO**
- Ações principais (comprar, adicionar ao carrinho, enviar no chat, criar estampa) ficam **embaixo, no alcance do polegar**. A barra de compra fixa no rodapé já segue isso.
- O topo (menu, busca, sacola, conta) fica longe do polegar. Isso é aceitável para ações secundárias, mas **a sacola também deve ser alcançável por baixo**: hoje ela abre sozinha ao adicionar um produto, o que ajuda.
- **Botões pequenos demais hoje:** quantidade e lixeira da sacola (32 px), tamanhos na barra de compra (36 px) e ícones do cabeçalho (40 px). Recomendo **44–48 px** (é o padrão das diretrizes da Apple e do Google). A conversão de milímetros para pixels varia por aparelho, então os valores são aproximados.

## 2. Primeira impressão: decidida em frações de segundo

- **50 milissegundos.** Lindgaard, Fernandes, Dudek e Brown (Carleton University, *Behaviour & Information Technology*, 2006): as pessoas julgam o **apelo visual** de uma página em cerca de 50 ms, e esse julgamento é consistente com o que dão depois de olhar mais tempo. O estudo mediu apelo visual, não usabilidade.
- **Simples e familiar vence.** Tuch et al. (Universidade de Basel e Google, *International Journal of Human-Computer Studies*, 2012): sites com **baixa complexidade visual** e **cara de site típico da categoria** foram os mais bem avaliados. A complexidade pesa já em 17 ms; a familiaridade ganha peso com mais tempo de exposição.
- **O gosto varia pelo público.** Reinecke e Gajos (Harvard, CHI 2014), com cerca de 2,4 milhões de avaliações de quase 40 mil pessoas: quanto maior a escolaridade, maior a preferência por sites menos coloridos e menos complexos.

**Na MERANNO:** o topo da página inicial deve ser **simples**: uma ideia forte, pouca coisa ao mesmo tempo. Entre as opções de topo, as de baixa complexidade (como o ás gigante) tendem a causar melhor primeira impressão do que as cheias de elementos animados. O restante do site deve continuar parecendo uma loja de roupa "normal" (vitrine, produto, sacola), porque isso é o que o cérebro reconhece rápido.

## 3. Bonito parece mais fácil e mais confiável

- **Aparência muda a usabilidade percebida.** Sonderegger e Sauer (Universidade de Fribourg, *Applied Ergonomics*, 2010): dois celulares com funções idênticas. O mais bonito foi avaliado como mais fácil de usar **e** as tarefas foram feitas mais rápido nele.
- **Aparência pesa na confiança.** Fogg et al. (Stanford Persuasive Technology Lab, 2002/2003), 2.684 participantes: o "visual do site" foi o fator mais citado nos comentários sobre credibilidade (46,1% dos comentários). Ressalva: os participantes só olharam os sites, sem comprar; críticos apontam que isso favorece o visual.

**Na MERANNO:** o acabamento (vidro, paleta, tipografia) não é só estético: ele aumenta a confiança para comprar de uma marca nova. Vale manter o mesmo cuidado no pagamento, que hoje é a página menos trabalhada.

## 4. Carrosséis e banners: as pessoas ignoram

- **Cegueira de banner.** Benway e Lane (Rice University, 1998): links grandes e chamativos, com cara de propaganda, eram ignorados mesmo quando continham exatamente o que a pessoa procurava.
- **Carrossel automático no topo recebe poucos cliques.** [dado institucional, não revisado por pares] Na Universidade de Notre Dame, o carrossel da página inicial recebeu cerca de **1% dos cliques**, e a maioria desses foi no **primeiro slide**. Os números variam entre as fontes, então use como tendência, não como valor exato.

**Na MERANNO:** não usar banner de topo que troca sozinho. O banner do Personalizador deve parecer **conteúdo da loja** (foto da peça, texto curto), não anúncio. Tirar a faixa vinho correndo foi coerente com isso. Nas vitrines que deslizam, **as peças mais fortes vão primeiro**.

## 5. Escolhas demais atrapalham

- Iyengar e Lepper (Columbia e Stanford, *Journal of Personality and Social Psychology*, 2000): com 6 opções de geleia, mais pessoas compraram do que com 24 ou 30, e ficaram mais satisfeitas com a escolha. Ressalva: estudos posteriores nem sempre repetiram esse efeito; não verifiquei essas revisões nesta pesquisa.

**Na MERANNO:** o Personalizador tem muitas escolhas (3 modelagens, 9 cores de malha, paleta livre, 6 fontes, estampas, referências). Para reduzir o peso:
- já vir com **tudo pré-escolhido** (isso já acontece);
- o **chat guia uma pergunta por vez** e oferece sugestões prontas (isso já acontece);
- considerar mostrar as opções avançadas (paleta livre, referências) só quando a pessoa pedir.

## 6. "Eu que fiz": personalização vale mais

- Franke, Schreier e Kaiser (Universidade de Economia de Viena, *Management Science*, 2010), cinco experimentos: pessoas aceitam **pagar mais** por um produto que elas mesmas desenharam, mesmo descontando o fato de ele combinar melhor com o gosto delas. O efeito vem do **sentimento de realização**, e é maior quando a pessoa sente que contribuiu de verdade e gosta do resultado.

**Na MERANNO:** é o argumento científico mais forte a favor do Personalizador.
- Reforçar a autoria: "criado por você", nome na etiqueta ou no cartão da embalagem (combina com o "Criado com você" das referências de marca).
- Deixar a pessoa sentir que decidiu: a tela de conferência, em que ela revisa e edita tudo, ajuda nisso.
- **Preço:** hoje a camiseta personalizada custa o mesmo que as do catálogo (R$ 189). A pesquisa sugere que dá para cobrar mais. É uma decisão de vocês.

## 7. Avaliações de clientes

- [centro universitário com dados de empresa parceira] Spiegel Research Center (Northwestern University) com dados da PowerReviews, 2017: um produto com **5 avaliações** teve **270% mais chance de ser comprado** do que um sem nenhuma. O ganho é maior em produtos mais caros e diminui depois das primeiras avaliações. Notas perfeitas (5,0) podem parecer "boas demais para ser verdade".

**Na MERANNO:** hoje **não há avaliações**. Recomendo adicionar, começando por pedir avaliação a quem já comprou. Não inventar avaliações.

## 8. Não usar truques (dark patterns)

- Mathur et al. (Princeton e Universidade de Chicago, CSCW 2019) analisaram cerca de 11 mil lojas e encontraram truques em ~11% delas: contadores de tempo falsos, "só restam 2" inventado, pressão para comprar. Em 183 sites, os truques eram enganosos.

**Na MERANNO:** não usar contagem regressiva falsa nem escassez inventada. O campo de estoque dos produtos só deve aparecer se o número for real. Isso também protege a marca de reclamações e problemas com o Código de Defesa do Consumidor.

## 9. Velocidade e respostas

- **Atraso muda o comportamento.** Arapakis, Bai e Cambazoglu (Yahoo Labs, SIGIR 2014): com páginas de resultados idênticas, as pessoas clicaram mais na que carregou mais rápido. Atrasos só são percebidos depois de certo limite.
- **Limites de tempo de resposta.** Muito citados: ~0,1 s parece instantâneo; ~1 s mantém o fluxo; acima de ~10 s a pessoa perde a atenção. A origem é Miller (1968) e Card et al. (1991), organizada por Nielsen (1993). É uma regra prática, não uma medição exata.
- [mercado] Estudos de Akamai, Deloitte e Google associam cada fração de segundo a mais com queda de conversão. Os números variam muito entre as fontes; não são revisados por pares.

**Na MERANNO:**
- Botões já respondem na hora ("Adicionando…"). Manter.
- **A criação da arte leva até ~1 minuto**: passa de 10 s, então precisa mostrar **progresso em etapas** ("Lendo sua ficha… Desenhando… Ajustando cores…") e não só "Criando…".
- A página inicial pesou cerca de 4,3 MB no teste; o vídeo do mar é a maior parte. Trocar o mar por um topo desenhado em código deixa o site mais leve e rápido.

## 10. Fotos do produto e provador virtual

- **Interagir com a imagem ajuda.** Fiore, Kim e Lee (Iowa State, *Journal of Interactive Marketing*, 2005): recursos de manipular a imagem do produto aumentaram o valor percebido e a disposição de comprar roupa online. Não confirmei se o estudo testou especificamente zoom e giro.
- **Provador virtual.** Baytar, Chung e Shin (Cornell, *Journal of Fashion Marketing and Management*, 2020): com realidade aumentada, as pessoas acertaram o tamanho da roupa. A intenção de compra foi boa, mas experimentar fisicamente ainda ganhou. Quem se sentiu "mais presente" na experiência gostou mais. O estudo usou só estudantes mulheres e uma peça.

**Na MERANNO:** manter a galeria com zoom e as vistas de frente, lados e verso. No provador (que fica por último), o foco deve ser **ajudar a escolher o tamanho e o caimento**, que é onde a pesquisa mostra mais ganho.

## 11. Pessoas nas fotos

- Djamasbi, Siegel e Tullis (Worcester Polytechnic Institute, *International Journal of Human-Computer Studies*, 2010): o público jovem (geração Y) preferiu páginas com **uma imagem principal grande** e pouco texto. Não confirmei no texto completo o que o estudo diz exatamente sobre fotos de pessoas.

---

## Resumo: o que já temos, o que melhorar

| Tema | Já temos | Melhorar |
|---|---|---|
| Botões no alcance do polegar | Barra de compra fixa embaixo; sacola abre sozinha | Aumentar botões pequenos para 44–48 px |
| Primeira impressão | Visual coeso, paleta definida | Topo simples, uma ideia só |
| Banners e carrosséis | Sem carrossel automático no topo | Peças mais fortes primeiro nas vitrines |
| Escolhas | Tudo pré-escolhido; chat guia | Esconder opções avançadas do Personalizador |
| Personalização | Personalizador completo | Reforçar autoria; rever o preço |
| Avaliações | Nenhuma | Criar avaliações reais |
| Truques | Nenhum | Mostrar estoque só se for real |
| Velocidade | Respostas imediatas | Progresso em etapas na criação; topo mais leve |
| Fotos | Galeria com zoom e vistas | Provador focado em tamanho |

## Medir os nossos próprios cliques

A pesquisa mostra tendências gerais. Para saber **onde os clientes da MERANNO clicam de verdade**, o caminho é instalar uma ferramenta de mapa de calor e gravação de sessões. A Ermos usa o Microsoft Clarity, que é gratuito; a Vercel Analytics é outra opção. Isso exige avisar o cliente e pedir consentimento, por causa da LGPD.

---

## Fontes

- Parhi, Karlson, Bederson (2006). *Target size study for one-handed thumb use on small touchscreen devices.* MobileHCI. https://dx.doi.org/10.1145/1152215.1152260
- Bergstrom-Lehtovirta, Oulasvirta (2014). *Modeling the functional area of the thumb on mobile touchscreen surfaces.* CHI. https://researchr.org/publication/Bergstrom-LehtovirtaO14
- Eardley, Roudaut, Gill, Thompson (2017). *Understanding grip shifts.* CHI. https://core.ac.uk/download/145642744.pdf
- Mayer, Le, Funk, Henze (2019). *Finding the sweet spot.* ISS. https://www.medien.ifi.lmu.de/pubdb/publications/pub/mayer2019findingthe/mayer2019findingthe.pdf
- Lindgaard et al. (2006). *Attention web designers: you have 50 milliseconds…* Behaviour & IT. https://www.nature.com/news/2006/060109/full/news060109-13.html
- Tuch et al. (2012). *The role of visual complexity and prototypicality…* IJHCS. https://research.google/pubs/pub38315/
- Reinecke, Gajos (2014). *Quantifying visual preferences around the world.* CHI. https://kgajos.seas.harvard.edu/papers/reinecke14visual.pdf
- Sonderegger, Sauer (2010). *The influence of design aesthetics in usability testing.* Applied Ergonomics. https://pubmed.ncbi.nlm.nih.gov/19892317/
- Fogg et al. (2002). *How do people evaluate a web site's credibility?* https://advocacy.consumerreports.org/research/how-do-people-evaluate-a-web-sites-credibility
- Benway, Lane (1998). *Banner blindness.* Rice University. https://jnd.org/banner-blindness-human-cognition-and-web-design/
- Carrossel de Notre Dame (dado institucional). https://www.orbitmedia.com/blog/rotating-sliders-hurt-website/ e https://usability.yale.edu/usability-best-practices/hero-imagescarousels
- Iyengar, Lepper (2000). *When choice is demotivating.* JPSP 79(6).
- Franke, Schreier, Kaiser (2010). *The "I designed it myself" effect in mass customization.* Management Science. https://www.wu.ac.at/fileadmin/wu/d/i/entrep/4_forschung/full-text-papers/franke_schreier_kaiser_2010_designed_it_myself.pdf
- Spiegel Research Center (2017). *How online reviews influence sales.* https://spiegel.medill.northwestern.edu/How-Online-Reviews-Influence-Sales
- Mathur et al. (2019). *Dark patterns at scale.* CSCW. https://arxiv.org/abs/1907.07032v2
- Arapakis, Bai, Cambazoglu (2014). *Impact of response latency on user behavior in web search.* SIGIR. https://dblp.org/rec/conf/sigir/ArapakisBC14.html
- Limites de tempo de resposta (Miller 1968; Card et al. 1991; Nielsen 1993). https://www.cs.umd.edu/users/ben/papers/Shneiderman1984Response.pdf
- [mercado] Deloitte (2020). *Milliseconds make millions.* https://www2.deloitte.com/content/dam/Deloitte/ie/Documents/Consulting/Milliseconds_Make_Millions_report.pdf
- Fiore, Kim, Lee (2005). *Effect of image interactivity technology…* Journal of Interactive Marketing. https://dr.lib.iastate.edu/entities/publication/5dc6d3c9-adac-4435-953a-1a858e7f767f
- Baytar, Chung, Shin (2020). *Evaluating garments in augmented reality when shopping online.* JFMM. https://www.emerald.com/jfmm/article/24/4/667/222411/Evaluating-garments-in-augmented-reality-when
- Djamasbi, Siegel, Tullis (2010). *Generation Y, web design, and eye tracking.* IJHCS. https://users.wpi.edu/~djamasbi/PDFS/2010%20djamasbi%20et%20al-%20IJHCS%20(journal%20version).pdf
