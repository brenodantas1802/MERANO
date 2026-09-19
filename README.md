# MERANO

MVP da MERANO, marca brasileira de moda premium feita sob demanda.

## Rodar localmente

```bash
npm install
npm run dev
```

Abra http://localhost:3000.

## Banco de dados

1. Copie `.env.example` para `.env` e informe `DATABASE_URL`.
2. Gere o client: `npx prisma generate`.
3. Crie a primeira migration quando o PostgreSQL estiver disponível: `npx prisma migrate dev --name init`.

O projeto usa a configuração atual do Prisma em `prisma.config.ts`; a URL do banco fica fora do schema e vem de `DATABASE_URL`.

O checkout desta fase envia a intenção do pedido para confirmação manual; nenhum cartão é armazenado ou processado.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
