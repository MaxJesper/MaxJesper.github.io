const fs=require("fs"), path=require("path");
const INK="#14213d", STEP=35, G=11, FS=21, STROKE=1.25, PAD=26;

function render(atoms, bonds, xscale=1){
  const SX=STEP*xscale, SY=STEP;
  const cols=atoms.map(a=>a.col), rows=atoms.map(a=>a.row);
  const minC=Math.min(...cols),maxC=Math.max(...cols),minR=Math.min(...rows),maxR=Math.max(...rows);
  const OX=PAD-minC*SX, OY=PAD-minR*SY, X=a=>OX+a.col*SX, Y=a=>OY+a.row*SY;
  let lines=[];
  for(const b of bonds){
    const a1=atoms[b.a],a2=atoms[b.b];
    let x1=X(a1),y1=Y(a1),x2=X(a2),y2=Y(a2);
    const dx=x2-x1,dy=y2-y1,len=Math.hypot(dx,dy),ux=dx/len,uy=dy/len;
    x1+=ux*G;y1+=uy*G;x2-=ux*G;y2-=uy*G;
    const px=-uy,py=ux, offs=b.order===1?[0]:b.order===2?[-3.5,3.5]:[-6,0,6];
    for(const o of offs)
      lines.push(`<line x1="${(x1+px*o).toFixed(1)}" y1="${(y1+py*o).toFixed(1)}" x2="${(x2+px*o).toFixed(1)}" y2="${(y2+py*o).toFixed(1)}"/>`);
  }
  const txt=atoms.map(a=>`<text x="${X(a).toFixed(1)}" y="${Y(a).toFixed(1)}" text-anchor="middle" dominant-baseline="central" font-family="Arial, sans-serif" font-size="${FS}" fill="${INK}">${a.el}</text>`).join("");
  const W=(maxC-minC)*SX+2*PAD, H=(maxR-minR)*SY+2*PAD;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W.toFixed(1)} ${H.toFixed(1)}" width="${W.toFixed(1)}" height="${H.toFixed(1)}"><g stroke="${INK}" stroke-width="${STROKE}" stroke-linecap="round">${lines.join("")}</g>${txt}</svg>`;
}

function chain({n,bonds}){
  const atoms=[],bl=[];
  for(let i=0;i<n;i++) atoms.push({el:"C",col:i,row:0});
  for(let i=0;i<n-1;i++) bl.push({a:i,b:i+1,order:bonds[i]});
  for(let i=0;i<n;i++){
    const hasPrev=i>0,hasNext=i<n-1,prevO=hasPrev?bonds[i-1]:0,nextO=hasNext?bonds[i]:0;
    const hc=4-prevO-nextO,nN=(hasPrev?1:0)+(hasNext?1:0),free=!hasPrev?"left":"right";
    let offs=[];
    if(nN===1 && ((hasNext&&nextO===2)||(hasPrev&&prevO===2))){
      const ELEV=45, angs=hasNext?[180-ELEV,180+ELEV]:[ELEV,-ELEV];
      for(const th of angs){const r=th*Math.PI/180;offs.push({dx:Math.cos(r),dy:-Math.sin(r)});}
    } else {
      let dirs=hc===4?["up","down","left","right"]:hc===3?["up","down",free]:hc===2?["up","down"]:hc===1?[free]:[];
      for(const d of dirs) offs.push({dx:d==="left"?-1:d==="right"?1:0,dy:d==="up"?-1:d==="down"?1:0});
    }
    for(const o of offs){atoms.push({el:"H",col:i+o.dx,row:o.dy});bl.push({a:i,b:atoms.length-1,order:1});}
  }
  return {atoms,bonds:bl};
}
function alkohol(n){
  const A=[],B=[],idx=x=>A.indexOf(x);
  for(let i=0;i<n;i++)A.push({el:"C",col:i,row:0});
  for(let i=0;i<n-1;i++)B.push([i,i+1,1]);
  const last=n-1,O={el:"O",col:n,row:0};A.push(O);B.push([last,idx(O),1]);
  const Ho={el:"H",col:n+1,row:0};A.push(Ho);B.push([idx(O),idx(Ho),1]);
  for(let i=0;i<n;i++){
    let dirs = (n===1||i===0)?[[-1,0],[0,-1],[0,1]]:[[0,-1],[0,1]];
    for(const [dx,dy] of dirs){const h={el:"H",col:i+dx,row:dy};A.push(h);B.push([i,idx(h),1]);}
  }
  return {atoms:A,bonds:B};
}
function syra(n){
  const A=[],B=[],idx=x=>A.indexOf(x);
  for(let i=0;i<n;i++)A.push({el:"C",col:i,row:0});
  for(let i=0;i<n-1;i++)B.push([i,i+1,1]);
  const cc=n-1;
  const Oc={el:"O",col:n-1,row:-1};A.push(Oc);B.push([cc,idx(Oc),2]);
  const Oh={el:"O",col:n,row:0};A.push(Oh);B.push([cc,idx(Oh),1]);
  const Hh={el:"H",col:n+1,row:0};A.push(Hh);B.push([idx(Oh),idx(Hh),1]);
  for(let i=0;i<n;i++){
    if(i===cc){ if(n===1){const h={el:"H",col:-1,row:0};A.push(h);B.push([i,idx(h),1]);} continue; }
    let dirs=(i===0)?[[-1,0],[0,-1],[0,1]]:[[0,-1],[0,1]];
    for(const [dx,dy] of dirs){const h={el:"H",col:i+dx,row:dy};A.push(h);B.push([i,idx(h),1]);}
  }
  return {atoms:A,bonds:B};
}
function etylbutanoat(){
  const A=[],B=[],idx=x=>A.indexOf(x);
  for(let i=0;i<4;i++)A.push({el:"C",col:i,row:0});         // butanoyl 0..3
  B.push([0,1,1],[1,2,1],[2,3,1]);
  const Oc={el:"O",col:3,row:-1};A.push(Oc);B.push([3,idx(Oc),2]);
  const O1={el:"O",col:4,row:0};A.push(O1);B.push([3,idx(O1),1]);
  const C4={el:"C",col:5,row:0};A.push(C4);B.push([idx(O1),idx(C4),1]);
  const C5={el:"C",col:6,row:0};A.push(C5);B.push([idx(C4),idx(C5),1]);
  const addH=(ci,dirs)=>dirs.forEach(([dx,dy,c=ci.col,r=ci.row])=>{const h={el:"H",col:c+dx,row:r+dy};A.push(h);B.push([idx(ci),idx(h),1]);});
  addH(A[0],[[-1,0],[0,-1],[0,1]]); addH(A[1],[[0,-1],[0,1]]); addH(A[2],[[0,-1],[0,1]]);
  addH(C4,[[0,-1],[0,1]]); addH(C5,[[0,-1],[0,1],[1,0]]);
  return {atoms:A,bonds:B};
}
function glycin(){
  const A=[],B=[],idx=x=>A.indexOf(x);
  const N={el:"N",col:0,row:0},C1={el:"C",col:1,row:0},C2={el:"C",col:2,row:0};
  A.push(N,C1,C2);B.push([0,1,1],[1,2,1]);
  const Oc={el:"O",col:2,row:-1};A.push(Oc);B.push([idx(C2),idx(Oc),2]);
  const Oh={el:"O",col:3,row:0};A.push(Oh);B.push([idx(C2),idx(Oh),1]);
  const Hh={el:"H",col:4,row:0};A.push(Hh);B.push([idx(Oh),idx(Hh),1]);
  const Nl={el:"H",col:-1,row:0};A.push(Nl);B.push([idx(N),idx(Nl),1]);
  const Nu={el:"H",col:0,row:-1};A.push(Nu);B.push([idx(N),idx(Nu),1]);
  const Cu={el:"H",col:1,row:-1};A.push(Cu);B.push([idx(C1),idx(Cu),1]);
  const Cd={el:"H",col:1,row:1};A.push(Cd);B.push([idx(C1),idx(Cd),1]);
  return {atoms:A,bonds:B};
}
function vatten(){ return {atoms:[{el:"O",col:0,row:0},{el:"H",col:-1,row:0},{el:"H",col:1,row:0}], bonds:[[0,1,1],[0,2,1]]}; }
function metylbutan(){ // 2-metylbutan, gren nedåt (visar -yl)
  const A=[],B=[],idx=x=>A.indexOf(x);
  for(let i=0;i<4;i++)A.push({el:"C",col:i,row:0}); B.push([0,1,1],[1,2,1],[2,3,1]);
  const Cb={el:"C",col:1,row:1};A.push(Cb);B.push([1,idx(Cb),1]);
  const addH=(ci,dirs)=>dirs.forEach(([dx,dy])=>{const h={el:"H",col:ci.col+dx,row:ci.row+dy};A.push(h);B.push([idx(ci),idx(h),1]);});
  addH(A[0],[[-1,0],[0,-1],[0,1]]); addH(A[1],[[0,-1]]); addH(A[2],[[0,-1],[0,1]]); addH(A[3],[[0,-1],[0,1],[1,0]]);
  addH(Cb,[[0,1],[-1,0],[1,0]]);
  return {atoms:A,bonds:B};
}

const items=[
  {fil:"metan",namn:"Metan",summa:"CH<sub>4</sub>",g:chain({n:1,bonds:[]})},
  {fil:"etan",namn:"Etan",summa:"C<sub>2</sub>H<sub>6</sub>",g:chain({n:2,bonds:[1]})},
  {fil:"propan",namn:"Propan",summa:"C<sub>3</sub>H<sub>8</sub>",g:chain({n:3,bonds:[1,1]})},
  {fil:"butan",namn:"Butan",summa:"C<sub>4</sub>H<sub>10</sub>",g:chain({n:4,bonds:[1,1,1]})},
  {fil:"eten",namn:"Eten",summa:"C<sub>2</sub>H<sub>4</sub>",g:chain({n:2,bonds:[2]})},
  {fil:"etyn",namn:"Etyn",summa:"C<sub>2</sub>H<sub>2</sub>",g:chain({n:2,bonds:[3]})},
  {fil:"propyn",namn:"Propyn",summa:"C<sub>3</sub>H<sub>4</sub>",g:chain({n:3,bonds:[1,3]})},
  {fil:"metanol",namn:"Metanol",summa:"CH<sub>3</sub>OH",g:alkohol(1)},
  {fil:"etanol",namn:"Etanol",summa:"C<sub>2</sub>H<sub>5</sub>OH",g:alkohol(2)},
  {fil:"glykol",namn:"Glykol",summa:"C<sub>2</sub>H<sub>6</sub>O<sub>2</sub>",g:glykol(),xscale:1.25},
  {fil:"glycerol",namn:"Glycerol",summa:"C<sub>3</sub>H<sub>8</sub>O<sub>3</sub>",g:glycerol(),xscale:1.25},
  {fil:"metansyra",namn:"Metansyra (myrsyra)",summa:"HCOOH",g:syra(1)},
  {fil:"etansyra",namn:"Etansyra (ättiksyra)",summa:"CH<sub>3</sub>COOH",g:syra(2)},
  {fil:"butansyra",namn:"Butansyra (smörsyra)",summa:"C<sub>3</sub>H<sub>7</sub>COOH",g:syra(4)},
  {fil:"etylbutanoat",namn:"Etylbutanoat",summa:"C<sub>3</sub>H<sub>7</sub>COOC<sub>2</sub>H<sub>5</sub>",g:etylbutanoat()},
  {fil:"vatten",namn:"Vatten",summa:"H<sub>2</sub>O",g:vatten()},
  {fil:"2-metylbutan",namn:"2-metylbutan",summa:"C<sub>5</sub>H<sub>12</sub>",g:metylbutan()},
  {fil:"glycin",namn:"Glycin",summa:"NH<sub>2</sub>CH<sub>2</sub>COOH",g:glycin()},
];
function glykol(){const A=[],C1={el:"C",col:0,row:0},C2={el:"C",col:1,row:0},Hu1={el:"H",col:0,row:-1},Hu2={el:"H",col:1,row:-1},O1={el:"OH",col:0,row:1},O2={el:"OH",col:1,row:1},Hl={el:"H",col:-1,row:0},Hr={el:"H",col:2,row:0};A.push(C1,C2,Hu1,Hu2,O1,O2,Hl,Hr);const i=x=>A.indexOf(x);return{atoms:A,bonds:[[i(C1),i(C2),1],[i(C1),i(Hu1),1],[i(C2),i(Hu2),1],[i(C1),i(O1),1],[i(C2),i(O2),1],[i(C1),i(Hl),1],[i(C2),i(Hr),1]]};}
function glycerol(){const A=[],C1={el:"C",col:0,row:0},C2={el:"C",col:1,row:0},C3={el:"C",col:2,row:0},Hu1={el:"H",col:0,row:-1},Hu2={el:"H",col:1,row:-1},Hu3={el:"H",col:2,row:-1},O1={el:"OH",col:0,row:1},O2={el:"OH",col:1,row:1},O3={el:"OH",col:2,row:1},Hl={el:"H",col:-1,row:0},Hr={el:"H",col:3,row:0};A.push(C1,C2,C3,Hu1,Hu2,Hu3,O1,O2,O3,Hl,Hr);const i=x=>A.indexOf(x);return{atoms:A,bonds:[[i(C1),i(C2),1],[i(C2),i(C3),1],[i(C1),i(Hu1),1],[i(C2),i(Hu2),1],[i(C3),i(Hu3),1],[i(C1),i(O1),1],[i(C2),i(O2),1],[i(C3),i(O3),1],[i(C1),i(Hl),1],[i(C3),i(Hr),1]]};}

// normalisera bindningsformat till {a,b,order}
function norm(g){ return {atoms:g.atoms, bonds:g.bonds.map(b=>Array.isArray(b)?{a:b[0],b:b[1],order:b[2]}:b)}; }

const OUT="/sessions/rcw-011wjks3rqhysgzpypskpjsn/mnt/Documents/github/images/kemi/kol-och-kolforeningar/strukturformler";
fs.mkdirSync(OUT,{recursive:true});
let cards="";
for(const it of items){
  const g=norm(it.g);
  const svg=render(g.atoms,g.bonds,it.xscale||1);
  fs.writeFileSync(path.join(OUT,it.fil+".svg"),svg);
  cards+=`<figure class="card"><div class="draw">${svg}</div><figcaption><h3>${it.namn}</h3><p class="f">${it.summa||""}</p><code>${it.fil}.svg</code></figcaption></figure>`;
}
const html=`<!DOCTYPE html><html lang="sv"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Kol – alla strukturformler</title>
<style>body{font-family:system-ui,sans-serif;margin:0;background:#f5f7fb;color:#14213d}.wrap{max-width:1000px;margin:0 auto;padding:2rem 1.25rem 3rem}
h1{font-size:1.5rem;margin:0 0 1rem}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:1rem}
.card{background:#fff;border:1px solid #e2e6ef;border-radius:12px;padding:1rem;box-shadow:0 1px 2px rgba(20,33,61,.06),0 6px 18px rgba(20,33,61,.05)}
.draw{display:flex;justify-content:center;align-items:center;min-height:150px}.draw svg{max-width:100%;height:auto}
figcaption{text-align:center}figcaption h3{margin:.5rem 0 .1rem;font-size:1.05rem}.f{margin:0;font-size:.95rem}.f sub{font-size:.6em}
code{font-size:.72rem;color:#8a93a6}</style></head>
<body><div class="wrap"><h1>Kol och kolföreningar – alla strukturformler</h1><div class="grid">${cards}</div></div></body></html>`;
fs.writeFileSync(path.join(OUT,"preview-alla.html"),html);
console.log("Genererade "+items.length+" SVG-filer + preview-alla.html");
console.log(items.map(i=>i.fil).join(", "));
