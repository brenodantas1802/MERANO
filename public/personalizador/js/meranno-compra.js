/* MERANNO store: "Comprar esta peça". Added by the site, not part of the programmer's delivery.
   Builds the production files with his MerannoProduction.build (300 DPI art, mockups, chest mark), sends them straight
   to Supabase Storage through one-time links from /api/estampa/envio, records the creation (/api/estampa/registrar)
   and hands the tee to the store's cart, in the page around this iframe. */
(() => {
  'use strict';
  const S = window.MerannoStudio, P = window.MerannoProduction, M = window.MERANNO;
  if (!S || !P || !M) return;
  const FIT_NAMES = { regular: 'Regular', oversized: 'Oversized', boxy: 'Boxy' };
  const SIZES = ['P', 'M', 'G'];
  const MAX_UPLOAD = 25 * 1024 * 1024 - 64 * 1024; // the bucket's limit, with some room
  const price = Number(window.frameElement?.dataset.preco) || 189;
  const money = (value) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const $ = (selector, root = document) => root.querySelector(selector);
  const el = (tag, attrs = {}, text) => { const node = document.createElement(tag); for (const [key, value] of Object.entries(attrs)) { if (key === 'class') node.className = value; else node.setAttribute(key, value); } if (text !== undefined) node.textContent = text; return node; };

  // ---------- dialog ----------
  const dialog = el('dialog', { class: 'connection-dialog compra-dialog', 'aria-labelledby': 'compra-title' });
  dialog.innerHTML = `<form method="dialog" id="compra-form">
    <h2 id="compra-title">Comprar esta peça</h2>
    <p id="compra-resumo"></p>
    <fieldset class="compra-tamanhos"><legend>Tamanho</legend>${SIZES.map((size) => `<label><input type="radio" name="size" value="${size}" required><span>${size}</span></label>`).join('')}</fieldset>
    <p class="compra-nota">A arte vai para a confecção do jeito que está na prévia: posição, tamanho e cores. A cor impressa pode variar um pouco da tela.</p>
    <p id="compra-status" role="status" aria-live="polite"></p>
    <div class="compra-acoes"><button type="button" class="btn btn--ghost" id="compra-cancelar">Voltar</button><button type="submit" class="btn btn--solid" id="compra-confirmar">Adicionar ao carrinho · ${money(price)}</button></div>
  </form>`;
  document.body.append(dialog);
  const form = $('#compra-form', dialog), status = $('#compra-status', dialog), confirm = $('#compra-confirmar', dialog), cancel = $('#compra-cancelar', dialog);
  let working = false;
  cancel.addEventListener('click', () => { if (!working) dialog.close(); });
  dialog.addEventListener('cancel', (event) => { if (working) event.preventDefault(); });
  const say = (text, error = false) => { status.textContent = text; status.classList.toggle('is-error', error); };

  async function open() {
    const edit = S.getEditState();
    if (edit.busy) return S.toast('Aguarde a operação atual terminar.');
    if (!edit.design?.aiImage) return S.toast('Crie ou escolha uma estampa antes de comprar.');
    const snap = await S.snapshot().catch(() => null);
    if (!snap) return S.toast('Não consegui ler a sua criação. Tente de novo.');
    const fabric = M.colorById(snap.palette[0]);
    const where = { back: 'estampa nas costas', front: 'estampa na frente', both: 'estampa na frente e nas costas' }[snap.design.placement] || 'estampa nas costas';
    $('#compra-resumo', dialog).textContent = `Camiseta ${FIT_NAMES[snap.fit]} ${fabric.name.toLowerCase()}, ${where}${snap.brandVisible ? ' e MERANNO no peito' : ''}. ${money(price)}.`;
    say('');
    form.reset();
    dialog.showModal();
  }

  // ---------- helpers ----------
  const loadImage = async (src) => { const image = new Image(); image.src = src; await image.decode(); return image; };
  async function thumbnail(bytes) {
    const url = URL.createObjectURL(new Blob([bytes], { type: 'image/jpeg' }));
    try {
      const image = await loadImage(url), canvas = document.createElement('canvas'), width = 360;
      canvas.width = width; canvas.height = Math.round(width * image.naturalHeight / image.naturalWidth);
      canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
      const data = canvas.toDataURL('image/jpeg', 0.8); canvas.width = canvas.height = 1; return data;
    } finally { URL.revokeObjectURL(url); }
  }
  async function api(path, body) {
    let response;
    try { response = await fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: AbortSignal.timeout(30000) }); }
    catch { throw Error('Sem conexão com a loja. Confira a internet e tente de novo.'); }
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw Error(data.error || 'Não deu certo agora. Tente de novo.');
    return data;
  }
  async function upload(url, bytes, type) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await fetch(url, { method: 'PUT', headers: { 'Content-Type': type, 'x-upsert': 'false' }, body: new Blob([bytes], { type }), signal: AbortSignal.timeout(120000) });
        if (response.ok) return;
      } catch { /* try once more */ }
    }
    throw Error('A arte não subiu. Confira a internet e tente de novo.');
  }

  // ---------- buying ----------
  async function buy(size) {
    await S.preparePrint();
    const snap = await S.snapshot();
    const design = snap.design;
    if (!design?.aiImage) throw Error('Crie ou escolha uma estampa antes de comprar.');
    const fabric = M.colorById(snap.palette[0]);
    const prepared = await P.prepareArt(await loadImage(design.aiImage));
    // Same width the programmer's production dialog starts with.
    const widthCM = design.layout?.widthCM ?? Math.min(28, 45 * prepared.width / prepared.height, prepared.width / 300 * 2.54);
    say('Preparando os arquivos da sua peça…');
    const pack = await P.build({ design, brandVisible: snap.brandVisible, fit: snap.fit, fitName: FIT_NAMES[snap.fit], fabric: fabric.hex, fabricName: fabric.name },
      { size, quantity: 1, widthCM: Math.max(1, Math.floor(widthCM * 100) / 100), brandWidthCM: 8, notes: '' }, prepared);
    const file = (name) => pack.files.find((item) => item.name === name)?.data;
    let art = file('estampa-costas.png') || file('estampa-frente.png');
    const front = file('mockup-frente-referencia.jpg'), back = file('mockup-costas-referencia.jpg'), mark = file('marca-frente-meranno.png');
    if (!art || !front || !back) throw Error('Não consegui preparar os arquivos. Tente de novo.');
    // A very large print at 300 DPI can pass the storage limit: then the art goes at its own resolution and the
    // order sheet keeps the size in cm, for the print shop to scale.
    let original = false;
    if (art.length > MAX_UPLOAD) { art = Uint8Array.from(atob(prepared.image.src.split(',')[1]), (c) => c.charCodeAt(0)); original = true; }
    if (art.length > MAX_UPLOAD) throw Error('A arte é grande demais para enviar. Gere uma versão mais simples ou menor.');

    say('Enviando a arte…');
    const types = ['png', 'jpg', 'jpg', ...(mark ? ['png'] : [])];
    const { envios } = await api('/api/estampa/envio', { tipos: types });
    await Promise.all([upload(envios[0].url, art, 'image/png'), upload(envios[1].url, front, 'image/jpeg'), upload(envios[2].url, back, 'image/jpeg'), ...(mark ? [upload(envios[3].url, mark, 'image/png')] : [])]);

    say('Registrando a peça…');
    const meta = pack.meta;
    const { id, preco } = await api('/api/estampa/registrar', {
      arte: envios[0].caminho,
      arquivos: { mockupFrente: envios[1].caminho, mockupCostas: envios[2].caminho, ...(mark ? { marca: envios[3].caminho } : {}) },
      tamanho: size,
      prompt: String(design.prompt || '').slice(0, 6000),
      painel: { fit: snap.fit, fitName: FIT_NAMES[snap.fit], fabric: fabric.hex, fabricName: fabric.name, paleta: snap.palette.map((id) => M.colorById(id).hex), fonte: snap.font, marca: snap.brandVisible, posicao: design.houseId ? 'back' : design.placement || 'back', ...(design.houseName ? { colecao: String(design.houseName).slice(0, 100) } : {}) },
      producao: { id: meta.id, arteCm: { largura: +meta.art.widthCM.toFixed(2), altura: +meta.art.heightCM.toFixed(2) }, artePx: { largura: meta.art.width, altura: meta.art.height }, arteOriginal: original, marcaCm: snap.brandVisible ? 8 : null, layout: meta.printLayout ? { offsetXCM: meta.printLayout.offsetXCM, offsetYCM: meta.printLayout.offsetYCM } : null },
    });

    const image = await thumbnail(design.placement === 'front' ? front : back);
    window.parent.postMessage({ tipo: 'meranno:carrinho', item: { criacaoId: id, preco, tamanho: size, modelagem: FIT_NAMES[snap.fit], cor: fabric.name, imagem: image } }, location.origin);
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (working) return;
    const size = new FormData(form).get('size');
    if (!SIZES.includes(size)) return say('Escolha o tamanho.', true);
    working = true; confirm.disabled = true; cancel.disabled = true; form.querySelectorAll('input').forEach((input) => { input.disabled = true; });
    try {
      await buy(size);
      say('Peça no carrinho.');
      setTimeout(() => dialog.close(), 600);
    } catch (error) {
      say(error?.message || 'Não deu certo agora. Tente de novo.', true);
    } finally {
      working = false; confirm.disabled = false; cancel.disabled = false; form.querySelectorAll('input').forEach((input) => { input.disabled = false; });
    }
  });

  // ---------- buttons ----------
  // In the toolbar, always; and in the chat, in place of "Baixar para produção" (the production pack is for the
  // store, it goes to the owners' panel with the order).
  const bar = $('.creation-actions');
  const main = el('button', { type: 'button', id: 'comprar-peca', class: 'comprar-peca' }, `Comprar esta peça · ${money(price)}`);
  main.addEventListener('click', open);
  bar?.append(main);
  const sync = () => { const edit = S.getEditState(); main.disabled = !edit.design?.aiImage; };
  document.addEventListener('meranno:change', sync);
  sync();
  setInterval(sync, 1500);

  function swap(download) {
    if (download.dataset.compra) return;
    download.dataset.compra = '1';
    download.hidden = true;
    document.querySelectorAll('.art-comprar').forEach((old) => old.remove());
    const button = el('button', { type: 'button', class: 'art-comprar btn btn--solid' }, `Comprar esta peça · ${money(price)}`);
    button.addEventListener('click', open);
    download.before(button);
    sync();
  }
  document.querySelectorAll('.art-download').forEach(swap);
  new MutationObserver((changes) => { for (const change of changes) for (const node of change.addedNodes) { if (!(node instanceof Element)) continue; if (node.matches('.art-download')) swap(node); node.querySelectorAll?.('.art-download').forEach(swap); } })
    .observe(document.body, { childList: true, subtree: true });
})();
