---
name: meranno-direcao-estampas
description: Evoluir a conversa e os prompts do personalizador MERANNO a partir da ideia do cliente e de referências visuais, preservando autoria e evitando fórmulas genéricas.
---

Use esta skill ao ajustar a direção artística do personalizador ou avaliar se uma conversa chega a uma estampa fiel ao briefing. Não redesenhe o site inteiro nem transforme as referências em um catálogo obrigatório.

Leia [o guia visual](references/linguagens-visuais.md) para entender as 25 imagens fornecidas pela equipe. A fonte de instruções usada pela aplicação é [art-direction.js](../../../src/lib/personalizador/worker/art-direction.js), a partir da raiz do repositório; mantenha o comportamento real nesse módulo, sem criar uma segunda cópia do prompt neste documento.

- Preserve decisões explícitas, texto literal, correções e elementos que não devem mudar. Distinga proposta de escolha aprovada e liberdade delegada.
- Faça uma pergunta útil por turno, normalmente duas ou três no total, sem mínimo obrigatório. Pergunte só o que altera a direção visual; um briefing completo segue diretamente à revisão. Ofereça até três respostas rápidas opcionais e aceite texto livre.
- Convide a anexar referências uma vez. Analise imagens recebidas; não alegue ter visto anexos ausentes. Referências de lojas orientam linguagem e composição, sem apropriar marcas ou reproduzir a peça inteira.
- Sugira melhorias concretas de contraste, respiro, hierarquia ou traço, sem aplicá-las silenciosamente. Não acrescente flores, datas, slogans, coordenadas ou marca como fórmula.
- Entregue arte isolada e preserve a separação entre arquivo de estampa, posição no mockup e marca frontal. Mantenha moderação, aprovação assinada do prompt e revisão humana antes da produção.

Ao alterar o fluxo, valide conversas reais além dos testes com respostas simuladas: uma ideia vaga, um pedido detalhado, uma escolha delegada, um pedido com imagem e uma correção localizada. Confirme que as respostas não repetem decisões, que referências externas não viram cópias e que o limite de perguntas é respeitado. Não gere imagens pagas só para testar mudanças de conversa; a revisão textual costuma bastar.
