const fs=require("fs"), path=require("path");
const SCALE=70, RC=27, RH=19, ROD=11, DCAM=7, DEG=Math.PI/180;

function rot(p,ay,ax){
  let {x,y,z}=p;
  let x1=x*Math.cos(ay)+z*Math.sin(ay), z1=-x*Math.sin(ay)+z*Math.cos(ay), y1=y;
  let y2=y1*Math.cos(ax)-z1*Math.sin(ax), z2=y1*Math.sin(ax)+z1*Math.cos(ax), x2=x1;
  return {x:x2,y:y2,z:z2};
}

// --- geometrier ---
function metan(){
  const CH=1.09, A=[{el:"C",x:0,y:0,z:0}];
  const t=[[0,1,0],[0.9428,-0.3333,0],[-0.4714,-0.3333,0.8165],[-0.4714,-0.3333,-0.8165]];
  const B=[];
  t.forEach((d,i)=>{A.push({el:"H",x:d[0]*CH,y:d[1]*CH,z:d[2]*CH});B.push([0,i+1,1]);});
  return {A,B,view:[-22*DEG,16*DEG]};
}
function tetraH(cpos,axisSign,phases,CH){
  const ax=-0.3338*axisSign, r=0.9426;
  return phases.map(t=>{const th=t*DEG;return {x:cpos.x+(-0+ax)*CH,y:cpos.y+r*Math.cos(th)*CH,z:cpos.z+r*Math.sin(th)*CH};});
}
function etan(){
  const CC=1.54,CH=1.09,A=[],B=[];
  const C1={el:"C",x:-CC/2,y:0,z:0},C2={el:"C",x:CC/2,y:0,z:0};A.push(C1,C2);B.push([0,1,1]);
  tetraH(C1,+1,[90,210,330],CH).forEach(h=>{A.push({el:"H",...h});B.push([0,A.length-1,1]);});
  tetraH(C2,-1,[30,150,270],CH).forEach(h=>{A.push({el:"H",...h});B.push([1,A.length-1,1]);});
  return {A,B,view:[-26*DEG,14*DEG]};
}
function eten(){
  const CC=1.33,CH=1.08,A=[],B=[];
  const C1={el:"C",x:-CC/2,y:0,z:0},C2={el:"C",x:CC/2,y:0,z:0};A.push(C1,C2);B.push([0,1,2]);
  [120,240].forEach(d=>{const th=d*DEG;A.push({el:"H",x:C1.x+Math.cos(th)*CH,y:Math.sin(th)*CH,z:0});B.push([0,A.length-1,1]);});
  [60,300].forEach(d=>{const th=d*DEG;A.push({el:"H",x:C2.x+Math.cos(th)*CH,y:Math.sin(th)*CH,z:0});B.push([1,A.length-1,1]);});
  return {A,B,view:[-18*DEG,20*DEG]};
}
function etyn(){
  const CC=1.20,CH=1.06,A=[],B=[];
  const C1={el:"C",x:-CC/2,y:0,z:0},C2={el:"C",x:CC/2,y:0,z:0};
  A.push(C1,C2,{el:"H",x:C1.x-CH,y:0,z:0},{el:"H",x:C2.x+CH,y:0,z:0});
  B.push([0,1,3],[0,2,1],[1,3,1]);
  return {A,B,view:[-16*DEG,12*DEG]};
}

function render({A,B,view}){
  const [ay,ax]=view;
  const P=A.map(a=>{const r=rot(a,ay,ax); const persp=DCAM/(DCAM-r.z);
    return {el:a.el, sx:r.x*SCALE*persp, sy:-r.y*SCALE*persp, z:r.z, persp};});
  let xs=[],ys=[];
  P.forEach(p=>{const R=(p.el==="C"?RC:RH)*p.persp; xs.push(p.sx-R,p.sx+R); ys.push(p.sy-R,p.sy+R);});
  const minX=Math.min(...xs)-6,maxX=Math.max(...xs)+6,minY=Math.min(...ys)-6,maxY=Math.max(...ys)+6;
  const W=maxX-minX,H=maxY-minY,OX=-minX,OY=-minY;
  // pinnar (mörka, avsmalnande på djupet)
  let rods="";
  for(const [i,j,order] of B){
    const p1=P[i],p2=P[j];
    const x1=p1.sx+OX,y1=p1.sy+OY,x2=p2.sx+OX,y2=p2.sy+OY;
    const w=ROD*(p1.persp+p2.persp)/2;
    const dx=x2-x1,dy=y2-y1,L=Math.hypot(dx,dy),ux=-dy/L,uy=dx/L;
    const offs=order===1?[0]:order===2?[-w*0.42,w*0.42]:[-w*0.62,0,w*0.62];
    for(const o of offs){
      const ax1=x1+ux*o,ay1=y1+uy*o,ax2=x2+ux*o,ay2=y2+uy*o;
      const ww=order===1?w:w*0.72;
      rods+=`<line x1="${ax1.toFixed(1)}" y1="${ay1.toFixed(1)}" x2="${ax2.toFixed(1)}" y2="${ay2.toFixed(1)}" stroke="#3f3a37" stroke-width="${ww.toFixed(1)}" stroke-linecap="round"/>`;
      rods+=`<line x1="${ax1.toFixed(1)}" y1="${ay1.toFixed(1)}" x2="${ax2.toFixed(1)}" y2="${ay2.toFixed(1)}" stroke="#6d665f" stroke-width="${(ww*0.3).toFixed(1)}" stroke-linecap="round"/>`;
    }
  }
  const order=P.map((p,i)=>i).sort((a,b)=>P[a].z-P[b].z);
  let balls="";
  for(const i of order){
    const p=P[i],R=(p.el==="C"?RC:RH)*p.persp,cx=p.sx+OX,cy=p.sy+OY;
    const grad=p.el==="C"?"gC":"gH", edge=p.el==="C"?"#050505":"#8f8f97";
    balls+=`<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${R.toFixed(1)}" fill="url(#${grad})" stroke="${edge}" stroke-width="0.6"/>`;
  }
  const defs=`<defs>
    <radialGradient id="gC" cx="34%" cy="30%" r="72%"><stop offset="0%" stop-color="#5f5f5f"/><stop offset="42%" stop-color="#222"/><stop offset="100%" stop-color="#070707"/></radialGradient>
    <radialGradient id="gH" cx="34%" cy="30%" r="72%"><stop offset="0%" stop-color="#ffffff"/><stop offset="48%" stop-color="#d9d9dd"/><stop offset="100%" stop-color="#9d9da6"/></radialGradient>
  </defs>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W.toFixed(1)} ${H.toFixed(1)}" width="${W.toFixed(1)}" height="${H.toFixed(1)}">${defs}${rods}${balls}</svg>`;
}

const items=[{namn:"Metan",g:metan()},{namn:"Etan",g:etan()},{namn:"Eten",g:eten()},{namn:"Etyn",g:etyn()}];
const cards=items.map(it=>`<figure class="card"><div class="draw">${render(it.g)}</div><figcaption><h3>${it.namn}</h3></figcaption></figure>`).join("");
const html=`<!DOCTYPE html><html lang="sv"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Kulmodeller v2</title>
<style>body{font-family:system-ui,sans-serif;margin:0;background:#f5f7fb;color:#14213d}.wrap{max-width:900px;margin:0 auto;padding:2rem 1.25rem 3rem}
h1{font-size:1.5rem;margin:0 0 .25rem}.sub{color:#4a5468;margin:0 0 1.5rem}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:1rem}
.card{background:#fff;border:1px solid #e2e6ef;border-radius:12px;padding:1rem;box-shadow:0 1px 2px rgba(20,33,61,.06),0 6px 18px rgba(20,33,61,.05)}
.draw{display:flex;justify-content:center;align-items:center;min-height:210px}.draw svg{max-width:100%;height:auto}
figcaption{text-align:center}figcaption h3{margin:.6rem 0 0;font-size:1.15rem}</style></head>
<body><div class="wrap"><h1>Kulmodeller – v2</h1><p class="sub">Pinnar mellan kulorna, tetraedrisk geometri (metan 109,5°) och 3D med djup: kulor bakåt ritas mindre, pinnar smalnar av.</p>
<div class="grid">${cards}</div></div></body></html>`;
const OUT="/sessions/rcw-011wjks3rqhysgzpypskpjsn/mnt/Documents/github/images/kemi/kol-och-kolforeningar/kulmodeller";
fs.mkdirSync(OUT,{recursive:true});
fs.writeFileSync(path.join(OUT,"preview-kulmodeller.html"),html);
console.log("kulmodeller v2 skriven (metan, etan, eten, etyn)");
