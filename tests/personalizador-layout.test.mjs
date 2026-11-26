import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const context=vm.createContext({btoa:value=>Buffer.from(value).toString('base64')});
vm.runInContext('window=globalThis;MERANNO={lum:()=>0.2,printArtwork:{back:()=>""}};MerannoWordmarkPath="M0 8H150V32H0Z";',context);
for(const file of ['layout.js','garments.js','snapshot.js'])vm.runInContext(readFileSync(new URL('../public/personalizador/js/'+file,import.meta.url),'utf8'),context);
const image='data:image/png;base64,aGVsbG8=';
const design={aiImage:image,placement:'both',artDimensions:{width:100,height:100},printBounds:{x:0,y:0,width:100,height:100},layouts:{back:{widthCM:20,offsetXCM:-3,offsetYCM:5},front:{widthCM:10,offsetXCM:7,offsetYCM:2}}};
test('front and back have independent positions and widths in the mockup',()=>{
 const front=context.MERANNO.shirtSVG({side:'front',design}),back=context.MERANNO.shirtSVG({side:'back',design});
 const position=s=>s.match(/class="garment-print" x="([^"]+)" y="([^"]+)" width="([^"]+)"/).slice(1).map(Number);
 assert.notDeepEqual(position(front),position(back));assert.equal(position(back)[2],position(front)[2]*2);
});
test('brand image is a separate layer and switching the brand never changes the main print',()=>{
 const brand={kind:'logo',image,dimensions:{width:100,height:100},layout:{widthCM:5,offsetXCM:8,offsetYCM:4}};
 const front=context.MERANNO.shirtSVG({side:'front',design,brand});
 assert.match(front,/class="front-wordmark"/);assert.match(front,/class="garment-print"/);assert.equal((front.match(/data:image\/png/g)||[]).length,2);
});
test('a snapshot retains both layouts and the uploaded logo, without credentials',()=>{
 const raw={version:1,fit:'regular',palette:['preto'],font:'cormorant',design,brand:{kind:'logo',image,dimensions:{width:100,height:100},layout:{widthCM:5,offsetXCM:8,offsetYCM:4}},apiKey:'never-persist-this'};
 const saved=context.MerannoSnapshot.normalize(raw);
 assert.equal(saved.design.layouts.front.widthCM,10);assert.equal(saved.design.layouts.back.widthCM,20);assert.equal(saved.brand.image,image);assert.equal(saved.apiKey,undefined);
});
test('legacy snapshots still load with the text brand and their saved back layout',()=>{
 const old=context.MerannoSnapshot.normalize({version:1,fit:'regular',palette:['preto'],font:'cormorant',design:{...design,layouts:undefined,layout:design.layouts.back}});
 assert.equal(old.brand.kind,'wordmark');assert.equal(old.design.layout.widthCM,20);
});
test('dragging remains within the printable area, for every layer',()=>{
 const normalized=context.MerannoLayout.normalize({widthCM:10,offsetXCM:999,offsetYCM:-999},{width:100,height:100});
 assert.equal(normalized.offsetXCM,13);assert.equal(normalized.offsetYCM,0);
});

test('garment inventory exactly matches each cut and survives saved drafts',()=>{
 const source=readFileSync(new URL('../public/personalizador/js/designs.js',import.meta.url),'utf8');
 const inventory=vm.createContext({});vm.runInContext('window=globalThis;',inventory);vm.runInContext(source,inventory);
 const expected={regular:['offwhite','preto','marinho','army','marrom','vermelho','amarelo','royal','bandeira'],oversized:['offwhite','preto','marinho','army','marrom'],boxy:['offwhite','preto','marinho','army','marrom','chumbo']};
 for(const [fit,ids]of Object.entries(expected)){
  assert.deepEqual(Array.from(inventory.MERANNO.COLORS.filter(c=>c.fits.includes(fit)),c=>c.id),ids);
  for(const color of ids){const saved=context.MerannoSnapshot.normalize({version:1,fit,palette:[color],font:'cormorant',design:null,brandVisible:false});assert.equal(saved.fit,fit);assert.equal(saved.palette[0],color);assert.equal(saved.brandVisible,true);}
 }
 for(const fit of ['regular','oversized'])assert.throws(()=>context.MerannoSnapshot.normalize({version:1,fit,palette:['chumbo'],font:'cormorant'}));
});
test('the frontal mark can be absent independently of the print',()=>{const svg=context.MERANNO.shirtSVG({side:'front',design,brandVisible:false});assert.doesNotMatch(svg,/class="front-wordmark"/);assert.match(svg,/class="garment-print"/);});

test('mandatory brand migrates legacy hidden snapshots to a visible name',()=>{const saved=context.MerannoSnapshot.normalize({version:1,fit:'boxy',palette:['chumbo'],font:'cormorant',brandVisible:false});assert.equal(saved.brandVisible,true);assert.equal(saved.brand.kind,'wordmark');});

test('storefront brand selection always has one available option and is further right',()=>{
 const name=context.MERANNO.frontBrand('wordmark');assert.equal(name.kind,'wordmark');assert.equal(name.layout.offsetXCM,10.5);
 assert.equal(context.MERANNO.frontBrand('logo').kind,'wordmark');
 context.MERANNO.BRAND_LOGO={image,dimensions:{width:100,height:80}};
 const logo=context.MERANNO.frontBrand('logo'),svg=context.MERANNO.shirtSVG({side:'front',brand:logo});assert.equal(logo.kind,'logo');assert.equal((svg.match(/class="front-wordmark"/g)||[]).length,1);assert.match(svg,/data:image\/png/);
 assert.equal(context.MERANNO.frontBrand('wordmark').kind,'wordmark');context.MERANNO.BRAND_LOGO=null;
});
