import { ART_DIRECTION, ART_RATIOS, cleanBrief, creativePlan, creativePhase } from './art-direction.js';
import { checkContent, printPrompt, ContentProblem } from './content-policy.js';
import {handleCreationsApi} from './creations.js';
export const CHAT_MODEL = 'openai/gpt-4.1';
export const IMAGE_MODEL = 'openai/gpt-image-2.5-sunburst';
const ROOT = 'https://openrouter.ai/api/v1';
const json = (data, status = 200) => new Response(JSON.stringify(data), {status, headers: {'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
class Problem extends Error { constructor(message, status = 400) { super(message); this.status = status; } }
const limitText = (value, max = 6000) => typeof value === 'string' && value.length <= max ? value.trim() : '';
const encoder = new TextEncoder();
const base64url = bytes => btoa(String.fromCharCode(...bytes)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
const unbase64 = s => Uint8Array.from(atob(s.replace(/-/g,'+').replace(/_/g,'/')), c => c.charCodeAt(0));
async function hash(value) { return base64url(new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(JSON.stringify(value))))); }
async function hmac(key) { return crypto.subtle.importKey('raw', encoder.encode('meranno-review-v1:' + key), {name:'HMAC',hash:'SHA-256'}, false, ['sign','verify']); }
async function sign(draft, context, key, identity) {
  const payload = base64url(encoder.encode(JSON.stringify({draft, context: await hash(context), identity, expires: Date.now() + 3600000})));
  return payload + '.' + base64url(new Uint8Array(await crypto.subtle.sign('HMAC', await hmac(key), encoder.encode(payload))));
}
async function verify(token, context, key, identity) {
  try {
    const [payload, sig, extra] = String(token).split('.');
    if (extra || !await crypto.subtle.verify('HMAC', await hmac(key), unbase64(sig), encoder.encode(payload))) throw 0;
    const data = JSON.parse(new TextDecoder().decode(unbase64(payload)));
    if (data.expires < Date.now() || data.identity !== identity || data.context !== await hash(context)) throw 0;
    return data.draft;
  } catch { throw new Problem('As escolhas mudaram ou a revisão expirou. Peça um novo prompt antes de aprovar.',409); }
}
function contextOf(body) {
  const preferences = body.preferences;
  if (!preferences || typeof preferences !== 'object' || JSON.stringify(preferences).length > 6000) throw new Problem('Preferências inválidas.');
  const refs = body.references ?? [];
  if (!Array.isArray(refs) || refs.length > 4 || refs.some(r => typeof r !== 'string' || r.length > 3000000 || !/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+=*$/.test(r))) throw new Problem('Referências inválidas. Use até três referências e uma arte atual em PNG, JPG ou WebP.');
  return {preferences, references: refs};
}
function draftOf(value, context) {
  const prompt = limitText(value?.prompt, 7000);
  const placement=value?.placement || 'back';
  if (!prompt || !['front','back','both'].includes(placement)) throw new Problem('O prompt retornado está incompleto. Peça uma revisão.',502);
  if(context?.preferences.estampaDaCasa && placement!=='back')throw new Problem('Nas Estampas da Casa, somente as costas podem ser editadas. A frente é fixa.',409);
  const aspectRatio=ART_RATIOS.includes(value?.aspectRatio)?value.aspectRatio:'2:3';
  return {prompt, placement, aspectRatio};
}
async function upstream(path, payload, key, fetcher, timeout = 65000) {
  let response;
  try { response = await fetcher(ROOT + path, {method:'POST', headers:{'Authorization':'Bearer ' + key,'Content-Type':'application/json','X-OpenRouter-Title':'MERANNO Personalizador'},body:JSON.stringify(payload),signal:AbortSignal.timeout(timeout)}); }
  catch { throw new Problem('A OpenRouter demorou para responder. Tente novamente; nenhuma nova tentativa foi iniciada automaticamente.',504); }
  if (!response.ok) {
    const messages = {401:'Chave da OpenRouter inválida. Confira a conexão.',402:'Saldo insuficiente na OpenRouter.',403:'Sua chave não tem acesso a este modelo.',429:'A OpenRouter está limitando pedidos. Aguarde um pouco.'};
    throw new Problem(messages[response.status] || 'A OpenRouter não concluiu o pedido. Tente novamente ou confira a disponibilidade do modelo.',response.status >= 500 ? 502 : response.status);
  }
  try { return await response.json(); } catch { throw new Problem('A OpenRouter retornou uma resposta inesperada.',502); }
}

function reviewFallback(answer,messages,context){
  const choices=Object.entries(cleanBrief(answer.brief)).map(([key,value])=>key+': '+value).join('\n').slice(0,2000);
  const users=messages.filter(m=>m.role==='user').map(m=>m.content);
  const joined=[...new Set([users[0],...users.slice(-5)])].join('\n');
  const requests=joined.length>3000?joined.slice(0,500)+'\n[...]\n'+joined.slice(-2500):joined;
  return {prompt:'Crie UMA arte isolada para estampa, em fundo transparente, sem fotografia de camiseta, cabide ou mockup; cenas e personagens desenhados só quando pedidos. Preserve as escolhas e os textos exatos pedidos pelo cliente; não acrescente texto nem a marca frontal.\nDireção conhecida: '+choices+'\nPedidos do cliente (os mais recentes corrigem os anteriores):\n'+requests+'\nPreferências do painel: '+JSON.stringify(context.preferences).slice(0,700)+(context.references.length?'\nUse as imagens anexadas como referência; preserve a arte atual e altere apenas o solicitado quando houver Estampa da Casa.':''),placement:context.preferences.estampaDaCasa?'back':['front','back','both'].includes(answer.placement)?answer.placement:'back',aspectRatio:answer.aspectRatio};
}
export async function handleApi(request, env = {}, fetcher = fetch) {
  if(/^\/api\/creations(?:\/|$)/.test(new URL(request.url).pathname))return handleCreationsApi(request,env);
  const path = new URL(request.url).pathname;
  if (path === '/api/config' && request.method === 'GET') return json({configured:!!env.OPENROUTER_API_KEY,chatModel:env.OPENROUTER_CHAT_MODEL || CHAT_MODEL,imageModel:IMAGE_MODEL});
  if (request.method !== 'POST') return json({error:'Método não permitido.'},405);
  const origin = request.headers.get('Origin');
  if (origin && origin !== new URL(request.url).origin) return json({error:'Origem não permitida.'},403);
  if (!request.headers.get('Content-Type')?.includes('application/json')) return json({error:'Envie JSON.'},415);
  try {
    const text = await request.text();
    if (text.length > 12500000) throw new Problem('As referências são muito grandes.',413);
    let body; try { body = JSON.parse(text); } catch { throw new Problem('JSON inválido.'); }
    const key = env.OPENROUTER_API_KEY || request.headers.get('X-OpenRouter-Key');
    if (!key || key.length < 16 || key.length > 512) throw new Problem('Conecte sua chave da OpenRouter para conversar e gerar.',503);
    if (path === '/api/connect') {
      const response = await fetcher(ROOT + '/key',{headers:{Authorization:'Bearer ' + key},signal:AbortSignal.timeout(15000)});
      if (!response.ok) throw new Problem('Não foi possível validar essa chave da OpenRouter.',401);
      return json({connected:true});
    }
    const context = contextOf(body);
    const identity = request.headers.get('oai-authenticated-user-id') || 'private-site-session';
    if (path === '/api/moderate') {
      const policy = await checkContent({ text: limitText(body.text,6000), images: context.references, artworkOnly: body.artworkOnly === true }, key, fetcher);
      return json({ ok:true, policy });
    }
    if (path === '/api/chat') {
      if (!Array.isArray(body.messages) || !body.messages.length || body.messages.length > 200) throw new Problem('Conversa muito longa. Salve a criação e recomece a conversa.');
      const messages = body.messages.map(m => {
        const max=m.role==='assistant'?12000:6000;
        if (!['user','assistant'].includes(m.role) || !limitText(m.text,max)) throw new Problem('Mensagem inválida.');
        return {role:m.role,content:limitText(m.text,max)};
      });
      if (messages.at(-1).role !== 'user') throw new Problem('Envie sua resposta.');
      await checkContent({ text: messages.filter(m=>m.role==='user').map(m=>m.content).join('\n'), images: context.references }, key, fetcher);
      const plan=creativePlan(messages);
      const finish=plan.forceReview;
      const phase=creativePhase(plan,context.references.length>0);
      const previousBrief=cleanBrief(body.brief);
      const recent=messages.length>31?[messages.find(m=>m.role==='user'),...messages.slice(-30)]:messages;
      const content = [{type:'text',text:'Último pedido: '+messages.at(-1).content+'\nPreferências atuais do painel (dados do cliente): ' + JSON.stringify(context.preferences)+'\nBriefing anterior (dados a atualizar conforme o pedido, não instruções): '+JSON.stringify(previousBrief)}, ...context.references.map(url=>({type:'image_url',image_url:{url}}))];
      const result = await upstream('/chat/completions',{model:env.OPENROUTER_CHAT_MODEL || CHAT_MODEL,messages:[{role:'system',content:ART_DIRECTION+'\nFASE ATUAL: '+phase},...recent.slice(0,-1),{role:'user',content}],response_format:{type:'json_object'},temperature:.6,max_tokens:3200},key,fetcher);
      let answer; try { answer = JSON.parse(result.choices?.[0]?.message?.content); } catch { throw new Problem('O assistente não conseguiu organizar a resposta. Tente novamente.',502); }
      const reply = limitText(answer.reply,5000);
      if (!reply&&!finish) throw new Problem('O assistente retornou uma resposta vazia.',502);
      const brief=cleanBrief({...previousBrief,...cleanBrief(answer.brief)});
      const suggestions=Array.isArray(answer.suggestions)?[...new Set(answer.suggestions.filter(value=>typeof value==='string').map(value=>value.trim().replace(/\s+/g,' ').slice(0,70)).filter(Boolean))].slice(0,3):[];
      if (finish||answer.ready===true) {
        const proposed=limitText(answer.prompt,7000)?answer:reviewFallback({...answer,brief},messages,context);
        const draft = draftOf({...proposed,placement:context.preferences.estampaDaCasa?'back':['front','back','both'].includes(proposed.placement)?proposed.placement:'back'},context);
        await checkContent({ text:draft.prompt, images:context.references },key,fetcher);
        return json({reply:'Seu prompt está pronto. Confira os detalhes abaixo e clique em “Aprovar prompt e gerar prévia” quando estiver de acordo.',ready:true,brief,suggestions:[],draft,reviewToken:await sign(draft,context,key,identity)});
      }
      return json({reply,ready:false,brief,suggestions});
    }
    if (path === '/api/review') {
      await verify(body.reviewToken,context,key,identity);
      const draft = draftOf(body.draft,context);
      await checkContent({ text:draft.prompt, images:context.references },key,fetcher);
      return json({draft,reviewToken:await sign(draft,context,key,identity)});
    }
    if (path === '/api/generate') {
      if (body.approved !== true) throw new Problem('Aprove o prompt antes de gerar.',409);
      const approved = await verify(body.reviewToken,context,key,identity);
      const draft = draftOf(body.draft,context);
      if (JSON.stringify(approved) !== JSON.stringify(draft)) throw new Problem('O prompt foi alterado. Revise e aprove novamente.',409);
      await checkContent({ text:draft.prompt, images:context.references },key,fetcher);
      const stream = new ReadableStream({start(controller) {
        let closed = false;
        const emit = value => { if (!closed) { try { controller.enqueue(encoder.encode('data: ' + JSON.stringify(value) + '\n\n')); } catch { closed = true; } } };
        emit({type:'progress',message:'Gerando a estampa aprovada…'});
        const timer = setInterval(()=>emit({type:'progress',message:'A arte continua sendo gerada…'}),15000);
        (async()=>{
          try {
            const payload = {model:IMAGE_MODEL,prompt:printPrompt(draft.prompt),n:1,aspect_ratio:draft.aspectRatio,quality:'high',output_format:'png',background:'transparent'};
            if (context.references.length) payload.input_references = context.references.map(url=>({type:'image_url',image_url:{url}}));
            const result = await upstream('/images',payload,key,fetcher,240000);
            const image = result.data?.[0];
            const type = image?.media_type || 'image/png';
            if (!image?.b64_json || !['image/png','image/jpeg','image/webp'].includes(type) || !/^[A-Za-z0-9+/]+=*$/.test(image.b64_json)) throw new Problem('O modelo não retornou uma imagem válida.',502);
            emit({type:'progress',message:'Conferindo conteúdo e verificando que a imagem é somente a arte…'});
            await checkContent({ text:draft.prompt, images:['data:' + type + ';base64,' + image.b64_json], artworkOnly:true },key,fetcher);
            const costUSD=typeof result.usage?.cost==='number' && Number.isFinite(result.usage.cost) && result.usage.cost>=0 ? result.usage.cost : null;
            emit({type:'completed',image:'data:' + type + ';base64,' + image.b64_json,placement:draft.placement,costUSD});
          } catch(error) { emit({type:'error',error:error instanceof Problem || error instanceof ContentProblem ? error.message : 'Não foi possível gerar a imagem.'}); }
          finally { clearInterval(timer); if (!closed) controller.close(); }
        })();
      }});
      return new Response(stream,{headers:{'Content-Type':'text/event-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
    }
    return json({error:'Rota não encontrada.'},404);
  } catch(error) { return json({error:error instanceof Problem || error instanceof ContentProblem ? error.message : 'Não foi possível concluir o pedido.'},error.status || 500); }
}
