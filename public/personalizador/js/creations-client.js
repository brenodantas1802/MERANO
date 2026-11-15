/* Save/restore only. No provider credentials or generation approvals persisted. */
(()=>{
 'use strict';
 const S=MerannoStudio,$=selector=>document.querySelector(selector);
 let session={authenticated:false,storageReady:false,scope:'guest'},initializing=true,cloudActive=false,localAvailable=true,timer,writing=null,revision=0,persisted=-1,pendingSave=null;
 const toolbar=$('.creation-actions'),studio=$('.studio'),status=$('#draft-status');
 const dialog=document.createElement('dialog');dialog.className='creations-dialog';dialog.setAttribute('aria-label','Salvar e retomar criações');document.body.append(dialog);
 const node=(tag,attrs={},text)=>{const el=document.createElement(tag);for(const[key,value]of Object.entries(attrs)){if(key==='class')el.className=value;else el.setAttribute(key,value);}if(text!==undefined)el.textContent=text;return el;};
 const setStatus=text=>{if(status.textContent!==text)status.textContent=text;};
 function controls(){const blocked=initializing||cloudActive||S.getState().busy;$('#save-creation').disabled=blocked;$('#my-creations').disabled=blocked;}
 function show(title){dialog.replaceChildren();const head=node('div',{class:'creations-dialog-head'}),heading=node('h2',{},title),close=node('button',{type:'button',class:'text-btn'},'Fechar');close.onclick=()=>dialog.close();head.append(heading,close);const content=node('div',{class:'creations-dialog-body'}),feedback=node('p',{class:'creations-feedback',role:'status'});dialog.append(head,content,feedback);if(!dialog.open)dialog.showModal();return {content,feedback};}
 function feedback(view,text,error=false){if(!view.feedback.isConnected)return;view.feedback.textContent=text;view.feedback.classList.toggle('is-error',error);}
 async function api(path='',body){let result;try{result=await fetch('/api/personalizador/creations'+path,{method:body?'POST':'GET',...(body?{headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(body?60000:30000)});}catch{throw Error('Não foi possível acessar suas criações. Confira a conexão e tente novamente.');}let data;try{data=await result.json();}catch{throw Error('O servidor não respondeu. Tente novamente.');}if(!result.ok){const error=Error(data.error||'Não foi possível concluir.');error.status=result.status;throw error;}return data;}
 const dbPromise=new Promise((resolve,reject)=>{let request;try{request=indexedDB.open('meranno-creations',1);}catch(error){reject(error);return;}request.onupgradeneeded=()=>request.result.createObjectStore('drafts');request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);request.onblocked=()=>reject(Error('Feche outras abas antigas do personalizador e tente novamente.'));});
 // Attach rejection handling immediately so unavailable storage never breaks the editor.
 dbPromise.catch(()=>{});
 async function localGet(name='current'){const db=await dbPromise;return new Promise((resolve,reject)=>{const request=db.transaction('drafts').objectStore('drafts').get(name+':'+session.scope);request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});}
 async function localPut(value,name='current'){const db=await dbPromise;return new Promise((resolve,reject)=>{const tx=db.transaction('drafts','readwrite');tx.objectStore('drafts').put(value,name+':'+session.scope);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||Error('O rascunho não foi salvo.'));});}
 async function flush(){
  clearTimeout(timer);if(initializing||S.getState().busy||!localAvailable)return;
  if(writing){await writing;if(persisted!==revision)return flush();return;}
  if(persisted===revision)return;
  const target=revision;setStatus('Salvando rascunho neste aparelho…');
  writing=(async()=>{try{const snapshot=await S.snapshot();await localPut({snapshot,savedAt:Date.now()});persisted=target;setStatus(persisted===revision?'Rascunho salvo neste aparelho':'Salvando alterações…');}catch(error){setStatus('Rascunho automático indisponível. Use Salvar na conta.');}})();
  await writing;writing=null;if(persisted!==revision&&persisted===target)timer=setTimeout(flush,0);
 }
 function changed(){controls();if(initializing)return;revision++;if(!S.getState().busy){setStatus('Salvando rascunho neste aparelho…');clearTimeout(timer);timer=setTimeout(flush,250);}}
 document.addEventListener('meranno:change',changed);
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')flush();});
 window.addEventListener('pagehide',()=>{flush();});
 function needAccount(){if(session.authenticated&&session.storageReady)return true;const view=show(session.authenticated?'Salvamento na conta':'Entre para salvar na conta');view.content.append(node('p',{},session.authenticated?'O salvamento na conta ainda está sendo ativado. O rascunho neste aparelho continua disponível.':'Entre com a conta que tem acesso a este site para guardar e abrir suas versões.'));if(!session.authenticated)view.content.append(node('a',{href:'/signin-with-chatgpt?returnTo=%2F',target:'_top',class:'btn btn--solid creations-signin'},'Entrar'));return false;}
 $('#save-creation').addEventListener('click',async()=>{
  if(cloudActive||initializing||S.getState().busy||!needAccount())return;
  cloudActive=true;controls();let snapshot;
  try{snapshot=await S.snapshot();}catch(error){S.toast(error.message);cloudActive=false;controls();return;}
  const view=show('Salvar versão na conta'),form=node('form'),label=node('label',{},'Nome desta versão'),input=node('input',{name:'title',maxlength:'80',required:true,autocomplete:'off'}),button=node('button',{type:'submit',class:'btn btn--solid'},'Salvar versão');input.value=S.getState().name;label.append(input);form.append(label,button);view.content.append(node('p',{},'Esta versão guarda a camiseta, a estampa, as referências e a conversa. Você poderá retomá-la em Minhas criações.'),form);input.focus();input.select();
  cloudActive=false;controls();let submitting=false;
  form.addEventListener('submit',async event=>{
   event.preventDefault();if(submitting)return;const title=input.value.trim();if(!title){feedback(view,'Dê um nome à versão.',true);return;}
   const signature=JSON.stringify([title,snapshot]);if(pendingSave?.signature!==signature)pendingSave={signature,id:crypto.randomUUID(),title,snapshot};
   submitting=true;cloudActive=true;controls();input.disabled=true;button.disabled=true;feedback(view,'Salvando versão na conta…');
   try{const result=await api('',{id:pendingSave.id,title,snapshot});pendingSave=null;feedback(view,'“'+result.creation.title+'” foi salva. Encontre esta versão em Minhas criações.');button.textContent='Versão salva';}
   catch(error){feedback(view,error.message+' Você pode tentar novamente.',true);input.disabled=false;button.disabled=false;submitting=false;}
   finally{cloudActive=false;controls();}
  });
 });
 async function restoreLocalBackup(view){
  if(cloudActive||S.getState().busy)return;cloudActive=true;controls();
  try{const previous=await localGet('previous');if(!previous)throw Error('Não há rascunho anterior disponível.');initializing=true;await S.restore(previous.snapshot);initializing=false;revision++;await flush();dialog.close();S.toast('Rascunho anterior recuperado.');}
  catch(error){feedback(view,error.message,true);}finally{initializing=false;cloudActive=false;controls();}
 }
 async function openCreation(id,view){
  if(cloudActive||S.getState().busy)return;cloudActive=true;controls();feedback(view,'Abrindo versão…');
  try{const result=await api('/'+id),previous=await S.snapshot();try{await localPut({snapshot:previous,savedAt:Date.now()},'previous');}catch{localAvailable=false;await api('',{id:crypto.randomUUID(),title:'Rascunho anterior · '+new Date().toLocaleString('pt-BR'),snapshot:previous});setStatus('Rascunho local indisponível. Use Salvar na conta.');}initializing=true;await S.restore(result.creation.snapshot);initializing=false;revision++;await flush();dialog.close();S.toast('Versão recuperada. Continue sua criação.');}
  catch(error){feedback(view,error.message,true);}finally{initializing=false;cloudActive=false;controls();}
 }
 $('#my-creations').addEventListener('click',async()=>{
  if(cloudActive||initializing||S.getState().busy||!needAccount())return;const view=show('Minhas criações'),list=node('div',{class:'creations-list'}),more=node('button',{type:'button',class:'btn btn--ghost',hidden:true},'Carregar mais versões');view.content.append(node('p',{},'Abra uma versão para retomar. O rascunho que você está usando fica guardado neste aparelho.'),list,more);
  let cursor=null,loading=false;
  async function load(){if(loading)return;loading=true;more.disabled=true;feedback(view,'Buscando suas versões…');try{const data=await api(cursor?'?before='+encodeURIComponent(cursor):'');if(!data.creations.length&&!cursor)list.append(node('p',{},'Você ainda não salvou versões na conta. Use “Salvar na conta” para começar.'));for(const item of data.creations){const row=node('article',{class:'creation-version'}),description=node('div'),title=node('h3',{},item.title),detail=node('p',{},item.summary.designName+' · '+({regular:'Regular',oversized:'Oversized',boxy:'Boxy'}[item.summary.fit])+' · '+new Date(item.createdAt).toLocaleString('pt-BR')),open=node('button',{type:'button',class:'btn btn--ghost'},'Abrir versão');description.append(title,detail);open.onclick=()=>openCreation(item.id,view);row.append(description,open);list.append(row);}cursor=data.nextCursor;more.hidden=!cursor;feedback(view,'');}catch(error){feedback(view,error.message,true);more.hidden=false;more.textContent='Tentar novamente';}finally{loading=false;more.disabled=false;}}
  more.onclick=load;await load();try{if(await localGet('previous')){const backup=node('button',{type:'button',class:'btn btn--ghost'},'Voltar ao rascunho anterior deste aparelho');backup.onclick=()=>restoreLocalBackup(view);view.content.append(backup);}}catch{}
 });
 async function start(){
  studio.inert=true;controls();
  try{const data=await api('/session');session={authenticated:!!data.authenticated,storageReady:!!data.storageReady,scope:data.scope||'guest'};}catch{session={authenticated:false,storageReady:false,scope:'guest'};}
  try{const draft=await localGet();if(draft?.snapshot){await S.restore(draft.snapshot);setStatus('Rascunho recuperado deste aparelho');}else setStatus('Seu rascunho será salvo neste aparelho');}
  catch{localAvailable=false;setStatus('Rascunho automático indisponível. Use Salvar na conta.');}
  finally{initializing=false;studio.inert=false;controls();}
  revision++;await flush();
 }
 window.MerannoCreations={ready:start(),flush};
})();
