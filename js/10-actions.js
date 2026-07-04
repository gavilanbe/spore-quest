'use strict';
/* ============================================================
   SPORE QUEST · capa 10-actions
   acciones: disparo, carga, habilidades, dano, loot y transiciones
   ============================================================ */
const DIRV={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]};
function shoot(){
  const p=player, v=DIRV[p.dir];
  const vx=v[0]*p.projSpd, vy=v[1]*p.projSpd;
  if(p.twin){
    const px=-v[1]*3, py=v[0]*3;
    spores.push({x:p.x+px,y:p.y-6+py,dx:vx,dy:vy,life:p.projLife,pierce:p.pierce,dmg:p.dmg});
    spores.push({x:p.x-px,y:p.y-6-py,dx:vx,dy:vy,life:p.projLife,pierce:p.pierce,dmg:p.dmg});
  } else {
    spores.push({x:p.x,y:p.y-6,dx:vx,dy:vy,life:p.projLife,pierce:p.pierce,dmg:p.dmg});
  }
  p.atkT=0.28; S.shoot();
}
function fireCharged(){
  const p=player, v=DIRV[p.dir];
  spores.push({x:p.x,y:p.y-6,dx:v[0]*p.projSpd*0.85,dy:v[1]*p.projSpd*0.85,
    life:p.projLife*1.25,pierce:p.pierce+2,dmg:p.dmg+2,big:true});
  p.atkT=0.32; S.bigShot(); poof(p.x,p.y-6,PAL.spore,5);
}
function explode(x,y,r,dmg){
  shake=Math.max(shake,0.2);
  poof(x,y,PAL.spore,10); poof(x,y,PAL.gold,8); poof(x,y,PAL.white,6);
  for(let j=enemies.length-1;j>=0;j--){
    const en=enemies[j];
    if(en.type===4&&en.mode==='buried')continue;
    if(bossInvuln(en))continue;
    const cy=en.type===2?en.y-7:en.y-4;
    if(Math.hypot(x-en.x,y-cy)<r){
      en.hp-=dmg; en.flash=0.15;
      if(en.hp<=0) killEnemy(j);
      else S.hit();
    }
  }
  for(let i=darts.length-1;i>=0;i--){
    if(Math.hypot(x-darts[i].x,y-darts[i].y)<r){poof(darts[i].x,darts[i].y,PAL.dartLt,3);darts.splice(i,1);}
  }
  S.boom();
}
function useSkill(){
  const p=player, sk=p.skill, lv2=p.skillLv>=2;
  if(!sk)return;
  if(sk==='rafaga'){
    const n=lv2?12:8;
    for(let i=0;i<n;i++){
      const a=i*Math.PI*2/n;
      spores.push({x:p.x,y:p.y-6,dx:Math.cos(a)*(p.projSpd-20),dy:Math.sin(a)*(p.projSpd-20),
        life:p.projLife*0.8,pierce:p.pierce+(lv2?1:0),dmg:p.dmg});
    }
    S.burst();
  } else if(sk==='estornudo'){
    const v=DIRV[p.dir], base=Math.atan2(v[1],v[0]);
    const half=lv2?3:2;
    for(let i=-half;i<=half;i++){
      const a=base+i*0.22;
      spores.push({x:p.x,y:p.y-6,dx:Math.cos(a)*(p.projSpd+10),dy:Math.sin(a)*(p.projSpd+10),
        life:lv2?0.38:0.3,pierce:p.pierce,dmg:p.dmg+(lv2?2:1)});
    }
    S.burst(); shake=Math.max(shake,0.08);
  } else if(sk==='anillo'){
    const n=lv2?5:3;
    for(let i=0;i<n;i++){
      spores.push({orbit:true,ang:i*Math.PI*2/n,x:p.x,y:p.y-6,dx:0,dy:0,life:lv2?6.2:4.2,pierce:0,dmg:p.dmg,cool:0});
    }
    S.relic();
  } else if(sk==='bomba'){
    const v=DIRV[p.dir];
    spores.push({bomb:true,x:p.x,y:p.y-6,dx:v[0]*85,dy:v[1]*85,life:0.5,pierce:0,dmg:p.dmg+2,cluster:lv2});
    S.shoot();
  }
  p.atkT=0.3; p.burstCd=skillCd();
}
function cutBush(tx,ty){
  room.tiles[ty*COLS+tx]=T_G;
  poof(tx*TS+8,ty*TS+8,CP().bush,7);
  const r=Math.random();
  if(r<0.30)drops.push({x:tx*TS+8,y:ty*TS+8,t:0,kind:'gold'});
  else if(r<0.36)drops.push({x:tx*TS+8,y:ty*TS+8,t:0,kind:'heart'});
  S.hit();
}
function poof(x,y,color,n){
  for(let i=0;i<n;i++){
    const a=Math.random()*6.28, sp=20+Math.random()*40;
    parts.push({x,y,dx:Math.cos(a)*sp,dy:Math.sin(a)*sp,life:0.25+Math.random()*0.2,color});
  }
}
function fireDart(x,y,tx,ty,spd){
  const d=Math.hypot(tx-x,ty-y)||1;
  darts.push({x,y,dx:(tx-x)/d*spd,dy:(ty-y)/d*spd,life:2});
  S.dartS();
}
function killEnemy(j){
  const en=enemies[j];
  const isBoss=en.type===2;
  const col=isBoss?PAL.moho:(en.type===3?PAL.moth:en.type===4?PAL.plant:en.type===5?PAL.snail:(en.type?PAL.slimeB:PAL.slimeA));
  poof(en.x,en.y-4,col,isBoss?22:10);
  dropLoot(en.x,en.y-2,isBoss,en.type);
  enemies.splice(j,1); kills++;
  hitStop=Math.max(hitStop,isBoss?0.12:0.05);
  parts.push({ring:true,x:en.x,y:en.y-4,r:2,life:0.22,color:isBoss?PAL.gold:PAL.white});
  if(isBoss){
    banner={text:BOSS_LINES[(Math.random()*BOSS_LINES.length)|0], t:2.6};
    shake=Math.max(shake,0.4); buzz([90,60,90]);
    S.bossDie();
  } else S.die();
  if(enemies.length===0){
    room.cleared=true;
    player.celebT=isBoss?1.6:1.1;
    if(!isBoss)S.clear();
  }
}
function dropLoot(x,y,isBoss,type){
  if(isBoss){
    drops.push({x,y,t:0,kind:'cont'});
    drops.push({x:x,y:y-14,t:0,kind:'relic'});
    for(let i=0;i<8;i++){
      const a=Math.random()*6.28;
      drops.push({x:x+Math.cos(a)*12,y:y+Math.sin(a)*10,t:0,kind:'gold'});
    }
    return;
  }
  const bonus=(type===4||type===5)?1:0;
  const n=1+bonus+((Math.random()*2)|0)+(Math.random()<Math.min(0.4,depth()*0.03)?1:0);
  for(let i=0;i<n;i++){
    const a=Math.random()*6.28;
    drops.push({x:x+Math.cos(a)*6,y:y+Math.sin(a)*5,t:0,kind:'gold'});
  }
  if(Math.random()<0.15) drops.push({x,y,t:0,kind:'heart'});
}
function hurtPlayer(fromX,fromY,dmg){
  if(player.iframes>0)return;
  player.hp-=(dmg||1); player.iframes=1.1;
  const d=Math.hypot(player.x-fromX,player.y-fromY)||1;
  player.kbx=(player.x-fromX)/d*130; player.kby=(player.y-fromY)/d*130; player.kbt=0.18;
  shake=Math.max(shake,0.15); buzz(60); hitStop=Math.max(hitStop,0.08); hurtVigT=0.32;
  S.hurt(); poof(player.x,player.y-8,PAL.capR,6);
  if(player.hp<=0){
    state='dying'; dieT=1.7; diePoof=false; buzz(180);
    player.iframes=99; player.charging=false; player.charge=0;
    shake=Math.max(shake,0.3);
  }
}

/* ---------- Transicion de sala ---------- */
function startSlide(dx,dy){
  const oldRoom=room;
  const nx=roomX+dx, ny=roomY+dy;
  const k=nx+','+ny;
  const newRoom=getRoom(nx,ny);
  const isNew=!visited.has(k);
  const count=isNew?visited.size+1:visited.size;
  if(isNew && newRoom.order===undefined){
    newRoom.order=count;
    if(count%BOSS_EVERY===0 && !newRoom.cleared) makeBossArena(newRoom);
    else {
      const r=mulberry32(newRoom.seed^0x7777)();
      if(r<0.10) makeTreasure(newRoom);
      else if(r<0.18) makeFountain(newRoom);
    }
  }
  const newSeason=seasonForCount(count);
  const realCtx=ctx, oldSeason=season;
  let c=bgA.getContext('2d'); c.imageSmoothingEnabled=false;
  ctx=c; renderRoomTiles(oldRoom,time);
  c=bgB.getContext('2d'); c.imageSmoothingEnabled=false;
  ctx=c; season=newSeason; renderRoomTiles(newRoom,time); season=oldSeason;
  ctx=realCtx;
  let ex=player.x, ey=player.y;
  if(dx===1) ex=10; if(dx===-1) ex=150;
  if(dy===1) ey=15; if(dy===-1) ey=121;
  slide={dx,dy,prog:0,ox:player.x,oy:player.y,ex,ey,nx,ny,newRoom,newSeason};
  spores=[]; drops=[]; parts=[]; darts=[];
  player.charging=false; player.charge=0;
  state='slide'; S.door();
}
function finishSlide(){
  roomX=slide.nx; roomY=slide.ny; room=slide.newRoom;
  player.x=slide.ex; player.y=slide.ey;
  visited.add(roomX+','+roomY);
  if(slide.newSeason!==season){
    season=slide.newSeason;
    banner={text:'LLEGA '+CP().art, t:2.4};
    S.seasonJ();
  }
  spawnEnemies();
  if(room.fountain&&!room.fountain.used&&player.hp<player.maxHp){
    player.hp=player.maxHp; room.fountain.used=true;
    banner={text:'EL AGUA SAGRADA TE RESTAURA',t:2.4};
    poof(player.x,player.y-8,PAL.white,8); poof(player.x,player.y-8,'#a8d8e8',6);
    player.celebT=1; S.pick();
  }
  slide=null; state='play';
}

/* ---------- Reset ---------- */
function newRun(){
  runSeed=(Math.random()*1e9)|0;
  rooms.clear(); visited.clear(); kills=0; season=0; banner=null; shake=0;
  roomX=0;roomY=0; room=getRoom(0,0); room.order=1; visited.add('0,0');
  // estela tutorial garantizada en la sala inicial
  if(room.tiles[2*COLS+2]!==T_TREE){
    room.tiles[2*COLS+2]=T_STELE;
    room.stele={tx:2,ty:2,lore:TUT_LORE};
  }
  const p=player;
  p.x=80;p.y=76;p.dir='down';p.hp=3;p.maxHp=3;
  p.iframes=0;p.atkT=0;p.burstCd=0;p.kbt=0;
  p.spd=58;p.projSpd=130;p.projLife=0.62;p.dmg=1;p.twin=false;p.pierce=0;p.cdMul=1;
  p.skill=null;p.skillLv=0;p.charge=0;p.charging=false;p.dinged=false;p.noSkillHint=0;
  p.idleT=0;p.blinkT=3;p.blinkOn=0;p.celebT=0;p.zzzT=1.5;
  p.lv=1;p.xp=0;p.xpNext=8;p.up={feet:0,wind:0,storm:0,fat:0,lungs:0};
  enemies=[];spores=[];parts=[];drops=[];darts=[];
  spawnEnemies();
  introPage=0; state='intro'; S.start();
}

/* ---------- Update ---------- */
function nearStele(){
  if(!room||!room.stele)return false;
  const sx=room.stele.tx*TS+8, sy=room.stele.ty*TS+10;
  return Math.hypot(player.x-sx,(player.y-4)-sy)<=20;
}
function nearChest(){
  if(!room||!room.chest||room.chest.open)return false;
  const cx=room.chest.tx*TS+8, cy=room.chest.ty*TS+10;
  return Math.hypot(player.x-cx,(player.y-4)-cy)<=20;
}
function openChest(){
  const ch=room.chest; ch.open=true;
  const cx=ch.tx*TS+8, cy=ch.ty*TS+10;
  for(let i=0;i<5;i++){
    const a=Math.random()*6.28;
    drops.push({x:cx+Math.cos(a)*10,y:cy+Math.sin(a)*8,t:0,kind:'gold'});
  }
  drops.push({x:cx,y:cy+8,t:0,kind:'heart'});
  if(depth()>6&&Math.random()<0.3) drops.push({x:cx,y:cy-6,t:0,kind:'cont'});
  banner={text:'TESORO DEL MICELIO',t:2.2};
  player.celebT=1.1; poof(cx,cy,PAL.gold,12);
  S.clear(); buzz(40);
}
