'use strict';
/* ============================================================
   SPORE QUEST · capa 09-entities
   enemigos, jefes, Bolet, cofres, dardos y corazones (dibujo)
   ============================================================ */
const BOSS_NAMES=['REY MOHO','POLILLA REINA','BROTE MADRE'];
function makeBoss(order){
  const n=(order/BOSS_EVERY)|0, bkind=(n-1)%3;
  const hp=[12,10,16][bkind]+n*5;
  const b={type:2,bkind,hp,maxHp:hp,dx:0,dy:0,t:0,ph:0,flash:0,
    kbx:0,kby:0,kbt:0,spawned:false};
  if(bkind===0){b.x=80;b.y=56;b.bstate='walk';b.st=2.2;}
  if(bkind===1){b.x=80;b.y=40;b.bstate='hover';b.st=2.0;b.tx=80;b.ty=36;b.fly=true;}
  if(bkind===2){b.x=80;b.y=68;b.bstate='closed';b.st=2.0;b.arc=0;}
  return b;
}
function bossInvuln(en){ return en.type===2&&en.bkind===2&&en.bstate==='closed'; }
/* tipos: 0 limo, 1 limo rojo, 2 REY MOHO, 3 polilla, 4 brote, 5 caracol */
function mkEnemy(type,x,y){
  const base={x,y,type,dx:0,dy:0,t:Math.random()*1.5,ph:Math.random()*6,flash:0,kbx:0,kby:0,kbt:0};
  if(type===0)return {...base,hp:2};
  if(type===1)return {...base,hp:3};
  if(type===3)return {...base,hp:1,fly:true,mode:'wander',tx:x,ty:y,st:1+Math.random()*2};
  if(type===4)return {...base,hp:3,mode:'buried',st:1+Math.random()*1.5,shot:false};
  if(type===5)return {...base,hp:5,armored:true,mode:'wander',st:0,cdir:[0,0]};
  return {...base,hp:2};
}
function enemyPool(){
  const d=depth();
  if(d<3)  return [0,0,0];
  if(d<6)  return [0,0,3,3];
  if(d<9)  return [0,1,3,4,4];
  if(d<13) return [0,1,3,4,5];
  return [1,1,3,4,5,5];
}
function spawnEnemies(){
  enemies=[];
  if(room.cleared) return;
  if(room.boss){ enemies.push(makeBoss(room.order||BOSS_EVERY)); S.bossRoar(); return; }
  if(roomX===0&&roomY===0&&visited.size<=1){room.cleared=true;return;}
  const rnd=mulberry32(room.seed^0xBEEF);
  const pool=enemyPool();
  const n=2+Math.min(3,(depth()/3)|0);
  let tries=0;
  while(enemies.length<n && tries<80){
    tries++;
    const tx=1+((rnd()*(COLS-2))|0), ty=1+((rnd()*(ROWS-2))|0);
    if(isSolidTile(room.tiles[ty*COLS+tx])) continue;
    const ex=tx*TS+8, ey=ty*TS+12;
    if(Math.hypot(ex-player.x,ey-player.y)<46) continue;
    const type=pool[(rnd()*pool.length)|0];
    enemies.push(mkEnemy(type,ex,ey));
  }
}

/* ---------- Colisiones ---------- */
function solidAtPx(px,py){
  const tx=Math.floor(px/TS), ty=Math.floor(py/TS);
  if(tx<0||tx>=COLS||ty<0||ty>=ROWS){
    if(bossLock()) return true;
    if(ty<0 && (tx===4||tx===5)) return false;
    if(ty>=ROWS && (tx===4||tx===5)) return false;
    if(tx<0 && (ty===3||ty===4)) return false;
    if(tx>=COLS && (ty===3||ty===4)) return false;
    return true;
  }
  if(room.chest&&!room.chest.open&&tx===room.chest.tx&&ty===room.chest.ty) return true;
  return isSolidTile(room.tiles[ty*COLS+tx]);
}
function boxCollides(x,y){
  const l=x-5,r=x+4,t=y-8,b=y-1;
  return solidAtPx(l,t)||solidAtPx(r,t)||solidAtPx(l,b)||solidAtPx(r,b)||solidAtPx((l+r)/2,b);
}
function moveEntity(e,dx,dy){
  const steps=Math.max(1,Math.ceil(Math.max(Math.abs(dx),Math.abs(dy))));
  const sx=dx/steps, sy=dy/steps;
  for(let i=0;i<steps;i++){
    if(!boxCollides(e.x+sx,e.y)) e.x+=sx;
    if(!boxCollides(e.x,e.y+sy)) e.y+=sy;
  }
}

/* ---------- Sprites ---------- */
function drawShadow(x,y,w){
  ctx.fillStyle='rgba(8,24,32,0.28)';
  ctx.fillRect(Math.round(x-w/2),Math.round(y),w,2);
}

/* ---- Bolet: sprite por estados con contorno real ---- */
const sprC=document.createElement('canvas'); sprC.width=24; sprC.height=26;
const sprX=sprC.getContext('2d'); sprX.imageSmoothingEnabled=false;
const silC=document.createElement('canvas'); silC.width=24; silC.height=26;
const silX=silC.getContext('2d'); silX.imageSmoothingEnabled=false;

function paintShroom(ax,ay,o){
  // pinta a Bolet en el canvas actual, ancla = centro de los pies
  const dir=o.dir||'down';
  const df=Math.max(0,Math.min(4,o.deflate||0));       // deshinchado (muerte)
  const e=df>0?0:Math.max(0,Math.min(3,o.e||0));       // hinchado
  const sq=(o.squash?1:0)+(df>1?1:0);                  // aplastado (dano)
  const bob=o.bob||0;                                   // rebote andar/celebrar
  const ox=ax-8, oy=ay-16+sq+bob;
  const face=o.face||'normal';
  const hopFeet=bob<0;

  // pies
  if(df<3){
    ctx.fillStyle=PAL.stemDk;
    const st=o.step||0;
    ctx.fillRect(ox+4, oy+14-((o.moving&&st===0)||hopFeet?1:0)+sq, 3, 2-sq);
    ctx.fillRect(ox+9, oy+14-((o.moving&&st===1)||hopFeet?1:0)+sq, 3, 2-sq);
  }
  // cuerpo
  const bh=Math.max(2,6-sq-df);
  ctx.fillStyle=PAL.stem; ctx.fillRect(ox+4,oy+14-bh,8,bh);
  ctx.fillStyle=PAL.stemDk;
  ctx.fillRect(ox+4,oy+13,8,1);
  ctx.fillRect(ox+4,oy+14-bh,1,bh); ctx.fillRect(ox+11,oy+14-bh,1,bh);
  // cara (fila base de ojos: oy+9)
  const ey=oy+14-bh+1;
  const eyesAt=(lx,rx)=>{
    ctx.fillStyle=PAL.black;
    if(face==='normal'||face==='shout'){ ctx.fillRect(ox+lx,ey,1,2); ctx.fillRect(ox+rx,ey,1,2); }
    else if(face==='blink'||face==='sleep'){ ctx.fillRect(ox+lx-1,ey+1,2,1); ctx.fillRect(ox+rx,ey+1,2,1); }
    else if(face==='happy'){ // ^ ^
      ctx.fillRect(ox+lx,ey,1,1); ctx.fillRect(ox+lx-1,ey+1,1,1); ctx.fillRect(ox+lx+1,ey+1,1,1);
      ctx.fillRect(ox+rx,ey,1,1); ctx.fillRect(ox+rx-1,ey+1,1,1); ctx.fillRect(ox+rx+1,ey+1,1,1);
    }
    else if(face==='hurt'||face==='strain'){ // > <
      ctx.fillRect(ox+lx-1,ey,1,1); ctx.fillRect(ox+lx,ey+1,1,1);
      ctx.fillRect(ox+rx+1,ey,1,1); ctx.fillRect(ox+rx,ey+1,1,1);
    }
  };
  if(dir==='down'){
    eyesAt(6,9);
    if(face==='strain'||o.cheeks){ // mofletes hinchados
      ctx.fillStyle='#f0a878';
      ctx.fillRect(ox+4,ey+2,2,2); ctx.fillRect(ox+10,ey+2,2,2);
    } else if(face==='normal'||face==='happy'||face==='blink'){
      ctx.fillStyle='#f0a878';
      ctx.fillRect(ox+5,ey+2,1,1); ctx.fillRect(ox+10,ey+2,1,1);
    }
    if(face==='shout'){ ctx.fillStyle=PAL.black; ctx.fillRect(ox+7,ey+3,2,1); }
    if(face==='hurt'){ ctx.fillStyle=PAL.black; ctx.fillRect(ox+7,ey+3,1,1); ctx.fillRect(ox+8,ey+2,1,1); }
  } else if(dir==='left'){
    eyesAt(5,8);
    if(face==='strain'||o.cheeks){ ctx.fillStyle='#f0a878'; ctx.fillRect(ox+4,ey+2,2,2); }
    else { ctx.fillStyle='#f0a878'; ctx.fillRect(ox+9,ey+2,1,1); }
    if(face==='shout'){ ctx.fillStyle=PAL.black; ctx.fillRect(ox+5,ey+3,2,1); }
  } else if(dir==='right'){
    eyesAt(8,11);
    if(face==='strain'||o.cheeks){ ctx.fillStyle='#f0a878'; ctx.fillRect(ox+10,ey+2,2,2); }
    else { ctx.fillStyle='#f0a878'; ctx.fillRect(ox+6,ey+2,1,1); }
    if(face==='shout'){ ctx.fillStyle=PAL.black; ctx.fillRect(ox+9,ey+3,2,1); }
  }
  // sombrero: se hincha (e) o se deshincha (df), y se inclina al andar
  const lean=(o.moving&&!df)?(dir==='left'?-1:dir==='right'?1:0):0;
  const rows=[[6,9],[4,11],[3,12],[2,13],[1,14],[1,14]];
  ctx.fillStyle=PAL.capR;
  for(let i=0;i<rows.length;i++){
    let x0=rows[i][0]-e+df, x1=rows[i][1]+e-df;
    if(x0>x1)continue;
    x0=Math.max(-1,x0+lean); x1=Math.min(16,x1+lean);
    ctx.fillRect(ox+x0, oy+i-e+df, x1-x0+1, 1);
  }
  for(let f=0;f<=e;f++){
    ctx.fillStyle=(f===e)?PAL.capDk:PAL.capR;
    const x0=Math.max(-1,2-e+lean), x1=Math.min(16,13+e+lean);
    if(df<3)ctx.fillRect(ox+x0, oy+6-e+f+df, x1-x0+1, 1);
  }
  if(df<2){
    // laminas bajo el ala
    ctx.fillStyle=PAL.capDk;
    ctx.fillRect(ox+3+lean,oy+7+df,2,1); ctx.fillRect(ox+7+lean,oy+7+df,2,1); ctx.fillRect(ox+11+lean,oy+7+df,2,1);
    // brillo y lunares (de espaldas cambian de sitio)
    ctx.fillStyle=PAL.capLt; ctx.fillRect(ox+4-e+lean,oy+1-e+df,4,1); ctx.fillRect(ox+3-e+lean,oy+2-e+df,2,1);
    ctx.fillStyle=PAL.white;
    if(dir==='up'){
      ctx.fillRect(ox+6+lean,oy+2-e+df,3,3); ctx.fillRect(ox+11+lean,oy+4-e+df,2,2); ctx.fillRect(ox+3+lean,oy+4-e+df,2,2);
      ctx.fillStyle=PAL.capDk; ctx.fillRect(ox+8+lean,oy-e+df,1,6);
    } else {
      ctx.fillRect(ox+9+lean,oy+2-e+df,2,2); ctx.fillRect(ox+5+lean,oy+4-e+df,2,2); ctx.fillRect(ox+12+lean,oy+4-e+df,1,2);
    }
  }
  // carga completa: destello
  if(o.ready && (((time*12)|0)&1)){
    ctx.fillStyle=PAL.spore;
    ctx.fillRect(ox+1-e,oy+1-e,2,1); ctx.fillRect(ox+13+e,oy+1-e,2,1);
    ctx.fillRect(ox+7,oy-2-e,2,1);
  }
}
function drawShroom(fx,fy,o){
  if((o.deflate||0)>=4) return; // ya solo quedan esporas
  // 1) pinta el sprite en su lienzo
  sprX.clearRect(0,0,24,26);
  const mainCtx=ctx;
  ctx=sprX; paintShroom(12,22,o); ctx=mainCtx;
  // 2) silueta para el contorno
  silX.globalCompositeOperation='source-over';
  silX.clearRect(0,0,24,26);
  silX.drawImage(sprC,0,0);
  silX.globalCompositeOperation='source-in';
  silX.fillStyle=PAL.black; silX.fillRect(0,0,24,26);
  // 3) sombra + contorno en 4 direcciones + sprite
  const tr=o.tremble?(((time*24)|0)&1?1:-1):0;
  const dx=Math.round(fx)-12+tr, dy=Math.round(fy)-22;
  if(!o.noShadow) drawShadow(fx,fy,10+(o.e||0)*2);
  ctx.drawImage(silC,dx-1,dy); ctx.drawImage(silC,dx+1,dy);
  ctx.drawImage(silC,dx,dy-1); ctx.drawImage(silC,dx,dy+1);
  ctx.drawImage(sprC,dx,dy);
}
function drawSlime(en){
  const s=(Math.sin(en.ph)>0)?1:0;
  const x=Math.round(en.x), y=Math.round(en.y);
  drawShadow(x,y-1,10);
  const main = en.flash>0 ? PAL.white : (en.type? PAL.slimeB : PAL.slimeA);
  const dk   = en.flash>0 ? PAL.white : (en.type? PAL.slimeBDk : PAL.slimeADk);
  ctx.fillStyle=dk;
  ctx.fillRect(x-5-s, y-6+s, 10+s*2, 6-s);
  ctx.fillRect(x-4-s, y-7+s, 8+s*2, 1);
  ctx.fillStyle=main;
  ctx.fillRect(x-4-s, y-6+s, 8+s*2, 4-s);
  // goterón que cuelga
  if(!s){ctx.fillStyle=dk;ctx.fillRect(x+3,y-1,1,2);}
  if(en.flash<=0){
    ctx.fillStyle=PAL.white;
    ctx.fillRect(x-4-s,y-6+s,1,1); // brillo
    ctx.fillRect(x-3,y-5+s,2,2); ctx.fillRect(x+1,y-5+s,2,2);
    ctx.fillStyle=PAL.black; ctx.fillRect(x-2,y-4+s,1,1); ctx.fillRect(x+2,y-4+s,1,1);
  }
}
function drawMoth(en){
  const x=Math.round(en.x), y=Math.round(en.y);
  const f=(((time*8)|0)&1)===0; // aleteo
  drawShadow(x,y+4,8);
  const wing=en.flash>0?PAL.white:PAL.mothWing;
  const body=en.flash>0?PAL.white:PAL.moth;
  const dk=en.flash>0?PAL.white:PAL.mothDk;
  ctx.fillStyle=wing;
  if(f){ // alas arriba
    ctx.fillRect(x-5,y-8,4,4); ctx.fillRect(x+1,y-8,4,4);
    ctx.fillRect(x-4,y-4,2,1); ctx.fillRect(x+2,y-4,2,1);
  } else { // alas extendidas
    ctx.fillRect(x-6,y-6,5,3); ctx.fillRect(x+1,y-6,5,3);
    ctx.fillRect(x-5,y-3,3,1); ctx.fillRect(x+2,y-3,3,1);
  }
  ctx.fillStyle=dk; // motas en las alas
  if(!f){ctx.fillRect(x-4,y-5,1,1);ctx.fillRect(x+3,y-5,1,1);}
  ctx.fillStyle=body;
  ctx.fillRect(x-1,y-7,2,7);
  ctx.fillStyle=dk;
  ctx.fillRect(x-1,y-1,2,1);
  ctx.fillRect(x-2,y-8,1,2); ctx.fillRect(x+1,y-8,1,2); // antenas
  if(en.flash<=0){ctx.fillStyle=PAL.capR;ctx.fillRect(x-1,y-6,1,1);ctx.fillRect(x+0,y-6,1,1);}
}
function drawBrote(en){
  const x=Math.round(en.x), y=Math.round(en.y);
  if(en.mode==='buried'){
    ctx.fillStyle=PAL.dirtDk; ctx.fillRect(x-4,y-2,8,3);
    ctx.fillStyle=PAL.dirt; ctx.fillRect(x-3,y-3,6,3);
    ctx.fillStyle=PAL.dirtDk; ctx.fillRect(x-1,y-2,2,1);
    return;
  }
  drawShadow(x,y-1,10);
  const up=(en.mode==='open')?0:2; // asomando/escondiendose
  const plant=en.flash>0?PAL.white:PAL.plant;
  const dk=en.flash>0?PAL.white:PAL.plantDk;
  // tallo
  ctx.fillStyle=plant; ctx.fillRect(x-1,y-6+up,2,6-up);
  ctx.fillStyle=dk; ctx.fillRect(x-3,y-3+up,2,1); ctx.fillRect(x+1,y-4+up,2,1); // hojas
  // cabeza/boca
  const hy=y-12+up;
  ctx.fillStyle=dk; ctx.fillRect(x-5,hy,10,7);
  ctx.fillStyle=plant; ctx.fillRect(x-4,hy,8,6);
  if(en.mode==='open'){
    ctx.fillStyle=en.flash>0?PAL.white:PAL.plantMaw;
    ctx.fillRect(x-3,hy+2,6,4);
    ctx.fillStyle=en.flash>0?PAL.white:PAL.plantIn;
    ctx.fillRect(x-2,hy+3,4,2);
    ctx.fillStyle=PAL.white; // dientes
    ctx.fillRect(x-3,hy+2,1,1); ctx.fillRect(x-1,hy+2,1,1); ctx.fillRect(x+1,hy+2,1,1);
  } else {
    ctx.fillStyle=dk; ctx.fillRect(x-1,hy+2,2,3); // capullo cerrado
  }
  ctx.fillStyle=PAL.white; ctx.fillRect(x-4,hy,2,1); // brillo
}
function drawSnail(en){
  const x=Math.round(en.x), y=Math.round(en.y);
  drawShadow(x,y-1,11);
  const sh=en.flash>0?PAL.white:PAL.snail;
  const dk=en.flash>0?PAL.white:PAL.snailDk;
  const lt=en.flash>0?PAL.white:PAL.snailLt;
  const body=en.flash>0?PAL.white:PAL.snailBody;
  const shakeX=(en.mode==='aim')?((((time*20)|0)&1)?1:-1):0;
  const hx=en.cdir&&en.cdir[0]!==0?en.cdir[0]:(player.x>en.x?1:-1);
  // cuerpo asomando
  ctx.fillStyle=body;
  ctx.fillRect(x+hx*4+shakeX,y-4,4,3);
  ctx.fillRect(x+hx*6+shakeX,y-6,1,2); ctx.fillRect(x+hx*4+shakeX,y-6,1,2); // cuernos
  // concha
  ctx.fillStyle=dk; ctx.fillRect(x-5+shakeX,y-9,10,9);
  ctx.fillStyle=sh; ctx.fillRect(x-4+shakeX,y-8,8,7);
  ctx.fillStyle=lt; ctx.fillRect(x-4+shakeX,y-8,3,2);
  ctx.fillStyle=dk; // espiral
  ctx.fillRect(x-2+shakeX,y-6,4,1); ctx.fillRect(x+1+shakeX,y-5,1,2);
  ctx.fillRect(x-2+shakeX,y-4,3,1); ctx.fillRect(x-2+shakeX,y-5,1,1);
  if(en.mode==='charge'){ // chispas al embestir
    ctx.fillStyle=PAL.white;
    ctx.fillRect(x-hx*6,y-2,1,1); ctx.fillRect(x-hx*7,y-4,1,1);
  }
}
function drawBoss(en){
  const x=Math.round(en.x), y=Math.round(en.y);
  if(en.bkind===1){ // POLILLA REINA
    const f=(((time*(en.bstate==='swoop'?16:9))|0)&1)===0;
    drawShadow(x,en.bstate==='tired'?y-1:PH-6,en.bstate==='tired'?16:10);
    const wing=en.flash>0?PAL.white:PAL.mothWing;
    const body=en.flash>0?PAL.white:PAL.moth;
    const dk=en.flash>0?PAL.white:PAL.mothDk;
    ctx.fillStyle=dk; // contorno alas
    if(f){ctx.fillRect(x-12,y-15,9,9);ctx.fillRect(x+3,y-15,9,9);}
    else{ctx.fillRect(x-14,y-11,11,6);ctx.fillRect(x+3,y-11,11,6);}
    ctx.fillStyle=wing;
    if(f){ctx.fillRect(x-11,y-14,7,7);ctx.fillRect(x+4,y-14,7,7);}
    else{ctx.fillRect(x-13,y-10,9,4);ctx.fillRect(x+4,y-10,9,4);}
    ctx.fillStyle=dk;
    if(!f){ctx.fillRect(x-10,y-9,2,2);ctx.fillRect(x+8,y-9,2,2);}
    else{ctx.fillRect(x-9,y-12,2,2);ctx.fillRect(x+7,y-12,2,2);}
    ctx.fillStyle=body; ctx.fillRect(x-2,y-14,4,14);
    ctx.fillStyle=dk;
    ctx.fillRect(x-2,y-2,4,2);
    ctx.fillRect(x-4,y-16,2,3); ctx.fillRect(x+2,y-16,2,3); // antenas
    if(en.flash<=0){
      ctx.fillStyle=(en.bstate==='tired')?PAL.black:PAL.capR;
      ctx.fillRect(x-2,y-12,2,2); ctx.fillRect(x+0,y-12,2,2);
    }
    ctx.fillStyle=PAL.gold; // corona
    ctx.fillRect(x-4,y-19,8,2);
    ctx.fillRect(x-4,y-21,2,2); ctx.fillRect(x-1,y-22,2,3); ctx.fillRect(x+2,y-21,2,2);
    if(en.bstate==='tired'&&(((time*4)|0)&1)){ // mareada
      drawText('!',x+8,y-20,PAL.uiGold,1);
    }
    return;
  }
  if(en.bkind===2){ // BROTE MADRE
    const open=en.bstate==='open';
    drawShadow(x,y-1,18);
    // monticulo y tallo grueso
    ctx.fillStyle=PAL.dirtDk; ctx.fillRect(x-8,y-3,16,4);
    ctx.fillStyle=PAL.dirt; ctx.fillRect(x-6,y-4,12,4);
    const plant=en.flash>0?PAL.white:PAL.plant;
    const dk=en.flash>0?PAL.white:PAL.plantDk;
    ctx.fillStyle=dk; ctx.fillRect(x-3,y-12,6,9);
    ctx.fillStyle=plant; ctx.fillRect(x-2,y-12,4,9);
    ctx.fillStyle=dk;
    ctx.fillRect(x-7,y-7,4,2); ctx.fillRect(x+3,y-9,4,2); // hojas
    // cabeza grande
    const hy=y-24;
    if(open){
      ctx.fillStyle=dk; ctx.fillRect(x-9,hy,18,13);
      ctx.fillStyle=plant; ctx.fillRect(x-8,hy,16,12);
      ctx.fillStyle=en.flash>0?PAL.white:PAL.plantMaw; ctx.fillRect(x-6,hy+3,12,8);
      ctx.fillStyle=en.flash>0?PAL.white:PAL.plantIn; ctx.fillRect(x-4,hy+5,8,5);
      // nucleo latiendo (punto debil visual)
      if(((time*5)|0)&1){ctx.fillStyle=PAL.gold;ctx.fillRect(x-1,hy+6,3,3);}
      ctx.fillStyle=PAL.white; // dientes
      for(let k=-6;k<6;k+=3)ctx.fillRect(x+k,hy+3,1,2);
      for(let k=-5;k<6;k+=3)ctx.fillRect(x+k,hy+9,1,2);
    } else {
      // capullo acorazado con nervios
      ctx.fillStyle=dk; ctx.fillRect(x-8,hy+1,16,12);
      ctx.fillStyle=plant; ctx.fillRect(x-7,hy+1,14,11);
      ctx.fillStyle=dk;
      ctx.fillRect(x-1,hy+1,2,11); ctx.fillRect(x-5,hy+2,1,9); ctx.fillRect(x+4,hy+2,1,9);
      ctx.fillStyle='#488850'; ctx.fillRect(x-7,hy+1,3,2);
      if(en.flash>0){ctx.fillStyle=PAL.white;ctx.fillRect(x-8,hy+1,16,12);}
    }
    ctx.fillStyle=PAL.gold; // corona
    ctx.fillRect(x-5,hy-3,10,2);
    ctx.fillRect(x-5,hy-5,2,2); ctx.fillRect(x-1,hy-6,2,3); ctx.fillRect(x+3,hy-5,2,2);
    return;
  }
  let s=(Math.sin(en.ph)>0)?1:0;
  if(en.bstate==='tele') s=(((time*16)|0)&1)?2:0;
  if(en.bstate==='dash') s=-1;
  drawShadow(x,y-1,22);
  const main=en.flash>0?PAL.white:PAL.moho;
  const dk=en.flash>0?PAL.white:PAL.mohoDk;
  const lt=en.flash>0?PAL.white:PAL.mohoLt;
  ctx.fillStyle=dk;
  ctx.fillRect(x-11-s, y-12+s, 22+s*2, 12-s);
  ctx.fillRect(x-9-s, y-14+s, 18+s*2, 2);
  ctx.fillStyle=main;
  ctx.fillRect(x-10-s, y-12+s, 20+s*2, 9-s);
  ctx.fillStyle=lt;
  ctx.fillRect(x-8-s,y-13+s,6,2); ctx.fillRect(x-9-s,y-10+s,2,4);
  ctx.fillRect(x-2,y-6,4,2); ctx.fillRect(x+5,y-9,3,3);
  // burbujas de moho que laten
  const bub=((time*3)|0)%3;
  ctx.fillStyle=lt;
  if(bub===0)ctx.fillRect(x-6,y-5,2,2);
  if(bub===1)ctx.fillRect(x+7,y-6,2,2);
  if(bub===2)ctx.fillRect(x+1,y-11+s,2,2);
  // goterones
  ctx.fillStyle=dk;
  ctx.fillRect(x-7,y-1,2,2+((time*2|0)&1)); ctx.fillRect(x+5,y-1,2,1+(((time*2+1)|0)&1));
  if(en.flash<=0){
    ctx.fillStyle=PAL.white; ctx.fillRect(x-6,y-10+s,3,3); ctx.fillRect(x+3,y-10+s,3,3);
    ctx.fillStyle=(en.bstate==='walk')?PAL.black:PAL.capR;
    ctx.fillRect(x-5,y-9+s,2,2); ctx.fillRect(x+4,y-9+s,2,2);
    if(en.spawned){ // fase 2: ceja enfadada
      ctx.fillStyle=dk;
      ctx.fillRect(x-7,y-12+s,4,1); ctx.fillRect(x+3,y-12+s,4,1);
    }
  }
  // corona del Rey
  ctx.fillStyle=PAL.gold;
  ctx.fillRect(x-5,y-17+s,10,2);
  ctx.fillRect(x-5,y-19+s,2,2); ctx.fillRect(x-1,y-20+s,2,3); ctx.fillRect(x+3,y-19+s,2,2);
  ctx.fillStyle=PAL.capR; ctx.fillRect(x-1,y-19+s,2,1); // joya
  ctx.fillStyle=PAL.goldDk; ctx.fillRect(x-5,y-16+s,10,1);
}
function drawSporeP(sp){
  const x=Math.round(sp.x),y=Math.round(sp.y);
  const f=((time*10)|0)&1;
  if(sp.bomb){
    ctx.fillStyle=PAL.sporeDk; ctx.fillRect(x-2,y-2,5,5);
    ctx.fillStyle=PAL.spore; ctx.fillRect(x-1,y-1,3,3);
    ctx.fillStyle=f?PAL.white:PAL.capR; ctx.fillRect(x,y-3,1,1); // mecha
    return;
  }
  if(sp.big){
    ctx.fillStyle=PAL.sporeDk; ctx.fillRect(x-2,y-2,5,5);
    ctx.fillStyle=PAL.spore; ctx.fillRect(x-1,y-2,3,5); ctx.fillRect(x-2,y-1,5,3);
    ctx.fillStyle=PAL.white; ctx.fillRect(x-1,y-1,1,1);
    ctx.fillStyle=PAL.sporeDk;
    if(f){ctx.fillRect(x-4,y,1,1);ctx.fillRect(x+3,y,1,1);}
    else{ctx.fillRect(x,y-4,1,1);ctx.fillRect(x,y+3,1,1);}
    return;
  }
  ctx.fillStyle=PAL.spore; ctx.fillRect(x-1,y-1,2,2);
  ctx.fillStyle=PAL.sporeDk;
  if(f){ctx.fillRect(x-2,y-1,1,1);ctx.fillRect(x+1,y,1,1);}
  else{ctx.fillRect(x,y-2,1,1);ctx.fillRect(x-1,y+1,1,1);}
}
function drawChest(ch){
  const x=ch.tx*TS+2, y=ch.ty*TS+3;
  drawShadow(ch.tx*TS+8,ch.ty*TS+13,12);
  if(ch.open){
    // tapa abierta
    ctx.fillStyle=PAL.dirtDk; ctx.fillRect(x,y-4,12,3);
    ctx.fillStyle=PAL.dirt; ctx.fillRect(x+1,y-4,10,2);
    ctx.fillStyle=PAL.black; ctx.fillRect(x+1,y,10,6);
    ctx.fillStyle=PAL.dirtDk; ctx.fillRect(x,y,12,10);
    ctx.fillStyle=PAL.black; ctx.fillRect(x+2,y+1,8,4);
    if(((time*4)|0)&1){ctx.fillStyle=PAL.gold;ctx.fillRect(x+5,y+2,2,1);}
  } else {
    ctx.fillStyle=PAL.dirtDk; ctx.fillRect(x,y,12,10);
    ctx.fillStyle=PAL.dirt; ctx.fillRect(x+1,y+1,10,8);
    ctx.fillStyle='#8c6438'; ctx.fillRect(x+1,y+1,10,2);
    ctx.fillStyle=PAL.goldDk; ctx.fillRect(x,y+4,12,2);
    ctx.fillStyle=PAL.gold; ctx.fillRect(x+5,y+3,2,4); // cerradura
    ctx.fillStyle=PAL.black; ctx.fillRect(x+5,y+5,2,1);
    ctx.fillStyle='#f8f0c0'; ctx.fillRect(x+1,y+1,2,1);
  }
}
function drawDart(dr){
  const x=Math.round(dr.x),y=Math.round(dr.y);
  ctx.fillStyle=PAL.dart; ctx.fillRect(x-1,y-1,2,2);
  ctx.fillStyle=PAL.dartLt;
  ctx.fillRect(x-Math.sign(dr.dx),y-Math.sign(dr.dy),1,1);
}
function drawHeartAt(x,y,gold){
  ctx.fillStyle=gold?PAL.gold:PAL.heart;
  ctx.fillRect(x,y+1,7,2);ctx.fillRect(x+1,y,2,1);ctx.fillRect(x+4,y,2,1);
  ctx.fillRect(x+1,y+3,5,1);ctx.fillRect(x+2,y+4,3,1);ctx.fillRect(x+3,y+5,1,1);
  ctx.fillStyle=PAL.white;ctx.fillRect(x+1,y+1,1,1);
}
function drawHeartPx(x,y,full){
  ctx.fillStyle=full?PAL.heart:PAL.black;
  ctx.fillRect(x,y+1,7,3); ctx.fillRect(x+1,y,2,1); ctx.fillRect(x+4,y,2,1);
  ctx.fillRect(x+1,y+4,5,1); ctx.fillRect(x+2,y+5,3,1); ctx.fillRect(x+3,y+6,1,1);
  if(full){ctx.fillStyle=PAL.white;ctx.fillRect(x+1,y+1,1,1);}
  else{ctx.fillStyle='#503038';ctx.fillRect(x+1,y+2,5,2);}
}

/* ---------- Acciones ---------- */
