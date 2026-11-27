import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';

// The shipping option filter, run with the project's own TypeScript compiler (same loader as the other tests).
const require = createRequire(import.meta.url);
const ts = require('typescript');
require.extensions['.ts'] = (module, filename) => {
  const { outputText } = ts.transpileModule(readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });
  module._compile(outputText, filename);
};
const { semOpcoesPiores, cotarFrete, CepRecusado, AVISO_CEP_RECUSADO } = require('../src/lib/frete.ts');

const opcao = (id, nome, preco, prazoMin, prazoMax) => ({ id, nome, empresa: 'Correios', preco, prazoMin, prazoMax });

test('hides an option that is pricier and slower than another (PAC in São Paulo)', () => {
  const sedex = opcao(2, 'SEDEX', 11.43, 1, 2);
  const pac = opcao(1, 'PAC', 17.77, 3, 5);
  assert.deepEqual(semOpcoesPiores([sedex, pac]), [sedex]);
});

test('keeps the usual trade-off: cheaper but slower, pricier but faster', () => {
  const pac = opcao(1, 'PAC', 18.4, 5, 8);
  const sedex = opcao(2, 'SEDEX', 29.9, 1, 3);
  assert.deepEqual(semOpcoesPiores([pac, sedex]), [pac, sedex]);
});

test('same price but slower is hidden; same price and same time both stay', () => {
  const rapido = opcao(2, 'SEDEX', 20, 1, 2);
  const lento = opcao(1, 'PAC', 20, 3, 5);
  assert.deepEqual(semOpcoesPiores([rapido, lento]), [rapido]);
  const a = opcao(1, 'PAC', 20, 3, 5);
  const b = opcao(3, '.Package', 20, 3, 5);
  assert.deepEqual(semOpcoesPiores([a, b]), [a, b]);
});

test('an overlapping range is not a clear loss, so it stays', () => {
  // Faster at best, slower at worst: neither is better on every count.
  const sedex = opcao(2, 'SEDEX', 15, 2, 6);
  const jadlog = opcao(3, '.Package', 15, 3, 4);
  assert.deepEqual(semOpcoesPiores([sedex, jadlog]), [sedex, jadlog]);
});

test('one option alone always stays', () => {
  const pac = opcao(1, 'PAC', 30, 7, 12);
  assert.deepEqual(semOpcoesPiores([pac]), [pac]);
  assert.deepEqual(semOpcoesPiores([]), []);
});

// SuperFrete refusing the CEP (Rio Branco's general 69900-000 got a 400 on 2026-11-26) is the customer's to fix, not
// "try again"; a SuperFrete outage still is.
test('a CEP SuperFrete refuses becomes CepRecusado; an outage stays a plain error', async () => {
  const fetchOriginal = globalThis.fetch;
  process.env.FRETE_CEP_ORIGEM = '01310100';
  try {
    globalThis.fetch = async () => new Response('{"message":"CEP de destino inválido"}', { status: 400 });
    await assert.rejects(cotarFrete('69900000', 1), (erro) => erro instanceof CepRecusado);
    globalThis.fetch = async () => new Response('', { status: 503 });
    await assert.rejects(cotarFrete('01310100', 1), (erro) => !(erro instanceof CepRecusado));
    assert.match(AVISO_CEP_RECUSADO, /CEP da sua rua/);
  } finally {
    globalThis.fetch = fetchOriginal;
  }
});
