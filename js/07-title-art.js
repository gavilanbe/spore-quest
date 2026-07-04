'use strict';
/* ============================================================
   SPORE QUEST · capa 07-title-art
   arte de portada y cinematica: gran arbol, heroe, logo, particulas
   ============================================================ */
let titleT=0, tSwapT=4.5, tparts=[], bootT=0, dingDone=false;
let hitStop=0, hurtVigT=0;
let cineScene=0, cineT=0, flashT=0, thunderT=1, cineLastSeason=-1;
function enterCine(){ state='cine'; cineScene=0; cineT=0; flashT=0; thunderT=0.8; cineLastSeason=-1; season=0; initTParts(); }
function updateFallParts(dt){
  for(let i=tparts.length-1;i>=0;i--){
    const p=tparts[i];
    if(p.star!==undefined){p.star-=dt;if(p.star<=0)tparts.splice(i,1);continue;}
    const fall=season===0?15:season===1?-6:season===2?20:12;
    p.y+=fall*dt;
    p.x+=Math.sin(time*2+p.ph)*(season===2?14:6)*dt;
    if(p.y>H+4||p.y<-6){ p.y=(season===1)?H-Math.random()*40:-4; p.x=Math.random()*W; }
  }
}
function initTParts(){
  tparts=[];
  for(let i=0;i<16;i++)tparts.push({x:Math.random()*W,y:Math.random()*H,ph:Math.random()*6});
}
function enterTitle(){
  state='title'; titleT=0; tSwapT=4.5; season=0; initTParts();
  if(AC)S.fanfare();
}
function updateTitle(dt){
  titleT+=dt; tSwapT-=dt;
  if(titleT>14){ enterCine(); return; } // modo attract: la historia se repite sola
  if(tSwapT<=0){ // la estacion del paisaje cambia, como en Oracle
    tSwapT=4.5; season=(season+1)%4;
    for(let i=0;i<9;i++)tparts.push({x:14+Math.random()*54,y:56+Math.random()*30,ph:0,star:0.45});
    if(AC)S.seasonJ();
  }
  updateFallParts(dt);
}
function drawTextBevel(s,x,y,scale,base,light,dark,base2){
  for(const o of [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[1,1],[-1,1],[1,-1]])
    drawText(s,x+o[0],y+o[1],PAL.black,scale);
  for(let i=0;i<s.length;i++){
    const g=FONT[s[i]]||FONT[' '];
    for(let r=0;r<5;r++)for(let c=0;c<3;c++){
      if(g[r][c]!=='1')continue;
      const px=x+i*4*scale+c*scale, py=y+r*scale;
      ctx.fillStyle=(r>=3&&base2)?base2:base; ctx.fillRect(px,py,scale,scale);
      ctx.fillStyle=light;
      if(r===0||g[r-1][c]!=='1')ctx.fillRect(px,py,scale,1);
      if(c===0||g[r][c-1]!=='1')ctx.fillRect(px,py,1,scale);
      ctx.fillStyle=dark;
      if(r===4||g[r+1][c]!=='1')ctx.fillRect(px,py+scale-1,scale,1);
      if(c===2||g[r][c+1]!=='1')ctx.fillRect(px+scale-1,py,1,scale);
    }
  }
}
function drawCloud(x,y){
  ctx.fillStyle=PAL.white;
  ctx.fillRect(x,y,22,5); ctx.fillRect(x+4,y-3,12,3); ctx.fillRect(x+2,y+5,17,2);
  ctx.fillStyle='#c8dce8';
  ctx.fillRect(x+2,y+6,15,1);
}
function drawGreatTree(cx,gy){
  const P=CP();
  // tronco del Gran Micelio
  ctx.fillStyle='#503418'; ctx.fillRect(cx-6,gy-18,12,18);
  ctx.fillStyle=P.trunk; ctx.fillRect(cx-5,gy-18,7,18);
  ctx.fillStyle='#503418'; ctx.fillRect(cx-1,gy-12,2,7);
  ctx.fillStyle=P.trunk; ctx.fillRect(cx-10,gy-2,5,2); ctx.fillRect(cx+5,gy-2,5,2);
  // copa
  const rows=[10,18,24,28,30,30,28,22,14];
  const ty=gy-18-rows.length*2;
  for(let i=0;i<rows.length;i++){
    const w=rows[i];
    ctx.fillStyle=P.treeDk;
    ctx.fillRect(cx-(w>>1)-1,ty+i*2,w+2,2);
  }
  for(let i=1;i<rows.length-1;i++){
    const w=rows[i]-3;
    ctx.fillStyle=P.tree;
    ctx.fillRect(cx-(w>>1),ty+i*2,w,2);
  }
  ctx.fillStyle=P.treeLt;
  ctx.fillRect(cx-8,ty+2,9,2); ctx.fillRect(cx-11,ty+5,4,3); ctx.fillRect(cx-5,ty+1,4,1);
  ctx.fillStyle=P.treeDk;
  ctx.fillRect(cx+3,ty+8,5,3); ctx.fillRect(cx-6,ty+12,4,2);
  // acentos por estacion
  if(season===0){ // flores
    ctx.fillStyle='#f0a0c8';
    ctx.fillRect(cx-9,ty+6,2,2); ctx.fillRect(cx+6,ty+4,2,2); ctx.fillRect(cx-2,ty+3,2,2); ctx.fillRect(cx+9,ty+10,2,2);
  } else if(season===1){ // frutos
    ctx.fillStyle=PAL.gold;
    ctx.fillRect(cx-7,ty+9,2,2); ctx.fillRect(cx+5,ty+7,2,2); ctx.fillRect(cx,ty+12,2,2);
  } else if(season===3){ // nieve
    ctx.fillStyle=PAL.white;
    ctx.fillRect(cx-(rows[0]>>1)-1,ty,rows[0]+2,2);
    ctx.fillRect(cx-(rows[1]>>1)-1,ty+2,rows[1]+2,1);
    ctx.fillRect(cx-11,ty+5,5,1); ctx.fillRect(cx+7,ty+6,5,1);
  }
  // setitas rojas al pie del arbol
  ctx.fillStyle=PAL.capR;
  ctx.fillRect(cx-11,gy-3,3,2); ctx.fillRect(cx+9,gy-3,3,2);
  ctx.fillStyle=PAL.stem;
  ctx.fillRect(cx-10,gy-1,1,1); ctx.fillRect(cx+10,gy-1,1,1);
  ctx.fillStyle=PAL.white; ctx.fillRect(cx-10,gy-3,1,1); ctx.fillRect(cx+10,gy-3,1,1);
}
function drawTPart(p){
  if(p.star!==undefined){ // destello del cambio de estacion
    if((((time*16)|0)&1)===0)return;
    ctx.fillStyle=PAL.white;
    ctx.fillRect(p.x-2,p.y,5,1); ctx.fillRect(p.x,p.y-2,1,5);
    return;
  }
  const x=Math.round(p.x),y=Math.round(p.y);
  if(season===0){ ctx.fillStyle='#f0a0c8'; ctx.fillRect(x,y,2,1); ctx.fillRect(x+((p.ph*7|0)&1),y+1,1,1); }
  else if(season===1){ if((((time*6+p.ph*3)|0)&1)===0)return; ctx.fillStyle='#f8f070'; ctx.fillRect(x,y,1,1); }
  else if(season===2){ ctx.fillStyle=((p.ph*5|0)&1)?'#d87828':'#b05818'; ctx.fillRect(x,y,2,2); ctx.fillStyle='#703008'; ctx.fillRect(x+1,y+1,1,1); }
  else { ctx.fillStyle=PAL.white; ctx.fillRect(x,y,((p.ph*9|0)&1)?1:2,1); }
}

/* ---------- Arte de portada: Bolet heroe (34x40 aprox) ---------- */
function heroShape(x,y,C){
  // pies
  ctx.fillStyle=C(PAL.stemDk);
  ctx.fillRect(x-9,y-3,6,3); ctx.fillRect(x+3,y-3,6,3);
  // cuerpo
  ctx.fillStyle=C(PAL.stem); ctx.fillRect(x-8,y-15,16,12);
  ctx.fillStyle=C(PAL.stemDk);
  ctx.fillRect(x-8,y-5,16,2); ctx.fillRect(x-8,y-15,2,12); ctx.fillRect(x+6,y-15,2,12);
  // ojos grandes con brillo
  ctx.fillStyle=C(PAL.black);
  ctx.fillRect(x-5,y-13,3,5); ctx.fillRect(x+2,y-13,3,5);
  ctx.fillStyle=C(PAL.white);
  ctx.fillRect(x-5,y-13,1,1); ctx.fillRect(x+2,y-13,1,1);
  // mofletes y sonrisa
  ctx.fillStyle=C('#f0a878');
  ctx.fillRect(x-8,y-8,2,2); ctx.fillRect(x+6,y-8,2,2);
  ctx.fillStyle=C(PAL.black); ctx.fillRect(x-1,y-6,2,1);
  // bufanda de heroe (verde espora) con cola al viento
  ctx.fillStyle=C(PAL.sporeDk);
  ctx.fillRect(x-8,y-15,16,2);
  const fl=(((time*4)|0)&1)?1:0;
  ctx.fillRect(x-13,y-14+fl,5,2); ctx.fillRect(x-15,y-12+fl,3,2);
  ctx.fillStyle=C(PAL.spore);
  ctx.fillRect(x-8,y-15,4,1); ctx.fillRect(x-12,y-14+fl,2,1);
  // sombrero: cupula grande con 3 bandas de sombreado
  const dome=[[5,y-31],[8,y-29],[11,y-27],[13,y-25],[15,y-23],[16,y-21],[17,y-19],[17,y-17]];
  ctx.fillStyle=C(PAL.capR);
  for(const [hw,yy] of dome) ctx.fillRect(x-hw,yy,hw*2,2);
  ctx.fillStyle=C(PAL.capDk); // borde inferior del ala
  ctx.fillRect(x-17,y-16,34,2);
  ctx.fillStyle=C(PAL.capLt); // brillo superior-izquierdo
  ctx.fillRect(x-8,y-30,8,2); ctx.fillRect(x-11,y-28,5,2); ctx.fillRect(x-13,y-26,3,2);
  // lunares
  ctx.fillStyle=C(PAL.white);
  ctx.fillRect(x+2,y-29,4,3); ctx.fillRect(x-10,y-25,4,3);
  ctx.fillRect(x+9,y-22,3,3); ctx.fillRect(x-3,y-20,2,2); ctx.fillRect(x+13,y-18,2,2);
  // laminas
  ctx.fillStyle=C(PAL.capDk);
  ctx.fillRect(x-13,y-14,3,1); ctx.fillRect(x-5,y-14,3,1); ctx.fillRect(x+4,y-14,3,1); ctx.fillRect(x+11,y-14,3,1);
}
function drawBoletHero(x,y){
  drawShadow(x,y-1,24);
  const sil=()=>PAL.black;
  for(const [dx,dy] of [[-1,0],[1,0],[0,-1],[0,1]]){
    ctx.save(); ctx.translate(dx,dy); heroShape(x,y,sil); ctx.restore();
  }
  heroShape(x,y,c=>c);
  // espora companera flotando
  const bx=x+22, by=y-32+Math.round(Math.sin(time*2.4)*3);
  ctx.fillStyle=PAL.sporeDk; ctx.fillRect(bx-2,by-2,5,5);
  ctx.fillStyle=PAL.spore; ctx.fillRect(bx-1,by-2,3,5); ctx.fillRect(bx-2,by-1,5,3);
  ctx.fillStyle=PAL.white; ctx.fillRect(bx-1,by-1,1,1);
  if(((time*5)|0)&1){ctx.fillStyle=PAL.spore;ctx.fillRect(bx-4,by,1,1);ctx.fillRect(bx+3,by,1,1);}
}
/* emblema de seta detras del logo */
function drawLogoEmblem(cx,ty){
  const rows=[[22,0],[38,2],[50,4],[58,6],[62,8],[64,10],[64,12],[62,14],[58,16]];
  ctx.fillStyle=PAL.capDk;
  for(const [hw,dy] of rows) ctx.fillRect(cx-hw-1,ty+dy,hw*2+2,2);
  ctx.fillStyle='#a82030';
  for(let i=1;i<rows.length-1;i++){
    const hw=rows[i][0]-3;
    ctx.fillRect(cx-hw,ty+rows[i][1],hw*2,2);
  }
  ctx.fillStyle='#c84850';
  ctx.fillRect(cx-30,ty+3,22,3); ctx.fillRect(cx-40,ty+6,8,3);
  ctx.fillStyle='#e8e0d0';
  ctx.fillRect(cx+14,ty+4,7,5); ctx.fillRect(cx-22,ty+8,6,5); ctx.fillRect(cx+34,ty+9,5,4);
  // laminas bajo el ala del emblema
  ctx.fillStyle='#701820';
  for(let i=-6;i<=6;i+=2) ctx.fillRect(cx+i*8,ty+16,3,2);
}
function drawVineCorner(x,y,fx){ // fx=1 izquierda, -1 derecha
  const P=CP();
  ctx.fillStyle=P.treeDk;
  ctx.fillRect(x,y,fx*14>0?14:-0,3);
  ctx.fillRect(x+(fx>0?0:-14),y,14,2);
  ctx.fillRect(x+(fx>0?2:-4),y+2,2,6);
  ctx.fillStyle=P.tree;
  ctx.fillRect(x+(fx>0?5:-8),y+3,4,3); ctx.fillRect(x+(fx>0?1:-3),y+7,3,3);
  ctx.fillStyle=P.treeLt;
  ctx.fillRect(x+(fx>0?6:-7),y+4,2,1);
}
function caption(txt,showA){
  const lines=wrap(txt,34);
  const bh=10+lines.length*7, by=H-bh-4;
  ctx.fillStyle=PAL.black; ctx.fillRect(4,by,W-8,bh);
  ctx.fillStyle=PAL.uiGold;
  ctx.fillRect(4,by,W-8,1); ctx.fillRect(4,by+bh-1,W-8,1);
  for(let i=0;i<lines.length;i++)
    drawText(lines[i],(W-textW(lines[i],1))/2,by+5+i*7,PAL.white,1);
  if(showA&&(((time*2)|0)&1)) drawText('A',W-12,by+bh-8,PAL.uiGold,1);
}

/* ---------- Estado ---------- */
