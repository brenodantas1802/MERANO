import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';

// Run the pure TypeScript sizing modules with the project's existing compiler, without a test dependency.
const require = createRequire(import.meta.url);
const ts = require('typescript');
require.extensions['.ts'] = (module, filename) => {
  const { outputText } = ts.transpileModule(readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });
  module._compile(outputText, filename);
};
const { recommendSize } = require('../src/lib/size-recommendation.ts');
const { EMPTY_PROFILE } = require('../src/lib/body-measure.ts');
const { SIZE_CHART } = require('../src/lib/products.ts');
const original = { ...EMPTY_PROFILE, altura: '180', peso: '79', busto: '91', cintura: '90', quadril: '88' };
const tall = { ...original, altura: '194', peso: '89', busto: '93', cintura: '92', quadril: '90' };
const labels = result => result.fits.map(({ size, label }) => [size, label]);

test('uses the supplied garment chart and only sells P, M and G', () => {
  assert.deepEqual(SIZE_CHART.map(({ size, largura, barra, comprimento }) => [size, largura, barra, comprimento]), [
    ['P', 50, 51, 70], ['M', 53, 54, 73], ['G', 56, 57, 76],
  ]);
});
test('180 cm / 79 kg: P closer, M ideal, G too large', () => {
  const result = recommendSize(original, SIZE_CHART);
  assert.equal(result.size, 'M');
  assert.deepEqual(labels(result), [['P', 'Justo'], ['M', 'Ideal'], ['G', 'Não indicado']]);
});
test('194 cm / 89 kg with circumferences increased 2 cm: P short, M closer, G ideal', () => {
  const result = recommendSize(tall, SIZE_CHART);
  assert.equal(result.size, 'G');
  assert.deepEqual(labels(result), [['P', 'Não indicado'], ['M', 'Justo'], ['G', 'Ideal']]);
  assert.match(result.fits[0].description, /curta/);
  assert.match(result.reason, /194 cm.*89 kg/);
  assert.match(result.reason, /comprimento/);
});
test('height alone can change the recommendation when circumferences and weight stay equal', () => {
  assert.equal(recommendSize({ ...original, altura: '194' }, SIZE_CHART).size, 'G');
  assert.equal(recommendSize({ ...tall, altura: '180' }, SIZE_CHART).size, 'M');
});
test('accepts metres with a comma and height in centimetres consistently', () => {
  assert.deepEqual(recommendSize({ ...tall, altura: '1,94' }, SIZE_CHART), recommendSize(tall, SIZE_CHART));
});
test('weight estimates missing circumferences while measured circumferences take precedence', () => {
  const estimated = { ...EMPTY_PROFILE, altura: '180', peso: '60' };
  assert.equal(recommendSize(estimated, SIZE_CHART).size, 'M');
  assert.equal(recommendSize({ ...estimated, peso: '79' }, SIZE_CHART).size, 'G');
  assert.equal(recommendSize({ ...original, peso: '89' }, SIZE_CHART).size, 'M');
});
test('waist and hips can each require a larger size independently', () => {
  for (const field of ['cintura', 'quadril']) {
    assert.equal(recommendSize({ ...original, [field]: '105' }, SIZE_CHART).size, 'G');
  }
});
test('length follows each product chart rather than a fixed height-to-size lookup', () => {
  const shorter = SIZE_CHART.map(row => ({ ...row, comprimento: row.comprimento - 6 }));
  const result = recommendSize(tall, shorter);
  assert.equal(result.comfortLimited, true);
  assert.equal(result.fits.some(fit => fit.label === 'Ideal'), false);
});
test('does not invent GG or an ideal size beyond the available chart', () => {
  for (const profile of [{ ...original, busto: '103' }, { ...tall, altura: '230' }, { ...original, busto: '150' }]) {
    const result = recommendSize(profile, SIZE_CHART);
    assert.equal(result.size, 'G');
    assert.equal(result.comfortLimited, true);
    assert.equal(result.fits.some(fit => fit.label === 'Ideal'), false);
  }
});
test('does not recommend from empty measurements, height alone or an empty chart', () => {
  assert.equal(recommendSize(EMPTY_PROFILE, SIZE_CHART), null);
  assert.equal(recommendSize({ ...EMPTY_PROFILE, altura: '194' }, SIZE_CHART), null);
  assert.equal(recommendSize(tall, []), null);
});

test('same height and weight can have different ideal sizes from measured circumferences', () => {
  const small = { ...original, busto: '84', cintura: '82', quadril: '82' };
  const large = { ...original, busto: '100', cintura: '98', quadril: '100' };
  assert.equal(recommendSize(small, SIZE_CHART).size, 'P');
  assert.equal(recommendSize(original, SIZE_CHART).size, 'M');
  assert.equal(recommendSize(large, SIZE_CHART).size, 'G');
});
test('does not automatically choose the size after the first compatible garment', () => {
  const roomy = SIZE_CHART.map(row => ({ ...row, largura: row.largura + 3, barra: row.barra + 3 }));
  const result = recommendSize(original, roomy);
  assert.equal(result.size, 'P');
  assert.equal(result.fits[0].label, 'Ideal');
});
test('changing only the product length can change the ideal for the same person', () => {
  const longer = SIZE_CHART.map(row => ({ ...row, comprimento: row.comprimento + 4 }));
  assert.equal(recommendSize(tall, SIZE_CHART).size, 'G');
  assert.equal(recommendSize(tall, longer).size, 'M');
});
test('size names and chart order do not decide the fit', () => {
  const renamed = SIZE_CHART.map((row, i) => ({ ...row, size: ['A', 'B', 'C'][i] })).reverse();
  assert.equal(recommendSize(original, renamed).size, 'B');
  assert.equal(recommendSize(tall, renamed).size, 'C');
});
test('every row has to satisfy all dimensions together on a non-monotonic chart', () => {
  const mixed = [
    { size: 'A', largura: 58, barra: 59, comprimento: 65 },
    { size: 'B', largura: 44, barra: 45, comprimento: 78 },
    { size: 'C', largura: 53, barra: 54, comprimento: 76 },
  ];
  const result = recommendSize(tall, mixed);
  assert.equal(result.size, 'C');
  assert.deepEqual(labels(result), [['A', 'Não indicado'], ['B', 'Não indicado'], ['C', 'Ideal']]);
});
test('can reject garments that are too long instead of automatically increasing size', () => {
  const result = recommendSize({ ...original, altura: '140' }, SIZE_CHART);
  assert.equal(result.comfortLimited, true);
  assert.equal(result.fits.every(fit => fit.label === 'Não indicado'), true);
  assert.match(result.fits[0].description, /comprida/);
});
