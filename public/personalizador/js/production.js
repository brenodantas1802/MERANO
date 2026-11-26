/* Production files are built locally. No API key, reference uploads or chat history enter the package. */
(() => {
  'use strict';
  const utf8=new TextEncoder();
  const crcTable=Uint32Array.from({length:256},(_,n)=>{for(let k=0;k<8;k++)n=n&1?0xedb88320^(n>>>1):n>>>1;return n>>>0;});
  const crc32=bytes=>{let crc=0xffffffff;for(const b of bytes)crc=crcTable[(crc^b)&255]^(crc>>>8);return (crc^0xffffffff)>>>0;};
  function concat(parts){const out=new Uint8Array(parts.reduce((n,p)=>n+p.length,0));let at=0;for(const p of parts){out.set(p,at);at+=p.length;}return out;}
  const bytesOf=data=>Uint8Array.from(atob(data.split(',')[1]),c=>c.charCodeAt(0));
  function pngChunk(type,data){const out=new Uint8Array(data.length+12);const view=new DataView(out.buffer);view.setUint32(0,data.length);out.set(utf8.encode(type),4);out.set(data,8);view.setUint32(data.length+8,crc32(out.subarray(4,data.length+8)));return out;}
  function png300(bytes){
    const parts=[bytes.slice(0,8)];const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
    for(let i=8;i<bytes.length;){const len=view.getUint32(i);const type=String.fromCharCode(...bytes.slice(i+4,i+8));
      if(!['pHYs','sRGB','iCCP'].includes(type))parts.push(bytes.slice(i,i+len+12));
      if(type==='IHDR'){const density=new Uint8Array(9);const dv=new DataView(density.buffer);dv.setUint32(0,11811);dv.setUint32(4,11811);density[8]=1;parts.push(pngChunk('sRGB',new Uint8Array([0])),pngChunk('pHYs',density));}
      i+=len+12;
    }return concat(parts);
  }
  function dimensions(widthCM,ratio){
    const heightCM=widthCM*ratio;
    if(!Number.isFinite(widthCM)||!Number.isFinite(ratio)||ratio<=0||widthCM<1||widthCM>36||heightCM>45.00001)throw Error('A estampa deve ter largura de 1 a 36 cm e altura máxima de 45 cm.');
    // Floor ensures the exported physical size never exceeds the requested dimensions.
    return {widthCM,heightCM,width:Math.floor(widthCM/2.54*300),height:Math.floor(heightCM/2.54*300)};
  }
  async function loadImage(src){const image=new Image();image.src=src;await image.decode();return image;}
  const svgURL=svg=>'data:image/svg+xml;base64,'+btoa(unescape(encodeURIComponent(svg)));
  async function renderImage(image,width,height,{opaque=false}={}){
    const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
    const ctx=canvas.getContext('2d',{colorSpace:'srgb'});if(opaque){ctx.fillStyle='#f5f1e9';ctx.fillRect(0,0,width,height);}
    ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(image,0,0,width,height);
    const blob=await new Promise(resolve=>canvas.toBlob(resolve,opaque?'image/jpeg':'image/png',.92));canvas.width=canvas.height=1;
    if(!blob)throw Error('Não foi possível preparar o arquivo. Tente novamente.');
    return new Uint8Array(await blob.arrayBuffer());
  }
  function inspectAlpha(image){
    const c=document.createElement('canvas');c.width=image.naturalWidth;c.height=image.naturalHeight;
    const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0);
    const pixels=ctx.getImageData(0,0,c.width,c.height).data;let left=c.width,top=c.height,right=-1,bottom=-1,transparent=false;
    for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++){
      const alpha=pixels[(y*c.width+x)*4+3];if(alpha<255)transparent=true;
      // Preserve every nonzero alpha pixel, including fine lines and soft edges.
      if(alpha>0){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}
    }
    const original={width:c.width,height:c.height};c.width=c.height=1;
    if(right<0)throw Error('A imagem está vazia. Escolha uma arte visível.');
    if(!transparent)throw Error('A arte não tem transparência. Peça uma versão sem fundo antes de baixar.');
    return {original,bounds:{x:left,y:top,width:right-left+1,height:bottom-top+1}};
  }
  async function prepareArt(image){
    const {original,bounds}=inspectAlpha(image);
    const cropped=bounds.width!==original.width||bounds.height!==original.height;
    if(cropped){const c=document.createElement('canvas');c.width=bounds.width;c.height=bounds.height;c.getContext('2d',{colorSpace:'srgb'}).drawImage(image,bounds.x,bounds.y,bounds.width,bounds.height,0,0,bounds.width,bounds.height);const url=c.toDataURL('image/png');c.width=c.height=1;image=await loadImage(url);}
    return {image,original,bounds,cropped,width:bounds.width,height:bounds.height};
  }
  async function prepareBrand(fabric,brand){return prepareArt(await loadImage(window.MERANNO.brandSource(fabric,brand)));}

  function zip(files){
    const local=[],central=[];let offset=0;const now=new Date();const time=(now.getHours()<<11)|(now.getMinutes()<<5)|(now.getSeconds()>>1),date=((now.getFullYear()-1980)<<9)|((now.getMonth()+1)<<5)|now.getDate();
    for(const file of files){const name=utf8.encode(file.name),data=typeof file.data==='string'?utf8.encode(file.data):file.data,crc=crc32(data);
      const lh=new Uint8Array(30+name.length),lv=new DataView(lh.buffer);lv.setUint32(0,0x04034b50,true);lv.setUint16(4,20,true);lv.setUint16(6,0x800,true);lv.setUint16(10,time,true);lv.setUint16(12,date,true);lv.setUint32(14,crc,true);lv.setUint32(18,data.length,true);lv.setUint32(22,data.length,true);lv.setUint16(26,name.length,true);lh.set(name,30);local.push(lh,data);
      const ch=new Uint8Array(46+name.length),cv=new DataView(ch.buffer);cv.setUint32(0,0x02014b50,true);cv.setUint16(4,20,true);cv.setUint16(6,20,true);cv.setUint16(8,0x800,true);cv.setUint16(12,time,true);cv.setUint16(14,date,true);cv.setUint32(16,crc,true);cv.setUint32(20,data.length,true);cv.setUint32(24,data.length,true);cv.setUint16(28,name.length,true);cv.setUint32(42,offset,true);ch.set(name,46);central.push(ch);offset+=lh.length+data.length;
    }
    const cd=concat(central),end=new Uint8Array(22),ev=new DataView(end.buffer);ev.setUint32(0,0x06054b50,true);ev.setUint16(8,files.length,true);ev.setUint16(10,files.length,true);ev.setUint32(12,cd.length,true);ev.setUint32(16,offset,true);return new Blob([...local,cd,end],{type:'application/zip'});
  }
  const latin=text=>Uint8Array.from([...text].map(c=>c.charCodeAt(0)<=255?c.charCodeAt(0):63));
  const pdfEscape=text=>String(text).replace(/[\r\n]/g,' ').replace(/([\\()])/g,'\\$1');
  function pdf(meta,front,back){
    const text=(s,x,y,size=10)=>`BT /F1 ${size} Tf ${x} ${y} Td (${pdfEscape(s)}) Tj ET\n`;
    let content=text('MERANNO - Ficha de produção',40,800,20)+text(meta.id+' | '+new Date(meta.exportedAt).toLocaleString('pt-BR'),40,778);
    const lines=[`Modelagem: ${meta.fit} | Tamanho: ${meta.size} | Quantidade: ${meta.quantity}`,`Malha: ${meta.fabric.name} (${meta.fabric.hex})`,`Estampa principal: ${meta.placementLabel} | ${meta.brand?'Marca frontal conforme mockup e coordenadas':'Sem marca frontal'}`,`Arte: ${meta.art.widthCM.toFixed(2)} x ${meta.art.heightCM.toFixed(2)} cm | ${meta.art.width} x ${meta.art.height} px`,meta.brand?`Marca frontal: ${meta.brand.widthCM} x ${meta.brand.heightCM.toFixed(2)} cm | Cor: ${meta.brand.color}`:'Marca frontal: removida pelo cliente','Impressão: PNG, RGB (sRGB), transparente, 300 DPI. Limite: 36 x 45 cm.',`Original: ${meta.original.width} x ${meta.original.height} px | Ampliação: ${meta.upscaled?'sim, não acrescenta detalhes':'não'}`];
    lines.forEach((line,i)=>content+=text(line,40,750-i*18));
    content+=text(`Área útil sem margens: ${meta.usablePixels.width} x ${meta.usablePixels.height} px. Dimensões da ficha = arte visível.`,40,624);
    if(meta.printLayout)content+=text('Na área de 36 x 45 cm: horizontal '+meta.printLayout.offsetXCM.toFixed(1)+' cm do centro; vertical '+meta.printLayout.offsetYCM.toFixed(1)+' cm do topo.',40,610,9);
    content+=text('Frente - referência de aplicação',40,596,11)+text('Costas - referência de aplicação',310,596,11);
    content+='q 235 0 0 243 35 340 cm /Front Do Q\nq 235 0 0 243 310 340 cm /Back Do Q\n';
    const instructions=['REVISÃO HUMANA OBRIGATÓRIA ANTES DA PRODUÇÃO','1. Enviar os PNGs como DOCUMENTOS no WhatsApp, nunca como fotos.','2. Uma estampa por arquivo, sem margens transparentes externas.','3. Mockups apenas como referência. Não usar como arte de impressão.','4. Somente frente/costas, sem avançar sobre mangas, costuras ou barras.','5. Tons podem variar entre tela, tecido e processo de impressão.','6. Pequenas variações de milímetros na aplicação podem ocorrer.',`Referência do pedido: ${meta.orderReference||'Não informada'}`];
    instructions.forEach((line,i)=>content+=text(line,40,310-i*18,i===0?12:10));
    const note=(meta.notes||'Sem observações.').match(/.{1,85}(?:\s|$)|.{1,85}/g)||[];content+=text('Observações:',40,160,11);note.slice(0,7).forEach((line,i)=>content+=text(line.trim(),40,143-i*12));
    const stream=data=>concat([latin(`<< /Length ${data.length} >>\nstream\n`),data,latin('\nendstream')]);
    const jpeg=data=>concat([latin(`<< /Type /XObject /Subtype /Image /Width 800 /Height 828 /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${data.length} >>\nstream\n`),data,latin('\nendstream')]);
    const objects=[latin('<< /Type /Catalog /Pages 2 0 R >>'),latin('<< /Type /Pages /Kids [3 0 R] /Count 1 >>'),latin('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> /XObject << /Front 6 0 R /Back 7 0 R >> >> /Contents 5 0 R >>'),latin('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>'),stream(latin(content)),jpeg(front),jpeg(back)];
    const parts=[latin('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n')],offsets=[0];let offset=parts[0].length;
    objects.forEach((obj,i)=>{offsets.push(offset);const part=concat([latin(`${i+1} 0 obj\n`),obj,latin('\nendobj\n')]);parts.push(part);offset+=part.length;});
    const xref=`xref\n0 ${objects.length+1}\n0000000000 65535 f \n`+offsets.slice(1).map(o=>String(o).padStart(10,'0')+' 00000 n \n').join('');
    parts.push(latin(xref+`trailer\n<< /Size ${objects.length+1} /Root 1 0 R >>\nstartxref\n${offset}\n%%EOF`));return concat(parts);
  }
  async function build(snapshot,options,prepared){
    if(snapshot.design?.manualHidden)throw Error('Mostre uma camada antes de preparar a produção.');
    const M=window.MERANNO;
    const asset=prepared?.bounds ? prepared : await prepareArt(prepared || await loadImage(snapshot.design.aiImage));
    const image=asset.image;
    const size=dimensions(Number(options.widthCM),asset.height/asset.width);
    if(!['P','M','G'].includes(options.size)||!Number.isInteger(+options.quantity)||+options.quantity<1||+options.quantity>9999)throw Error('Informe tamanho e quantidade válidos.');
    const visible={x:0,y:0,width:asset.width,height:asset.height};
    const primary=snapshot.design.placement==='front'?'front':'back';
    const initial=snapshot.design.layouts?.[primary]||snapshot.design.layout||MerannoLayout.initial(visible,visible);
    const layout=MerannoLayout.normalize({...initial,widthCM:size.widthCM},visible);
    snapshot={...snapshot,design:{...snapshot.design,artDimensions:{width:asset.width,height:asset.height},printBounds:visible,layout,layouts:{...snapshot.design.layouts,[primary]:layout}}};
    const brandAsset=await prepareBrand(snapshot.fabric,snapshot.brand);
    const brandSize=dimensions(Number(snapshot.brand?.layout?.widthCM||options.brandWidthCM),brandAsset.height/brandAsset.width);
    const art=png300(await renderImage(image,size.width,size.height));
    const brand=png300(await renderImage(brandAsset.image,brandSize.width,brandSize.height));
    const garment=await fetch(`assets/garments/${snapshot.fit}-v2.webp`).then(r=>{if(!r.ok)throw Error('Não foi possível preparar o mockup.');return r.blob();});
    const garmentURL=await new Promise(resolve=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.readAsDataURL(garment);});
    async function mockup(side){let svg=M.shirtSVG({fit:snapshot.fit,side,fabric:snapshot.fabric,brandVisible:snapshot.brandVisible,brand:snapshot.brand,design:{...snapshot.design,aiImage:image.src},label:side});svg=svg.replace(/href="assets\/garments\/[^"]+"/g,`href="${garmentURL}"`);return loadImage(svgURL(svg));}
    const front=await mockup('front'),back=await mockup('back');
    const frontPNG=await renderImage(front,1200,1242,{opaque:true}),backPNG=await renderImage(back,1200,1242,{opaque:true});
    const frontPDF=await renderImage(front,800,828,{opaque:true}),backPDF=await renderImage(back,800,828,{opaque:true});
    const placement=snapshot.design.houseId?'back':snapshot.design.placement||'back';
    const meta={printLayout:{...layout,areaWidthCM:36,areaHeightCM:45,horizontalReference:'Centro da área; positivo = direita na vista das costas',verticalReference:'Início superior da área; positivo = para baixo'},id:'MER-'+crypto.randomUUID().slice(0,8).toUpperCase(),exportedAt:new Date().toISOString(),approvedAt:snapshot.design.approvedAt,fit:snapshot.fitName,size:options.size,quantity:+options.quantity,fabric:{name:snapshot.fabricName,hex:snapshot.fabric},placement,placementLabel:{back:'Costas',front:'Frente',both:'Frente e costas'}[placement],art:{...size,dpi:300,colorSpace:'sRGB',transparent:true,externalTransparentMargins:'removed',contentBoundsInOriginal:asset.bounds},brand:{...brandSize,kind:snapshot.brand?.kind||'wordmark',layout:snapshot.brand?.layout||null,text:'MERANNO',color:snapshot.brand?.kind==='logo'?'Cores originais da logo':M.wordmarkColor(snapshot.fabric),visible:snapshot.brandVisible!==false,position:'Frente; posição medida em brand.layout, a partir do centro e do topo da área imprimível',dpi:300,externalTransparentMargins:'removed'},original:asset.original,usablePixels:{width:asset.width,height:asset.height},upscaled:size.width>asset.width||size.height>asset.height,prompt:snapshot.design.prompt,orderReference:String(options.orderReference||'').slice(0,80),notes:('Revisão humana obrigatória antes da produção. '+String(options.notes||'')).slice(0,500),positioning:'Somente frente e costas. Não avançar sobre mangas, costuras ou barras. Confirmar distâncias em cm com a confecção; mockup ilustrativo, sem escala técnica.',colorNote:'A tela, o tecido, a cor da malha e o processo de impressão podem alterar a percepção das cores.',placementTolerance:'Podem ocorrer pequenas variações de milímetros no tamanho e posicionamento durante a aplicação.'};
    meta.humanReview='pending';meta.applications={};
    for(const side of ['back','front'])if(placement===side||placement==='both'){
      const applied=MerannoLayout.normalize(snapshot.design.layouts?.[side]||layout,visible);
      meta.applications[side]={...applied,areaWidthCM:36,areaHeightCM:45};
    }
    if(snapshot.brandVisible===false)meta.brand=null;
    const files=[{name:'mockup-frente-referencia.jpg',data:frontPNG},{name:'mockup-costas-referencia.jpg',data:backPNG},{name:'ficha-producao.pdf',data:pdf(meta,frontPDF,backPDF)},{name:'especificacoes.json',data:JSON.stringify(meta,null,2)}];
    if(snapshot.brandVisible!==false)files.push({name:'marca-frente-meranno.png',data:brand});
    if(placement==='back'||placement==='both')files.push({name:'estampa-costas.png',data:art});
    if(placement==='front'||placement==='both'){const frontSize=dimensions(meta.applications.front.widthCM,asset.height/asset.width);files.push({name:'estampa-frente.png',data:png300(await renderImage(image,frontSize.width,frontSize.height))});}
    files.push({name:'LEIA-ME.txt',data:'ENVIAR COMO DOCUMENTO, NÃO COMO FOTO.\n\nCada PNG contém uma única estampa isolada, em RGB (sRGB), fundo transparente e 300 DPI, no tamanho descrito na ficha. As margens totalmente transparentes foram removidas antes de calcular o tamanho; nenhum pixel visível foi removido. Não imprimir os arquivos de mockup: são apenas referência visual.\n\nDescompacte o ZIP e envie os PNGs separados, a ficha PDF e os mockups como documentos para o canal da confecção. No WhatsApp, use Anexar > Documento. Nenhum envio é feito automaticamente.\n\nAntes de enviar, confira o texto, as cores, a proporção, as dimensões, a nitidez e o fundo dos PNGs. A produção usa o arquivo final recebido.\n\n'+meta.positioning+'\n'+meta.colorNote+'\n'+meta.placementTolerance+'\n\n'+(meta.upscaled?'A arte original foi ampliada para o tamanho solicitado. A ampliação não recupera detalhes; verificar nitidez antes de produzir.':'A arte principal não precisou ser ampliada.')});
    return {blob:zip(files),filename:meta.id+'-producao.zip',meta,files};
  }
  const dialog=document.createElement('dialog');dialog.className='connection-dialog production-dialog';dialog.setAttribute('aria-labelledby','production-title');
  dialog.innerHTML=`<form id="production-form"><h2 id="production-title">Conferir para produção</h2><p>Prévia sujeita à revisão humana. Confira conteúdo, direitos de uso, texto, cores e posições antes de produzir.</p><div class="production-art-review"><figure><div class="alpha-preview"><img id="production-art-preview" alt="Estampa isolada sem margens externas"></div><figcaption>Estampa principal</figcaption></figure><figure><div class="alpha-preview"><img id="production-brand-preview" alt="Assinatura MERANNO isolada"></div><figcaption>Peito esquerdo: MERANNO</figcaption></figure></div><p class="production-margin-note">O quadriculado indica transparência e não vai no arquivo. O tamanho abaixo é da arte visível, sem margens externas.</p><div class="production-grid"><label>Tamanho<select name="size" required><option value="">Escolha</option><option>P</option><option>M</option><option>G</option></select></label><label>Quantidade<input name="quantity" type="number" min="1" max="9999" value="1" required></label><label>Largura da estampa (cm)<input name="widthCM" type="number" min="1" max="36" step="0.01" required></label><label>Largura de “MERANNO” (cm)<input name="brandWidthCM" type="number" min="1" max="36" step="0.1" value="8" required></label></div><p id="production-size"></p><label>Referência do pedido (opcional)<input name="orderReference" maxlength="80" placeholder="Nome ou número do pedido"></label><label>Observações para a confecção (opcional)<textarea name="notes" rows="2" maxlength="500"></textarea></label><p id="production-quality"></p><details class="production-rules"><summary>Orientações da confecção</summary><ul><li>Somente frente e costas, sem avançar sobre mangas, costuras ou barras.</li><li>As cores podem variar entre tela e tecido. A aplicação pode ter pequenas variações de milímetros.</li><li>Envie os PNGs finais como documentos no WhatsApp. Mockups são apenas referência.</li></ul></details><p id="production-error" role="status" aria-live="polite"></p><p>Pacote com <strong>PNGs + ficha PDF + mockups</strong>.</p><div class="connection-actions"><button type="button" class="btn btn--ghost" id="production-close">Voltar</button><button type="submit" class="btn btn--solid" id="production-download">Conferir e baixar</button></div></form>`;
  document.body.append(dialog);const form=dialog.querySelector('form');let current=null,source=null,previousFocus=null;
  const feedback=dialog.querySelector('#production-error');
  function describe(){if(!source)return;try{const dims=dimensions(+form.elements.widthCM.value,source.height/source.width);dialog.querySelector('#production-size').textContent=`${dims.widthCM.toFixed(2)} × ${dims.heightCM.toFixed(2)} cm · ${dims.width} × ${dims.height} px · 300 DPI · RGB`;
    const native=`Original: ${source.width} × ${source.height} px. Sem ampliar: até ${(source.width/300*2.54).toFixed(1)} × ${(source.height/300*2.54).toFixed(1)} cm a 300 DPI. `;
    dialog.querySelector('#production-quality').textContent=native+(dims.width>source.width||dims.height>source.height?'Para este tamanho, a arte será ampliada. Isso não recupera detalhes; use um original maior para manter a nitidez.':'Resolução original suficiente para este tamanho.');feedback.textContent='';}catch(e){feedback.textContent=e.message;}}
  form.elements.widthCM.addEventListener('input',describe);
  dialog.querySelector('#production-close').addEventListener('click',()=>dialog.close());dialog.addEventListener('close',()=>previousFocus?.focus());
  form.addEventListener('submit',async event=>{event.preventDefault();const button=dialog.querySelector('#production-download');button.disabled=true;feedback.textContent='Preparando os arquivos…';
    try{const options=Object.fromEntries(new FormData(form));const result=await build(current,options,source);const url=URL.createObjectURL(result.blob),a=document.createElement('a');a.href=url;a.download=result.filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),60000);feedback.textContent='Pacote baixado. Envie como documento para a confecção.';}
    catch(e){feedback.textContent=e.message;}finally{button.disabled=false;}
  });
  async function open(snapshot){previousFocus=document.activeElement;current=structuredClone(snapshot);source=null;form.elements.brandWidthCM.closest('label').hidden=snapshot.brandVisible===false;dialog.querySelector('#production-brand-preview').closest('figure').hidden=snapshot.brandVisible===false;form.elements.brandWidthCM.readOnly=!!snapshot.design.houseId;if(snapshot.design.houseId)form.elements.brandWidthCM.value=8;dialog.showModal();feedback.textContent='Preparando dimensões…';const button=dialog.querySelector('#production-download');button.disabled=true;
    try{source=await prepareArt(await loadImage(current.design.aiImage));const brand=await prepareBrand(current.fabric,current.brand);dialog.querySelector('#production-art-preview').src=source.image.src;dialog.querySelector('#production-brand-preview').src=brand.image.src;const selected=current.design.layout?MerannoLayout.normalize(current.design.layout,{width:source.width,height:source.height}).widthCM:Math.min(28,45*source.width/source.height,source.width/300*2.54);form.elements.widthCM.value=Math.max(1,Math.floor(selected*100)/100);form.elements.widthCM.max=Math.floor(Math.min(36,45*source.width/source.height)*100)/100;describe();form.elements.size.focus();}
    catch(error){source=null;feedback.textContent=error.message||'Não foi possível abrir a estampa.';}finally{button.disabled=!source;}
  }
  window.MerannoProduction={open,build,dimensions,png300,zip,prepareArt,inspectArt:inspectAlpha};
})();
