import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';
import { handleApi } from '../src/lib/personalizador/worker/api.js';

const require = createRequire(import.meta.url);
const ts = require('typescript');
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText, filename);
const { personalizadorUrl } = require('../src/lib/personalizador-request.ts');

async function chat({ url = 'http://localhost:3000/api/personalizador/chat', host = '127.0.0.1:3000', origin = 'http://127.0.0.1:3000', protocol } = {}) {
  const headers = new Headers({ 'Content-Type': 'application/json', Origin: origin });
  if (host) headers.set('Host', host);
  if (protocol) headers.set('X-Forwarded-Proto', protocol);
  const body = JSON.stringify({ preferences: {}, references: [], messages: [{ role: 'user', text: 'Quero uma estampa de limões.' }] });
  const incoming = new Request(url, { method: 'POST', headers, body });
  const forwarded = new Request(personalizadorUrl(incoming, ['chat']), { method: 'POST', headers, body });
  let calls = 0;
  const response = await handleApi(forwarded, { OPENROUTER_API_KEY: 'test-key-not-a-real-secret' }, async (_url, options) => {
    if (JSON.parse(options.body).messages[0].content.startsWith('MERANNO_CONTENT_POLICY_V1')) return Response.json({choices:[{message:{content:JSON.stringify({allowed:true,category:'none',containsGarment:false})}}]});
    calls++;
    return Response.json({ choices: [{ message: { content: JSON.stringify({ reply: 'Qual estilo você prefere?', ready: false }) } }] });
  });
  return { response, calls };
}

test('chat accepts the browser origin when Next exposes a different internal hostname', async () => {
  const { response, calls } = await chat();
  assert.equal(response.status, 200);
  assert.equal(calls, 1);
  assert.equal((await response.json()).reply, 'Qual estilo você prefere?');
});
test('chat accepts the public HTTPS origin behind a proxy', async () => {
  const { response, calls } = await chat({ host: 'loja.example.com', origin: 'https://loja.example.com', protocol: 'https' });
  assert.equal(response.status, 200);
  assert.equal(calls, 1);
});
test('chat still blocks a request from another website before calling the model', async () => {
  const { response, calls } = await chat({ origin: 'https://other.example.com' });
  assert.equal(response.status, 403);
  assert.equal(calls, 0);
  assert.equal((await response.json()).error, 'Origem não permitida.');
});
test('different ports and opaque iframe origins remain blocked', async () => {
  for (const origin of ['http://127.0.0.1:3001', 'null', 'https://127.0.0.1:3000']) {
    const { response, calls } = await chat({ origin });
    assert.equal(response.status, 403);
    assert.equal(calls, 0);
  }
});
test('falls back to the request URL when the Host header is absent', async () => {
  const { response } = await chat({ host: null, origin: 'http://localhost:3000' });
  assert.equal(response.status, 200);
});
test('only rewrites the worker path and preserves the query string', () => {
  const request = new Request('http://localhost:3000/api/personalizador/creations/id?download=1', { headers: { Host: '127.0.0.1:3000' } });
  assert.equal(personalizadorUrl(request, ['creations', 'id']).href, 'http://127.0.0.1:3000/api/creations/id?download=1');
});
