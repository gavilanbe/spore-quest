'use strict';
/* ============================================================
   SPORE QUEST · capa 08-state
   estado global de la partida, salas visitadas y record
   ============================================================ */
let state='boot';
let time=0, banner=null, introPage=0, readLore=null, shake=0;
const rooms=new Map(); const visited=new Set();
let roomX=0, roomY=0, room=null;
let enemies=[], spores=[], parts=[], drops=[], darts=[];
let kills=0, best=0;
let slide=null;
let skillChoices=[], skillCursor=0, dieT=0, diePoof=false;
const bgA=document.createElement('canvas'), bgB=document.createElement('canvas');
bgA.width=bgB.width=W; bgA.height=bgB.height=PH;

const player={x:80,y:76,dir:'down',hp:3,maxHp:3,iframes:0,atkT:0,burstCd:0,
  kbx:0,kby:0,kbt:0,walkT:0,moving:false,
  spd:58,projSpd:130,projLife:0.62,dmg:1,twin:false,pierce:0,cdMul:1,
  skill:null,skillLv:0,charge:0,charging:false,dinged:false,noSkillHint:0,
  idleT:0,blinkT:3,blinkOn:0,celebT:0,zzzT:1.5,
  lv:1,xp:0,xpNext:8,up:{feet:0,wind:0,storm:0,fat:0,lungs:0}};
function chargeNeed(){ return 0.7*Math.pow(0.72,player.up.lungs); }

/* record persistente (solo si el runtime lo soporta) */
try{
  if(window.storage&&window.storage.get){
    window.storage.get('sq-best').then(r=>{if(r&&r.value)best=parseInt(r.value)||0;}).catch(()=>{});
  }
}catch(e){}
function saveBest(){
  if(visited.size>best){
    best=visited.size;
    try{ if(window.storage&&window.storage.set) window.storage.set('sq-best',String(best)).catch(()=>{}); }catch(e){}
  }
}

function getRoom(rx,ry){
  const k=rx+','+ry;
  if(!rooms.has(k)) rooms.set(k,genRoom(rx,ry));
  return rooms.get(k);
}
function depth(){ return visited.size; }
function bossLock(){ return room && room.boss && !room.cleared; }

