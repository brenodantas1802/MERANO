import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const context=vm.createContext({});
for(const file of ['layout.js','snapshot.js'])vm.runInContext(readFileSync(new URL('../public/personalizador/js/'+file,import.meta.url),'utf8'),context);
const basic={version:1,fit:'regular',palette:['preto'],font:'cormorant',history:[]};
test('a saved creation retains composition, explicit exclusions and exact text from its creative brief',()=>{
 const brief={theme:'Lírio lilás',composition:'Grande, à esquerda, vazio à direita',text:'Why not me?',preserve:'Haste fina',avoid:'Sem moldura nem datas'};
 const saved=context.MerannoSnapshot.normalize({...basic,creativeBrief:brief});
 assert.deepEqual(JSON.parse(JSON.stringify(saved.creativeBrief)),brief);
});
test('credentials and unknown fields never enter the saved creative brief',()=>{
 const saved=context.MerannoSnapshot.normalize({...basic,creativeBrief:{theme:'Flor',apiKey:'discard',instructions:{ignore:'no'}}});
 assert.equal(saved.creativeBrief.theme,'Flor');assert.equal(saved.creativeBrief.apiKey,undefined);assert.equal(saved.creativeBrief.instructions,undefined);
});
test('old drafts load without a creative brief',()=>{
 const saved=context.MerannoSnapshot.normalize(basic);assert.equal(Object.keys(saved.creativeBrief).length,0);
});
