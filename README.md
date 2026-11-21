# MERANNO

Loja da MERANNO: coleção de camisetas, Personalizador com IA, Provador e pré-venda para um grupo fechado.

- **O que falta e o passo a passo de cada item:** [`PENDENCIAS-LEIA-ME.md`](PENDENCIAS-LEIA-ME.md)
- **Personalizador** (app do programador dentro do site): [`docs/PERSONALIZADOR.md`](docs/PERSONALIZADOR.md)

## Rodar no computador

1. Instale o Node.js 20 ou mais novo.
2. Baixe o projeto e instale as dependências:
   ```bash
   git clone https://github.com/brenodantas1802/MERANO.git merano
   cd merano
   npm install
   ```
3. Peça o arquivo `.env.local` a um dos sócios **por um canal seguro** (nunca pelo grupo, e-mail aberto ou chat com IA) e coloque na pasta `merano`. Ele tem as chaves do Supabase e da IA.
4. Rode `npm run dev` e abra http://localhost:3000.

Com o Claude Code: abra a pasta `merano` e peça o que precisa. As instruções para ele ficam em `AGENTS.md`.

## Como o site é montado

- **Next.js 16** (as regras mudaram em relação às versões antigas: leia `node_modules/next/dist/docs/` antes de mexer), React 19 e Tailwind 4.
- **Supabase**: login, banco e arquivos. Tabelas principais: `pedidos`, `cupons`, `criacoes_estampa`, `pre_venda_autorizados`, `cadastros_cupom`, `avaliacoes`.
- **Vercel**: hospedagem. Ela **não** publica sozinha quando o GitHub muda.
- **Pagamento**: Mercado Pago Checkout Pro quando `MERCADOPAGO_ACCESS_TOKEN` está na Vercel; sem ele, o pedido é registrado e fechado pelo WhatsApp. O preço, o cupom e o frete são sempre calculados de novo no servidor (`src/lib/pedidos.ts`).
- **Frete**: SuperFrete (`src/lib/frete.ts`); sem token, mostra valores de exemplo.
- **Painel da equipe**: `/admin` (só os e-mails de `OWNER_EMAILS`, entrando com o Google): lista da pré-venda, pedidos, cupons, estampas do Personalizador e e-mails do pop-up.

## Publicar

Só depois de testar. A partir de uma cópia limpa do branch (sem `.env.local` e sem arquivos soltos):

```bash
git worktree add ../merano-publicar main
cp -r .vercel ../merano-publicar/   # o vínculo com o projeto da Vercel não vai para o GitHub
cd ../merano-publicar
vercel --prod --yes
cd .. && git worktree remove merano-publicar
```

As variáveis (chaves) ficam na Vercel, em **Settings → Environment Variables**. A lista completa está no fim do `PENDENCIAS-LEIA-ME.md`.
