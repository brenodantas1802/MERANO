/* MERANNO — Personalizador */
(function () {
  'use strict';
  const M = window.MERANNO;
  const $ = (s, r = document) => r.querySelector(s);
  const h = (tag, attrs = {}, html = '') => {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === 'class') el.className = v;
      else if (k === 'style') el.style.cssText = v;
      else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
      else if (v !== false && v != null) el.setAttribute(k, v === true ? '' : v);
    }
    if (html) el.innerHTML = html;
    return el;
  };
  const escHTML = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const changed = () => document.dispatchEvent(new Event('meranno:change'));
  let printGeometryCache={source:null,promise:null};
  function inspectPrint(source){
    if(printGeometryCache.source!==source){printGeometryCache={source,promise:(async()=>{
      const image=new Image();image.src=source;await image.decode();const dims=MerannoLayout.dimensions({width:image.naturalWidth,height:image.naturalHeight});
      let bounds={x:0,y:0,...dims},transparent=true;try{bounds=MerannoProduction.inspectArt(image).bounds;}catch{transparent=false;}
      return {dims,bounds,transparent};
    })()};}return printGeometryCache.promise;
  }

  // ---------- dados ----------
  const FITS = [
    { id: 'regular', name: 'Regular', desc: 'Ombro alinhado, corte reto', img: 'assets/fits/regular.jpg' },
    { id: 'oversized', name: 'Oversized', desc: 'Ombro caído, mangas amplas', img: 'assets/fits/oversized.jpg' },
    { id: 'boxy', name: 'Boxy', desc: 'Larga e mais curta', img: 'assets/fits/boxy.jpg' },
  ];
  const DEFAULTS = { fit: 'regular', palette: ['preto', 'offwhite', 'vermelho'], font: 'cormorant' };
  const MAX_COLORS = 6;
  const MAX_REFS = 3;
  const STYLE_DESC = {
    mesa: 'enquadramento aberto com número serifado e naipes',
    naipe: 'naipe grande com texto em arco',
    fichas: 'ficha de cassino com texto circular',
    losango: 'losango da casa sobre padrão de pequenos losangos',
    carta: 'carta de baralho com índices nos cantos',
    jazz: 'teclas de piano com texto de jazz club',
  };
  const hex = (id) => M.colorById(id).hex;

  const SUGGESTIONS = window.MerannoHousePrints;
  const houseAssets = new Map();

  const state = {
    fit: DEFAULTS.fit,
    palette: [...DEFAULTS.palette],
    font: DEFAULTS.font,
    refs: [], // Prepared images with actual pixel palettes.
    refsLoading: false,
    design: null,
    review: null,
    busy: false,
    adding: false,
    slide: 0,
    history: [], // {role:'user'|'assistant', text}
    restoredPrompt: null,
    brandVisible: true,
    deleted: null,
  };

  // ---------- toast ----------
  let toastT;
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg; t.classList.add('is-on');
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('is-on'), 3200);
  }

  // =====================================================================
  // PRÉVIA: zoom e pan com suavização
  // =====================================================================
  class PanZoom {
    constructor(root) {
      this.root = root;
      this.canvas = $('.viewer__canvas', root);
      this.content = $('.viewer__content', root);
      this.label = $('.zoom-val', root);
      this.t = { x: 0, y: 0, s: 1 };
      this.c = { x: 0, y: 0, s: 1 };
      this.ptrs = new Map();
      this.raf = 0;
      this.bind();
      new ResizeObserver(()=>this.refresh()).observe(this.canvas);
    }
    bind() {
      const cv = this.canvas;
      cv.addEventListener('wheel', (e) => {
        e.preventDefault();
        const k = Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0018));
        this.zoomAt(this.local(e), this.t.s * k);
      }, { passive: false });
      cv.addEventListener('pointerdown', (e) => {
        cv.setPointerCapture(e.pointerId);
        this.ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
        cv.classList.add('is-dragging');
      });
      cv.addEventListener('pointermove', (e) => {
        if (!this.ptrs.has(e.pointerId)) return;
        const prev = this.ptrs.get(e.pointerId);
        if (this.ptrs.size === 1) {
          this.t.x += e.clientX - prev.x; this.t.y += e.clientY - prev.y;
          this.clamp(); this.kick();
        } else if (this.ptrs.size === 2) {
          const [a, b] = [...this.ptrs.values()];
          const other = a === prev ? b : a;
          const d0 = Math.hypot(prev.x - other.x, prev.y - other.y);
          const d1 = Math.hypot(e.clientX - other.x, e.clientY - other.y);
          const mid = this.local({ clientX: (e.clientX + other.x) / 2, clientY: (e.clientY + other.y) / 2 });
          if (d0 > 0) this.zoomAt(mid, this.t.s * (d1 / d0));
        }
        this.ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
      });
      const up = (e) => { this.ptrs.delete(e.pointerId); if (!this.ptrs.size) cv.classList.remove('is-dragging'); };
      cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
      cv.addEventListener('dblclick', (e) => this.zoomAt(this.local(e), this.t.s > 1.4 ? 1 : 2.4));
      cv.addEventListener('keydown', (e) => {
        const step = 40;
        if (e.key === '+' || e.key === '=') this.zoomAt({ x: 0, y: 0 }, this.t.s * 1.3);
        else if (e.key === '-') this.zoomAt({ x: 0, y: 0 }, this.t.s / 1.3);
        else if (e.key === '0') this.reset();
        else if (e.key.startsWith('Arrow')) {
          this.t.x += e.key === 'ArrowLeft' ? step : e.key === 'ArrowRight' ? -step : 0;
          this.t.y += e.key === 'ArrowUp' ? step : e.key === 'ArrowDown' ? -step : 0;
          this.clamp(); this.kick();
        } else return;
        e.preventDefault();
      });
      this.root.querySelectorAll('[data-zoom]').forEach((b) => b.addEventListener('click', () => {
        const z = b.dataset.zoom;
        if (z === 'fit') this.reset();
        else this.zoomAt({ x: 0, y: 0 }, this.t.s * (z === 'in' ? 1.4 : 1 / 1.4));
      }));
    }
    local(e) {
      const r = this.canvas.getBoundingClientRect();
      return { x: e.clientX - r.left - r.width / 2, y: e.clientY - r.top - r.height / 2 };
    }
    maxZoom() {
      const svg=this.content.firstElementChild;if(!svg)return 1;
      const rect=svg.getBoundingClientRect(), unit=Math.min(rect.width/400,rect.height/414);
      if(!unit)return 1;
      const garment=M.GARMENTS[svg.dataset.garment];
      let pixelsPerUnit=Math.min(1/garment.sx,1/garment.sy);
      const art=svg.querySelector('.garment-print image');
      if(art){
        const url=art.getAttribute('href');
        if(this.artURL!==url){this.artURL=url;this.artImage=new Image();this.artImage.onload=()=>this.refresh();this.artImage.src=url;}
        if(!this.artImage.naturalWidth)return 1;
        const viewport=art.parentElement;
        pixelsPerUnit=Math.min(pixelsPerUnit,Math.max(this.artImage.naturalWidth/+viewport.getAttribute('width'),this.artImage.naturalHeight/+viewport.getAttribute('height')));
      }
      return Math.max(1,Math.min(6,pixelsPerUnit/(unit*(window.devicePixelRatio||1))));
    }
    refresh(){this.t.s=Math.min(this.t.s,this.maxZoom());this.c.s=Math.min(this.c.s,this.t.s);this.clamp();this.kick();}
    zoomAt(p, s) {
      s = Math.min(this.maxZoom(), Math.max(1, s));
      const k = s / this.t.s;
      this.t.x = p.x - (p.x - this.t.x) * k;
      this.t.y = p.y - (p.y - this.t.y) * k;
      this.t.s = s;
      this.clamp(); this.kick();
    }
    clamp() {
      const r = this.canvas.getBoundingClientRect();
      const mx = (r.width * (this.t.s - 1)) / 2 + r.width * 0.15;
      const my = (r.height * (this.t.s - 1)) / 2 + r.height * 0.15;
      if (this.t.s === 1) { this.t.x *= 0; this.t.y *= 0; }
      this.t.x = Math.max(-mx, Math.min(mx, this.t.x));
      this.t.y = Math.max(-my, Math.min(my, this.t.y));
    }
    reset() { this.t = { x: 0, y: 0, s: 1 }; this.kick(); }
    kick() { if (!this.raf) this.raf = requestAnimationFrame(() => this.step()); }
    step() {
      const a = reduceMotion ? 1 : 0.2;
      const c = this.c, t = this.t;
      c.x += (t.x - c.x) * a; c.y += (t.y - c.y) * a; c.s += (t.s - c.s) * a;
      const done = Math.abs(t.x - c.x) < 0.1 && Math.abs(t.y - c.y) < 0.1 && Math.abs(t.s - c.s) < 0.001;
      if (done) Object.assign(c, t);
      const svg=this.content.firstElementChild;
      if(svg){
        const rect=svg.getBoundingClientRect(),unit=Math.min(rect.width/400,rect.height/414)||1;
        const w=rect.width/(unit*c.s),h=rect.height/(unit*c.s);
        svg.setAttribute('viewBox',[200-w/2-c.x/(unit*c.s),207-h/2-c.y/(unit*c.s),w,h].join(' '));
      }
      const zoomIn=this.root.querySelector('[data-zoom="in"]');
      zoomIn.disabled=this.t.s>=this.maxZoom()-.01;
      zoomIn.title=zoomIn.disabled?'Resolução máxima da imagem':'Ampliar';
      this.label.textContent = Math.round(c.s * 100) + '%';
      this.raf = done ? 0 : requestAnimationFrame(() => this.step());
    }
  }
  const viewBack = new PanZoom($('#viewer-back'));
  const viewFront = new PanZoom($('#viewer-front'));

  function renderShirts(reveal) {
    invalidateIfChanged();
    const fabric = hex(state.palette[0]);
    const fitName = FITS.find((f) => f.id === state.fit).name;
    viewBack.content.innerHTML = M.shirtSVG({ fit: state.fit, side: 'back', fabric, brandVisible:state.brandVisible, design: state.design, label: `Verso da camiseta ${fitName}` });
    viewFront.content.innerHTML = M.shirtSVG({ fit: state.fit, side: 'front', fabric, brandVisible:state.brandVisible, design: state.design, label: `Frente da camiseta ${fitName}` });
    viewBack.refresh(); viewFront.refresh();
    changed();
    if (reveal && !reduceMotion) {
      [viewBack, viewFront].forEach((v) => {
        v.content.classList.remove('is-reveal'); void v.content.offsetWidth; v.content.classList.add('is-reveal');
      });
    }
  }
  function setGenerating(on) {
    $('.stage').querySelectorAll('.viewer__canvas').forEach((c) => c.classList.toggle('is-generating', on));
  }

  // =====================================================================
  // MODELAGEM
  // =====================================================================
  function renderFits() {
    invalidateIfChanged();
    const el = $('#fits'); el.innerHTML = '';
    FITS.forEach((f) => {
      el.append(h('button', {
        class: 'fit', type: 'button', role: 'radio', 'aria-checked': String(state.fit === f.id),
        onclick: () => { if (state.fit !== f.id) { state.fit = f.id; ensureFabric(true); renderAll(); } },
      }, `<span class="fit__preview" aria-hidden="true">${M.shirtSVG({ fit: f.id, side: 'front', fabric: '#EEE9DF', design: null })}</span><span class="fit__name">${f.name}</span><span class="fit__desc">${f.desc}</span>`));
    });
  }

  // a 1ª cor da paleta é a malha: precisa existir na modelagem escolhida
  function ensureFabric(announce) {
    const ok = (id) => M.colorById(id).fits.includes(state.fit);
    if (ok(state.palette[0])) return;
    const old = M.colorById(state.palette[0]).name;
    const fitName = FITS.find((f) => f.id === state.fit).name;
    state.palette[0] = M.COLORS.find((c) => c.id === 'preto' && ok(c.id))?.id || M.COLORS.find(c => ok(c.id)).id;
    if (announce) toast(`${old} não existe na ${fitName}. A malha agora é ${M.colorById(state.palette[0]).name}.`);
  }

  function chooseFabric(id) {
    if (!M.colorById(id)?.fits.includes(state.fit)) return;
    state.palette[0] = id;
    renderFabricColors(); renderPalette(); renderShirts();
  }
  function renderFabricColors() {
    const colors = M.COLORS.filter(c => c.fits.includes(state.fit));
    const root = $('#fabric-colors'); root.innerHTML = '';
    $('#fabric-name').textContent = M.colorById(state.palette[0]).name;
    root.setAttribute('aria-label', `Cores da camiseta ${FITS.find(f => f.id === state.fit).name}`);
    colors.forEach((color, index) => {
      const selected = color.id === state.palette[0];
      const button = h('button', {
        type: 'button', class: 'fabric-swatch', role: 'radio', 'aria-label': color.name,
        'aria-checked': String(selected), 'data-color': color.id, title: color.name,
        tabindex: selected ? '0' : '-1', style: `--fabric-color:${color.hex}`,
        onclick: () => { chooseFabric(color.id); $('#fabric-colors').querySelector(`[data-color="${color.id}"]`).focus({ preventScroll: true }); },
      });
      button.addEventListener('keydown', e => {
        let next;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (index + 1) % colors.length;
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (index - 1 + colors.length) % colors.length;
        else if (e.key === 'Home') next = 0;
        else if (e.key === 'End') next = colors.length - 1;
        else return;
        e.preventDefault(); chooseFabric(colors[next].id);
        $('#fabric-colors').querySelector(`[data-color="${colors[next].id}"]`).focus({ preventScroll: true });
      });
      root.append(button);
    });
  }

  // =====================================================================
  // PALETA
  // =====================================================================
  let pop = null;
  function closePop() { if (pop) { pop.remove(); pop = null; } $('#palette').querySelectorAll('.is-open').forEach((e) => e.classList.remove('is-open')); }

  function optionsFor(i) {
    if (i === 0) return M.COLORS.filter(c => c.fits.includes(state.fit));
    const used = new Set(state.palette.filter((_, k) => k !== i && k !== 0));
    return M.COLORS.filter((c) => !used.has(c.id));
  }

  function placePop(p, col) {
    const wrap = $('#palette');
    wrap.append(p);
    const W = wrap.clientWidth, pw = p.offsetWidth;
    const cx = col.offsetLeft + col.offsetWidth / 2;
    const left = Math.max(0, Math.min(W - pw, cx - pw / 2));
    p.style.left = left + 'px';
    p.style.top = (col.offsetTop + col.offsetHeight + 10) + 'px';
    p.style.setProperty('--arrow', (cx - left) + 'px');
  }

  function openBubble(i, col, btn) {
    const was = btn.classList.contains('is-open');
    closePop(); state.adding = false;
    if (was) return;
    btn.classList.add('is-open');
    const opts = optionsFor(i);
    pop = h('div', { class: 'pop pop--bubble', role: 'listbox', 'aria-label': 'Trocar cor' });
    pop.append(h('div', { class: 'pop__title' }, i === 0 ? `Cores de malha da ${FITS.find((f) => f.id === state.fit).name}` : 'Trocar por'));
    opts.forEach((c) => {
      const cur = c.id === state.palette[i];
      pop.append(h('button', {
        class: 'dot', type: 'button', role: 'option', 'aria-selected': String(cur), 'data-name': c.name, 'aria-label': c.name,
        style: `background:${c.hex};${cur ? 'box-shadow:0 0 0 2px var(--marfim),0 0 0 3.5px var(--bordo)' : ''}`,
        onclick: (e) => { e.stopPropagation(); state.palette[i] = c.id; closePop(); renderPalette(); renderFabricColors(); renderShirts(); },
      }));
    });
    placePop(pop, col);
    pop.querySelector('.dot')?.focus({ preventScroll: true });
  }

  function openAddList(col) {
    const opts = optionsFor(state.palette.length);
    pop = h('div', { class: 'pop pop--list', role: 'listbox', 'aria-label': 'Escolher nova cor' });
    if (!opts.length) pop.append(h('p', { class: 'pop__empty' }, 'Todas as cores disponíveis já estão na paleta.'));
    opts.forEach((c) => pop.append(h('button', {
      type: 'button', role: 'option',
      onclick: (e) => { e.stopPropagation(); state.palette.push(c.id); state.adding = false; closePop(); renderPalette(); },
    }, `<i style="background:${c.hex}"></i><b>${c.name}</b><small>${c.hex}</small>`)));
    placePop(pop, col);
    pop.querySelector('button')?.focus({ preventScroll: true });
  }

  function renderPalette() {
    invalidateIfChanged();
    changed();
    closePop();
    const el = $('#palette'); el.innerHTML = '';
    const bar = h('div', { class: 'pal-bar' });
    const dels = h('div', { class: 'pal-dels' });
    state.palette.forEach((id, i) => {
      const c = M.colorById(id);
      const col = h('div', { class: 'pal-col' });
      const light = M.lum(c.hex) > 0.45;
      const btn = h('button', {
        class: 'pal-sw' + (light ? ' is-light' : ''), type: 'button', style: `background:${c.hex}`,
        'aria-label': `${i === 0 ? 'Cor da malha' : 'Cor'} ${c.name}, ${c.hex}. Clique para trocar.`,
      }, `${i === 0 ? '<span class="pal-sw__tag">malha</span>' : ''}<span class="pal-sw__name">${c.name}</span><span class="pal-sw__hex">${c.hex}</span>`);
      btn.addEventListener('click', (e) => { e.stopPropagation(); openBubble(i, col, btn); });
      col.append(btn); bar.append(col);
      dels.append(h('div', {}, '').appendChild(h('button', {
        class: 'pal-del', type: 'button', 'aria-label': `Remover ${c.name}`, disabled: state.palette.length === 1,
        onclick: () => {
          state.palette.splice(i, 1);
          if (i === 0) ensureFabric(false);
          renderPalette(); renderFabricColors(); renderShirts();
        },
      }, '<span class="ms">delete</span>')).parentNode);
    });
    if (state.adding) {
      const col = h('div', { class: 'pal-col' }, '<div class="pal-pending" aria-hidden="true"></div>');
      bar.append(col); dels.append(h('div'));
      el.append(bar, dels);
      requestAnimationFrame(() => openAddList(col));
      return;
    }
    if (state.palette.length < MAX_COLORS) {
      const col = h('div', { class: 'pal-col' });
      col.append(h('button', {
        class: 'pal-add', type: 'button',
        onclick: (e) => { e.stopPropagation(); state.adding = true; renderPalette(); },
      }, '<span class="ms">add</span>Adicionar cor'));
      bar.append(col); dels.append(h('div'));
    }
    el.append(bar, dels);
  }

  document.addEventListener('click', (e) => {
    if (pop && !pop.contains(e.target)) {
      closePop();
      if (state.adding) { state.adding = false; renderPalette(); }
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (!$('#modal').hidden) return closeModal();
    if (pop) { closePop(); if (state.adding) { state.adding = false; renderPalette(); } }
  });

  // =====================================================================
  // FONTES
  // =====================================================================
  function renderFonts() {
    invalidateIfChanged();
    const el = $('#fonts'); el.innerHTML = '';
    M.FONTS.forEach((f) => el.append(h('button', {
      class: 'font-btn', type: 'button', role: 'radio', 'aria-checked': String(state.font === f.id),
      style: `font-family:${f.family};font-weight:${f.weight};font-size:${Math.round(17 * f.k)}px`,
      onclick: () => { state.font = f.id; renderFonts(); },
    }, escHTML(f.name))));
    changed();
  }

  // =====================================================================
  // SUGESTÕES (carrossel)
  // =====================================================================
  let houseCategory='all',visibleSuggestions=SUGGESTIONS;
  const searchText=value=>String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  function filterHouse(){
    const words=searchText($('#house-search').value.trim()).split(/\s+/).filter(Boolean);
    visibleSuggestions=SUGGESTIONS.filter(item=>(houseCategory==='all'||item.categories?.includes(houseCategory))&&words.every(word=>searchText(item.name+' '+(item.tags||'')).includes(word)));
    state.slide=0;renderCarousel();
  }
  document.querySelectorAll('[data-house-category]').forEach(button=>button.addEventListener('click',()=>{
    houseCategory=button.dataset.houseCategory;
    document.querySelectorAll('[data-house-category]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
    filterHouse();
  }));
  $('#house-search').addEventListener('input',filterHouse);
  $('#house-clear').addEventListener('click',()=>{
    houseCategory='all';$('#house-search').value='';
    document.querySelectorAll('[data-house-category]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.houseCategory==='all')));
    filterHouse();$('#house-search').focus();
  });
  function renderCarousel() {
    const track=$('#car-track');track.innerHTML='';
    visibleSuggestions.forEach((item,i)=>{
      const ready=!!item.art;
      const card=h(ready?'button':'div',{class:'slide'+(ready?'':' slide--pending'),...(ready?{type:'button',tabindex:i===state.slide?'0':'-1','aria-label':'Usar '+item.name}:{}),'data-house-id':item.id});
      if(item.mockup){const img=h('img',{src:item.mockup,alt:item.name,loading:'lazy'});img.style.cssText='width:100%;height:180px;object-fit:contain';card.append(img);}
      else if(ready){card.innerHTML=M.shirtSVG({fit:item.fit,side:'back',fabric:hex(item.fabric)});loadHouse(item).then(design=>{card.querySelector('svg').outerHTML=M.shirtSVG({fit:item.fit,side:'back',fabric:hex(item.fabric),design});}).catch(()=>{card.disabled=true;card.querySelector('.slide__cta').textContent='Arte indisponível';});}
      else card.append(h('span',{class:'ms','aria-hidden':'true'},'image'));
      const name=h('span',{class:'slide__name'});name.textContent=item.name;card.append(name);
      const caption=h('span',{class:'slide__cta'});caption.textContent=ready?'Aplicar e personalizar':'Aguardando a arte final';card.append(caption);
      if(ready)card.addEventListener('click',()=>applySuggestion(item));track.append(card);
    });
    $('#carousel').hidden=!visibleSuggestions.length;
    $('#house-empty').hidden=!!visibleSuggestions.length;
    $('#house-clear').hidden=houseCategory==='all'&&!$('#house-search').value;
    $('#carousel').querySelectorAll('.car-arrow').forEach(b=>b.disabled=visibleSuggestions.length<2);
    moveCarousel(0);
    let note=$('#house-note');if(!note){note=h('p',{id:'house-note',class:'house-note'});$('#carousel').after(note);}
    note.textContent='Personalize as costas. A marca frontal é uma aplicação separada.';
  }
  function moveCarousel(dir) {
    const n=visibleSuggestions.length;if(!n){$('#sugg-count').textContent='0 resultados';return;}
    state.slide=(state.slide+dir+n)%n;
    $('#car-track').style.transform='translateX('+(-state.slide*100)+'%)';
    $('#car-track').querySelectorAll('.slide').forEach((el,i)=>{if(el.tagName==='BUTTON')el.tabIndex=i===state.slide?0:-1;});
    $('#sugg-count').textContent=(state.slide+1)+' de '+n;
  }
  $('#carousel').querySelectorAll('.car-arrow').forEach(b=>b.addEventListener('click',()=>moveCarousel(+b.dataset.dir)));
  async function loadHouse(item){
    if(!houseAssets.has(item.id))houseAssets.set(item.id,(async()=>{
      const response=await fetch(item.art);if(!response.ok)throw Error('Não foi possível abrir a arte. Tente novamente.');
      const blob=await response.blob();if(blob.type!=='image/png')throw Error('A estampa precisa ser um PNG transparente.');
      const url=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(Error('Não foi possível ler a arte.'));reader.readAsDataURL(blob);});
        const image=new Image();image.src=url;await image.decode();
        const prepared=await window.MerannoProduction.prepareArt(image);
        return {aiImage:prepared.image.src,houseId:item.id,houseName:item.name,placement:'back',prompt:item.description,approvedAt:new Date().toISOString()};
    })().catch(error=>{houseAssets.delete(item.id);throw error;}));
    return houseAssets.get(item.id);
  }
  function addDownload(message,design){
    const download=h('button',{class:'art-download btn btn--solid',type:'button'});download.textContent='Baixar para produção';
    download.addEventListener('click',async()=>{if(state.busy||state.refsLoading)return;download.disabled=true;try{if(design===state.design&&design.placement!=='front')await window.MerannoStudio.preparePrint();await window.MerannoProduction.open({design,brandVisible:state.brandVisible,fit:state.fit,fitName:FITS.find(f=>f.id===state.fit).name,fabric:hex(state.palette[0]),fabricName:M.colorById(state.palette[0]).name});}catch(error){toast(error.message);}finally{download.disabled=false;}});message.append(download);
    if(design.placement!=='front'){const adjust=h('button',{class:'art-adjust btn btn--ghost',type:'button'});adjust.textContent='Ajustar tamanho e posição';adjust.addEventListener('click',()=>{const editor=$('#print-editor');editor.hidden=false;editor.scrollIntoView({behavior:reduceMotion?'auto':'smooth',block:'nearest'});$('#print-width').focus({preventScroll:true});});message.append(adjust);}
  }
  async function applySuggestion(item) {
    if(state.busy||state.refsLoading)return toast('Aguarde a operação atual terminar.');
    invalidateReview();setBusy(true);
    try{
      const design=await loadHouse(item);
      state.fit=item.fit;state.palette[0]=item.fabric;ensureFabric(false);
      state.design={...design};state.brandVisible=true;state.deleted=null;state.history=[];state.restoredPrompt=null;log.innerHTML='';renderAll();
      viewBack.reset();viewFront.reset();
      const msg='“'+item.name+'” aplicada nas costas. Use o editor da peça para mover ou apagar; o chat pode criar variações.';
      const message=pushMsg('ai',msg);addDownload(message,state.design);
      state.history.push({role:'assistant',text:'Estampa selecionada: '+item.name+'. '+msg});
      renderChips();
      $('#chat-input').focus();
    }catch(error){toast(error.message);}finally{setBusy(false);}
  }

  // =====================================================================
  // REFERÊNCIAS
  // =====================================================================
  function referenceColors() {
    return $('#refs-use-colors').checked ? window.MerannoReferences.palette(state.refs) : [];
  }
  function updateReferenceInspiration() {
    const colors = referenceColors();
    if (state.design && !state.design.aiImage && (colors.length || state.design.referenceColors)) {
      state.design.inks = colors.length ? colors : state.palette.slice(1).map(hex);
      state.design.referenceColors = colors.length > 0;
      renderShirts(true);
    }
  }
  function refsFeedback(message, error = false) {
    $('#refs-feedback').textContent = message;
    $('#refs-feedback').classList.toggle('is-error', error);
  }
  function renderRefs() {
    invalidateIfChanged();
    const el = $('#refs'); el.innerHTML = '';
    state.refs.forEach((r, i) => {
      const box = h('div', { class: 'ref' }, `<img src="${r.url}" alt="${escHTML(r.name)}"><span class="ref__name" title="${escHTML(r.name)}">${escHTML(r.name)}</span>`);
      box.append(h('button', {
        class: 'ref__rm', type: 'button', disabled: state.busy || state.refsLoading, 'aria-label': `Remover referência ${i + 1}`,
        onclick: () => {
          if (state.busy || state.refsLoading) return;
          URL.revokeObjectURL(r.url); state.refs = state.refs.filter(ref => ref.id !== r.id);
          renderRefs(); updateReferenceInspiration();
          refsFeedback(state.refs.length ? 'Referência removida. A inspiração foi atualizada.' : 'Envie uma imagem para inspirar sua estampa.');
        },
      }, '<span class="ms">close</span>'));
      el.append(box);
    });
    if (state.refs.length < MAX_REFS) {
      const add = h('button', { class: 'ref-add', type: 'button', disabled: state.busy || state.refsLoading, onclick: () => $('#refs-input').click() },
        `<span class="ms">upload</span>${state.refsLoading ? 'Preparando…' : state.refs.length ? 'Adicionar' : 'Enviar referências'}`);
      el.append(add);
      for (let k = state.refs.length + 1; k < MAX_REFS; k++) el.append(h('div', { class: 'ref-slot', 'aria-hidden': 'true' }));
    }
    $('#refs-count').textContent = `${state.refs.length} de ${MAX_REFS}`;
    $('#ref-direction').hidden = !state.refs.length;
    $('#ref-colors').innerHTML = window.MerannoReferences.palette(state.refs).map(color => `<span style="background:${color}" title="${color}" aria-label="Cor ${color}" role="img"></span>`).join('');
    $('#refs-apply').disabled = state.busy || state.refsLoading;
    $('#refs-notes').disabled = state.busy || state.refsLoading;
    $('#refs-use-colors').disabled = state.busy || state.refsLoading;
    $('.send-btn').disabled = state.busy || state.refsLoading;
    $('#prefs-reset').disabled = state.busy || state.refsLoading;
    $('#refs').setAttribute('aria-busy', String(state.refsLoading));
    changed();
  }
  async function addRefs(files) {
    if (state.busy || state.refsLoading) return toast('Aguarde a operação atual terminar.');
    if (!files.length) return;
    state.refsLoading = true; renderRefs();
    refsFeedback('Preparando imagens e extraindo as cores…');
    const errors = []; let added = 0;
    try {
      for (const file of [...files]) {
        if (state.refs.length >= MAX_REFS) { errors.push('Cabem até 3 referências. Remova uma para trocar.'); break; }
        const fingerprint = [file.name, file.size, file.lastModified].join(':');
        if (state.refs.some(ref => ref.fingerprint === fingerprint)) { errors.push('Essa imagem já foi adicionada.'); continue; }
        try { state.refs.push(await window.MerannoReferences.prepare(file)); added++; }
        catch (error) { errors.push(error.message); }
      }
      updateReferenceInspiration();
    } finally {
      state.refsLoading = false; renderRefs();
      const success = added ? `${added} referência(s) pronta(s) para orientar a conversa e o próximo prompt.` : '';
      refsFeedback([success, ...new Set(errors)].filter(Boolean).join(' '), errors.length > 0);
    }
  }
  $('#refs-input').addEventListener('change', (e) => { addRefs(e.target.files); e.target.value = ''; });
  ['dragenter', 'dragover'].forEach(event => $('#refs').addEventListener(event, e => {
    e.preventDefault(); $('#refs').classList.add('is-over');
  }));
  $('#refs').addEventListener('dragleave', e => { if (!$('#refs').contains(e.relatedTarget)) $('#refs').classList.remove('is-over'); });
  $('#refs').addEventListener('drop', e => {
    e.preventDefault(); $('#refs').classList.remove('is-over'); addRefs(e.dataTransfer.files);
  });
  document.addEventListener('paste', e => {
    if (e.clipboardData?.files.length) { e.preventDefault(); addRefs(e.clipboardData.files); }
  });
  // Do not let a missed drop navigate away from the unsaved creation.
  ['dragover', 'drop'].forEach(event => document.addEventListener(event, e => {
    if ([...(e.dataTransfer?.types || [])].includes('Files')) e.preventDefault();
  }));
  $('#refs-use-colors').addEventListener('change', () => {
    invalidateIfChanged();
    updateReferenceInspiration();
    refsFeedback($('#refs-use-colors').checked ? 'As cores das referências estão ativas.' : 'A estampa usará as cores escolhidas na paleta.');
    changed();
  });
  $('#refs-notes').addEventListener('input', () => { invalidateIfChanged(); changed(); });
  document.addEventListener('meranno:connection', invalidateReview);
  $('#refs-apply').addEventListener('click', () => {
    if (state.refs.length) send($('#refs-notes').value.trim() || 'Use as cores das minhas referências como base');
  });

  // =====================================================================
  // CHAT
  // =====================================================================
  const log = $('#chat-log');
  const INTRO = 'Qual é a ideia da sua estampa?\n\nUse o editor da peça sem chat ou conte sua ideia para criar com IA.';
  const CHIPS = ['Quero uma estampa cartoon', 'Algo gráfico e tecnológico', 'Desenho ou rascunho', 'Usar minhas referências'];

  function pushMsg(kind, text, prompt) {
    const li = h('li', { class: `msg msg--${kind}` });
    li.textContent = text;
    if (prompt) {
      const d = h('details', { class: 'msg__prompt' });
      d.append(h('summary', {}, '<span class="ms">chevron_right</span>Ver direção da criação'));
      const box = h('div'); box.textContent = prompt; d.append(box);
      li.append(d);
    }
    log.append(li);
    log.scrollTop = log.scrollHeight;
    renderChips();
    changed();
    return li;
  }
  function typing() {
    const li = h('li', { class: 'msg msg--ai', 'aria-label': 'Escrevendo' }, '<span class="typing"><i></i><i></i><i></i></span>');
    log.append(li); log.scrollTop = log.scrollHeight;
    return li;
  }
  function renderChips() {
    const el = $('#chat-chips'); el.innerHTML = '';
    if (state.history.length) return;
    CHIPS.forEach((c) => el.append(h('button', { class: 'chip', type: 'button', onclick: () => send(c) }, escHTML(c))));
  }
  function resetChat() {
    invalidateReview();
    state.design = null;
    state.restoredPrompt = null;
    state.history = [];
    log.innerHTML = '';
    pushMsg('ai', INTRO);
    renderShirts();
  }

  function setBusy(on) {
    state.busy = on;
    $('.prefs').inert = on;
    $('#connect-ai').disabled = on;
    $('.send-btn').disabled = on;
    $('#chat-reset').disabled = on;
    $('#prefs-reset').disabled = on || state.refsLoading;
    renderRefs();
  }

  // Conversation and image generation are separate actions and separate endpoints.
  function prefsSummary() {
    return {marcaFrontal:state.brandVisible,fit: FITS.find(f=>f.id===state.fit).name,
      malha: M.colorById(state.palette[0]).name + ' ' + hex(state.palette[0]),
      cores: referenceColors().length ? referenceColors() : state.palette.slice(1).map(hex),
      fonte: M.fontById(state.font).name,
      estampaDaCasa:state.design?.houseId||null, frenteFixa:!!state.design?.houseId,
      arteAtual:state.design?.aiImage?'A primeira imagem é a arte atual das costas. Edite apenas o que o cliente pedir, preservando os demais elementos.':null,
      orientacaoReferencias: state.refs.length ? $('#refs-notes').value.trim() : '',
      usarCoresDasReferencias: $('#refs-use-colors').checked};
  }
  function fingerprint() { return JSON.stringify([prefsSummary(),state.refs.map(r=>r.id),state.design?.aiImage]); }
  function invalidateReview() {
    const review=state.review;if(!review)return;
    state.restoredPrompt={prompt:review.element.querySelector('textarea').value,placement:review.element.querySelector('select').value};
    review.element.classList.add('review-expired');
    review.element.querySelectorAll('button,textarea,select').forEach(el=>el.disabled=true);
    review.status.textContent='Esta revisão foi substituída. Continue a conversa para montar um novo prompt.';
    state.review=null;
  }
  function invalidateIfChanged() { if(state.review && state.review.fingerprint!==fingerprint())invalidateReview(); }
  async function requestContext() {
    const references=await Promise.all(state.refs.map(async ref=>{
      if(ref.dataURL)return ref.dataURL;
      const bitmap=await createImageBitmap(ref.file);
      try {
        const canvas=document.createElement('canvas');const scale=Math.min(1,1280/Math.max(bitmap.width,bitmap.height));
        canvas.width=Math.round(bitmap.width*scale);canvas.height=Math.round(bitmap.height*scale);
        const ctx=canvas.getContext('2d');ctx.fillStyle='#ffffff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);
        ref.dataURL=canvas.toDataURL('image/jpeg',.88);
      } finally {bitmap.close();}
      return ref.dataURL;
    }));
    if(state.design?.aiImage){
      const image=new Image();image.src=state.design.aiImage;await image.decode();
      const canvas=document.createElement('canvas'),ratio=Math.min(1,1280/Math.max(image.width,image.height));
      canvas.width=Math.round(image.width*ratio);canvas.height=Math.round(image.height*ratio);canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);
      references.unshift(canvas.toDataURL('image/webp',.92));
    }
    return {preferences:prefsSummary(),references};
  }
  function showReview(result,context) {
    invalidateReview();
    state.restoredPrompt = null;
    const element=h('li',{class:'prompt-review'});
    const title=h('h3');title.textContent='Confira sua estampa';
    const intro=h('p');intro.textContent='Edite se quiser. Só geramos após sua aprovação.';
    const id='prompt-'+crypto.randomUUID();
    const label=h('label',{for:id});label.textContent='Prompt da estampa';
    const area=h('textarea',{id,maxlength:'7000','aria-label':'Prompt final para aprovação'});area.value=result.draft.prompt;
    const placementLabel=h('label',{for:id+'-side'});placementLabel.textContent='Aplicar a arte em';
    const placement=h('select',{id:id+'-side'});
    (state.design?.houseId?[['back','Costas · frente fixa']]:[['back','Costas · padrão'],['front','Frente'],['both','Frente e costas (mesma arte)']]).forEach(([value,text])=>{const opt=h('option',{value});opt.textContent=text;placement.append(opt);});placement.value=result.draft.placement || 'back';
    const brandNote=h('p',{class:'brand-note'});brandNote.textContent='“MERANNO” no peito esquerdo de quem veste, separado da arte.';
    const status=h('p',{class:'review-status',role:'status','aria-live':'polite'});
    status.textContent='Aguardando sua aprovação.';
    const save=h('button',{class:'btn btn--ghost',type:'button',hidden:true});save.textContent='Salvar revisão do prompt';
    const approve=h('button',{class:'btn btn--solid',type:'button'});approve.textContent='Aprovar prompt e gerar prévia';
    element.append(title,intro,label,area,placementLabel,placement,brandNote,status,save,approve);log.append(element);
    const review={element,status,context,fingerprint:fingerprint(),draft:result.draft,token:result.reviewToken};state.review=review;
    const dirty=()=>{approve.disabled=true;save.hidden=false;status.textContent='Você alterou o prompt. Salve a revisão antes de aprovar.';};
    area.addEventListener('input',()=>{dirty();changed();});placement.addEventListener('change',()=>{dirty();changed();});
    save.addEventListener('click',async()=>{
      if(state.busy || state.review!==review)return;
      setBusy(true);save.disabled=true;area.disabled=true;placement.disabled=true;
      try{
        const update=await window.MerannoAI.call('review',{...context,reviewToken:review.token,draft:{prompt:area.value.trim(),placement:placement.value}});
        review.draft=update.draft;review.token=update.reviewToken;save.hidden=true;approve.disabled=false;status.textContent='Revisão salva. Confira e aprove para gerar.';
      }catch(error){status.textContent=error.message;}
      finally{save.disabled=false;area.disabled=false;placement.disabled=false;setBusy(false);}
    });
    approve.addEventListener('click',async()=>{
      if(state.busy || state.review!==review)return;
      invalidateIfChanged();if(state.review!==review)return;
      if(!window.MerannoAI.ensure())return;
      setBusy(true);setGenerating(true);approve.disabled=true;area.disabled=true;placement.disabled=true;save.disabled=true;
      status.textContent='Gerando a estampa aprovada. Isso pode levar alguns minutos.';
      try{
        const result=await window.MerannoAI.generate({...context,reviewToken:review.token,draft:review.draft,approved:true},message=>{status.textContent=message;});
        state.design={houseId:state.design?.houseId,houseName:state.design?.houseName,layout:state.design?.layout,aiImage:result.image,placement:state.design?.houseId?'back':result.placement,prompt:review.draft.prompt,approvedAt:new Date().toISOString(),costUSD:result.costUSD};state.review=null;
        renderShirts(true);status.textContent='Estampa criada e aplicada na prévia da camiseta.';approve.textContent='Prévia gerada';
        const completedDesign=state.design;
        const message=pushMsg('ai','Sua prévia está pronta. Quer ajustar algo?');
        if(typeof result.costUSD==='number') {const cost=h('p',{class:'generation-cost'});cost.textContent='Custo da imagem: '+new Intl.NumberFormat('pt-BR',{style:'currency',currency:'USD',minimumFractionDigits:4}).format(result.costUSD)+' · conversa à parte';message.append(cost);}
        addDownload(message,completedDesign);
        state.history.push({role:'assistant',text:'Estampa gerada após aprovação. Prompt usado: '+review.draft.prompt});
      }catch(error){status.textContent=error.message;approve.disabled=false;area.disabled=false;placement.disabled=false;save.disabled=false;}
      finally{setGenerating(false);setBusy(false);}
    });
    log.scrollTop=log.scrollHeight;
  }
  async function send(text) {
    text=text.trim();if(!text || state.busy)return false;
    if(text.length>6000){toast('Envie uma mensagem com até 6.000 caracteres.');return false;}
    if(state.refsLoading){toast('Aguarde as referências terminarem de carregar.');return false;}
    await window.MerannoAI.ready;if(!window.MerannoAI.ensure())return false;
    invalidateReview();setBusy(true);pushMsg('user',text);
    const message={role:'user',text};state.history.push(message);const tp=typing();
    try{
      const context=await requestContext();
      const result=await window.MerannoAI.call('chat',{...context,messages:state.history});
      tp.remove();pushMsg('ai',result.reply);state.history.push({role:'assistant',text:result.reply+(result.ready?'\nPrompt proposto: '+result.draft.prompt:'')});
      if(result.ready)showReview(result,context);
      return true;
    }catch(error){tp.remove();state.history.pop();const errorMessage=pushMsg('note',error.message);const retry=h('button',{class:'chip',type:'button'});retry.textContent='Tentar novamente';retry.addEventListener('click',()=>{if(!state.busy){retry.disabled=true;send(text);}});errorMessage.append(document.createElement('br'),retry);return false;}
    finally{setBusy(false);}
  }

  const input = $('#chat-input');
  const grow = () => { input.style.height = 'auto'; input.style.height = Math.min(140, input.scrollHeight) + 'px'; };
  input.addEventListener('input', () => { grow(); changed(); });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); $('#chat-form').requestSubmit(); }
  });
  $('#chat-form').addEventListener('submit', (e) => {
    e.preventDefault();
    if (state.busy || state.refsLoading) return;
    const v = input.value; send(v).then(sent => { if (sent && input.value === v) { input.value = ''; grow(); changed(); } });
  });

  // ---------- reset do chat (com confirmação) ----------
  let lastFocus = null;
  function openModal() { lastFocus = document.activeElement; $('#modal').hidden = false; $('#modal-cancel').focus(); }
  function closeModal() { $('#modal').hidden = true; lastFocus?.focus?.(); }
  $('#chat-reset').addEventListener('click', openModal);
  $('#modal-cancel').addEventListener('click', closeModal);
  $('#modal').addEventListener('click', (e) => { if (e.target.id === 'modal') closeModal(); });
  $('#modal-confirm').addEventListener('click', () => { closeModal(); resetChat(); toast('Criação recomeçada. Suas preferências continuam.'); });
  $('#modal').addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const f = [$('#modal-cancel'), $('#modal-confirm')];
    const i = f.indexOf(document.activeElement);
    e.preventDefault(); f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
  });

  // ---------- reset das preferências ----------
  $('#prefs-reset').addEventListener('click', () => {
    if (state.busy || state.refsLoading) return;
    invalidateReview();state.design=null;state.brandVisible=false;state.deleted=null;state.history=[];state.restoredPrompt=null;
    log.innerHTML='';input.value='';grow();
    state.fit = DEFAULTS.fit; state.palette = ['offwhite',...DEFAULTS.palette.slice(1)]; state.font = DEFAULTS.font;
    viewBack.reset();viewFront.reset();
    state.refs.forEach((r) => URL.revokeObjectURL(r.url)); state.refs = [];
    $('#refs-notes').value = ''; $('#refs-use-colors').checked = true;
    updateReferenceInspiration();
    refsFeedback('Arraste as imagens para cá ou clique para escolher.');
    state.adding = false;
    renderAll();
    toast('Camiseta branca e sem aplicações.');
  });

  function renderAll() { renderFits(); renderFabricColors(); renderPalette(); renderFonts(); renderRefs(); renderShirts(); }
  window.MerannoStudio = {
    getEditState:()=>({busy:state.busy||state.refsLoading,brandVisible:state.brandVisible,design:state.design,canUndo:!!state.deleted}),
    deletePart(part){
      if(state.busy||state.refsLoading)return;
      state.deleted={design:structuredClone(state.design),brandVisible:state.brandVisible};invalidateReview();state.restoredPrompt=null;
      if(part==='brand')state.brandVisible=false;
      else if(state.design?.placement==='both')state.design={...state.design,placement:part==='back'?'front':'back'};
      else state.design=null;
      document.querySelectorAll('.art-download,.art-adjust').forEach(el=>el.remove());renderShirts();
    },
    undoDelete(){if(!state.deleted||state.busy||state.refsLoading)return;invalidateReview();Object.assign(state,state.deleted);state.deleted=null;renderShirts();},
    showBrand(){if(state.busy||state.refsLoading)return;state.brandVisible=true;renderShirts();},
    async uploadArt(file){
      if(state.busy||state.refsLoading)return;if(!file||file.type!=='image/png'||file.size>9000000)throw Error('Envie um PNG transparente de até 9 MB.');
      setBusy(true);try{const url=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=()=>reject(Error('Não foi possível ler a arte.'));r.readAsDataURL(file);});
      const image=new Image();image.src=url;await image.decode();MerannoLayout.dimensions({width:image.naturalWidth,height:image.naturalHeight});await MerannoProduction.prepareArt(image);
      invalidateReview();state.restoredPrompt=null;state.design={aiImage:url,placement:'back',houseName:file.name.slice(0,100),prompt:''};state.deleted=null;renderShirts();
      }finally{setBusy(false);}
    },
    async downloadCurrent(){if(!state.design||state.busy||state.refsLoading)return;try{await this.preparePrint();await MerannoProduction.open({design:state.design,brandVisible:state.brandVisible,fit:state.fit,fitName:FITS.find(f=>f.id===state.fit).name,fabric:hex(state.palette[0]),fabricName:M.colorById(state.palette[0]).name});}catch(error){toast(error.message);}},
    getState: () => ({ busy:state.busy||state.refsLoading, hasDesign:!!state.design, name:state.design?.houseName||'Minha criação' }),
    getPrintState:()=>({busy:state.busy||state.refsLoading,source:state.design?.aiImage||null,placement:state.design?.placement||'back',layout:state.design?.layout?{...state.design.layout}:null,dimensions:state.design?.artDimensions?{...state.design.artDimensions}:null,bounds:state.design?.printBounds?{...state.design.printBounds}:null}),
    async preparePrint(){
      if(state.busy||state.refsLoading||!state.design?.aiImage)return null;const design=state.design,geometry=await inspectPrint(design.aiImage);
      if(state.design!==design||state.busy||state.refsLoading)return null;
      const layout=design.layout?MerannoLayout.normalize(design.layout,geometry.bounds):MerannoLayout.initial(geometry.dims,geometry.bounds);
      const before=JSON.stringify([design.artDimensions,design.printBounds,design.layout]);design.artDimensions=geometry.dims;design.printBounds=geometry.bounds;design.layout=layout;
      if(JSON.stringify([design.artDimensions,design.printBounds,design.layout])!==before)renderShirts();return {transparent:geometry.transparent};
    },
    setPrintLayout(value){if(state.busy||state.refsLoading||!state.design?.artDimensions||state.design.placement==='front')return false;state.design.layout=MerannoLayout.normalize(value,state.design.printBounds||state.design.artDimensions);renderShirts();return true;},
    async snapshot() {
      const captured={version:1,brandVisible:state.brandVisible,fit:state.fit,palette:[...state.palette],font:state.font,design:structuredClone(state.design),history:structuredClone(state.history),referenceNotes:$('#refs-notes').value,useReferenceColors:$('#refs-use-colors').checked,messageDraft:input.value};
      const sourceRefs=[...state.refs];
      let reviewDraft=state.restoredPrompt?{...state.restoredPrompt}:null;
      if(state.review)reviewDraft={prompt:state.review.element.querySelector('textarea').value,placement:state.review.element.querySelector('select').value};
      const refs=await Promise.all(sourceRefs.map(async ref=>{
        if(!ref.savedDataURL)ref.savedDataURL=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(Error('Não foi possível salvar uma referência.'));reader.readAsDataURL(ref.file);});
        return {name:ref.name,dataURL:ref.savedDataURL};
      }));
      return MerannoSnapshot.normalize({...captured,refs,reviewDraft});
    },
    async restore(raw) {
      if(state.busy||state.refsLoading)throw Error('Aguarde a operação atual terminar.');
      const snapshot=MerannoSnapshot.normalize(raw),prepared=[];setBusy(true);
      try {
        for(const ref of snapshot.refs){const blob=await(await fetch(ref.dataURL)).blob(),item=await MerannoReferences.prepare(new File([blob],ref.name,{type:blob.type}));item.savedDataURL=ref.dataURL;prepared.push(item);}
        invalidateReview();state.refs.forEach(ref=>URL.revokeObjectURL(ref.url));
        state.brandVisible=snapshot.brandVisible;state.deleted=null;state.fit=snapshot.fit;state.palette=[...snapshot.palette];state.font=snapshot.font;state.design=snapshot.design;state.refs=prepared;state.history=snapshot.history;state.restoredPrompt=snapshot.reviewDraft;
        $('#refs-notes').value=snapshot.referenceNotes;$('#refs-use-colors').checked=snapshot.useReferenceColors;input.value=snapshot.messageDraft;grow();
        log.innerHTML='';for(const msg of state.history)pushMsg(msg.role==='user'?'user':'ai',msg.text);if(!state.history.length)pushMsg('ai',INTRO);
        if(state.restoredPrompt){const note=pushMsg('note','Prompt salvo. Peça uma nova revisão no chat antes de gerar.');note.classList.add('saved-prompt');const area=h('textarea',{'aria-label':'Prompt salvo para retomar',readonly:true});area.value=state.restoredPrompt.prompt;note.append(area);}
        if(state.design){const note=pushMsg('ai','Sua estampa foi recuperada. Você pode continuar a criação.');addDownload(note,state.design);}
        renderAll();renderChips();viewBack.reset();viewFront.reset();
      } catch(error) { if(state.refs!==prepared)prepared.forEach(ref=>URL.revokeObjectURL(ref.url));throw error; }
      finally {setBusy(false);changed();}
    },
    toast,
  };

  // ---------- início ----------
  renderAll();
  renderCarousel();
  pushMsg('ai', INTRO);
  addEventListener('resize', () => { closePop(); viewBack.refresh();viewFront.refresh(); });
})();
