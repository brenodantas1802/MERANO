/* Explicit allowlist: provider keys and approval tokens never enter a snapshot. */
(()=>{
 const colors=['offwhite','preto','marinho','army','marrom','chumbo','vermelho','amarelo','royal','bandeira'];
 const fabrics={regular:colors.filter(c=>c!=='chumbo'),oversized:colors.slice(0,5),boxy:colors.slice(0,6)};
 const fonts=['cormorant','bodoni','cinzel','pinyon','limelight','grotesk'];
 const image=(value,max)=>typeof value==='string'&&value.length<=max&&/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+=*$/.test(value);
 function str(value,max,label,optional=false){if(value==null&&optional)return '';if(typeof value!=='string'||value.length>max)throw Error(label+' inválido.');return value;}
 function normalize(value){
  if(!value||value.version!==1||!Object.hasOwn(fabrics,value.fit)||!Array.isArray(value.palette)||!value.palette.length||value.palette.length>6||value.palette.some(c=>!colors.includes(c))||!fabrics[value.fit].includes(value.palette[0])||!fonts.includes(value.font))throw Error('Escolhas da criação inválidas.');
  let design=null;if(value.design!=null){const d=value.design;if(!image(d.aiImage,12000000))throw Error('A estampa precisa ser PNG, JPG ou WebP de até 9 MB.');const houseId=str(d.houseId,60,'Coleção',true);if(!['back','front','both'].includes(d.placement))throw Error('Posição da estampa inválida.');design={aiImage:d.aiImage,placement:houseId?'back':d.placement,houseId:houseId||null,houseName:str(d.houseName,100,'Nome da estampa',true),prompt:str(d.prompt,7000,'Prompt',true),approvedAt:str(d.approvedAt,60,'Data',true)};if(typeof d.costUSD==='number'&&Number.isFinite(d.costUSD)&&d.costUSD>=0)design.costUSD=d.costUSD;}
  if(design&&value.design.manualLayers){
    const layers=value.design.manualLayers;
    if(!Array.isArray(layers)||layers.length>12)throw Error('Use até 12 camadas.');
    design.manualLayers=layers.map(l=>{
      if(!l||!['text','image'].includes(l.type)||!image(l.src,12000000))throw Error('Camada inválida.');
      for(const k of ['width','ratio','x','y','angle'])if(typeof l[k]!=='number'||!Number.isFinite(l[k]))throw Error('Medida da camada inválida.');
      if(l.width<.1||l.width>36||l.ratio<=0||l.ratio>100||l.x<0||l.x>36||l.y<0||l.y>45||Math.abs(l.angle)>180)throw Error('Camada fora da área.');
      const result={type:l.type,src:l.src,width:l.width,ratio:l.ratio,x:l.x,y:l.y,angle:l.angle,visible:l.visible!==false};
      if(l.type==='text'){result.text=str(l.text,300,'Texto');if(!['Barlow','Barlow Condensed','Cormorant Garamond','Pinyon Script'].includes(l.font)||!/^#[0-9a-f]{6}$/i.test(l.color))throw Error('Fonte ou cor inválida.');result.font=l.font;result.color=l.color;}else result.name=str(l.name,80,'Nome');return result;
    });design.manualHidden=value.design.manualHidden===true;
  }
  const history=value.history||[];if(!Array.isArray(history)||history.length>200)throw Error('A conversa pode ter até 200 mensagens salvas.');const cleanHistory=history.map(m=>{if(!m||!['user','assistant'].includes(m.role))throw Error('Conversa inválida.');return {role:m.role,text:str(m.text,12000,'Mensagem')};});
  const refs=value.refs||[];if(!Array.isArray(refs)||refs.length>3)throw Error('Use até três referências.');const cleanRefs=refs.map(r=>{if(!r||!image(r.dataURL,6000000))throw Error('Uma referência é muito grande para salvar. Use uma imagem menor.');return {name:str(r.name,120,'Nome da referência'),dataURL:r.dataURL};});
  let reviewDraft=null;if(value.reviewDraft){if(!['back','front','both'].includes(value.reviewDraft.placement))throw Error('Posição do prompt inválida.');reviewDraft={prompt:str(value.reviewDraft.prompt,7000,'Prompt salvo'),placement:value.reviewDraft.placement};}
  const rawBrand=value.brand||{},kind=rawBrand.kind==='logo'?'logo':'wordmark';
  if(rawBrand.image!=null&&!image(rawBrand.image,4000000))throw Error('Logo inválida. Use PNG de até 3 MB.');
  const brandDims=rawBrand.image?MerannoLayout.dimensions(rawBrand.dimensions):{width:150,height:24};
  if(kind==='logo'&&!rawBrand.image)throw Error('Envie a logo antes de selecioná-la.');
  const brand={kind,image:rawBrand.image||null,dimensions:brandDims,layout:MerannoLayout.normalize(rawBrand.layout||{widthCM:8,offsetXCM:8,offsetYCM:5},kind==='logo'?brandDims:{width:150,height:24})};
  const creativeBrief={};let briefSpace=7000;for(const key of ['theme','style','colors','composition','text','placement','referenceUse','preserve','avoid','assumptions']){const value=valueForBrief(key);if(value){creativeBrief[key]=value;briefSpace-=value.length;}}
  function valueForBrief(key){return typeof value.creativeBrief?.[key]==='string'?value.creativeBrief[key].trim().slice(0,Math.min(1000,briefSpace)):'';}
  const result={version:1,creativeBrief,brand,brandVisible:true,fit:value.fit,palette:[...value.palette],font:value.font,design,history:cleanHistory,refs:cleanRefs,referenceNotes:str(value.referenceNotes,600,'Orientação',true),useReferenceColors:value.useReferenceColors!==false,messageDraft:str(value.messageDraft,6000,'Rascunho da mensagem',true),reviewDraft};
  if(design){const raw=value.design;if((raw.layout||raw.printBounds)&&!raw.artDimensions)throw Error('As medidas precisam das dimensões da arte.');if(raw.artDimensions){const dims=MerannoLayout.dimensions(raw.artDimensions),visible=MerannoLayout.bounds(raw.printBounds,dims);design.artDimensions=dims;design.printBounds=visible;if(raw.layout)design.layout=MerannoLayout.normalize(raw.layout,visible);if(raw.layouts){design.layouts={};for(const side of ['front','back'])if(raw.layouts[side])design.layouts[side]=MerannoLayout.normalize(raw.layouts[side],visible);}}}
  if(JSON.stringify(result).length>19500000)throw Error('A criação está muito grande para salvar. Reduza as imagens de referência.');return result;
 }
 globalThis.MerannoSnapshot={normalize};
})();
