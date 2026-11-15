(()=>{
 'use strict';const S=MerannoStudio,L=MerannoLayout,$=s=>document.querySelector(s),panel=$('#print-editor');let preparedSource=null,pending=false,transparent=true,errorText='';
 const cm=n=>n.toLocaleString('pt-BR',{minimumFractionDigits:1,maximumFractionDigits:1})+' cm';
 function render(){const state=S.getPrintState(),enabled=!!state.source&&state.placement!=='front';panel.hidden=!enabled;if(!enabled)return;
  const ready=state.layout&&state.dimensions&&state.bounds&&!pending,blocked=!ready||state.busy;
  for(const id of ['print-width','print-x','print-y','print-center','print-reset'])$('#'+id).disabled=blocked;
  if(ready){const layout=L.normalize(state.layout,state.bounds),limits=L.limits(layout,state.bounds);
   for(const[id,value,min,max]of[['print-width',layout.widthCM,1,limits.widthMax],['print-x',layout.offsetXCM,-limits.xMax,limits.xMax],['print-y',layout.offsetYCM,0,limits.yMax]]){const field=$('#'+id);field.min=min;field.max=max;field.value=value;$('#'+id+'-value').textContent=cm(value);}
   $('#print-height').textContent='Altura proporcional: '+cm(layout.heightCM);
   const w=Math.floor(layout.widthCM/2.54*300),h=Math.floor(layout.heightCM/2.54*300),upscaled=w>state.bounds.width||h>state.bounds.height;
   $('#print-quality').textContent=errorText||(!transparent?'A arte não tem fundo transparente; isso precisa ser corrigido antes da produção.':upscaled?'Para '+cm(layout.widthCM)+' × '+cm(layout.heightCM)+' a 300 DPI, use um original maior. Ampliar não recupera detalhes.':'Resolução original suficiente para estas medidas a 300 DPI.');
  }else $('#print-quality').textContent=errorText||'Lendo as dimensões da arte…';
 }
 async function update(){render();const state=S.getPrintState();if(pending||state.busy||!state.source||state.placement==='front'||(preparedSource===state.source&&(errorText||(state.layout&&state.dimensions&&state.bounds))))return;const source=state.source;pending=true;preparedSource=source;errorText='';render();try{const result=await S.preparePrint();if(result)transparent=result.transparent;else preparedSource=null;}catch(error){errorText=error.message;}finally{pending=false;render();if(S.getPrintState().source!==source||preparedSource===null)update();}}
 document.addEventListener('meranno:change',update);
 for(const id of ['print-width','print-x','print-y'])$('#'+id).addEventListener('input',()=>{const state=S.getPrintState();if(!state.layout)return;const value={...state.layout};if(id==='print-width')value.widthCM=+$('#print-width').value;if(id==='print-x')value.offsetXCM=+$('#print-x').value;if(id==='print-y')value.offsetYCM=+$('#print-y').value;S.setPrintLayout(value);});
 $('#print-center').onclick=()=>{const state=S.getPrintState();if(!state.layout)return;const height=state.layout.heightCM;S.setPrintLayout({...state.layout,offsetXCM:0,offsetYCM:(45-height)/2});};
 $('#print-reset').onclick=()=>{const state=S.getPrintState();if(state.dimensions)S.setPrintLayout(L.initial(state.dimensions,state.bounds));};
 update();
})();
