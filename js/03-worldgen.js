'use strict';
/* ============================================================
   SPORE QUEST · capa 03-worldgen
   rng determinista por sala, tiles, generacion de salas y su render
   ============================================================ */
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;}}
let runSeed=(Math.random()*1e9)|0;
function roomSeed(rx,ry){
  let h=(rx*374761393 + ry*668265263) ^ runSeed;
  h=(h^(h>>>13))*1274126177; return (h^(h>>>16))>>>0;
}
function tRnd(seed,tx,ty){
  let h=(seed^(tx*928371+ty*123457))>>>0; h=(h^(h>>>13))*0x5bd1e995; return ((h^(h>>>15))>>>0)/4294967296;
}

/* ---------- Tiles ---------- */
const T_G=0,T_TREE=1,T_PATH=2,T_BUSH=3,T_WATER=4,T_FLOW=5,T_STELE=6;
function isSolidTile(t){
  if(t===T_WATER) return season!==3; // en invierno se congela
  return t===T_TREE||t===T_BUSH||t===T_STELE;
}

function genRoom(rx,ry){
  const seed=roomSeed(rx,ry), rnd=mulberry32(seed);
  const t=new Array(COLS*ROWS).fill(T_G);
  const inLaneX=c=>(c===4||c===5), inLaneY=r=>(r===3||r===4);
  for(let c=0;c<COLS;c++){ if(!inLaneX(c)){t[c]=T_TREE; t[(ROWS-1)*COLS+c]=T_TREE;} }
  for(let r=0;r<ROWS;r++){ if(!inLaneY(r)){t[r*COLS]=T_TREE; t[r*COLS+COLS-1]=T_TREE;} }
  for(let c=0;c<COLS;c++)for(const r of [3,4]) if(rnd()<0.8) t[r*COLS+c]=T_PATH;
  for(let r=0;r<ROWS;r++)for(const c of [4,5]) if(rnd()<0.8) t[r*COLS+c]=T_PATH;
  for(let r=1;r<ROWS-1;r++)for(let c=1;c<COLS-1;c++){
    if(inLaneX(c)||inLaneY(r)) continue;
    const v=rnd();
    if(v<0.09) t[r*COLS+c]=T_TREE;
    else if(v<0.16) t[r*COLS+c]=T_BUSH;
    else if(v<0.22) t[r*COLS+c]=T_FLOW;
  }
  if(rnd()<0.32){
    const pc=1+((rnd()*(COLS-4))|0), pr=1+((rnd()*(ROWS-4))|0);
    let ok=true;
    for(let r=pr;r<pr+2;r++)for(let c=pc;c<pc+2;c++) if(inLaneX(c)||inLaneY(r)) ok=false;
    if(ok) for(let r=pr;r<pr+2;r++)for(let c=pc;c<pc+2;c++) t[r*COLS+c]=T_WATER;
  }
  // estela con lore (~30% de salas)
  let stele=null;
  if(rnd()<0.30){
    for(let tries=0;tries<30 && !stele;tries++){
      const c=1+((rnd()*(COLS-2))|0), r=1+((rnd()*(ROWS-2))|0);
      if(inLaneX(c)||inLaneY(r)) continue;
      const tv=t[r*COLS+c];
      if(tv===T_G||tv===T_FLOW){ t[r*COLS+c]=T_STELE; stele={tx:c,ty:r,lore:seed%LORE.length}; }
    }
  }
  return {tiles:t, seed, cleared:false, stele, boss:false};
}
function makeTreasure(room){
  const spots=[[4,3],[5,3],[4,4],[5,4],[3,3],[6,3],[3,4],[6,4]];
  for(const [c,r] of spots) room.tiles[r*COLS+c]=T_PATH;
  room.chest={tx:4,ty:3,open:false};
  room.treasure=true; room.cleared=true; room.stele=null;
}
function makeFountain(room){
  for(let r=1;r<=4;r++)for(let c=1;c<=4;c++){
    const t=room.tiles[r*COLS+c];
    if(t===T_TREE||t===T_BUSH||t===T_STELE) room.tiles[r*COLS+c]=T_G;
  }
  for(let r=2;r<=3;r++)for(let c=2;c<=3;c++) room.tiles[r*COLS+c]=T_WATER;
  room.fountain={used:false}; room.cleared=true; room.stele=null;
}
function makeBossArena(room){
  const rnd=mulberry32(room.seed^0xB055);
  for(let r=1;r<ROWS-1;r++)for(let c=1;c<COLS-1;c++){
    const lane=(c===4||c===5)||(r===3||r===4);
    room.tiles[r*COLS+c]= lane&&rnd()<0.8 ? T_PATH : T_G;
  }
  room.tiles[1*COLS+1]=T_FLOW; room.tiles[1*COLS+8]=T_FLOW;
  room.tiles[6*COLS+1]=T_FLOW; room.tiles[6*COLS+8]=T_FLOW;
  room.stele=null; room.boss=true;
}

/* ---------- Dibujo de tiles ---------- */
function drawTile(tile,tx,ty,seed,time){
  const x=tx*TS, y=ty*TS, r=tRnd(seed,tx,ty), P=CP();
  ctx.fillStyle=((tx+ty)&1)?P.grass:P.grass2;
  ctx.fillRect(x,y,TS,TS);
  ctx.fillStyle=P.grassDk;
  ctx.fillRect(x+3+((r*9)|0), y+4+((r*13)%8|0), 2,1);
  ctx.fillRect(x+10-((r*5)|0), y+11, 2,1);
  if(tile===T_PATH){
    ctx.fillStyle=P.path; ctx.fillRect(x,y,TS,TS);
    ctx.fillStyle=P.pathDk;
    ctx.fillRect(x+2+((r*10)|0),y+3,2,2); ctx.fillRect(x+9,y+9+((r*4)|0),2,2);
    ctx.fillRect(x+4,y+12,1,1);
  } else if(tile===T_TREE){
    ctx.fillStyle=P.trunk; ctx.fillRect(x+6,y+12,4,4);
    ctx.fillStyle=P.treeDk;
    ctx.fillRect(x+1,y+3,14,10); ctx.fillRect(x+3,y+1,10,14);
    ctx.fillStyle=P.tree;
    ctx.fillRect(x+2,y+3,12,8); ctx.fillRect(x+4,y+1,8,12);
    ctx.fillStyle=P.treeLt;
    ctx.fillRect(x+4,y+2,5,2); ctx.fillRect(x+3,y+4,2,3);
    if(season===3){ctx.fillRect(x+9,y+2,4,2);ctx.fillRect(x+11,y+4,3,1);}
    ctx.fillStyle=P.treeDk;
    ctx.fillRect(x+7,y+7,3,2); ctx.fillRect(x+4,y+9,2,2);
  } else if(tile===T_BUSH){
    ctx.fillStyle=P.bushDk;
    ctx.fillRect(x+2,y+5,12,9); ctx.fillRect(x+4,y+3,8,12);
    ctx.fillStyle=P.bush;
    ctx.fillRect(x+3,y+5,10,7); ctx.fillRect(x+5,y+3,6,10);
    ctx.fillStyle=P.treeLt; ctx.fillRect(x+5,y+4,4,2);
    ctx.fillStyle=P.bushDk; ctx.fillRect(x+7,y+8,3,2);
  } else if(tile===T_WATER){
    if(season===3){ // hielo transitable
      ctx.fillStyle=P.water; ctx.fillRect(x,y,TS,TS);
      ctx.fillStyle=P.waterLt;
      ctx.fillRect(x+2,y+2,5,1); ctx.fillRect(x+6,y+3,1,3);
      ctx.fillRect(x+9,y+9,4,1); ctx.fillRect(x+10,y+10,1,3);
      ctx.fillStyle='#88b8cc'; ctx.fillRect(x,y+15,TS,1); ctx.fillRect(x+15,y,1,TS);
    } else {
      ctx.fillStyle=P.water; ctx.fillRect(x,y,TS,TS);
      const f=((time*2)|0)&1;
      ctx.fillStyle=P.waterLt;
      ctx.fillRect(x+2,y+3+f,4,1); ctx.fillRect(x+9,y+8-f,4,1);
      ctx.fillRect(x+5,y+11+f,3,1);
    }
  } else if(tile===T_FLOW){
    if(season===3){
      ctx.fillStyle=PAL.white; ctx.fillRect(x+5,y+9,5,3); ctx.fillRect(x+6,y+8,3,1);
      ctx.fillStyle=P.grassDk; ctx.fillRect(x+5,y+12,5,1);
    } else {
      const fx=x+3+((r*7)|0), fy=y+4+((r*11)%6|0);
      ctx.fillStyle=(r<0.5)?P.flow:PAL.white;
      ctx.fillRect(fx,fy-1,3,1); ctx.fillRect(fx,fy+1,3,1);
      ctx.fillRect(fx-1,fy,1,1); ctx.fillRect(fx+3,fy,1,1);
      ctx.fillStyle=PAL.uiGold; ctx.fillRect(fx+1,fy,1,1);
    }
  } else if(tile===T_STELE){
    ctx.fillStyle=PAL.stoneDk; ctx.fillRect(x+3,y+3,10,12);
    ctx.fillStyle=PAL.stone; ctx.fillRect(x+4,y+3,8,11);
    ctx.fillStyle=PAL.stoneLt; ctx.fillRect(x+4,y+3,8,1); ctx.fillRect(x+4,y+3,1,10);
    ctx.fillStyle=PAL.uiGold;
    ctx.fillRect(x+7,y+5,2,2); ctx.fillRect(x+6,y+8,1,3); ctx.fillRect(x+9,y+8,1,3); ctx.fillRect(x+7,y+9,2,1);
  }
}
function renderRoomTiles(room,time){
  for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)
    drawTile(room.tiles[r*COLS+c],c,r,room.seed,time);
}
function drawRoots(){ // raices sellando puertas en sala de boss
  const gaps=[[4,0],[5,0],[4,ROWS-1],[5,ROWS-1],[0,3],[0,4],[COLS-1,3],[COLS-1,4]];
  for(const [c,r] of gaps){
    const x=c*TS,y=r*TS;
    ctx.fillStyle=PAL.mohoDk; ctx.fillRect(x,y,TS,TS);
    ctx.fillStyle=PAL.moho;
    ctx.fillRect(x+2,y,3,TS); ctx.fillRect(x+8,y,3,TS);
    ctx.fillRect(x,y+4,TS,2); ctx.fillRect(x,y+10,TS,3);
    ctx.fillStyle=PAL.mohoLt;
    ctx.fillRect(x+3,y+2,1,4); ctx.fillRect(x+9,y+7,1,4); ctx.fillRect(x+5,y+11,4,1);
  }
}

/* ============================================================
   AUDIO — emulacion de los 4 canales de la Game Boy:
   pulso 1 (melodia, duty 25%), pulso 2 (armonia, duty 50%),
   onda/triangulo (bajo) y ruido (percusion). Con vibrato,
   eco de melodia y scheduler con lookahead.
   ============================================================ */
let AC=null, muted=false, musGain=null, sfxGain=null, noiseBuf=null;
const pulseCache={};
