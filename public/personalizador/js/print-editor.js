(()=>{
 const S=MerannoStudio,L=MerannoLayout,$=s=>document.querySelector(s);let pending=false,error='';
 const cm=n=>n.toLocaleString('pt-BR',{maximumFractionDigits:1})+' cm';
 function render(){const edit=S.getEditState();for(const option of $('#print-part').options){option.disabled=option.value==='brand'?true:!edit.design||!(edit.design.placement===option.value||edit.design.placement==='both');}const s=S.getPrintState();$('#print-editor').hidden=!s.source;if(!s.source)return;
  $('#print-part').value=s.part;$('#print-target-name').textContent={back:'Estampa das costas',front:'Estampa da frente',brand:'Marca frontal'}[s.part];
  const ready=s.layout&&s.bounds,blocked=!ready||s.busy||pending;
  for(const id of ['print-width','print-x','print-y','print-center','print-reset'])$('#'+id).disabled=blocked;
  if(!ready)return;const layout=L.normalize(s.layout,s.bounds),limits=L.limits(layout,s.bounds);
  for(const[id,value,min,max]of[['print-width',layout.widthCM,1,limits.widthMax],['print-x',layout.offsetXCM,-limits.xMax,limits.xMax],['print-y',layout.offsetYCM,0,limits.yMax]]){const f=$('#'+id);f.min=min;f.max=max;f.value=value;$('#'+id+'-value').textContent=cm(value);}
  $('#print-height').textContent='Altura proporcional: '+cm(layout.heightCM);
  $('#print-quality').textContent=error||'Posição e escala preservadas nos arquivos. A equipe confere nitidez, transparência e conteúdo antes da produção.';
 }
 async function update(){render();const s=S.getPrintState();if(pending||s.busy||!s.source||s.part==='brand'||s.layout&&s.bounds)return;pending=true;try{await S.preparePrint();error='';}catch(e){error=e.message;}finally{pending=false;render();}}
 document.addEventListener('meranno:change',update);$('#print-part').onchange=e=>S.setEditPart(e.target.value);
 for(const id of ['print-width','print-x','print-y'])$('#'+id).oninput=()=>{const s=S.getPrintState();if(!s.layout)return;const v={...s.layout};v[{'print-width':'widthCM','print-x':'offsetXCM','print-y':'offsetYCM'}[id]]=+$('#'+id).value;S.setPrintLayout(v);};
 $('#print-center').onclick=()=>{const s=S.getPrintState();if(s.layout)S.setPrintLayout({...s.layout,offsetXCM:0,offsetYCM:(45-s.layout.heightCM)/2});};
 $('#print-reset').onclick=()=>{const s=S.getPrintState();if(s.dimensions)S.setPrintLayout(s.part==='brand'?{widthCM:8,offsetXCM:8,offsetYCM:5}:L.initial(s.dimensions,s.bounds));};
 update();
})();
