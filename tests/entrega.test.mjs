import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';

// The estimated arrival date, run with the project's own TypeScript compiler (same loader as the other tests).
const require = createRequire(import.meta.url);
const ts = require('typescript');
require.extensions['.ts'] = (module, filename) => {
  const { outputText } = ts.transpileModule(readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });
  module._compile(outputText, filename);
};
const { avisoPostagem, dataChegada, dataPostagem, diaEmSaoPaulo, esperaProducao, formatarDia, PRIMEIRA_POSTAGEM, somarDiasUteis } = require('../src/lib/entrega.ts');

// Thursday 26 November 2026, 15h in Brasília (pre-sale), and Thursday 7 January 2027 (shirts in hand).
const quinta = new Date('2026-11-26T18:00:00Z');
const janeiro = new Date('2027-01-07T18:00:00Z');

test('pre-sale orders are posted on the first posting day, after Remix makes the shirts', () => {
  assert.equal(PRIMEIRA_POSTAGEM, '2026-12-07');
  assert.equal(dataPostagem(quinta), '2026-12-07');
  assert.equal(esperaProducao(quinta), true);
  assert.match(avisoPostagem(quinta), /estimativa é postar a partir de segunda, 7\/12/);
});

test('with the shirts in hand, posts within two business days, skipping the weekend', () => {
  assert.equal(dataPostagem(janeiro), '2027-01-11');
  assert.equal(esperaProducao(janeiro), false);
  assert.match(avisoPostagem(janeiro), /até 2 dias úteis/);
});

test('adds the carrier deadline after the posting day', () => {
  assert.equal(dataChegada(1, quinta), '2026-12-08');
  assert.equal(dataChegada(2, quinta), '2026-12-09');
  assert.equal(dataChegada(7, quinta), '2026-12-16');
  assert.equal(dataChegada(12, quinta), '2026-12-23');
  assert.equal(dataChegada(2, janeiro), '2027-01-13');
});

test('no deadline in the quote means no date', () => {
  assert.equal(dataChegada(0, quinta), null);
  assert.equal(dataChegada(undefined, quinta), null);
});

test('holidays do not count as business days', () => {
  // 25 December 2026 is a Friday: from Thursday the 24th, one business day lands on Monday the 28th.
  assert.equal(somarDiasUteis('2026-12-24', 1), '2026-12-28');
  // 1 January 2027 is a Friday too.
  assert.equal(somarDiasUteis('2026-12-31', 1), '2027-01-04');
});

test('late at night in Brasília still counts as that day', () => {
  // 23h30 on Saturday the 28th in Brasília is already Sunday in UTC.
  assert.equal(diaEmSaoPaulo(new Date('2026-11-29T02:30:00Z')), '2026-11-28');
});

test('formats the day in Portuguese', () => {
  assert.equal(formatarDia('2026-12-03'), 'quinta, 3/12');
  assert.equal(formatarDia('2026-12-03', { semana: false }), '3/12');
  assert.equal(formatarDia('2026-11-28'), 'sábado, 28/11');
});
