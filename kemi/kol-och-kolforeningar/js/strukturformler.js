/**
 * Delad ritmotor för strukturformler – kolväten och kolföreningar.
 *
 * Används av flera sidor i kol-och-kolföreningar-kapitlet (begreppsbingo, Lärande spel,
 * och det kommande tävlingsspelet "Stafetten") så att samma kod och samma geometri
 * återanvänds överallt istället för att kopieras in i varje fil.
 *
 * Inkludera filen med <script src="js/strukturformler.js"></script> FÖRE sidans egen
 * <script> som anropar funktionerna nedan – de blir globala precis som i de befintliga
 * inbäddade kopiorna.
 *
 * renderSVG(g, xscale, grupp) ritar en {atoms,bonds}-graf som en SVG-sträng.
 *   grupp (valfritt tredje argument): {atoms:[...atomindex], bonds:[...bindningsindex]}
 *   markerar en funktionell grupp i blått (både bokstav och de bindningar som hör till
 *   gruppen). Byggarfunktionerna nedan sätter automatiskt g.grupp när det är relevant,
 *   så vanligast är att anropa renderSVG(g, xscale, g.grupp) – eller bara renderSVG(g)
 *   om ingen markering önskas.
 *
 * Byggarfunktioner (alla returnerar {atoms:[...], bonds:[...], grupp?:{...}}):
 *   chain(n, bonds)        – rak kolkedja, bonds=[ordning mellan varje kolpar] (alkan/alken/alkyn)
 *   alkohol(n)             – rak kedja med -OH på sista kolet
 *   syra(n)                – rak kedja med -COOH på sista kolet
 *   polyol(n, ohCarbons)   – rak kedja med -OH på flera namngivna kol (ohCarbons, 0-indexerat)
 *   glycerol()             – genväg: polyol(3,[0,1,2])
 *   grenAlkan(n, pos)      – rak kedja med en metylgren nedåt på kol 'pos' (1-indexerat)
 *   esterBuild(acidN, alcoholN) – syra (acidN kol) förestrad med alkohol (alcoholN kol)
 *   aldehyd(n)             – rak kedja med aldehydgrupp (CHO) på sista kolet
 *   keton(n, pos)          – rak kedja med karbonyl (C=O) på kol 'pos' (1-indexerat, ej ändkol)
 *   glycin()               – aminosyran glycin (NH2-CH2-COOH) – den enda aminosyra som
 *                             används, eftersom den unika kolplatsen bara bär ett väte
 *                             (inga stereo-/sidokedjefrågor att ta ställning till)
 */

const STEP=35, G=11, FS=21, PAD=20, MARK="#1257e0";

function renderSVG(g, xscale=1, grupp=null){
  const SX=STEP*xscale, SY=STEP;
  const markA=(grupp&&grupp.atoms)||[], markB=(grupp&&grupp.bonds)||[];
  const cols=g.atoms.map(a=>a.col), rows=g.atoms.map(a=>a.row);
  const minC=Math.min(...cols),maxC=Math.max(...cols),minR=Math.min(...rows),maxR=Math.max(...rows);
  const OX=PAD-minC*SX, OY=PAD-minR*SY, X=a=>OX+a.col*SX, Y=a=>OY+a.row*SY;
  let els=[];
  g.bonds.forEach((b,bi)=>{
    const a1=g.atoms[b.a],a2=g.atoms[b.b];
    let x1=X(a1),y1=Y(a1),x2=X(a2),y2=Y(a2);
    const dx=x2-x1,dy=y2-y1,len=Math.hypot(dx,dy)||1,ux=dx/len,uy=dy/len;
    const trim=b.gap!==undefined?b.gap:G;
    x1+=ux*trim;y1+=uy*trim;x2-=ux*trim;y2-=uy*trim;
    const px=-uy,py=ux, offs=b.order===1?[0]:b.order===2?[-3.5,3.5]:[-6,0,6];
    const col=markB.includes(bi)?` stroke="${MARK}"`:"";
    offs.forEach(o=>els.push(`<line x1="${(x1+px*o).toFixed(1)}" y1="${(y1+py*o).toFixed(1)}" x2="${(x2+px*o).toFixed(1)}" y2="${(y2+py*o).toFixed(1)}"${col}/>`));
  });
  g.atoms.forEach((a,i)=>{
    const col=markA.includes(i)?` fill="${MARK}"`:"";
    els.push(`<text x="${X(a).toFixed(1)}" y="${Y(a).toFixed(1)}" text-anchor="middle" dominant-baseline="central" font-size="${FS}"${col}>${a.el}</text>`);
  });
  const W=(maxC-minC)*SX+2*PAD, H=(maxR-minR)*SY+2*PAD;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W.toFixed(1)} ${H.toFixed(1)}" width="${W.toFixed(1)}" height="${H.toFixed(1)}">${els.join("")}</svg>`;
}

/* ===================== BYGGARE ===================== */
function chain(n,bonds){
  const A=[],B=[];
  for(let i=0;i<n;i++)A.push({el:"C",col:i,row:0});
  for(let i=0;i<n-1;i++)B.push({a:i,b:i+1,order:bonds[i]});
  for(let i=0;i<n;i++){
    const hasPrev=i>0,hasNext=i<n-1,prevO=hasPrev?bonds[i-1]:0,nextO=hasNext?bonds[i]:0;
    const hc=4-prevO-nextO,nN=(hasPrev?1:0)+(hasNext?1:0),free=!hasPrev?"left":"right";
    let offs=[];
    if(nN===1 && ((hasNext&&nextO===2)||(hasPrev&&prevO===2))){
      const E=45, angs=hasNext?[180-E,180+E]:[E,-E];
      for(const th of angs){const r=th*Math.PI/180;offs.push({dx:Math.cos(r),dy:-Math.sin(r)});}
    } else {
      let dirs=hc===4?["up","down","left","right"]:hc===3?["up","down",free]:hc===2?["up","down"]:hc===1?(nN===1?[free]:["up"]):[];
      for(const d of dirs) offs.push({dx:d==="left"?-1:d==="right"?1:0,dy:d==="up"?-1:d==="down"?1:0});
    }
    for(const o of offs){A.push({el:"H",col:i+o.dx,row:o.dy});B.push({a:i,b:A.length-1,order:1});}
  }
  return {atoms:A,bonds:B};
}
function alkohol(n){
  const A=[],B=[],idx=x=>A.indexOf(x);
  for(let i=0;i<n;i++)A.push({el:"C",col:i,row:0});
  for(let i=0;i<n-1;i++)B.push({a:i,b:i+1,order:1});
  const O={el:"O",col:n,row:0};A.push(O);B.push({a:n-1,b:idx(O),order:1});
  const Ho={el:"H",col:n+1,row:0};A.push(Ho);B.push({a:idx(O),b:idx(Ho),order:1});
  for(let i=0;i<n;i++){let dirs=(n===1||i===0)?[[-1,0],[0,-1],[0,1]]:[[0,-1],[0,1]];
    for(const [dx,dy] of dirs){const h={el:"H",col:i+dx,row:dy};A.push(h);B.push({a:i,b:idx(h),order:1});}}
  return {atoms:A,bonds:B, grupp:{atoms:[n,n+1], bonds:[n]}}; // OH: syret + dess H
}
function syra(n){
  const A=[],B=[],idx=x=>A.indexOf(x);
  for(let i=0;i<n;i++)A.push({el:"C",col:i,row:0});
  for(let i=0;i<n-1;i++)B.push({a:i,b:i+1,order:1});
  const cc=n-1;
  const Oc={el:"O",col:n-1,row:-1};A.push(Oc);B.push({a:cc,b:idx(Oc),order:2});
  const Oh={el:"O",col:n,row:0};A.push(Oh);B.push({a:cc,b:idx(Oh),order:1});
  const Hh={el:"H",col:n+1,row:0};A.push(Hh);B.push({a:idx(Oh),b:idx(Hh),order:1});
  for(let i=0;i<n;i++){ if(i===cc){ if(n===1){const h={el:"H",col:-1,row:0};A.push(h);B.push({a:i,b:idx(h),order:1});} continue; }
    let dirs=(i===0)?[[-1,0],[0,-1],[0,1]]:[[0,-1],[0,1]];
    for(const [dx,dy] of dirs){const h={el:"H",col:i+dx,row:dy};A.push(h);B.push({a:i,b:idx(h),order:1});}}
  return {atoms:A,bonds:B, grupp:{atoms:[cc,n,n+1,n+2], bonds:[n-1,n,n+1]}}; // COOH
}
function polyol(n, ohCarbons){
  const A=[],B=[],idx=x=>A.indexOf(x);
  for(let i=0;i<n;i++)A.push({el:"C",col:i,row:0});
  for(let i=0;i<n-1;i++)B.push({a:i,b:i+1,order:1});
  for(let i=0;i<n;i++){
    const hasPrev=i>0,hasNext=i<n-1,hasOH=ohCarbons.includes(i);
    const hc=4-(hasPrev?1:0)-(hasNext?1:0)-(hasOH?1:0);
    if(hasOH){const O={el:"OH",col:i,row:1};A.push(O);B.push({a:i,b:idx(O),order:1});}
    const slots=[[0,-1]]; if(!hasOH) slots.push([0,1]); if(!hasPrev) slots.push([-1,0]); if(!hasNext) slots.push([1,0]);
    for(let k=0;k<hc;k++){const [dx,dy]=slots[k]; const h={el:"H",col:i+dx,row:dy};A.push(h);B.push({a:i,b:idx(h),order:1});}
  }
  return {atoms:A,bonds:B};
}
function glycerol(){ return polyol(3,[0,1,2]); }
function grenAlkan(n,pos){ // rak kedja n kol med en metylgren (nedåt) på kol 'pos' (1-indexerat)
  const A=[],B=[],idx=x=>A.indexOf(x);
  for(let i=0;i<n;i++)A.push({el:"C",col:i,row:0});
  for(let i=0;i<n-1;i++)B.push({a:i,b:i+1,order:1});
  const bc=pos-1;
  const Cb={el:"C",col:bc,row:2};A.push(Cb);B.push({a:bc,b:idx(Cb),order:1});
  const addH=(ci,dirs)=>dirs.forEach(([dx,dy])=>{const h={el:"H",col:ci.col+dx,row:ci.row+dy};A.push(h);B.push({a:idx(ci),b:idx(h),order:1});});
  for(let i=0;i<n;i++){const first=i===0,last=i===n-1;
    let dirs = (i===bc) ? [[0,-1]] : [[0,-1],[0,1]];
    if(first) dirs.push([-1,0]); if(last) dirs.push([1,0]);
    addH(A[i],dirs);
  }
  addH(Cb,[[0,1],[-1,0],[1,0]]);
  return {atoms:A,bonds:B};
}
function esterBuild(acidN, alcoholN){ // syra (acidN kol) förestrad med alkohol (alcoholN kol)
  const A=[],B=[],idx=x=>A.indexOf(x);
  for(let i=0;i<acidN;i++)A.push({el:"C",col:i,row:0});
  for(let i=0;i<acidN-1;i++)B.push({a:i,b:i+1,order:1});
  const cc=acidN-1;
  const Oc={el:"O",col:cc,row:-1};A.push(Oc);B.push({a:cc,b:idx(Oc),order:2});
  const O1={el:"O",col:acidN,row:0};A.push(O1);B.push({a:cc,b:idx(O1),order:1});
  const alc=[];
  for(let j=0;j<alcoholN;j++){const c={el:"C",col:acidN+1+j,row:0};A.push(c);alc.push(c);}
  B.push({a:idx(O1),b:idx(alc[0]),order:1});
  for(let j=0;j<alcoholN-1;j++)B.push({a:idx(alc[j]),b:idx(alc[j+1]),order:1});
  const addH=(ci,dirs)=>dirs.forEach(([dx,dy])=>{const h={el:"H",col:ci.col+dx,row:ci.row+dy};A.push(h);B.push({a:idx(ci),b:idx(h),order:1});});
  for(let i=0;i<cc;i++){const first=i===0; addH(A[i], first?[[-1,0],[0,-1],[0,1]]:[[0,-1],[0,1]]);}
  if(acidN===1){ addH(A[cc],[[-1,0]]); }
  for(let j=0;j<alcoholN;j++){const last=j===alcoholN-1; addH(alc[j], last?[[0,-1],[0,1],[1,0]]:[[0,-1],[0,1]]);}
  return {atoms:A,bonds:B};
}
function aldehyd(n){ // rak kedja n kol, aldehydgrupp (CHO) på kol n (sista kolet)
  const A=[],B=[],idx=x=>A.indexOf(x);
  for(let i=0;i<n;i++)A.push({el:"C",col:i,row:0});
  for(let i=0;i<n-1;i++)B.push({a:i,b:i+1,order:1});
  const cc=n-1;
  const Oc={el:"O",col:n-1,row:-1};A.push(Oc);B.push({a:cc,b:idx(Oc),order:2});
  const Ha={el:"H",col:n,row:0};A.push(Ha);B.push({a:cc,b:idx(Ha),order:1});
  for(let i=0;i<n;i++){
    if(i===cc){ if(n===1){const h={el:"H",col:-1,row:0};A.push(h);B.push({a:i,b:idx(h),order:1});} continue; }
    let dirs=(i===0)?[[-1,0],[0,-1],[0,1]]:[[0,-1],[0,1]];
    for(const [dx,dy] of dirs){const h={el:"H",col:i+dx,row:dy};A.push(h);B.push({a:i,b:idx(h),order:1});}
  }
  return {atoms:A,bonds:B, grupp:{atoms:[cc,n,n+1], bonds:[n-1,n]}}; // CHO
}
function keton(n,pos){ // rak kedja n kol, karbonyl (dubbelbundet syre) på kol 'pos' (1-indexerat, ej ändkol)
  const A=[],B=[],idx=x=>A.indexOf(x);
  for(let i=0;i<n;i++)A.push({el:"C",col:i,row:0});
  for(let i=0;i<n-1;i++)B.push({a:i,b:i+1,order:1});
  const kc=pos-1;
  const Oc={el:"O",col:kc,row:-1};A.push(Oc);B.push({a:kc,b:idx(Oc),order:2});
  for(let i=0;i<n;i++){
    if(i===kc) continue;
    const first=i===0, last=i===n-1;
    let dirs = first ? [[0,-1],[0,1],[-1,0]] : last ? [[0,-1],[0,1],[1,0]] : [[0,-1],[0,1]];
    for(const [dx,dy] of dirs){const h={el:"H",col:i+dx,row:dy};A.push(h);B.push({a:i,b:idx(h),order:1});}
  }
  return {atoms:A,bonds:B, grupp:{atoms:[kc,n], bonds:[n-1]}}; // CO
}
function glycin(){ // aminosyra – enda aminosyran som används (unik plats bär bara ett väte)
  const A=[],B=[],idx=x=>A.indexOf(x);
  const N={el:"N",col:0,row:0},C1={el:"C",col:1,row:0},C2={el:"C",col:2,row:0};
  A.push(N,C1,C2);
  B.push({a:idx(N),b:idx(C1),order:1},{a:idx(C1),b:idx(C2),order:1});
  const Oc={el:"O",col:2,row:-1};A.push(Oc);B.push({a:idx(C2),b:idx(Oc),order:2});
  const Oh={el:"O",col:3,row:0};A.push(Oh);B.push({a:idx(C2),b:idx(Oh),order:1});
  const Hh={el:"H",col:4,row:0};A.push(Hh);B.push({a:idx(Oh),b:idx(Hh),order:1});
  const Nl={el:"H",col:-1,row:0};A.push(Nl);B.push({a:idx(N),b:idx(Nl),order:1});
  const Nu={el:"H",col:0,row:-1};A.push(Nu);B.push({a:idx(N),b:idx(Nu),order:1});
  const Cu={el:"H",col:1,row:-1};A.push(Cu);B.push({a:idx(C1),b:idx(Cu),order:1});
  const Cd={el:"H",col:1,row:1};A.push(Cd);B.push({a:idx(C1),b:idx(Cd),order:1});
  return {atoms:A,bonds:B, grupp:{
    atoms:[idx(N),idx(Nl),idx(Nu), idx(C2),idx(Oc),idx(Oh),idx(Hh)],  // NH2 + COOH
    bonds:[5,6, 2,3,4]                                                // N-H, N-H, C=O, C-OH, O-H
  }};
}
