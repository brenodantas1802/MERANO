/* Physical placement inside a 36 × 45 cm print area. No bitmap edits. */
(()=>{
 const AREA={widthCM:36,heightCM:45};
 function dimensions(value={width:300,height:360}){const width=value.width,height=value.height;if(!Number.isInteger(width)||!Number.isInteger(height)||width<1||height<1||width>16384||height>16384||width*height>40000000)throw Error('Dimensões da imagem inválidas.');return {width,height};}
 function bounds(value,dims){const d=dimensions(dims),b=value||{x:0,y:0,...d};for(const key of ['x','y','width','height'])if(!Number.isInteger(b[key]))throw Error('Área visível da estampa inválida.');if(b.x<0||b.y<0||b.width<1||b.height<1||b.x+b.width>d.width||b.y+b.height>d.height)throw Error('Área visível da estampa inválida.');return {x:b.x,y:b.y,width:b.width,height:b.height};}
 function number(value,fallback){if(value===undefined)return fallback;if(typeof value!=='number'||!Number.isFinite(value))throw Error('Informe uma medida válida para a estampa.');return value;}
 function normalize(value={},dims={width:300,height:360}){
  const d=dimensions(dims),maxWidth=Math.min(36,45*d.width/d.height);if(maxWidth<1)throw Error('A estampa é estreita demais para esta área de impressão.');
  const widthCM=Math.max(1,Math.min(maxWidth,number(value.widthCM,Math.min(28,maxWidth)))),heightCM=widthCM*d.height/d.width,xMax=Math.max(0,(36-widthCM)/2),yMax=Math.max(0,45-heightCM);
  return {widthCM,heightCM,offsetXCM:Math.max(-xMax,Math.min(xMax,number(value.offsetXCM,0))),offsetYCM:Math.max(0,Math.min(yMax,number(value.offsetYCM,0)))};
 }
 // Fit visible artwork, not the transparent canvas, into the upper back.
 function initial(dims,visible){const d=dimensions(dims),b=bounds(visible,d),widthCM=Math.min(32,36*b.width/b.height);return normalize({widthCM,offsetXCM:0,offsetYCM:Math.max(2,(40-widthCM*b.height/b.width)/2)},b);}
 function limits(value,dims){const d=dimensions(dims),l=normalize(value,d);return {widthMax:Math.min(36,45*d.width/d.height),xMax:Math.max(0,(36-l.widthCM)/2),yMax:Math.max(0,45-l.heightCM)};}
 globalThis.MerannoLayout={AREA,dimensions,bounds,normalize,initial,limits};
})();
