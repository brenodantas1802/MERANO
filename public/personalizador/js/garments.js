/* Photographic garment surfaces. Original image alpha and cotton detail are preserved. */
(() => {
  'use strict';
  const M = window.MERANNO;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  let sequence = 0;
  // Shared camera scale, with fit-specific physical proportions and aligned collars.
  const GARMENTS = {
    regular: { sx: .43, sy: .35, top: 67, back: [129, 96, 142, 170.4], front: [218, 101, 62, 31] },
    oversized: { sx: .49, sy: .38, top: 92, back: [120, 100, 160, 192], front: [220, 109, 66, 33] },
    boxy: { sx: .49, sy: .46, top: 187, back: [126, 94, 148, 177.6], front: [220, 101, 64, 32] },
  };
  function tintTable(channel) {
    const c = channel / 255;
    return Array.from({ length: 17 }, (_, i) => {
      const light = i / 16;
      const diffuse = c * Math.pow(light / .82, 1.7);
      const reflected = (1 - c) * Math.max(0, light - .55) * .24;
      return Math.min(1, diffuse + reflected).toFixed(4);
    }).join(' ');
  }
  function shirtSVG({ fit = 'regular', side = 'front', fabric = '#F6F2E6', design, brandVisible = true, label = '' }) {
    const key = Object.hasOwn(GARMENTS, fit) ? fit : 'regular';
    const garment = GARMENTS[key];
    const back = side === 'back';
    const id = `photo-shirt-${++sequence}`;
    const asset = `assets/garments/${key}-v2.webp`;
    const sourceX = back ? -768 : 0;
    const x = 200 - 384 * garment.sx;
    const y = 32 - garment.top * garment.sy;
    let [px, py, pw, ph] = design?.aiImage && !back ? [130, 115, 140, 168] : garment[back ? 'back' : 'front'];
    const dims=design?.artDimensions?MerannoLayout.dimensions(design.artDimensions):{width:300,height:360};
    let artView=[0,0,dims.width,dims.height],clip=[px-24,py-24,pw+48,ph+48];
    if(back&&design?.aiImage&&design.layout){
      const visible=MerannoLayout.bounds(design.printBounds,dims),layout=MerannoLayout.normalize(design.layout,visible),zone=garment.back,unit=zone[2]/36;
      px=zone[0]+((36-layout.widthCM)/2+layout.offsetXCM)*unit;py=zone[1]+layout.offsetYCM*unit;pw=layout.widthCM*unit;ph=layout.heightCM*unit;
      artView=[visible.x,visible.y,visible.width,visible.height];clip=[zone[0],zone[1],zone[2],45*unit];
    }
    const channels = /^#[0-9a-f]{6}$/i.test(fabric) ? fabric.slice(1).match(/../g).map(c => parseInt(c, 16)) : [246, 242, 230];
    const surface = `<svg x="${x}" y="${y}" width="${768 * garment.sx}" height="${1024 * garment.sy}" viewBox="0 0 768 1024" preserveAspectRatio="none" overflow="hidden"><image href="${asset}" x="${sourceX}" y="0" width="1536" height="1024"/></svg>`;
    const raster = design?.aiImage && /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+=*$/.test(design.aiImage);
    const show = raster && (!design.houseId || back) && (design.placement === 'both' || design.placement === (back ? 'back' : 'front'));
    const art = raster ? (show ? '<image href="' + esc(design.aiImage) + '" width="'+dims.width+'" height="'+dims.height+'" preserveAspectRatio="xMidYMid meet"/>' : '') : design && back ? M.printArtwork.back(design, fabric) : '';
    return `<svg viewBox="0 0 400 414" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(label)}" data-garment="${key}" data-side="${back ? 'back' : 'front'}" class="garment-photo" style="isolation:isolate">
      <defs>
        <filter id="${id}-tint" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
          <feColorMatrix type="saturate" values="0"/>
          <feComponentTransfer>
            <feFuncR type="table" tableValues="${tintTable(channels[0])}"/>
            <feFuncG type="table" tableValues="${tintTable(channels[1])}"/>
            <feFuncB type="table" tableValues="${tintTable(channels[2])}"/>
            <feFuncA type="identity"/>
          </feComponentTransfer>
        </filter>
        <clipPath id="${id}-print"><rect x="${clip[0]}" y="${clip[1]}" width="${clip[2]}" height="${clip[3]}" rx="1"/></clipPath>
        <filter id="${id}-ink" x="-5%" y="-5%" width="110%" height="110%" color-interpolation-filters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency=".035 .06" numOctaves="2" seed="7" result="cloth"/>
          <feDisplacementMap in="SourceGraphic" in2="cloth" scale=".7" xChannelSelector="R" yChannelSelector="G"/>
        </filter>
      </defs>
      <g filter="url(#${id}-tint)">${surface}</g>
      ${!back && brandVisible ? `<svg class="front-wordmark" x="218" y="116" width="52" height="14" viewBox="0 0 150 40" aria-label="MERANNO no peito esquerdo de quem veste" data-placement="wearer-left-chest"><rect width="150" height="40" fill="transparent" pointer-events="all"/>${M.wordmarkArtwork(fabric)}</svg>` : ''}
      ${design ? `<g clip-path="url(#${id}-print)">
        <svg class="garment-print" x="${px}" y="${py}" width="${pw}" height="${ph}" viewBox="${raster?artView.join(' '):back?'0 0 300 360':'0 0 120 60'}" overflow="hidden" opacity="1">${art}</svg>
      </g>` : ''}
    </svg>`;
  }
  M.wordmarkColor = fabric => M.lum(fabric) > .45 ? '#171513' : '#F6F2E6';
  M.wordmarkArtwork = fabric => `<path d="${window.MerannoWordmarkPath}" fill="${M.wordmarkColor(fabric)}" fill-rule="evenodd"/>`;
  M.wordmarkSVG = fabric => `<svg xmlns="http://www.w3.org/2000/svg" width="150" height="40" viewBox="0 0 150 40">${M.wordmarkArtwork(fabric)}</svg>`;
  M.shirtSVG = shirtSVG;
  M.GARMENTS = GARMENTS;
})();
