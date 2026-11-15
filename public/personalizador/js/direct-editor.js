(()=>{
 const S=MerannoStudio,$=s=>document.querySelector(s);let selected=null,drag=null;
 const names={back:'Estampa · costas',front:'Estampa · frente',brand:'Marca MERANNO'};
 function parts(state){const result=[];if(state.design){for(const side of ['back','front'])if(state.design.placement===side||state.design.placement==='both')result.push(side);}if(state.brandVisible)result.push('brand');return result;}
 function render(){const state=S.getEditState(),items=parts(state);if(!items.includes(selected))selected=null;
  const list=$('#edit-items');list.replaceChildren();
  for(const part of items){const b=document.createElement('button');b.type='button';b.textContent=names[part];b.dataset.part=part;b.setAttribute('aria-pressed',String(selected===part));b.disabled=state.busy;b.onclick=()=>select(part);list.append(b);}
  $('#edit-selection').textContent=selected?names[selected]+' selecionada.':'Selecione uma aplicação para editar ou apagar.';
  $('#delete-item').disabled=state.busy||!selected;$('#edit-size').disabled=state.busy||selected!=='back';$('#undo-delete').disabled=state.busy||!state.canUndo;
  $('#add-art').disabled=state.busy;$('#direct-download').disabled=state.busy||!state.design;$('#add-brand').hidden=state.brandVisible;$('#add-brand').disabled=state.busy;
  document.querySelectorAll('.viewer .garment-print,.viewer .front-wordmark').forEach(el=>{const side=el.closest('.viewer').id==='viewer-back'?'back':'front',part=el.classList.contains('front-wordmark')?'brand':side,exists=items.includes(part);el.classList.toggle('is-selected',selected===part);if(exists){el.setAttribute('role','button');el.setAttribute('aria-label','Selecionar '+names[part]);el.setAttribute('tabindex','0');el.dataset.editPart=part;}else{el.removeAttribute('data-edit-part');el.removeAttribute('tabindex');}});
 }
 function select(part){if(S.getEditState().busy)return;selected=part;render();}
 $('#delete-item').onclick=()=>{S.deletePart(selected);selected=null;render();};
 $('#undo-delete').onclick=()=>S.undoDelete();$('#add-brand').onclick=()=>S.showBrand();$('#direct-download').onclick=()=>S.downloadCurrent();
 $('#edit-size').onclick=()=>{$('#print-editor').scrollIntoView({block:'center',behavior:'smooth'});$('#print-width').focus({preventScroll:true});};
 $('#add-art').onclick=()=>$('#direct-art-file').click();
 $('#direct-art-file').onchange=async e=>{const file=e.target.files[0];e.target.value='';if(!file)return;try{await S.uploadArt(file);select('back');}catch(error){S.toast(error.message);}};
 document.querySelectorAll('.viewer__canvas').forEach(canvas=>{
  canvas.addEventListener('click',e=>{const part=e.target.closest('[data-edit-part]')?.dataset.editPart;if(part)select(part);});
  canvas.addEventListener('pointerdown',e=>{
   const part=e.target.closest('[data-edit-part]')?.dataset.editPart;if(!part||S.getEditState().busy||e.button!==0)return;
   if(part!=='back'){e.stopImmediatePropagation();select(part);return;}if(drag){e.stopImmediatePropagation();return;}
   const layout=S.getPrintState().layout;if(!layout)return;const svg=canvas.querySelector('.garment-photo'),matrix=svg.getScreenCTM()?.inverse();if(!matrix)return;
   const point=new DOMPoint(e.clientX,e.clientY).matrixTransform(matrix),unit=MERANNO.GARMENTS[svg.dataset.garment].back[2]/36;
   selected='back';drag={id:e.pointerId,matrix,point,layout,unit};canvas.setPointerCapture(e.pointerId);e.preventDefault();e.stopImmediatePropagation();render();
  },true);
  canvas.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;const p=new DOMPoint(e.clientX,e.clientY).matrixTransform(drag.matrix);S.setPrintLayout({...drag.layout,offsetXCM:drag.layout.offsetXCM+(p.x-drag.point.x)/drag.unit,offsetYCM:drag.layout.offsetYCM+(p.y-drag.point.y)/drag.unit});e.preventDefault();e.stopImmediatePropagation();},true);
  const up=e=>{if(!drag||drag.id!==e.pointerId)return;drag=null;e.stopImmediatePropagation();};canvas.addEventListener('pointerup',up,true);canvas.addEventListener('pointercancel',up,true);
  canvas.addEventListener('keydown',e=>{const part=e.target.closest('[data-edit-part]')?.dataset.editPart;if((e.key==='Enter'||e.key===' ')&&part){e.preventDefault();e.stopImmediatePropagation();select(part);}else if((e.key==='Delete'||e.key==='Backspace')&&selected){e.preventDefault();e.stopImmediatePropagation();S.deletePart(selected);}},true);
 });
 for(const viewer of document.querySelectorAll('.viewer')){const b=document.createElement('button');b.type='button';b.className='zoom-btn';b.setAttribute('aria-label','Tela cheia · '+(viewer.id==='viewer-back'?'costas':'frente'));b.textContent='⛶';b.onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await viewer.requestFullscreen();}catch{S.toast('Use o zoom e arraste a prévia para navegar.');}};viewer.querySelector('.viewer__tools').append(b);}
 document.addEventListener('meranno:change',render);render();
})();
