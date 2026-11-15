# Personalizador MERANNO: pacote para transferir

Este pacote contém o personalizador de estampa completo: chat com IA, esboço, confirmação, geração da arte e visual igual ao protótipo.

## Onde mais está salvo

- **GitHub**: repositório `brenodantas1802/MERANO`, branch `claude/virtual-taster-openrouter-89fmt8`.
- **Pull request**: https://github.com/brenodantas1802/MERANO/pull/1. Mesclar esse PR no `main` coloca o personalizador no site atual.

## O que tem aqui

| Item | Para que serve |
|---|---|
| `arquivos/` | Todos os arquivos do personalizador, nas mesmas pastas do projeto (`src/...`, `public/...`). |
| `arquivos/personalizador.css` | Estilos do personalizador (cores do protótipo). Cole no fim do `globals.css`. |
| `personalizador-MERANO.patch` | As mesmas mudanças em formato git, para aplicar de uma vez no repositório MERANO. |

## Opção A: aplicar no repositório MERANO

No computador, dentro da pasta do projeto:

```bash
git checkout main
git apply --binary personalizador-MERANO.patch
npm install
npm run build
```

## Opção B: levar para outro projeto (ex.: um repositório novo "meranno")

1. Copie o conteúdo de `arquivos/src` e `arquivos/public` para as pastas `src` e `public` do projeto, mantendo os caminhos.
2. Cole o conteúdo de `arquivos/personalizador.css` no fim do CSS global (`src/app/globals.css`).
3. O projeto precisa ter as mesmas bases do MERANO:
   - Next.js 16 (App Router), React 19 e Tailwind CSS 4;
   - os pacotes `zod` (versão 4) e `lucide-react`;
   - o atalho de importação `@/` apontando para `src/` (no `tsconfig.json`).
4. Em `src/app/personalizar-estampa/page.tsx` existe `import { SiteHeader } from "@/components/site-header";`. Esse é o menu do site MERANO. Num projeto que não tenha esse arquivo, apague essa importação e a linha `<SiteHeader />`, ou troque pelo menu do novo site.
5. O tipo `LayoutProps` usado em `layout.tsx` é gerado pelo próprio Next.js ao rodar `next dev` ou `next build`.

## Configuração obrigatória

- Variável de ambiente **`OPENROUTER_API_KEY`**, com a chave do OpenRouter. No site atual ela já existe, porque o provador usa a mesma. Num projeto novo, cadastre em Vercel → Settings → Environment Variables.
- Modelos usados:
  - chat: `google/gemini-2.5-flash`, com reserva `openai/gpt-5.4-mini`;
  - imagem: `openai/gpt-image-2.5-flare`, o mesmo do provador.

  Confira no OpenRouter se continuam disponíveis.

## Como funciona (resumo)

1. **`/api/estampa/chat`**: recebe a conversa, o painel e as referências. A IA devolve:
   - a resposta;
   - a **ficha** da estampa (ideia, elementos, estilo, composição, cores, texto, o que evitar);
   - sugestões de resposta;
   - se a ficha está pronta;
   - um **esboço SVG** simples. O esboço sai da mesma chamada de texto, sem usar o modelo de imagem, e por isso é barato.
2. **Confirmação**: o cliente revisa e edita a ficha e vê o pedido completo. O pedido é montado pelo código (`planEstampa` em `src/lib/estampa.ts`).
3. **`/api/estampa/gerar`**: remonta o pedido a partir da ficha confirmada e gera a arte. A arte vai no **verso**, e o texto é aplicado depois, com a fonte escolhida.
4. **Frente**: escrita MERANNO fixa, em 6 tipos (Cormorant, Bodoni Moda, Cinzel, Pinyon Script, Limelight e Space Grotesk), na cor escolhida.
5. **Limites**:
   - chat: 40 mensagens a cada 10 minutos por pessoa;
   - arte: 4 a cada 10 minutos por pessoa e no máximo 60 por dia;
   - página: 3 criações por visita.

## Ainda pendente

- Testar com a chave real do OpenRouter. Até agora, só testei com respostas simuladas.
- Nome: a página usa **MERANNO**, mas o logo e o resto do site atual usam **MERANO**.
- Estampas da casa: há só 3 (barco, café, laranjeira). As 6 do protótipo precisam dos arquivos de imagem.
- Ainda não existe:
  - "provar no corpo" a peça criada;
  - salvar a arte junto com o pedido;
  - gerar o arquivo em resolução de impressão (hoje a arte sai em 1K).
