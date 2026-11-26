(()=>{
 const S=MerannoStudio,$=s=>document.querySelector(s);let selected=null,drag=null;
 const names={back:'Estampa · costas',front:'Estampa · frente',brand:'Marca MERANNO'};
 function parts(state){const result=[];if(state.design){for(const side of ['back','front'])if(state.design.placement===side||state.design.placement==='both')result.push(side);}return result;}
 function render(){const state=S.getEditState(),items=parts(state);selected=items.includes(state.editPart)?state.editPart:null;
  const list=$('#edit-items');list.replaceChildren();
  for(const part of items){const b=document.createElement('button');b.type='button';b.textContent=names[part];b.dataset.part=part;b.setAttribute('aria-pressed',String(selected===part));b.disabled=state.busy;b.onclick=()=>select(part);list.append(b);}
  $('#edit-selection').textContent=selected?names[selected]+' selecionada.':'Selecione uma aplicação para editar ou apagar.';
  $('#delete-item').disabled=state.busy||!selected;$('#edit-size').disabled=state.busy||!selected;$('#undo-delete').disabled=state.busy||!state.canUndo;
  document.querySelectorAll('.art-selection').forEach(el=>el.remove());
  if(!state.design?.manualLayers){for(const viewer of document.querySelectorAll('.viewer')){const part=viewer.id==='viewer-back'?'back':'front';if(!items.includes(part))continue;const svg=viewer.querySelector('.garment-photo'),print=svg?.querySelector('.garment-print');if(!print)continue;const ns='http://www.w3.org/2000/svg',g=document.createElementNS(ns,'g'),x=+print.getAttribute('x'),y=+print.getAttribute('y'),w=+print.getAttribute('width'),h=+print.getAttribute('height');g.setAttribute('class','art-selection');g.setAttribute('data-edit-part',part);const rect=document.createElementNS(ns,'rect');for(const[k,v]of Object.entries({x,y,width:w,height:h,fill:'none',stroke:'#BA9654','stroke-width':.7,'stroke-dasharray':'3 2'}))rect.setAttribute(k,v);rect.style.pointerEvents='none';g.append(rect);const handle=document.createElementNS(ns,'circle');for(const[k,v]of Object.entries({cx:x+w,cy:y+h,r:4,fill:'#551e2b',stroke:'#fff','stroke-width':1,'data-art-resize':'true',role:'button','aria-label':'Redimensionar estampa'}))handle.setAttribute(k,v);handle.style.cursor='nwse-resize';g.append(handle);svg.append(g);}}
  $('#add-art').disabled=state.busy;$('#direct-download').disabled=state.busy||!state.design;$('#add-brand').hidden=state.brandVisible;$('#add-brand').disabled=state.busy;
  document.querySelectorAll('.viewer .garment-print,.viewer .front-wordmark').forEach(el=>{const side=el.closest('.viewer').id==='viewer-back'?'back':'front',part=el.classList.contains('front-wordmark')?'brand':side,exists=items.includes(part);el.classList.toggle('is-selected',selected===part);if(exists){el.setAttribute('role','button');el.setAttribute('aria-label','Selecionar '+names[part]);el.setAttribute('tabindex','0');el.dataset.editPart=part;}else{el.removeAttribute('data-edit-part');el.removeAttribute('tabindex');}});
 }
 function select(part){if(S.getEditState().busy)return;selected=part;window.MerannoManual?.selectArtwork(part);S.setEditPart(part);render();}
 $('#delete-item').onclick=()=>{S.deletePart(selected);selected=null;render();};
 $('#undo-delete').onclick=()=>S.undoDelete();$('#add-brand').onclick=()=>S.showBrand();$('#direct-download').onclick=()=>S.downloadCurrent();
 $('#edit-size').onclick=()=>S.toast('Arraste a estampa na camiseta; use a alça do canto para mudar o tamanho.');
 $('#add-art').onclick=()=>$('#manual-image').click();
 $('#direct-art-file').onchange=async e=>{const file=e.target.files[0];e.target.value='';if(!file)return;try{await S.uploadArt(file);select('back');}catch(error){S.toast(error.message);}};
 document.querySelectorAll('.viewer__canvas').forEach(canvas=>{
  canvas.addEventListener('click',e=>{const part=e.target.closest('[data-edit-part]')?.dataset.editPart;if(part)select(part);});
  canvas.addEventListener('pointerdown',e=>{
   const part=e.target.closest('[data-edit-part]')?.dataset.editPart;if(!part||S.getEditState().busy||e.button!==0)return;
   if(window.MerannoManual?.pointerDown(e,canvas)){canvas.focus({preventScroll:true});e.preventDefault();e.stopImmediatePropagation();return;}
   canvas.focus({preventScroll:true});select(part);if(drag){e.stopImmediatePropagation();return;}
   const layout=S.getPrintState().layout;if(!layout)return;const svg=canvas.querySelector('.garment-photo'),matrix=svg.getScreenCTM()?.inverse();if(!matrix)return;
   const point=new DOMPoint(e.clientX,e.clientY).matrixTransform(matrix),unit=MERANNO.GARMENTS[svg.dataset.garment].back[2]/36;
   selected=part;drag={id:e.pointerId,matrix,point,layout,unit,part,resize:!!e.target.closest('[data-art-resize]')};canvas.setPointerCapture(e.pointerId);e.preventDefault();e.stopImmediatePropagation();render();
  },true);
  canvas.addEventListener('pointermove',e=>{if(window.MerannoManual?.pointerMove(e)){e.preventDefault();e.stopImmediatePropagation();return;}if(!drag||drag.id!==e.pointerId)return;const p=new DOMPoint(e.clientX,e.clientY).matrixTransform(drag.matrix);S.setPrintLayout(drag.resize?{...drag.layout,widthCM:drag.layout.widthCM+2*(p.x-drag.point.x)/drag.unit}:{...drag.layout,offsetXCM:drag.layout.offsetXCM+(p.x-drag.point.x)/drag.unit,offsetYCM:drag.layout.offsetYCM+(p.y-drag.point.y)/drag.unit},drag.part);e.preventDefault();e.stopImmediatePropagation();},true);
  const up=e=>{if(window.MerannoManual?.pointerUp(e)){e.stopImmediatePropagation();return;}if(!drag||drag.id!==e.pointerId)return;drag=null;e.stopImmediatePropagation();};canvas.addEventListener('pointerup',up,true);canvas.addEventListener('pointercancel',up,true);
  canvas.addEventListener('keydown',e=>{const part=e.target.closest('[data-edit-part]')?.dataset.editPart;if((e.key==='Enter'||e.key===' ')&&part){e.preventDefault();e.stopImmediatePropagation();select(part);}else if(e.key.startsWith('Arrow')&&part){S.setEditPart(part);const v=S.getPrintState().layout;if(!v)return;const step=e.shiftKey?1:.2;S.setPrintLayout({...v,offsetXCM:v.offsetXCM+(e.key==='ArrowLeft'?-step:e.key==='ArrowRight'?step:0),offsetYCM:v.offsetYCM+(e.key==='ArrowUp'?-step:e.key==='ArrowDown'?step:0)});e.preventDefault();e.stopImmediatePropagation();}},true);
 });
 for(const viewer of document.querySelectorAll('.viewer')){const b=document.createElement('button');b.type='button';b.className='zoom-btn';b.setAttribute('aria-label','Tela cheia · '+(viewer.id==='viewer-back'?'costas':'frente'));b.textContent='⛶';b.onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await viewer.requestFullscreen();}catch{S.toast('Use o zoom e arraste a prévia para navegar.');}};viewer.querySelector('.viewer__tools').append(b);}
 for(const [id,action]of [['art-smaller','smaller'],['art-larger','larger'],['art-center','center'],['art-delete','delete']])$('#'+id).onclick=async()=>{try{if(S.getEditState().busy)return;await S.preparePrint();const p=S.getPrintState();if(!p.layout)return;if(action==='delete'){await MerannoManual.deleteArtwork();return;}S.setPrintLayout(action==='center'?{...p.layout,offsetXCM:0}:{...p.layout,widthCM:p.layout.widthCM*(action==='larger'?1.1:1/1.1)});}catch(e){S.toast(e.message);}};
 $('#art-placement').onchange=e=>S.setPlacement(e.target.value);
 $('#front-brand-kind').onchange=e=>S.setBrandKind(e.target.value);
 $('#upload-brand').onclick=()=>$('#brand-file').click();
 $('#brand-file').onchange=async e=>{const file=e.target.files[0];e.target.value='';if(!file)return;try{await S.uploadBrand(file);select('brand');}catch(error){S.toast(error.message);}};
 document.addEventListener('meranno:change',()=>{render();const state=S.getEditState();$('#front-brand-kind').value=state.brand.kind;$('#front-brand-kind').disabled=state.busy;$('#upload-brand').disabled=state.busy;$('#art-placement').disabled=state.busy||!state.design||!!state.design.houseId;if(state.design)$('#art-placement').value=state.design.placement;});render();
})();
