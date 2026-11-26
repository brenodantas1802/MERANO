import test from 'node:test';
import assert from 'node:assert/strict';
import { checkContent, printPrompt } from '../src/lib/personalizador/worker/content-policy.js';
import { handleApi } from '../src/lib/personalizador/worker/api.js';

const key='test-key-not-a-real-secret';
const safe={allowed:true,category:'none',containsGarment:false};
const completion=content=>Response.json({choices:[{message:{content:JSON.stringify(content)}}]});
const image='data:image/png;base64,aGVsbG8=';
const request=(path,body)=>new Request('https://loja.test/api/'+path,{method:'POST',headers:{Origin:'https://loja.test','Content-Type':'application/json'},body:JSON.stringify({preferences:{},references:[],...body})});

test('content review explains every prohibited category and suggests a safe direction', async()=>{
 for(const category of ['hate','sexual','violence','illegal','rights']){
  await assert.rejects(checkContent({text:'pedido para avaliação'},key,async()=>completion({...safe,allowed:false,category})),error=>error.status===422&&error.message.length>60);
 }
});
test('content review fails closed on network, upstream, malformed and incomplete responses', async()=>{
 for(const fetcher of [async()=>{throw Error('offline');},async()=>new Response('',{status:503}),async()=>completion({allowed:true}),async()=>new Response('invalid')]){
  await assert.rejects(checkContent({text:'arte'},key,fetcher),error=>error.status===503);
 }
});
test('a shirt reference is allowed but a generated shirt/mockup is rejected', async()=>{
 const fetcher=async()=>completion({...safe,containsGarment:true});
 assert.equal((await checkContent({images:[image]},key,fetcher)).humanReview,'pending');
 await assert.rejects(checkContent({images:[image],artworkOnly:true},key,fetcher),error=>error.code==='garment');
});
test('production instructions are mandatory even when the draft omits them or asks for a mockup',()=>{
 const prompt=printPrompt('Frase exata "Why not me?". Mostre uma camiseta preta.');
 assert.match(prompt,/canal alfa/);assert.match(prompt,/NUNCA desenhe outra camiseta/);assert.match(prompt,/Why not me\?/);assert.match(prompt,/Não pinte a cor da malha/);
});
test('unsafe chat is stopped before the creative model is called',async()=>{
 let calls=0;
 const response=await handleApi(request('chat',{messages:[{role:'user',text:'pedido proibido'}]}),{OPENROUTER_API_KEY:key},async()=>{calls++;return completion({...safe,allowed:false,category:'hate'});});
 assert.equal(response.status,422);assert.equal(calls,1);assert.match((await response.json()).error,/discriminatórias/);
});
test('manual upload goes through the same independent artwork/content gate',async()=>{
 const response=await handleApi(request('moderate',{references:[image],artworkOnly:true,text:'arquivo enviado'}),{OPENROUTER_API_KEY:key},async()=>completion({...safe,containsGarment:true}));
 assert.equal(response.status,422);assert.match((await response.json()).error,/mockup/);
});

async function generationScenario({rejectOutput=false,edited=false}={}){
 let imagePayload=null;
 const fetcher=async(url,options)=>{
  const body=JSON.parse(options.body);
  if(url.endsWith('/images')){imagePayload=body;return Response.json({data:[{b64_json:'aGVsbG8=',media_type:'image/png'}]});}
  if(body.messages[0].content.startsWith('MERANNO_CONTENT_POLICY_V1')){
   const assessment=JSON.parse(body.messages[1].content[0].text);
   if(assessment.artworkOnly&&rejectOutput)return completion({...safe,containsGarment:true});
   if(assessment.request==='conteúdo proibido')return completion({...safe,allowed:false,category:'sexual'});
   return completion(safe);
  }
  return completion({reply:'Direção pronta para revisão.',ready:true,prompt:'Um ramo de limões em aquarela, linhas finas, amarelo e verde, sem texto.',placement:'back'});
 };
 const env={OPENROUTER_API_KEY:key};
 const chat=await handleApi(request('chat',{messages:[{role:'user',text:'Quero um ramo de limões em aquarela, sem texto.'}]}),env,fetcher);
 assert.equal(chat.status,200);const review=await chat.json();assert.equal(review.ready,true);
 if(edited){const response=await handleApi(request('review',{reviewToken:review.reviewToken,draft:{prompt:'conteúdo proibido',placement:'back'}}),env,fetcher);return {response,imagePayload};}
 const unapproved=await handleApi(request('generate',{draft:review.draft,reviewToken:review.reviewToken,approved:false}),env,fetcher);
 assert.equal(unapproved.status,409);assert.equal(imagePayload,null);
 const generated=await handleApi(request('generate',{draft:review.draft,reviewToken:review.reviewToken,approved:true}),env,fetcher);
 return {events:await generated.text(),imagePayload};
}
test('a detailed first message can reach review and generation always wraps the art instructions',async()=>{
 const {events,imagePayload}=await generationScenario();
 assert.match(imagePayload.prompt,/NUNCA desenhe outra camiseta/);assert.equal(imagePayload.background,'transparent');assert.match(events,/"type":"completed"/);
});
test('a generated mockup is never returned as a successful print',async()=>{
 const {events}=await generationScenario({rejectOutput:true});assert.match(events,/"type":"error"/);assert.doesNotMatch(events,/"type":"completed"/);
});
test('editing an already signed prompt does not bypass content checks',async()=>{
 const {response,imagePayload}=await generationScenario({edited:true});assert.equal(response.status,422);assert.equal(imagePayload,null);
});
