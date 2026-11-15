/* MERANNO — silhuetas de camiseta e gerador de estampas (SVG) */
(function () {
  'use strict';

  // ---------- Cores reais do fornecedor (Remix on Demand: Algodão, Oversized, Boxy) ----------
  const COLORS = [
    { id: 'offwhite', name: 'Off White', hex: '#F6F2E6', fits: ['regular', 'oversized', 'boxy'] },
    { id: 'preto', name: 'Preto', hex: '#0A0A0A', fits: ['regular', 'oversized', 'boxy'] },
    { id: 'marinho', name: 'Marinho', hex: '#31426B', fits: ['regular', 'oversized', 'boxy'] },
    { id: 'army', name: 'Verde Army', hex: '#4D5D55', fits: ['regular', 'oversized', 'boxy'] },
    { id: 'marrom', name: 'Marrom', hex: '#5C3A29', fits: ['regular', 'oversized', 'boxy'] },
    { id: 'chumbo', name: 'Chumbo Estonada', hex: '#5A5C5E', fits: ['boxy'] },
    { id: 'vermelho', name: 'Vermelho', hex: '#C20000', fits: ['regular'] },
    { id: 'amarelo', name: 'Amarelo', hex: '#FAE03C', fits: ['regular'] },
    { id: 'royal', name: 'Azul Royal', hex: '#1B55A4', fits: ['regular'] },
    { id: 'bandeira', name: 'Verde Bandeira', hex: '#077153', fits: ['regular'] },
  ];
  const colorById = (id) => COLORS.find((c) => c.id === id);

  const FONTS = [
    { id: 'cormorant', name: 'Cormorant', family: "'Cormorant Garamond', serif", weight: 600, k: 1.05 },
    { id: 'bodoni', name: 'Bodoni Moda', family: "'Bodoni Moda', serif", weight: 600, k: 0.92 },
    { id: 'cinzel', name: 'Cinzel', family: "'Cinzel', serif", weight: 600, k: 0.8 },
    { id: 'pinyon', name: 'Pinyon Script', family: "'Pinyon Script', cursive", weight: 400, k: 1.25 },
    { id: 'limelight', name: 'Limelight', family: "'Limelight', serif", weight: 400, k: 0.82 },
    { id: 'grotesk', name: 'Space Grotesk', family: "'Space Grotesk', sans-serif", weight: 600, k: 0.88 },
  ];
  const fontById = (id) => FONTS.find((f) => f.id === id) || FONTS[0];

  const STYLES = ['mesa', 'naipe', 'fichas', 'losango', 'carta', 'jazz'];
  const SUITS = ['copas', 'ouros', 'espadas', 'paus'];

  // ---------- util ----------
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  function hexToRgb(h) { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
  function lum(h) {
    const [r, g, b] = hexToRgb(h).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }
  function contrast(a, b) { const la = lum(a), lb = lum(b); return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05); }
  function shade(h, amt) {
    const [r, g, b] = hexToRgb(h);
    const f = (v) => Math.max(0, Math.min(255, Math.round(amt < 0 ? v * (1 + amt) : v + (255 - v) * amt)));
    return '#' + [f(r), f(g), f(b)].map((v) => v.toString(16).padStart(2, '0')).join('');
  }
  function rng(seed) {
    let a = seed >>> 0;
    return function () { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  let uid = 0;
  const nextId = (p) => `${p}${++uid}`;

  // ---------- naipes ----------
  const SUIT_PATH = {
    copas: 'M50 90C22 68 4 52 4 32C4 16 16 6 29 6C39 6 46 12 50 21C54 12 61 6 71 6C84 6 96 16 96 32C96 52 78 68 50 90Z',
    ouros: 'M50 3L87 50L50 97L13 50Z',
    espadas: 'M50 3C70 26 94 40 94 60C94 74 84 82 72 82C64 82 57 78 53 72C54 82 58 90 66 97H34C42 90 46 82 47 72C43 78 36 82 28 82C16 82 6 74 6 60C6 40 30 26 50 3Z',
    paus: 'M50 8a19 19 0 1 1 0 38a19 19 0 1 1 0-38ZM28 40a19 19 0 1 1 0 38a19 19 0 1 1 0-38ZM72 40a19 19 0 1 1 0 38a19 19 0 1 1 0-38ZM46 55C46 76 41 88 32 97H68C59 88 54 76 54 55Z',
  };
  function suit(name, x, y, size, fill, extra = '') {
    const p = SUIT_PATH[name] || SUIT_PATH.copas;
    return `<path d="${p}" fill="${fill}" transform="translate(${x - size / 2} ${y - size / 2}) scale(${size / 100})" ${extra}/>`;
  }
  // losango de ouros com divisão diagonal (sinal de apoio)
  function sign(x, y, size, a, b) {
    const s = size / 100;
    return `<g transform="translate(${x - size * 0.3} ${y - size / 2}) scale(${s})">
      <path d="M30 0L60 50L30 100L0 50Z" fill="${a}"/>
      <path d="M22 66L40 32" stroke="${b}" stroke-width="5" stroke-linecap="round"/></g>`;
  }

  // ---------- tinta: cores do usuário que aparecem sobre a malha ----------
  function resolveInks(inkHexes, fabricHex) {
    let inks = inkHexes.filter((h) => h.toLowerCase() !== fabricHex.toLowerCase() && contrast(h, fabricHex) > 1.55);
    if (!inks.length) inks = [lum(fabricHex) > 0.4 ? '#0A0A0A' : '#F6F2E6'];
    return { a: inks[0], b: inks[1] || inks[0], c: inks[2] || inks[1] || inks[0], list: inks };
  }

  function fitText(text, maxW, font, base) {
    const len = Math.max(1, [...text].length);
    return Math.min(base, (maxW / (len * 0.58)) * (1 / font.k) * 1.0);
  }
  function txt(text, x, y, size, font, fill, extra = '') {
    return `<text x="${x}" y="${y}" font-family="${esc(font.family)}" font-weight="${font.weight}" font-size="${size.toFixed(1)}" fill="${fill}" text-anchor="middle" ${extra}>${esc(text)}</text>`;
  }
  function corners(x, y, w, h, len, stroke, sw) {
    const p = (d) => `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="square"/>`;
    return p(`M${x} ${y + len}V${y}H${x + len}`) + p(`M${x + w - len} ${y}H${x + w}V${y + len}`) +
      p(`M${x} ${y + h - len}V${y + h}H${x + len}`) + p(`M${x + w - len} ${y + h}H${x + w}V${y + h - len}`);
  }

  const DEFAULT_TEXT = {
    mesa: 'Sorte de quem escolhe', naipe: 'Coração de copas', fichas: 'La Maison', losango: 'Pra quem entende',
    carta: 'Carta alta', jazz: 'After hours',
  };

  // ---------- estampas das costas (viewBox 300 x 360) ----------
  const BACK = {
    mesa(d, k, f, R) {
      const num = d.number || '17';
      const s = d.suit;
      const row = SUITS.map((n, i) => suit(n, 96 + i * 36, 236, 20, n === s ? k.b : k.c, n === s ? '' : 'opacity=".55"')).join('');
      const t = d.text || '';
      return corners(46, 26, 208, 236, 28, k.a, 3) +
        txt(num, 150, 192, num.length > 2 ? 104 : 140, f, k.a, 'letter-spacing="-2"') + row +
        `<line x1="100" y1="290" x2="200" y2="290" stroke="${k.b}" stroke-width="1.6"/>` +
        (t ? txt(t, 150, 330, fitText(t, 270, f, 34), f, k.a) : '');
    },
    naipe(d, k, f) {
      const id = nextId('arc');
      const t = d.text || '';
      const fs = Math.min(38, fitText(t, 330, f, 38));
      return `<defs><path id="${id}" d="M40 196A110 110 0 0 1 260 196"/></defs>` +
        `<circle cx="150" cy="196" r="128" fill="none" stroke="${k.b}" stroke-width="1.4"/>` +
        `<circle cx="150" cy="196" r="74" fill="none" stroke="${k.c}" stroke-width="1" stroke-dasharray="2 6" opacity=".8"/>` +
        suit(d.suit, 150, 200, 110, k.a) +
        (t ? `<text font-family="${esc(f.family)}" font-weight="${f.weight}" font-size="${fs.toFixed(1)}" fill="${k.a}" text-anchor="middle"><textPath href="#${id}" startOffset="50%">${esc(t)}</textPath></text>` : '') +
        sign(150, 338, 26, k.b, k.c);
    },
    fichas(d, k, f, R) {
      const notches = Array.from({ length: 8 }, (_, i) =>
        `<rect x="141" y="58" width="18" height="30" rx="2" fill="${k.b}" transform="rotate(${i * 45} 150 180)"/>`).join('');
      const id = nextId('ring');
      const t = (d.text || '').toUpperCase();
      return `<circle cx="150" cy="180" r="122" fill="${k.a}"/>` + notches +
        `<circle cx="150" cy="180" r="90" fill="none" stroke="${k.c}" stroke-width="2" stroke-dasharray="3 5"/>` +
        `<defs><path id="${id}" d="M150 180m-74 0a74 74 0 1 1 148 0a74 74 0 1 1 -148 0"/></defs>` +
        (t ? `<text font-family="${esc(f.family)}" font-weight="${f.weight}" font-size="${Math.min(17, fitText(t, 400, f, 17)).toFixed(1)}" letter-spacing="3" fill="${k.c}" text-anchor="middle"><textPath href="#${id}" startOffset="25%">${esc(t)}</textPath></text>` : '') +
        txt(d.number || '21', 150, 206, 72, f, k.c) +
        suit(d.suit, 150, 122, 22, k.c);
    },
    losango(d, k, f, R) {
      let grid = '';
      for (let r = 0; r < 7; r++) for (let c = 0; c < 9; c++) {
        const x = 22 + c * 32 + (r % 2 ? 16 : 0), y = 20 + r * 32;
        if (x > 280) continue;
        const dx = x - 150, dy = y - 116;
        if (dx * dx + dy * dy < 78 * 78) continue;
        grid += `<path d="M${x} ${y - 7}L${x + 5} ${y}L${x} ${y + 7}L${x - 5} ${y}Z" fill="${k.c}" opacity="${(0.35 + R() * 0.5).toFixed(2)}"/>`;
      }
      const t = d.text || '';
      return grid +
        `<path d="M150 22L210 116L150 210L90 116Z" fill="${k.a}"/>` +
        `<path d="M134 152L166 80" stroke="${k.b}" stroke-width="5" stroke-linecap="round"/>` +
        (t ? txt(t, 150, 290, fitText(t, 280, f, 40), f, k.a) : '') +
        `<line x1="40" y1="318" x2="260" y2="318" stroke="${k.b}" stroke-width="1.2"/>`;
    },
    carta(d, k, f) {
      const num = d.number || 'A';
      const t = d.text || '';
      const idx = (x, y, rot) => `<g transform="rotate(${rot} ${x} ${y})">${txt(num, x, y, 30, f, k.a)}${suit(d.suit, x, y + 18, 18, k.a)}</g>`;
      return `<rect x="66" y="16" width="168" height="250" rx="12" fill="none" stroke="${k.a}" stroke-width="3"/>` +
        `<rect x="80" y="30" width="140" height="222" rx="6" fill="none" stroke="${k.b}" stroke-width="1"/>` +
        idx(96, 62, 0) + idx(204, 220, 180) +
        suit(d.suit, 150, 142, 86, k.a) +
        (t ? txt(t, 150, 320, fitText(t, 280, f, 36), f, k.a) : '');
    },
    jazz(d, k, f) {
      let keys = '';
      for (let i = 0; i < 14; i++) keys += `<rect x="${24 + i * 18}" y="40" width="18" height="110" fill="none" stroke="${k.b}" stroke-width="1.2"/>`;
      [0, 1, 3, 4, 5, 7, 8, 10, 11, 12].forEach((i) => { keys += `<rect x="${36 + i * 18}" y="40" width="12" height="66" fill="${k.a}"/>`; });
      const t = d.text || '';
      return keys +
        (t ? txt(t, 150, 226, fitText(t, 280, f, 54), f, k.a) : '') +
        `<line x1="40" y1="262" x2="120" y2="262" stroke="${k.b}" stroke-width="1.2"/><line x1="180" y1="262" x2="260" y2="262" stroke="${k.b}" stroke-width="1.2"/>` +
        suit(d.suit, 150, 262, 18, k.b) +
        txt(d.number ? `Mesa ${d.number}` : 'Mesa 7', 150, 304, 20, fontById('cormorant'), k.c, 'font-style="italic"');
    },
  };

  function backPrint(design, fabricHex) {
    const k = resolveInks(design.inks, fabricHex);
    const f = fontById(design.font);
    const R = rng(design.seed || 1);
    const body = (BACK[design.style] || BACK.mesa)(design, k, f, R);
    const s = design.scale || 1;
    return `<g transform="translate(150 180) scale(${s}) translate(-150 -180)">${body}</g>`;
  }
  // peito (viewBox 120 x 60)
  function frontPrint(design, fabricHex) {
    const k = resolveInks(design.inks, fabricHex);
    const f = fontById(design.font);
    const t = design.frontText ?? 'MERANNO';
    if (!t) return suit(design.suit, 60, 30, 26, k.a);
    return suit(design.suit, 60, 12, 14, k.b) + txt(t, 60, 46, fitText(t, 116, f, 22), f, k.a);
  }

  // ---------- silhuetas ----------
  const FIT = {
    // T: topo, n: meia-gola, nd: profundidade gola, S: ombro, O: manga ext., I: manga int., A: axila, H: barra
    regular: { n: 32, nd: 25, S: [86, 51], O: [159, 102], I: [139, 151], A: [108, 137], H: [112, 362] },
    oversized: { n: 34, nd: 24, S: [117, 64], O: [185, 127], I: [163, 185], A: [126, 163], H: [128, 384] },
    boxy: { n: 35, nd: 23, S: [122, 61], O: [188, 112], I: [169, 166], A: [132, 146], H: [136, 328] },
  };
  const CX = 200, TOP = 32;

  function shirtPath(fit, back) {
    const g = FIT[fit];
    const nd = back ? 9 : g.nd;
    const [sx, sy] = g.S, [ox, oy] = g.O, [ix, iy] = g.I, [ax, ay] = g.A, [hx, hy] = g.H;
    return `M${CX - g.n} ${TOP} Q${CX} ${TOP + nd * 1.9} ${CX + g.n} ${TOP}
      C${CX + 53} ${TOP + 4} ${CX + sx - 18} ${sy - 5} ${CX + sx} ${sy}
      Q${CX + ox - 21} ${oy - 23} ${CX + ox} ${oy}
      Q${CX + ox - 7} ${oy + 27} ${CX + ix} ${iy}
      Q${CX + ix - 15} ${iy - 4} ${CX + ax + 3} ${ay}
      C${CX + ax - 4} ${ay + 38} ${CX + hx - 5} ${hy - 75} ${CX + hx} ${hy - 6}
      Q${CX + hx + 1} ${hy + 1} ${CX + hx - 8} ${hy + 2}
      C${CX + 53} ${hy + 7} ${CX - 46} ${hy - 2} ${CX - hx + 6} ${hy + 3}
      Q${CX - hx - 2} ${hy + 3} ${CX - hx} ${hy - 6}
      C${CX - hx + 6} ${hy - 78} ${CX - ax + 5} ${ay + 41} ${CX - ax - 3} ${ay}
      Q${CX - ix + 14} ${iy - 4} ${CX - ix} ${iy}
      Q${CX - ox + 6} ${oy + 27} ${CX - ox} ${oy}
      Q${CX - ox + 22} ${oy - 24} ${CX - sx} ${sy}
      C${CX - sx + 18} ${sy - 5} ${CX - 53} ${TOP + 4} ${CX - g.n} ${TOP}Z`;
  }

  function shirtSVG({ fit, side, fabric, design, label }) {
    const g = FIT[fit];
    const back = side === 'back';
    const id = nextId('sh');
    const dark = lum(fabric) < 0.08;
    const seam = shade(fabric, dark ? 0.10 : -0.18);
    const nd = back ? 9 : g.nd;
    const neck = `M${CX - g.n} ${TOP} Q${CX} ${TOP + nd * 1.9} ${CX + g.n} ${TOP}`;
    const neckInner = `M${CX - g.n + 7} ${TOP + 2} Q${CX} ${TOP + nd * 1.9 - 10} ${CX + g.n - 7} ${TOP + 2}`;
    const hemY = g.H[1];

    let print = '';
    if (design) {
      if (back) {
        const w = Math.min(g.A[0] * 1.48, (hemY - TOP - 104) / 1.2), h = w * 1.2, x = CX - w / 2, y = TOP + 62;
        print = `<svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="0 0 300 360" overflow="visible">${backPrint(design, fabric)}</svg>`;
      } else {
        const w = g.A[0] * 0.66, h = w * 0.5, x = CX + g.A[0] * 0.12, y = TOP + 72;
        print = `<svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="0 0 120 60" overflow="visible">${frontPrint(design, fabric)}</svg>`;
      }
    }

    // etiqueta interna (vista pela gola, só na frente) — nome em marfim sobre bordô
    const tag = back ? '' : `<rect x="${CX - 13}" y="${TOP + 3}" width="26" height="9" rx="1" fill="#551E2B"/><text x="${CX}" y="${TOP + 9.6}" font-family="'Cormorant Garamond',serif" font-size="5.2" letter-spacing="1" fill="#F6F1E8" text-anchor="middle">MERANNO</text>`;

    return `<svg viewBox="0 0 400 414" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(label || '')}">
  <defs>
    <clipPath id="${id}c"><path d="${shirtPath(fit, back)}"/></clipPath>
    <linearGradient id="${id}g" x1="0" x2="1" y1="0" y2="0">
      <stop offset="0" stop-color="#000" stop-opacity=".27"/><stop offset=".17" stop-color="#fff" stop-opacity=".035"/>
      <stop offset=".25" stop-color="#000" stop-opacity=".12"/><stop offset=".33" stop-color="#fff" stop-opacity=".09"/>
      <stop offset=".53" stop-color="#fff" stop-opacity=".025"/><stop offset=".70" stop-color="#fff" stop-opacity=".065"/>
      <stop offset=".79" stop-color="#000" stop-opacity=".15"/><stop offset=".88" stop-color="#fff" stop-opacity=".04"/>
      <stop offset="1" stop-color="#000" stop-opacity=".3"/>
    </linearGradient>
    <filter id="${id}soft"><feGaussianBlur stdDeviation="3.5"/></filter>
    <linearGradient id="${id}v" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0" stop-color="#fff" stop-opacity=".06"/><stop offset="1" stop-color="#000" stop-opacity=".1"/>
    </linearGradient>
    <filter id="${id}n" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="4"/>
      <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .07 0"/>
      <feComposite in2="SourceGraphic" operator="in"/>
    </filter>
  </defs>
  <path d="${shirtPath(fit, back)}" fill="${fabric}" stroke="${seam}" stroke-width="1.2" stroke-linejoin="round"/>
  ${!back ? `<path d="M${CX - g.n} ${TOP} Q${CX} ${TOP - 6} ${CX + g.n} ${TOP} Q${CX} ${TOP + nd * 1.9} ${CX - g.n} ${TOP}Z" fill="${shade(fabric, dark ? 0.08 : -0.3)}"/>` : ''}
  <g clip-path="url(#${id}c)">
    ${print}
    <rect width="400" height="${hemY + 30}" fill="url(#${id}g)"/>
    <rect width="400" height="${hemY + 30}" fill="url(#${id}v)"/>
    <rect width="400" height="${hemY + 30}" fill="${fabric}" filter="url(#${id}n)"/>
    <path d="M${CX + g.S[0]} ${g.S[1]} Q${CX + g.A[0] + 4} ${(g.S[1] + g.A[1]) / 2} ${CX + g.A[0]} ${g.A[1]}" fill="none" stroke="${seam}" stroke-width="1" opacity=".7"/>
    <path d="M${CX - g.S[0]} ${g.S[1]} Q${CX - g.A[0] - 4} ${(g.S[1] + g.A[1]) / 2} ${CX - g.A[0]} ${g.A[1]}" fill="none" stroke="${seam}" stroke-width="1" opacity=".7"/>
    <path d="M${CX - g.H[0]} ${hemY - 12} Q${CX} ${hemY - 6} ${CX + g.H[0]} ${hemY - 12}" fill="none" stroke="${seam}" stroke-width=".9" stroke-dasharray="3 2.5" opacity=".7"/>
    <path d="M${CX + g.O[0] - 6} ${g.O[1] - 4} L${CX + g.I[0] - 4} ${g.I[1] - 10}" fill="none" stroke="${seam}" stroke-width=".9" stroke-dasharray="3 2.5" opacity=".7"/>
    <path d="M${CX - g.O[0] + 6} ${g.O[1] - 4} L${CX - g.I[0] + 4} ${g.I[1] - 10}" fill="none" stroke="${seam}" stroke-width=".9" stroke-dasharray="3 2.5" opacity=".7"/>
    ${[-1, 1].map(s => `<g fill="none" filter="url(#${id}soft)">
      <path d="M${CX + s * (g.A[0] - 2)} ${g.A[1] - 3} Q${CX + s * (g.A[0] - 38)} ${g.A[1] + 28} ${CX + s * (g.A[0] - 26)} ${g.A[1] + 89}" stroke="#000" stroke-opacity=".22" stroke-width="7"/>
      <path d="M${CX + s * (g.A[0] - 12)} ${g.A[1] + 12} Q${CX + s * (g.A[0] - 44)} ${g.A[1] + 39} ${CX + s * (g.A[0] - 33)} ${g.A[1] + 92}" stroke="#fff" stroke-opacity=".075" stroke-width="5"/>
      <path d="M${CX + s * (g.H[0] - 19)} ${hemY - 7} Q${CX + s * (g.H[0] - 44)} ${hemY - 65} ${CX + s * (g.H[0] - 26)} ${hemY - 120}" stroke="#000" stroke-opacity=".16" stroke-width="9"/>
      <path d="M${CX + s * (g.S[0] + 9)} ${g.S[1] + 12} Q${CX + s * (g.S[0] + 13)} ${g.I[1] - 22} ${CX + s * (g.I[0] - 4)} ${g.I[1] - 7}" stroke="#fff" stroke-opacity=".06" stroke-width="9"/>
    </g>`).join('')}
  </g>
  <path d="${neck}" fill="none" stroke="${shade(fabric, dark ? 0.075 : -0.12)}" stroke-width="8" stroke-linecap="round"/>
  <path d="${neck}" fill="none" stroke="${seam}" stroke-width="6" stroke-dasharray=".65 1.35" opacity=".55"/>
  <path d="${neckInner}" fill="none" stroke="${seam}" stroke-width=".8" stroke-dasharray="3 2.5" opacity=".8"/>
  ${tag}
</svg>`;
  }

  window.MERANNO = { COLORS, colorById, FONTS, fontById, STYLES, SUITS, DEFAULT_TEXT, shirtSVG, contrast, lum, rng, printArtwork: { front: frontPrint, back: backPrint } };
})();
