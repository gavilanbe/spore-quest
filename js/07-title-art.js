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

/* ---------- Arte de portada: Bolet heroe GRANDE (64x84, estilo Oracle) ----------
   Como en los titulos de los Oracle: el personaje en arte grande y detallado.
   Rasterizado procedural cocinado a buffer una sola vez: elipses por scanline,
   rampas de 3 tonos con trama de dithering, lunares con sombra que siguen la
   curvatura, luz de borde, laminillas y contorno automatico. Dos frames
   (bufanda al viento) + parpadeo, destello y nieve invernal en runtime. */
const HERO_W=64, HERO_H=84;
const CAP_HOT='#ffd2c2', STEM_HI='#fff6dc', SPOT_SH='#d8c8b8', SCARF_DK='#4c7c20';
function hEll(c,cx,cy,rx,ry,col){ // elipse rellena por scanline, bordes duros
  rx=Math.max(rx,.5); ry=Math.max(ry,.5); c.fillStyle=col;
  const y0=Math.round(cy-ry), y1=Math.round(cy+ry);
  for(let y=y0;y<=y1;y++){
    const t=(y-cy)/ry, q=1-t*t; if(q<=0)continue;
    const hw=rx*Math.sqrt(q); if(hw<.35)continue;
    const xa=Math.round(cx-hw);
    c.fillRect(xa,y,Math.max(1,Math.round(cx+hw)-xa),1);
  }
}
function hRing(c,cx,cy,rxA,ryA,rxB,ryB,col){ // anillo con trama ajedrez (dither)
  c.fillStyle=col;
  const y0=Math.round(cy-ryA), y1=Math.round(cy+ryA);
  const x0=Math.round(cx-rxA), x1=Math.round(cx+rxA);
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
    if(((x+y)&1)===0)continue;
    const a=((x-cx)/rxA)**2+((y-cy)/ryA)**2;
    const b=((x-cx)/rxB)**2+((y-cy)/ryB)**2;
    if(a<1&&b>1)c.fillRect(x,y,1,1);
  }
}
function hOut(c,w,h,col){ // contorno automatico alrededor de lo pintado
  const d=c.getImageData(0,0,w,h).data, sol=new Uint8Array(w*h);
  for(let i=0;i<w*h;i++)sol[i]=d[i*4+3]>60?1:0;
  c.fillStyle=col;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    const i=y*w+x;
    if(sol[i])continue;
    if((x>0&&sol[i-1])||(x<w-1&&sol[i+1])||(y>0&&sol[i-w])||(y<h-1&&sol[i+w]))
      c.fillRect(x,y,1,1);
  }
}
function heroDomeHW(y){ // semiancho de la cupula del sombrero en la fila y (4..46)
  const t=(38-y)/34, q=1-t*t;
  return q<=0?0:27*Math.sqrt(q);
}
function bakeHero(wave){
  const b=document.createElement('canvas'); b.width=HERO_W; b.height=HERO_H;
  const c=b.getContext('2d',{willReadFrequently:true}); c.imageSmoothingEnabled=false;

  /* — pies — */
  hEll(c,24,79,6,3.5,PAL.stemDk); hEll(c,40,79,6,3.5,PAL.stemDk);
  hEll(c,23,78,4.5,2,PAL.stem);   hEll(c,39,78,4.5,2,PAL.stem);

  /* — tallo (cuerpo): barriga con media luna de sombra a la derecha — */
  hEll(c,32,66,13.5,13,PAL.stemDk);
  hEll(c,30.6,65.2,12.6,12.4,PAL.stem);
  hEll(c,32,58,11,6,PAL.stem); // hombros
  hEll(c,32,77,10.5,3.5,PAL.stemDk); // asiento
  hRing(c,32,74,12,6.5,10.5,4.5,PAL.stemDk);
  hRing(c,26,58,7.5,4.5,4,2.2,STEM_HI); // brillo suave en trama
  /* brazo izquierdo pegado y brazo derecho alzado hacia la espora */
  hEll(c,19,64,3,5,PAL.stem);
  hEll(c,46,57,3.5,4,PAL.stem);
  hEll(c,49.5,51.5,3,3.5,PAL.stem);
  hEll(c,52.5,47.5,2.8,2.8,PAL.stem);
  hEll(c,53,49,2,1.2,PAL.stemDk); // palma

  /* — ojos grandes con doble brillo — */
  c.fillStyle=PAL.black;
  c.fillRect(23,58,5,8); c.fillRect(24,57,3,1); c.fillRect(24,66,3,1);
  c.fillRect(37,58,5,8); c.fillRect(38,57,3,1); c.fillRect(38,66,3,1);
  c.fillStyle=PAL.white;
  c.fillRect(24,59,2,2); c.fillRect(38,59,2,2);
  c.fillRect(26,64,1,1); c.fillRect(40,64,1,1);
  /* mofletes y sonrisa */
  c.fillStyle='#f0a878';
  c.fillRect(18,67,3,2); c.fillRect(43,67,3,2);
  c.fillStyle=PAL.black;
  c.fillRect(30,71,4,1); c.fillRect(29,70,1,1); c.fillRect(34,70,1,1);

  /* — bufanda verde espora: banda fina al cuello, nudo y cola al viento — */
  c.fillStyle=PAL.sporeDk; c.fillRect(20,51,25,4);
  c.fillStyle=PAL.spore;   c.fillRect(20,51,25,1);
  c.fillStyle=SCARF_DK;    c.fillRect(26,53,3,1); c.fillRect(36,52,3,1); // pliegues
  hEll(c,19,55,3,3,PAL.sporeDk); // nudo
  c.fillStyle=PAL.spore; c.fillRect(18,53,2,1);
  const ph=wave?Math.PI:0;
  for(let x=16;x>=2;x--){ // la cola ondea; se afina hacia la punta
    const yo=Math.round(Math.sin(x*0.42+ph)*2.2-(x<6?(6-x)*0.4:0));
    const hh=x>11?5:4;
    c.fillStyle=PAL.sporeDk; c.fillRect(x,51+yo,1,hh);
    c.fillStyle=PAL.spore;   c.fillRect(x,51+yo,1,1);
    if(((x+wave)&3)===0){ c.fillStyle=SCARF_DK; c.fillRect(x,51+yo+hh-2,1,2); }
  }

  /* — sombrero: cupula con rampa de 3 tonos, trama, luz de borde — */
  for(let y=4;y<=42;y++){
    const hw=heroDomeHW(y); if(hw<1)continue;
    const xa=Math.round(32-hw), xb=Math.round(32+hw);
    c.fillStyle=PAL.capR; c.fillRect(xa,y,xb-xa,1);
    const sw=Math.max(1,Math.round(hw*0.30)); // sombra al lado derecho
    c.fillStyle=PAL.capDk; c.fillRect(xb-sw,y,sw,1);
    for(let x=xb-sw-3;x<xb-sw;x++) if(((x+y)&1)===0){c.fillStyle=PAL.capDk;c.fillRect(x,y,1,1);}
    if(y<24){ c.fillStyle=PAL.capLt; c.fillRect(xa,y,1,1); } // luz de borde
  }
  /* penumbra inferior de la cupula, con trama de transicion */
  for(let y=43;y<=46;y++){
    const hw=heroDomeHW(y); if(hw<1)continue;
    c.fillStyle=PAL.capDk;
    c.fillRect(Math.round(32-hw),y,Math.round(hw*2),1);
  }
  for(let x=5;x<60;x++)for(let y=40;y<43;y++)
    if(((x+y)&1)===0&&heroDomeHW(y)>Math.abs(x-32)){c.fillStyle=PAL.capDk;c.fillRect(x,y,1,1);}
  /* ala inferior con labio que recoge luz */
  for(const [y,hw] of [[47,26],[48,24.5],[49,23]]){
    c.fillStyle=PAL.capR; c.fillRect(Math.round(32-hw),y,Math.round(hw*2),1);
  }
  c.fillStyle=PAL.capDk; c.fillRect(11,49,42,2);
  for(let x=13;x<=51;x+=4){ c.fillStyle=PAL.black; c.fillRect(x,49,1,2); } // laminillas
  /* brillo superior-izquierdo con nucleo caliente */
  hEll(c,22,17,11,7,PAL.capLt);
  hRing(c,22,17,14,9.5,11,7,PAL.capLt);
  hEll(c,20,15,4.5,2.6,CAP_HOT);
  /* lunares blancos con sombra inferior, siguiendo la curvatura */
  const spot=(sx,sy,rx,ry)=>{
    hEll(c,sx,sy,rx,ry,PAL.white);
    hEll(c,sx,sy+ry*0.5,rx*0.72,ry*0.42,SPOT_SH);
  };
  spot(40,16,5,3.6); spot(15,29,4.2,3); spot(45,36,4,2.8);
  spot(27,41,3,2.2); spot(50,26,2,1.4);

  hOut(c,HERO_W,HERO_H,PAL.black);
  return b;
}
const HERO_A=bakeHero(0), HERO_B=bakeHero(1);

function drawBoletHero(x,y){ // x,y = centro de los pies
  const bob=(((time*2)|0)&1)?1:0;
  drawShadow(x,y-1,40);
  ctx.drawImage((((time*3)|0)&1)?HERO_B:HERO_A, x-32, y-HERO_H+2+bob);
  const ox=x-32, oy=y-HERO_H+2+bob;
  /* parpadeo cada ~4.6s */
  if((time%4.6)<0.13){
    ctx.fillStyle=PAL.stem;
    ctx.fillRect(ox+23,oy+57,5,10); ctx.fillRect(ox+37,oy+57,5,10);
    ctx.fillStyle=PAL.black;
    ctx.fillRect(ox+23,oy+61,5,1); ctx.fillRect(ox+37,oy+61,5,1);
  }
  /* nieve posada en el sombrero (invierno) */
  if(season===3){
    ctx.fillStyle=PAL.white;
    for(let yy=5;yy<=9;yy++){
      const hw=heroDomeHW(yy)*0.94; if(hw<1)continue;
      if(yy<8) ctx.fillRect(Math.round(ox+32-hw),oy+yy,Math.round(hw*2),1);
      else for(let xx=Math.round(32-hw);xx<=Math.round(32+hw);xx++)
        if(((xx+yy)&1)===0)ctx.fillRect(ox+xx,oy+yy,1,1);
    }
  }
  /* destello en el brillo del sombrero, de tanto en tanto */
  const gph=time%3.4;
  if(gph<0.3){
    const gs=gph<0.15?1+((gph/0.05)|0):3-(((gph-0.15)/0.05)|0);
    const gx=ox+20, gy=oy+15;
    ctx.fillStyle=PAL.white;
    ctx.fillRect(gx-gs,gy,gs*2+1,1); ctx.fillRect(gx,gy-gs,1,gs*2+1);
  }
  /* espora companera flotando junto a la mano alzada */
  const bx=x+28, by=y-66+Math.round(Math.sin(time*2.4)*3);
  ctx.fillStyle=PAL.sporeDk; ctx.fillRect(bx-3,by-3,7,7);
  ctx.fillStyle=PAL.spore; ctx.fillRect(bx-2,by-3,5,7); ctx.fillRect(bx-3,by-2,7,5);
  ctx.fillStyle='#e8ffc0'; ctx.fillRect(bx-1,by-2,2,2);
  ctx.fillStyle=PAL.white; ctx.fillRect(bx-1,by-2,1,1);
  if(((time*5)|0)&1){
    ctx.fillStyle=PAL.spore;
    ctx.fillRect(bx-5,by,1,1); ctx.fillRect(bx+4,by,1,1); ctx.fillRect(bx,by-5,1,1);
  }
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
