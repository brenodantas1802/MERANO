import test from 'node:test';
import assert from 'node:assert/strict';
import { ART_DIRECTION, cleanBrief, creativePlan, creativePhase } from '../src/lib/personalizador/worker/art-direction.js';
import { handleApi } from '../src/lib/personalizador/worker/api.js';

const env={OPENROUTER_API_KEY:'test-key-not-a-real-secret'};
const completion=content=>Response.json({choices:[{message:{content:JSON.stringify(content)}}]});
const safe={allowed:true,category:'none',containsGarment:false};
const bodyFor=(messages,extra={})=>new Request('https://loja.test/api/chat',{method:'POST',headers:{Origin:'https://loja.test','Content-Type':'application/json'},body:JSON.stringify({messages,preferences:{malha:'Preto',cores:['#F6F2E6']},references:[],...extra})});
const user=text=>({role:'user',text}),assistant=text=>({role:'assistant',text});

test('mentioning generation in a vague idea does not skip the conversation',()=>{
 const plan=creativePlan([{role:'user',content:'Quero gerar uma flor.'}]);
 assert.equal(plan.forceReview,false);assert.equal(plan.remaining,3);
});
test('a delegated direction or explicit request for the prompt may finish immediately',()=>{
 for(const text of ['Você escolhe os detalhes.','Pode preparar o prompt.','Prepare o prompt com o que combinamos.'])assert.equal(creativePlan([{role:'user',content:text}]).forceReview,true);
});
test('asking to explore before generating does not force a review',()=>{
 const plan=creativePlan([{role:'user',content:'Você escolhe algumas sugestões, mas não gere ainda, estou explorando.'}]);
 assert.equal(plan.forceReview,false);
});
test('budget counts assistant follow-ups rather than number of user messages',()=>{
 const messages=[{role:'user',content:'Flor'},...Array.from({length:3},(_,i)=>({role:'assistant',content:'Pergunta '+i+'?'})),{role:'user',content:'Lilás'}];
 assert.equal(creativePlan(messages).remaining,0);assert.equal(creativePlan(messages).forceReview,true);
 const onlyUsers=Array.from({length:8},()=>({role:'user',content:'um detalhe'}));assert.equal(creativePlan(onlyUsers).forceReview,false);
});
test('a refinement has its own short question budget without discarding earlier choices',()=>{
 const plan=creativePlan([{role:'assistant',content:'Pergunta?'},{role:'assistant',content:'Prompt proposto: um lírio lilás'},{role:'user',content:'Quero mudar só as folhas.'}]);
 assert.equal(plan.asked,0);
});
test('brief cleaning persists explicit removal and does not retain unknown fields',()=>{
 const brief=cleanBrief({theme:'Flor',text:'',apiKey:'not-a-secret',composition:['invalid']});
 assert.deepEqual(brief,{theme:'Flor',text:''});
 assert.ok(JSON.stringify(cleanBrief(Object.fromEntries(['theme','style','colors','composition','text','placement','referenceUse','preserve','avoid','assumptions'].map(k=>[k,'a'.repeat(9000)])))).length<7500);
});

async function chat(messages,answer,extra={}){
 let creativePayload;
 const response=await handleApi(bodyFor(messages,extra),env,async(_url,options)=>{
  const payload=JSON.parse(options.body);
  if(payload.messages[0].content.startsWith('MERANNO_CONTENT_POLICY_V1'))return completion(safe);
  creativePayload=payload;return completion(answer);
 });
 assert.equal(response.status,200);
 return {result:await response.json(),creativePayload};
}
test('incomplete model output does not prematurely review just because panel colors filled the brief',async()=>{
 const {result}=await chat([user('Quero uma flor')],{reply:'Você imagina aquarela ou traço de caneta?',ready:false,brief:{theme:'flor',style:'a definir',colors:'Off white'},prompt:'Uma flor genérica',suggestions:['Aquarela delicada','Traço de caneta']});
 assert.equal(result.ready,false);assert.equal(result.draft,undefined);assert.deepEqual(result.suggestions,['Aquarela delicada','Traço de caneta']);
});
test('valid detailed request can go directly to review with a horizontal format',async()=>{
 const {result}=await chat([user('Uma faixa horizontal de texto e colagem em papel, frase exata "Why not me?", sem objetos extras.')],{reply:'Direção pronta.',ready:true,brief:{text:'Why not me?',composition:'Faixa horizontal com sobreposição'},prompt:'Faixa horizontal, frase exata "Why not me?", serifas sobrepostas por papel rasgado, sem objetos extras.',placement:'back',aspectRatio:'3:1'});
 assert.equal(result.ready,true);assert.equal(result.draft.aspectRatio,'3:1');assert.match(result.draft.prompt,/Why not me\?/);assert.deepEqual(result.suggestions,[]);
});
test('invalid image ratio is not forwarded to the image provider',async()=>{
 const {result}=await chat([user('Prepare o prompt')],{reply:'Pronto',ready:true,prompt:'Uma flor de linha, sem texto.',aspectRatio:'unbounded'});
 assert.equal(result.draft.aspectRatio,'2:3');
});
test('after three useful follow-ups the API reviews instead of asking a fourth question',async()=>{
 const messages=[user('Uma flor'),assistant('Que traço?'),user('Aquarela'),assistant('Qual cor?'),user('Lilás'),assistant('Qual composição?'),user('Um lírio só, pequeno.')];
 const {result}=await chat(messages,{reply:'Qual espécie?',ready:false,brief:{theme:'lírio',style:'aquarela',colors:'lilás',composition:'pequeno, isolado'}});
 assert.equal(result.ready,true);assert.match(result.draft.prompt,/lírio/);assert.ok(result.reviewToken);assert.deepEqual(result.suggestions,[]);
});
test('previous briefing and user corrections reach the creative model intact',async()=>{
 const previous={theme:'lírio',style:'aquarela',composition:'Um elemento pequeno',text:'',preserve:'Cor lilás e haste fina'};
 const {result,creativePayload}=await chat([user('Mude somente as folhas para um verde mais escuro.')],{reply:'Certo, mantenho o lírio lilás e a haste fina.',ready:true,brief:{colors:'Lilás e verde escuro'},prompt:'Um lírio lilás pequeno em aquarela, haste fina, folhas verde-escuras, sem texto.'},{brief:previous});
 const content=creativePayload.messages.at(-1).content[0].text;
 assert.match(content,/Um elemento pequeno/);assert.match(content,/Mude somente/);assert.equal(result.brief.preserve,previous.preserve);
});
test('attached images are supplied to the model and the phase does not ask to upload again',async()=>{
 const image='data:image/png;base64,aGVsbG8=';
 const {creativePayload}=await chat([user('Gosto do traço, mas não quero a marca da foto.')],{reply:'Vou aproveitar o traço, sem copiar a marca. Você prefere uma flor isolada ou um ramo?',ready:false,suggestions:['Uma flor isolada','Um ramo']},{references:[image]});
 assert.equal(creativePayload.messages.at(-1).content[1].image_url.url,image);
 assert.match(creativePayload.messages[0].content,/Não peça para enviar novamente/);
});
test('suggestions are optional data, deduplicated and limited for the interface',async()=>{
 const {result}=await chat([user('Uma flor')],{reply:'Qual traço?',ready:false,suggestions:['Aquarela','Aquarela',42,'Caneta','Rabisco','Outra']});
 assert.deepEqual(result.suggestions,['Aquarela','Caneta','Rabisco']);
});
test('the application loads the direction guide rather than an unused documentation-only skill',async()=>{
 const {creativePayload}=await chat([user('Flor')],{reply:'Qual linguagem?',ready:false});
 assert.ok(creativePayload.messages[0].content.startsWith(ART_DIRECTION));
});

test('a prior invitation to attach references is remembered on subsequent questions',()=>{
 const plan=creativePlan([{role:'assistant',content:'Pode anexar uma referência, se tiver.'},{role:'user',content:'Prefiro descrever: lírio lilás.'}]);
 assert.equal(plan.referencesInvited,true);assert.match(creativePhase(plan,false),/Não repita o convite/);
});
test('a horizontal format survives edited review and reaches the image request',async()=>{
 let imagePayload;
 const fetcher=async(url,options)=>{
  const payload=JSON.parse(options.body);
  if(url.endsWith('/images')){imagePayload=payload;return Response.json({data:[{b64_json:'aGVsbG8=',media_type:'image/png'}]});}
  if(payload.messages[0].content.startsWith('MERANNO_CONTENT_POLICY_V1'))return completion(safe);
  return completion({reply:'Revisão pronta.',ready:true,prompt:'Uma faixa horizontal de lettering sobreposto.',placement:'back',aspectRatio:'3:1'});
 };
 const initial=await handleApi(bodyFor([user('Uma faixa de lettering horizontal. Pode preparar o prompt.')]),env,fetcher);
 const review=await initial.json();assert.equal(imagePayload,undefined);
 const req=(path,body)=>new Request('https://loja.test/api/'+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({preferences:{},references:[],...body})});
 // Retain the same panel context that the review token signed.
 const context={preferences:{malha:'Preto',cores:['#F6F2E6']},references:[]};
 const changed=await handleApi(req('review',{...context,reviewToken:review.reviewToken,draft:{...review.draft,prompt:review.draft.prompt+' Sem objetos.'}}),env,fetcher);
 assert.equal(changed.status,200);const updated=await changed.json();
 const generated=await handleApi(req('generate',{...context,reviewToken:updated.reviewToken,draft:updated.draft,approved:true}),env,fetcher);
 assert.match(await generated.text(),/"type":"completed"/);assert.equal(imagePayload.aspect_ratio,'3:1');
});
