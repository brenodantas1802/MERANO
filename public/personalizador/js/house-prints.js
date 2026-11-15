/* Approved house artwork. Original transparent PNGs are retained at native
   resolution. Preview mockups are rendered from the same isolated artwork. */
window.MerannoHousePrints = [
  {id:'lirio-azul',name:'Lírio azul',fabric:'offwhite',fit:'oversized',art:'assets/house/lirio-azul.png',mockup:null,description:'Lírio em aquarela azul, texto exato MERANNO™ e EST. 2026.'},
  {id:'match-point',name:'Match Point',fabric:'offwhite',fit:'oversized',art:'assets/house/match-point.png',mockup:null,description:'Cena de tênis com pinceladas, quadra verde e placar. Preserve os detalhes da imagem selecionada.'},
  {id:'vodka-friends',name:'Vodka & Friends',fabric:'preto',fit:'oversized',art:'assets/house/vodka-friends.png',mockup:null,description:'Tipografia creme e azul: SOMETIMES WE JUST NEED TO DRINK VODKA WITH YOUR FRIENDS, com garrafa MERANO VODKA.'},
  {id:'surf',name:'Surf',fabric:'offwhite',fit:'oversized',art:'assets/house/surf.png',mockup:null,description:'Desenho preto de surfista, prancha Meranno, mar e palmeiras. Preserve o traço e a composição da imagem.'},
  {id:'verano',name:'Verano',fabric:'offwhite',fit:'oversized',art:'assets/house/verano.png',mockup:null,description:'Lettering vinho com o texto exato: it can’t be Verano without Meranno.'},
  {id:'already-late',name:'Already Late',fabric:'preto',fit:'oversized',art:'assets/house/already-late.png',mockup:null,description:'Números de relógio vermelhos e texto exato Who cares, I’m already late.'},
];
// Discovery metadata only: artwork and production files remain unchanged.
const houseTags={
 'lirio-azul':{categories:['natureza'],tags:'flor lírio azul aquarela floral botânico'},
 'match-point':{categories:['esportes'],tags:'tênis quadra esporte pintura'},
 'vodka-friends':{categories:['frases'],tags:'vodka bebida amigos tipografia azul'},
 surf:{categories:['natureza','esportes'],tags:'surf praia mar verão prancha desenho'},
 verano:{categories:['frases'],tags:'verano verão vinho lettering tipografia'},
 'already-late':{categories:['frases'],tags:'relógio números atrasado vermelho tipografia'}
};
for(const item of window.MerannoHousePrints)Object.assign(item,houseTags[item.id]);
