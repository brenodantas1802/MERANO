import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import test from 'node:test';

// The pre-sale list parser, run with the project's own TypeScript compiler (same loader as the other tests). "@/..."
// imports resolve to src/.
const require = createRequire(import.meta.url);
const ts = require('typescript');
const Module = require('node:module');
const src = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '../src');
const resolver = Module._resolveFilename;
Module._resolveFilename = function (request, ...rest) {
  if (request.startsWith('@/')) request = path.join(src, `${request.slice(2)}.ts`);
  return resolver.call(this, request, ...rest);
};
require.extensions['.ts'] = (module, filename) => {
  const { outputText } = ts.transpileModule(readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });
  module._compile(outputText, filename);
};
const { lerLista, normalizarTelefone } = require('../src/lib/pre-venda-lista.ts');

test('reads the WhatsApp list as pasted: numbering, non-breaking hyphens and group titles', () => {
  const colado = [
    '*Meranno pré venda AMIGOS*',
    '',
    '1- Felipe Brasil +55 85 98208‑0710',
    '7-Miguel de biase +55 11 94062-9090',
    '12- DG +55 11 97701-6260',
    '',
    '*MERANNO PRÉ VENDA FAMILIARES*',
    '',
    '5- Leonardo Zavatini +55 11 941417700',
    '10-Daniela +55 11 992688032',
  ].join('\n');
  const { linhas, ignoradas } = lerLista(colado);
  assert.deepEqual(ignoradas, []);
  assert.deepEqual(linhas, [
    { nome: 'Felipe Brasil', email: null, telefone: '5585982080710', grupo: 'Amigos' },
    { nome: 'Miguel de biase', email: null, telefone: '5511940629090', grupo: 'Amigos' },
    { nome: 'DG', email: null, telefone: '5511977016260', grupo: 'Amigos' },
    { nome: 'Leonardo Zavatini', email: null, telefone: '5511941417700', grupo: 'Familiares' },
    { nome: 'Daniela', email: null, telefone: '5511992688032', grupo: 'Familiares' },
  ]);
});

test('keeps the older formats working', () => {
  const { linhas, ignoradas } = lerLista('Ana Souza, 11 98765-4321\npedro@gmail.com\nPedro - +55 (21) 99999-0000 - pedro@hotmail.com\nsó um nome');
  assert.deepEqual(linhas, [
    { nome: 'Ana Souza', email: null, telefone: '5511987654321', grupo: null },
    { nome: null, email: 'pedro@gmail.com', telefone: null, grupo: null },
    { nome: 'Pedro', email: 'pedro@hotmail.com', telefone: '5521999990000', grupo: null },
  ]);
  assert.deepEqual(ignoradas, ['só um nome']);
});

test('a number at the start of the line is not taken for list numbering', () => {
  assert.equal(lerLista('11 98765-4321 Ana').linhas[0].telefone, '5511987654321');
  assert.equal(lerLista('1- (11) 98765-4321 Ana').linhas[0].telefone, '5511987654321');
});

test('normalizes Brazilian numbers', () => {
  assert.equal(normalizarTelefone('(11) 98765-4321'), '5511987654321');
  assert.equal(normalizarTelefone('+55 11 98765-4321'), '5511987654321');
  assert.equal(normalizarTelefone('98765-4321'), null);
});
