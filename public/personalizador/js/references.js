/* Local image preparation: actual pixel colours, not semantic AI analysis. */
(() => {
  'use strict';
  const MAX_BYTES = 10 * 1024 * 1024;
  const TYPES = ['image/png', 'image/jpeg', 'image/webp'];
  function extractColors(imageData) {
    const bins = new Map();
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] < 160) continue;
      const rgb = [data[i], data[i + 1], data[i + 2]];
      const key = rgb.map(c => Math.floor(c / 32)).join(',');
      const bin = bins.get(key) || { count: 0, sum: [0, 0, 0] };
      bin.count++;
      rgb.forEach((c, j) => bin.sum[j] += c);
      bins.set(key, bin);
    }
    const ranked = [...bins.values()].sort((a, b) => b.count - a.count);
    const selected = [];
    for (const bin of ranked) {
      const rgb = bin.sum.map(c => Math.round(c / bin.count));
      if (selected.every(c => Math.hypot(...rgb.map((v, i) => v - c[i])) > 64)) selected.push(rgb);
      if (selected.length === 4) break;
    }
    return selected.map(rgb => '#' + rgb.map(c => c.toString(16).padStart(2, '0')).join(''));
  }
  async function prepare(file) {
    if (!TYPES.includes(file.type)) throw new Error('Use uma imagem PNG, JPG ou WebP.');
    if (file.size > MAX_BYTES) throw new Error('Cada imagem pode ter até 10 MB.');
    let bitmap;
    try { bitmap = await createImageBitmap(file); }
    catch { throw new Error('Não foi possível abrir essa imagem. Escolha outro arquivo.'); }
    try {
      if (bitmap.width * bitmap.height > 40000000) throw new Error('A imagem é muito grande. Envie uma versão de até 40 megapixels.');
      const canvas = document.createElement('canvas');
      const scale = Math.min(1, 1536 / Math.max(bitmap.width, bitmap.height));
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      const ctx = canvas.getContext('2d');
      ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      const sample = document.createElement('canvas');
      sample.width = 64; sample.height = 64;
      const sampleCtx = sample.getContext('2d', { willReadFrequently: true });
      sampleCtx.drawImage(bitmap, 0, 0, 64, 64);
      const colors = extractColors(sampleCtx.getImageData(0, 0, 64, 64));
      if (!colors.length) throw new Error('A imagem está transparente. Envie uma referência visível.');
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error('Não foi possível preparar a imagem. Tente outro arquivo.');
      return {
        id: crypto.randomUUID(), name: file.name,
        fingerprint: [file.name, file.size, file.lastModified].join(':'),
        url: URL.createObjectURL(blob),
        file: new File([blob], 'reference.png', { type: 'image/png' }),
        colors, width: bitmap.width, height: bitmap.height,
      };
    } finally { bitmap.close(); }
  }
  function palette(refs) {
    const colors = [];
    // Interleave references so one image does not consume the entire palette.
    for (let i = 0; i < 4; i++) {
      for (const ref of refs) {
        const color = ref.colors[i];
        if (color && !colors.includes(color)) colors.push(color);
      }
    }
    return colors.slice(0, 6);
  }
  window.MerannoReferences = { prepare, palette };
})();
