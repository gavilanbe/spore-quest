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
function drawCloud(x,y){ // nube pequena
  ctx.fillStyle=PAL.white;
  ctx.fillRect(x,y,22,5); ctx.fillRect(x+4,y-3,12,3); ctx.fillRect(x+2,y+5,17,2);
  ctx.fillStyle='#c8dce8';
  ctx.fillRect(x+2,y+6,15,1);
}
function drawCloudBig(x,y){ // nube esponjosa de tres lomos con base plana
  x=Math.round(x);
  ctx.fillStyle='#d8e8f0';
  ctx.fillRect(x,y+6,40,4);
  ctx.fillStyle=PAL.white;
  ctx.fillRect(x+2,y+2,36,5);
  ctx.fillRect(x+5,y-2,12,5); ctx.fillRect(x+19,y-4,14,7); ctx.fillRect(x+30,y,8,4);
  ctx.fillRect(x+8,y-3,7,2); ctx.fillRect(x+22,y-5,8,2);
  ctx.fillStyle='#c8dce8';
  ctx.fillRect(x+3,y+8,34,2); ctx.fillRect(x+8,y+10,22,1);
  ctx.fillStyle=PAL.white; ctx.fillRect(x+4,y+8,6,1);
}
function drawGreatTree(cx,gy){
  const P=CP();
  /* raices que abrazan el suelo */
  ctx.fillStyle='#503418';
  ctx.fillRect(cx-14,gy-3,8,3); ctx.fillRect(cx+7,gy-3,8,3);
  ctx.fillRect(cx-17,gy-1,6,1); ctx.fillRect(cx+12,gy-1,6,1);
  /* tronco ancho con corteza en tres tonos */
  ctx.fillStyle='#503418'; ctx.fillRect(cx-8,gy-30,16,30);
  ctx.fillStyle=P.trunk;   ctx.fillRect(cx-6,gy-30,10,30);
  ctx.fillStyle='#503418'; ctx.fillRect(cx-1,gy-26,2,10); ctx.fillRect(cx-5,gy-18,2,8);
  ctx.fillStyle='#a8825c'; ctx.fillRect(cx-6,gy-30,2,26); // luz lateral
  /* la puerta del oraculo, con su lucecita dorada */
  ctx.fillStyle='#2c1c0c';
  ctx.fillRect(cx-3,gy-9,7,9); ctx.fillRect(cx-2,gy-11,5,2);
  ctx.fillStyle=PAL.black; ctx.fillRect(cx-3,gy-9,1,9); ctx.fillRect(cx+3,gy-9,1,9);
  if((((time*1.4)|0)&1)===0){ ctx.fillStyle=PAL.gold; ctx.fillRect(cx+1,gy-5,1,1); }
  /* setas repisa en el tronco */
  ctx.fillStyle=PAL.capDk; ctx.fillRect(cx-10,gy-20,6,2);
  ctx.fillStyle=PAL.capR;  ctx.fillRect(cx-10,gy-21,6,2);
  ctx.fillStyle=PAL.white; ctx.fillRect(cx-9,gy-21,1,1);
  ctx.fillStyle=PAL.capDk; ctx.fillRect(cx+5,gy-14,5,2);
  ctx.fillStyle=PAL.capR;  ctx.fillRect(cx+5,gy-15,5,2);
  ctx.fillStyle=PAL.white; ctx.fillRect(cx+7,gy-15,1,1);
  /* copa en tres capas con trama entre ellas */
  hEll2(cx,gy-38,27,11,P.treeDk);
  hEll2(cx+8,gy-34,16,8,P.treeDk);
  hEll2(cx-3,gy-44,22,10,P.tree);
  hRing2(cx-3,gy-44,25,12,22,10,P.tree);
  hEll2(cx-8,gy-50,14,7,P.treeLt);
  hRing2(cx-8,gy-50,17,9,14,7,P.treeLt);
  /* festones de sombra bajo la copa */
  ctx.fillStyle=P.treeDk;
  for(let i=-2;i<=2;i++) hEll2(cx+i*9,gy-30,5,2.5,P.treeDk);
  /* acentos por estacion */
  if(season===0){ // flores de primavera
    ctx.fillStyle='#f0a0c8';
    ctx.fillRect(cx-14,gy-48,2,2); ctx.fillRect(cx+2,gy-52,2,2);
    ctx.fillRect(cx+12,gy-42,2,2); ctx.fillRect(cx-4,gy-38,2,2); ctx.fillRect(cx+18,gy-36,2,2);
  } else if(season===1){ // frutos de verano
    ctx.fillStyle=PAL.gold;
    ctx.fillRect(cx-10,gy-44,2,2); ctx.fillRect(cx+6,gy-48,2,2); ctx.fillRect(cx+14,gy-38,2,2);
  } else if(season===3){ // manto de nieve
    ctx.fillStyle=PAL.white;
    hEll2(cx-8,gy-52,13,3,PAL.white);
    hEll2(cx-3,gy-47,10,2,PAL.white);
    ctx.fillRect(cx+10,gy-40,6,1); ctx.fillRect(cx-18,gy-40,5,1);
  }
  /* esporas doradas levitando alrededor de la copa */
  for(let i=0;i<3;i++){
    const sx=cx-20+i*18, sy=gy-56+Math.round(Math.sin(time*1.6+i*2.1)*3)+i*4;
    if((((time*3)|0)+i)&1)continue;
    ctx.fillStyle=i===1?PAL.spore:PAL.sporeDk;
    ctx.fillRect(sx,sy,2,2);
  }
  /* setitas rojas al pie */
  ctx.fillStyle=PAL.capR;
  ctx.fillRect(cx-13,gy-3,3,2); ctx.fillRect(cx+11,gy-3,3,2);
  ctx.fillStyle=PAL.stem;
  ctx.fillRect(cx-12,gy-1,1,1); ctx.fillRect(cx+12,gy-1,1,1);
  ctx.fillStyle=PAL.white; ctx.fillRect(cx-12,gy-3,1,1); ctx.fillRect(cx+12,gy-3,1,1);
}
/* variantes de elipse/anillo que pintan directo al ctx de pantalla */
function hEll2(cx,cy,rx,ry,col){
  ctx.fillStyle=col;
  const y0=Math.round(cy-ry), y1=Math.round(cy+ry);
  for(let y=y0;y<=y1;y++){
    const t=(y-cy)/ry, q=1-t*t; if(q<=0)continue;
    const hw=rx*Math.sqrt(q); if(hw<.35)continue;
    const xa=Math.round(cx-hw);
    ctx.fillRect(xa,y,Math.max(1,Math.round(cx+hw)-xa),1);
  }
}
function hRing2(cx,cy,rxA,ryA,rxB,ryB,col){
  ctx.fillStyle=col;
  const y0=Math.round(cy-ryA), y1=Math.round(cy+ryA);
  const x0=Math.round(cx-rxA), x1=Math.round(cx+rxA);
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
    if(((x+y)&1)===0)continue;
    const a=((x-cx)/rxA)**2+((y-cy)/ryA)**2;
    const b=((x-cx)/rxB)**2+((y-cy)/ryB)**2;
    if(a<1&&b>1)ctx.fillRect(x,y,1,1);
  }
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
function heroDomeHW(y){ // semiancho de la cupula del sombrero en la fila y (4..44)
  const t=(36-y)/32, q=1-t*t;
  return q<=0?0:27*Math.sqrt(q);
}
function bakeHero(wave){
  const b=document.createElement('canvas'); b.width=HERO_W; b.height=HERO_H;
  const c=b.getContext('2d',{willReadFrequently:true}); c.imageSmoothingEnabled=false;

  /* — pies grandes y asentados — */
  hEll(c,23,80,6.5,3.8,PAL.stemDk); hEll(c,41,80,6.5,3.8,PAL.stemDk);
  hEll(c,22,79,5,2,PAL.stem);       hEll(c,40,79,5,2,PAL.stem);

  /* — tallo (cuerpo): barriga rotunda con media luna de sombra — */
  hEll(c,32,66,14,13,PAL.stemDk);
  hEll(c,30.5,65,13,12.4,PAL.stem);
  hEll(c,32,56,11,6,PAL.stem); // hombros
  hEll(c,32,77,11,4,PAL.stemDk); // asiento
  hRing(c,32,75,12.5,6,11,4,PAL.stemDk);
  hRing(c,26,58,7.5,4.5,4,2.2,STEM_HI); // brillo suave en trama
  /* brazo izquierdo pegado y brazo derecho alzado hacia la espora */
  hEll(c,17.5,63,3.2,5.5,PAL.stem);
  hEll(c,46,55,3.6,4,PAL.stem);
  hEll(c,50,50,3.2,3.6,PAL.stem);
  hEll(c,53,45.5,3,3,PAL.stem);
  hEll(c,54,47,2,1.2,PAL.stemDk); // palma

  /* — ojos grandes con doble brillo — */
  c.fillStyle=PAL.black;
  c.fillRect(23,56,5,8); c.fillRect(24,55,3,1); c.fillRect(24,64,3,1);
  c.fillRect(37,56,5,8); c.fillRect(38,55,3,1); c.fillRect(38,64,3,1);
  c.fillStyle=PAL.white;
  c.fillRect(24,57,2,2); c.fillRect(38,57,2,2);
  c.fillRect(26,62,1,1); c.fillRect(40,62,1,1);
  /* mofletes y sonrisa */
  c.fillStyle='#f0a878';
  c.fillRect(18,65,3,2); c.fillRect(43,65,3,2);
  c.fillStyle=PAL.black;
  c.fillRect(30,69,4,1); c.fillRect(29,68,1,1); c.fillRect(34,68,1,1);

  /* — bufanda verde espora: banda fina al cuello, nudo y cola al viento — */
  c.fillStyle=PAL.sporeDk; c.fillRect(20,49,25,4);
  c.fillStyle=PAL.spore;   c.fillRect(20,49,25,1);
  c.fillStyle=SCARF_DK;    c.fillRect(26,51,3,1); c.fillRect(36,50,3,1); // pliegues
  hEll(c,19,53,3,3,PAL.sporeDk); // nudo
  c.fillStyle=PAL.spore; c.fillRect(18,51,2,1);
  const ph=wave?Math.PI:0;
  for(let x=16;x>=2;x--){ // la cola ondea; se afina hacia la punta
    const yo=Math.round(Math.sin(x*0.42+ph)*2.2-(x<6?(6-x)*0.4:0));
    const hh=x>11?5:4;
    c.fillStyle=PAL.sporeDk; c.fillRect(x,49+yo,1,hh);
    c.fillStyle=PAL.spore;   c.fillRect(x,49+yo,1,1);
    if(((x+wave)&3)===0){ c.fillStyle=SCARF_DK; c.fillRect(x,49+yo+hh-2,1,2); }
  }

  /* — sombrero: cupula con rampa de 3 tonos, trama, luz de borde — */
  for(let y=4;y<=40;y++){
    const hw=heroDomeHW(y); if(hw<1)continue;
    const xa=Math.round(32-hw), xb=Math.round(32+hw);
    c.fillStyle=PAL.capR; c.fillRect(xa,y,xb-xa,1);
    const sw=Math.max(1,Math.round(hw*0.30)); // sombra al lado derecho
    c.fillStyle=PAL.capDk; c.fillRect(xb-sw,y,sw,1);
    for(let x=xb-sw-3;x<xb-sw;x++) if(((x+y)&1)===0){c.fillStyle=PAL.capDk;c.fillRect(x,y,1,1);}
    if(y<22){ c.fillStyle=PAL.capLt; c.fillRect(xa,y,1,1); } // luz de borde
  }
  /* penumbra inferior de la cupula, con trama de transicion */
  for(let y=41;y<=44;y++){
    const hw=heroDomeHW(y); if(hw<1)continue;
    c.fillStyle=PAL.capDk;
    c.fillRect(Math.round(32-hw),y,Math.round(hw*2),1);
  }
  for(let x=5;x<60;x++)for(let y=38;y<41;y++)
    if(((x+y)&1)===0&&heroDomeHW(y)>Math.abs(x-32)){c.fillStyle=PAL.capDk;c.fillRect(x,y,1,1);}
  /* ala inferior con labio que recoge luz */
  for(const [y,hw] of [[45,26],[46,24.5],[47,23]]){
    c.fillStyle=PAL.capR; c.fillRect(Math.round(32-hw),y,Math.round(hw*2),1);
  }
  c.fillStyle=PAL.capDk; c.fillRect(11,47,42,2);
  for(let x=13;x<=51;x+=4){ c.fillStyle=PAL.black; c.fillRect(x,47,1,2); } // laminillas
  /* brillo superior-izquierdo con nucleo caliente */
  hEll(c,22,15,11,7,PAL.capLt);
  hRing(c,22,15,14,9.5,11,7,PAL.capLt);
  hEll(c,20,13,4.5,2.6,CAP_HOT);
  /* lunares blancos con sombra inferior, siguiendo la curvatura */
  const spot=(sx,sy,rx,ry)=>{
    hEll(c,sx,sy,rx,ry,PAL.white);
    hEll(c,sx,sy+ry*0.5,rx*0.72,ry*0.42,SPOT_SH);
  };
  spot(40,14,5,3.6); spot(15,27,4.2,3); spot(45,34,4,2.8);
  spot(27,39,3,2.2); spot(50,24,2,1.4);

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
    ctx.fillRect(ox+23,oy+55,5,10); ctx.fillRect(ox+37,oy+55,5,10);
    ctx.fillStyle=PAL.black;
    ctx.fillRect(ox+23,oy+59,5,1); ctx.fillRect(ox+37,oy+59,5,1);
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
    const gx=ox+20, gy=oy+13;
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
/* ---------- LOGOTIPO propio: letras 8x10 dibujadas a mano, oro con bisel ---------- */
const LGLYPH={
S:['01111110','11111111','11000011','11100000','11111100','00111110','00000111','11000011','11111111','01111110'],
P:['11111100','11111110','11000111','11000011','11000111','11111110','11111100','11000000','11000000','11000000'],
O:['00111100','01111110','11100111','11000011','11000011','11000011','11000011','11100111','01111110','00111100'],
R:['11111100','11111110','11000111','11000111','11111110','11111100','11001110','11000111','11000011','11000011'],
E:['11111111','11111111','11000000','11000000','11111100','11111100','11000000','11000000','11111111','11111111'],
Q:['00111100','01111110','11100111','11000011','11000011','11001011','11100111','01111110','00111110','00000011'],
U:['11000011','11000011','11000011','11000011','11000011','11000011','11000011','11100111','01111110','00111100'],
T:['11111111','11111111','00111100','00111100','00111100','00111100','00111100','00111100','00111100','00111100'],
};
const LOGO_RAMP=['#f8f0c0','#f8f0c0','#f0d048','#f0d048','#f0d048','#e0a828','#e0a828','#c08818','#c08818','#b07818'];
function drawBigWord(word,y,arc){ // letras 16x20 en arco, con sombra, contorno y bisel
  const lw=word.length*18-2, x0=Math.round((W-lw)/2);
  const at=(i,r,c)=>{const g=LGLYPH[word[i]];return r>=0&&r<10&&c>=0&&c<8&&g[r][c]==='1';};
  /* sombra proyectada */
  ctx.fillStyle='#402008';
  for(let i=0;i<word.length;i++){const g=LGLYPH[word[i]],yy=y+arc[i];
    for(let r=0;r<10;r++)for(let c2=0;c2<8;c2++)if(g[r][c2]==='1')
      ctx.fillRect(x0+i*18+c2*2+1,yy+r*2+2,2,2);
  }
  /* contorno */
  ctx.fillStyle=PAL.black;
  for(let i=0;i<word.length;i++){const g=LGLYPH[word[i]],yy=y+arc[i];
    for(let r=0;r<10;r++)for(let c2=0;c2<8;c2++)if(g[r][c2]==='1')
      ctx.fillRect(x0+i*18+c2*2-1,yy+r*2-1,4,4);
  }
  /* relleno con rampa de oro y bisel */
  for(let i=0;i<word.length;i++){const g=LGLYPH[word[i]],yy=y+arc[i];
    for(let r=0;r<10;r++)for(let c2=0;c2<8;c2++){
      if(g[r][c2]!=='1')continue;
      const px=x0+i*18+c2*2, py=yy+r*2;
      ctx.fillStyle=LOGO_RAMP[r]; ctx.fillRect(px,py,2,2);
      if(!at(i,r-1,c2)){ ctx.fillStyle='#fffef0'; ctx.fillRect(px,py,2,1); }
      if(!at(i,r+1,c2)){ ctx.fillStyle='#8c5c14'; ctx.fillRect(px,py+1,2,1); }
    }
  }
}
function drawLogoEmblem(cx,ty){ // gran seta emblema tras el logo
  for(let y=0;y<=40;y++){
    const t=(40-y)/40, q=1-t*t; if(q<=0)continue;
    const hw=62*Math.sqrt(q);
    const xa=Math.round(cx-hw), xb=Math.round(cx+hw);
    ctx.fillStyle='#a82030'; ctx.fillRect(xa,ty+y,xb-xa,1);
    const sw=Math.max(1,Math.round(hw*0.26));
    ctx.fillStyle=PAL.capDk; ctx.fillRect(xb-sw,ty+y,sw,1);
    if(y<12){ ctx.fillStyle='#c84850'; ctx.fillRect(xa,ty+y,Math.max(2,Math.round(hw*0.5)),1); }
  }
  /* lunares apagados y laminillas del emblema */
  ctx.fillStyle='#d88890';
  hEll2(cx-30,ty+14,7,4,'#d88890'); hEll2(cx+22,ty+10,5,3,'#d88890'); hEll2(cx+42,ty+24,4,2.5,'#d88890');
  ctx.fillStyle=PAL.capDk; ctx.fillRect(Math.round(cx-58),ty+40,116,2);
  ctx.fillStyle='#701820';
  for(let i=-6;i<=6;i++) ctx.fillRect(cx+i*9,ty+40,2,3);
}
function drawFarWoods(hy){ // bosque lejano en dos profundidades
  const P=CP();
  ctx.fillStyle=P.treeDk;
  ctx.fillRect(0,hy-6,W,6);
  for(let i=0;i<14;i++){
    const bx=i*12-4, bh=4+((tRnd(31,i,2)*6)|0);
    hEll2(bx+6,hy-6-bh*0.4,7,bh*0.7,P.treeDk);
  }
  ctx.fillStyle=P.tree;
  for(let i=0;i<11;i++){
    const bx=i*15-6, bh=3+((tRnd(17,i,5)*5)|0);
    hEll2(bx+8,hy-2-bh*0.3,8,bh*0.6,P.tree);
  }
  for(let x=0;x<W;x+=2){ // trama de fusion con la colina
    if(((x+hy)&3)===0){ ctx.fillStyle=P.treeDk; ctx.fillRect(x,hy-1,1,1); }
  }
}
function drawSunMoon(){ // astro por estacion, con rayos que giran
  const TS2=[[14,30],[14,26],[14,44],[16,34]][season];
  const sx=TS2[0], sy=TS2[1];
  if(season===3){ // luna creciente con estrellas
    ctx.fillStyle=PAL.white;
    hEll2(sx+3,sy+3,6,6,PAL.white);
    const skyc=ctx.fillStyle='#90c8f0';
    hEll2(sx+6,sy+2,5,5,'#b8ccd8');
    if(((time*2)|0)&1){ctx.fillStyle=PAL.white;ctx.fillRect(sx+16,sy-6,1,1);ctx.fillRect(sx+10,sy+12,1,1);}
    else{ctx.fillStyle=PAL.white;ctx.fillRect(sx+20,sy+4,1,1);}
    return;
  }
  const sc=season===2?'#f0d048':PAL.gold;
  hEll2(sx+3,sy+3,5.5,5.5,sc);
  hEll2(sx+2,sy+2,2.5,2.5,'#f8f0c0');
  const f=((time*2)|0)&1; ctx.fillStyle=sc;
  if(f){
    ctx.fillRect(sx+2,sy-6,2,3); ctx.fillRect(sx+2,sy+10,2,3);
    ctx.fillRect(sx-6,sy+2,3,2); ctx.fillRect(sx+10,sy+2,3,2);
  } else {
    ctx.fillRect(sx-4,sy-4,2,2); ctx.fillRect(sx+8,sy-4,2,2);
    ctx.fillRect(sx-4,sy+8,2,2); ctx.fillRect(sx+8,sy+8,2,2);
  }
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
