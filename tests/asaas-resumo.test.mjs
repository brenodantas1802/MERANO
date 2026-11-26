import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import test from 'node:test';

// How an Asaas checkout's charges become the order's payment details (lib/asaas resumoDoCheckout), with the project's
// own TypeScript compiler and the "@/" alias pointed at src.
const require = createRequire(import.meta.url);
const ts = require('typescript');
const Module = require('node:module');
const resolver = Module._resolveFilename;
Module._resolveFilename = function (pedido, ...resto) {
  if (pedido.startsWith('@/')) return resolver.call(this, path.join(process.cwd(), 'src', `${pedido.slice(2)}.ts`), ...resto);
  return resolver.call(this, pedido, ...resto);
};
require.extensions['.ts'] = (module, filename) => {
  const { outputText } = ts.transpileModule(readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } });
  module._compile(outputText, filename);
};
const { resumoDoCheckout } = require('../src/lib/asaas.ts');

const cobranca = (extra) => ({ id: 'pay_1', status: 'CONFIRMED', value: 60, billingType: 'CREDIT_CARD', checkoutSession: 'c', externalReference: null, installment: null, netValue: 57, estimatedCreditDate: null, creditDate: null, bandeira: 'VISA', final: '1234', ...extra });

test('a card in 3 instalments: paid, 3x, credited a month apart, not received yet', () => {
  const resumo = resumoDoCheckout([
    cobranca({ id: 'pay_1', installment: 'ins', estimatedCreditDate: '2026-12-28' }),
    cobranca({ id: 'pay_2', installment: 'ins', status: 'PENDING', estimatedCreditDate: '2027-01-27' }),
    cobranca({ id: 'pay_3', installment: 'ins', status: 'PENDING', estimatedCreditDate: '2027-02-26' }),
  ], 180);
  assert.equal(resumo.pago, true);
  assert.equal(resumo.metodo, 'cartao');
  assert.equal(resumo.detalhes.parcelas, 3);
  assert.equal(resumo.detalhes.liquido, 171);
  assert.equal(resumo.detalhes.credito, '2026-12-28');
  assert.equal(resumo.detalhes.recebido, false);
  assert.equal(resumo.detalhes.bandeira, 'VISA');
  assert.equal(resumo.detalhes.final, '1234');
});

test('Pix: one charge, received at once', () => {
  const resumo = resumoDoCheckout([cobranca({ billingType: 'PIX', status: 'RECEIVED', value: 191.43, netValue: 190.44, creditDate: '2026-11-26', bandeira: null, final: null })], 191.43);
  assert.equal(resumo.pago, true);
  assert.equal(resumo.metodo, 'pix');
  assert.equal(resumo.detalhes.parcelas, 1);
  assert.equal(resumo.detalhes.recebido, true);
  assert.equal(resumo.detalhes.credito, '2026-11-26');
});
