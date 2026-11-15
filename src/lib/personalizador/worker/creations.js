import '../../../../public/personalizador/js/layout.js';
import '../../../../public/personalizador/js/snapshot.js';
const creationJSON=(value,status=200)=>new Response(JSON.stringify(value),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
class CreationError extends Error{constructor(message,status=400){super(message);this.status=status;}}
const uuid=value=>typeof value==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(value);
const digest=async text=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text))),b=>b.toString(16).padStart(2,'0')).join('');
const summaryOf=s=>({fit:s.fit,fabric:s.palette[0],designName:s.design?.houseName|| (s.design?'Criação personalizada':'Ideias e preferências')});
const creationRow=row=>({id:row.id,title:row.title,summary:JSON.parse(row.summary),createdAt:row.created_at});
async function limitedJSON(request){
 if(+request.headers.get('Content-Length')>20000000)throw new CreationError('A criação excede o tamanho permitido.',413);
 const reader=request.body?.getReader();if(!reader)throw new CreationError('Envie a criação.');const parts=[];let length=0;
 try{while(true){const part=await reader.read();if(part.done)break;length+=part.value.length;if(length>20000000){await reader.cancel();throw new CreationError('A criação excede o tamanho permitido.',413);}parts.push(part.value);}}finally{reader.releaseLock();}
 try{return JSON.parse(await new Blob(parts).text());}catch{throw new CreationError('Dados inválidos.');}
}
export async function handleCreationsApi(request,env){
 const url=new URL(request.url),path=url.pathname.slice('/api/creations'.length),method=request.method;
 try{
  if(path==='/session'&&method==='GET'){const owner=request.headers.get('oai-authenticated-user-id');return creationJSON({authenticated:!!owner,storageReady:!!env.DB&&!!env.BUCKET,scope:owner?await digest('draft:'+owner):'guest'});}
  if(!env.DB||!env.BUCKET)throw new CreationError('O salvamento na conta está sendo ativado. Seu rascunho continua neste aparelho.',503);
  if(path==='/health'&&method==='GET'){await env.DB.prepare('SELECT COUNT(*) AS total FROM creations').first();await env.BUCKET.head('storage-probe');return creationJSON({database:true,files:true});}
  const owner=request.headers.get('oai-authenticated-user-id');if(!owner)throw new CreationError('Entre na sua conta para acessar as criações salvas.',401);
  if(path===''&&method==='GET'){
   const before=url.searchParams.get('before');let rows;
   if(before){if(!uuid(before))throw new CreationError('Página inválida.');const cursor=await env.DB.prepare('SELECT created_at,id FROM creations WHERE user_id=? AND id=?').bind(owner,before).first();if(!cursor)throw new CreationError('Página não encontrada.',404);rows=await env.DB.prepare('SELECT id,title,summary,created_at FROM creations WHERE user_id=? AND (created_at<? OR (created_at=? AND id<?)) ORDER BY created_at DESC,id DESC LIMIT 20').bind(owner,cursor.created_at,cursor.created_at,cursor.id).all();}
   else rows=await env.DB.prepare('SELECT id,title,summary,created_at FROM creations WHERE user_id=? ORDER BY created_at DESC,id DESC LIMIT 20').bind(owner).all();
   return creationJSON({creations:rows.results.map(creationRow),nextCursor:rows.results.length===20?rows.results.at(-1).id:null});
  }
  if(path===''&&method==='POST'){
   const origin=request.headers.get('Origin');if(origin&&origin!==url.origin)throw new CreationError('Origem não permitida.',403);if(!request.headers.get('Content-Type')?.includes('application/json'))throw new CreationError('Envie JSON.',415);
   const body=await limitedJSON(request);if(!uuid(body.id))throw new CreationError('Identificador da versão inválido.');if(typeof body.title!=='string'||body.title.trim().length<1||body.title.length>80)throw new CreationError('Dê um nome de até 80 caracteres à criação.');
   let snapshot;try{snapshot=MerannoSnapshot.normalize(body.snapshot);}catch(error){throw new CreationError(error.message);}
   const title=body.title.trim(),serialized=JSON.stringify(snapshot),fingerprint=await digest(JSON.stringify([title,snapshot]));
   const existing=await env.DB.prepare('SELECT * FROM creations WHERE user_id=? AND id=?').bind(owner,body.id).first();if(existing){if(existing.fingerprint!==fingerprint)throw new CreationError('Esta versão já foi salva com outro conteúdo. Salve uma nova versão.',409);return creationJSON({creation:creationRow(existing)});}
   const key='creations/'+await digest(owner)+'/'+body.id+'/'+fingerprint+'.json',now=new Date().toISOString(),summary=JSON.stringify(summaryOf(snapshot));
   await env.BUCKET.put(key,serialized,{httpMetadata:{contentType:'application/json'}});
   try{await env.DB.prepare('INSERT INTO creations (id,user_id,title,asset_key,fingerprint,summary,created_at) VALUES (?,?,?,?,?,?,?)').bind(body.id,owner,title,key,fingerprint,summary,now).run();}
   catch(error){const retry=await env.DB.prepare('SELECT * FROM creations WHERE user_id=? AND id=?').bind(owner,body.id).first();if(retry?.fingerprint===fingerprint)return creationJSON({creation:creationRow(retry)});if(retry)throw new CreationError('Esta versão já existe. Salve uma nova versão.',409);throw error;}
   return creationJSON({creation:{id:body.id,title,summary:JSON.parse(summary),createdAt:now}},201);
  }
  if(method==='GET'&&path.startsWith('/')){const id=path.slice(1);if(!uuid(id))throw new CreationError('Criação não encontrada.',404);const row=await env.DB.prepare('SELECT * FROM creations WHERE user_id=? AND id=?').bind(owner,id).first();if(!row)throw new CreationError('Criação não encontrada.',404);const object=await env.BUCKET.get(row.asset_key);if(!object)throw new CreationError('Não foi possível abrir a arte desta versão. Tente novamente.',503);return creationJSON({creation:{...creationRow(row),snapshot:MerannoSnapshot.normalize(JSON.parse(await object.text()))}});}
  return creationJSON({error:'Método não permitido.'},405);
 }catch(error){return creationJSON({error:error instanceof CreationError?error.message:'Não foi possível salvar ou abrir a criação. Tente novamente.'},error.status||500);}
}
