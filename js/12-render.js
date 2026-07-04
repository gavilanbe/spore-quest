'use strict';
/* ============================================================
   SPORE QUEST · capa 12-render
   render(): HUD, playfield, portada, pausa, menus y overlays
   ============================================================ */
function drawHUD(){
  ctx.fillStyle=PAL.black; ctx.fillRect(0,0,W,HUD);
  for(let i=0;i<player.maxHp;i++) drawHeartPx(3+i*9,1,i<player.hp);
  const st='SALA '+visited.size;
  drawText(st, W-3-textW(st,1), 2, PAL.uiGold,1);
  // LV + barra XP
  drawText('LV'+player.lv,3,10,PAL.spore,1);
  const bx=3+textW('LV'+player.lv,1)+4;
  ctx.fillStyle='#203828'; ctx.fillRect(bx,11,30,3);
  ctx.fillStyle=PAL.gold;
  ctx.fillRect(bx,11,Math.max(0,Math.min(30,Math.round(30*player.xp/player.xpNext))),3);
  // cooldown B
  drawText('B',W-30,10,player.skill?PAL.white:'#4a5a50',1);
  ctx.fillStyle='#304038'; ctx.fillRect(W-24,11,20,3);
  if(player.skill){
    ctx.fillStyle=player.burstCd<=0?PAL.spore:PAL.sporeDk;
    const cdm=skillCd()||1;
    ctx.fillRect(W-24,11,Math.round(20*(1-player.burstCd/cdm)),3);
    if(player.skillLv>=2){ctx.fillStyle=PAL.gold;ctx.fillRect(W-4,11,2,3);}
  } else if(((time*2)|0)&1){
    drawText('?',W-16,10,'#4a5a50',1);
  }
}
function drawPlayer(){
  const p=player;
  let deflate=0;
  if(state==='dying'){
    const t=1.7-dieT;
    if(t>0.4) deflate=Math.min(4,(t-0.4)/0.8*4);
    drawShroom(p.x,p.y,{dir:'down',face:'hurt',squash:t<0.4,deflate,e:0});
    return;
  }
  const hurtFace=p.iframes>0.75;
  if(p.iframes>0 && !hurtFace && (((time*14)|0)&1)) return; // parpadeo de invulnerabilidad
  let e=(p.atkT<=0 && !p.charging && Math.sin(time*(p.idleT>6?1.6:3.2))>0)?1:0;
  let face='normal', bob=0, squash=false, tremble=false, cheeks=false, ready=false;
  if(p.atkT>0.16) e=2;
  if(p.charging){
    const c=Math.min(1,p.charge/chargeNeed());
    e=Math.max(e,Math.round(c*3));
    cheeks=true;
    if(c>=1){face='strain';tremble=true;ready=true;}
  }
  if(p.moving) bob=((p.walkT|0)&1)?-1:0;
  if(hurtFace){face='hurt';squash=true;}
  else if(!p.charging){
    if(p.atkT>0.16) face='shout';
    else if(p.celebT>0){face='happy'; bob=-(((p.celebT*9)|0)&1)*2;}
    else if(p.idleT>6) face='sleep';
    else if(p.blinkOn>0) face='blink';
  }
  drawShroom(p.x,p.y,{
    dir:p.dir, e, face, bob, squash, tremble, cheeks, ready,
    moving:p.moving, step:((p.walkT|0)&1),
  });
}
function drawTextBox(lines){
  const bh=12+lines.length*7;
  const by=H-bh-3;
  ctx.fillStyle=PAL.black; ctx.fillRect(3,by,W-6,bh);
  ctx.fillStyle=PAL.uiGold;
  ctx.fillRect(3,by,W-6,1); ctx.fillRect(3,by+bh-1,W-6,1);
  ctx.fillRect(3,by,1,bh); ctx.fillRect(W-4,by,1,bh);
  for(let i=0;i<lines.length;i++) drawText(lines[i],8,by+6+i*7,PAL.white,1);
  if(((time*2)|0)&1) drawText('A',W-12,by+bh-8,PAL.uiGold,1);
}
function drawBanner(){
  if(!banner)return;
  const tw=textW(banner.text,1);
  const bx=(W-tw)/2-5, by=30;
  ctx.fillStyle=PAL.black; ctx.fillRect(bx,by,tw+10,13);
  ctx.fillStyle=PAL.uiGold; ctx.fillRect(bx,by,tw+10,1); ctx.fillRect(bx,by+12,tw+10,1);
  drawText(banner.text,(W-tw)/2,by+4,PAL.uiGold,1);
}
function renderPlayfield(){
  drawHUD();
  ctx.save();
  const shx=shake>0?((Math.random()*3)|0)-1:0, shy=shake>0?((Math.random()*3)|0)-1:0;
  ctx.translate(shx,HUD+shy);
  renderRoomTiles(room,time);
  if(bossLock()) drawRoots();
  for(const h of drops){
    const bob=Math.round(Math.sin(h.t*5));
    const blink=h.t>9&&(((time*8)|0)&1);
    if(blink)continue;
    if(h.kind==='gold'){
      const f=((time*6+h.x)|0)&1;
      ctx.fillStyle=f?PAL.gold:PAL.goldDk;
      ctx.fillRect(Math.round(h.x)-1,Math.round(h.y)-1+bob,3,3);
      ctx.fillStyle=PAL.white; ctx.fillRect(Math.round(h.x)-1,Math.round(h.y)-1+bob,1,1);
    } else if(h.kind==='cont'){
      drawHeartAt(Math.round(h.x)-3,Math.round(h.y)-3+bob,true);
    } else if(h.kind==='relic'){
      const x=Math.round(h.x),y=Math.round(h.y)+bob;
      ctx.fillStyle=PAL.mothDk; ctx.fillRect(x-3,y-3,6,6);
      ctx.fillStyle=PAL.dartLt; ctx.fillRect(x-2,y-2,4,4);
      ctx.fillStyle=PAL.white; ctx.fillRect(x-1,y-2,1,1);
      ctx.fillStyle=PAL.gold;
      if(((time*4)|0)&1){ctx.fillRect(x-4,y,1,1);ctx.fillRect(x+3,y,1,1);}
      else{ctx.fillRect(x,y-4,1,1);ctx.fillRect(x,y+3,1,1);}
    } else {
      drawHeartAt(Math.round(h.x)-3,Math.round(h.y)-3+bob,false);
    }
  }
  if(room.chest) drawChest(room.chest);
  if(room.fountain&&!room.fountain.used){ // destellos del agua sagrada
    const fparks=[[40,40],[56,36],[48,56],[36,52]];
    const fi=((time*3)|0)%fparks.length;
    ctx.fillStyle=PAL.white;
    ctx.fillRect(fparks[fi][0]-1,fparks[fi][1],3,1);
    ctx.fillRect(fparks[fi][0],fparks[fi][1]-1,1,3);
  }
  // orden de dibujo: brotes (suelo), caracoles y limos, jugador, boss, polillas (aire)
  for(const en of enemies) if(en.type===4) drawBrote(en);
  for(const en of enemies) if(en.type===5) drawSnail(en);
  for(const en of enemies) if(en.type===0||en.type===1) drawSlime(en);
  drawPlayer();
  for(const en of enemies) if(en.type===2) drawBoss(en);
  for(const en of enemies) if(en.type===3) drawMoth(en);
  if(room&&room.stele&&nearStele()&&(((time*2)|0)&1)){
    drawText('A',room.stele.tx*TS+6,room.stele.ty*TS-6,PAL.white,1);
  }
  if(nearChest()&&(((time*2)|0)&1)){
    drawText('A',room.chest.tx*TS+6,room.chest.ty*TS-8,PAL.white,1);
  }
  for(const sp of spores) drawSporeP(sp);
  for(const dr of darts) drawDart(dr);
  for(const pa of parts){
    if(pa.z){ drawText('Z',Math.round(pa.x),Math.round(pa.y),PAL.white,1); continue; }
    if(pa.ring){
      const r=Math.round(pa.r), px2=Math.round(pa.x), py2=Math.round(pa.y);
      ctx.fillStyle=pa.color;
      ctx.fillRect(px2-r,py2-r,r*2,1); ctx.fillRect(px2-r,py2+r,r*2,1);
      ctx.fillRect(px2-r,py2-r,1,r*2); ctx.fillRect(px2+r,py2-r,1,r*2+1);
      continue;
    }
    ctx.fillStyle=pa.color;ctx.fillRect(Math.round(pa.x),Math.round(pa.y),1,1);
  }
  ctx.restore();
  // viñeta roja de dano
  if(hurtVigT>0){
    const a=Math.min(0.45,hurtVigT*1.6);
    ctx.fillStyle='rgba(216,56,64,'+a.toFixed(2)+')';
    ctx.fillRect(0,0,W,3); ctx.fillRect(0,H-3,W,3);
    ctx.fillRect(0,0,3,H); ctx.fillRect(W-3,0,3,H);
  }
  const boss=enemies.find(e=>e.type===2);
  if(boss){
    ctx.fillStyle=PAL.black; ctx.fillRect(28,H-8,104,6);
    ctx.fillStyle='#401018'; ctx.fillRect(30,H-6,100,2);
    ctx.fillStyle=PAL.capR; ctx.fillRect(30,H-6,Math.max(0,Math.round(100*boss.hp/boss.maxHp)),2);
    const bn=BOSS_NAMES[boss.bkind||0];
    drawText(bn,(W-textW(bn,1))/2,H-16,PAL.capR,1);
  }
  drawBanner();
}
function render(){
  ctx.fillStyle=PAL.black; ctx.fillRect(0,0,W,H);

  if(state==='boot'){
    // arranque tipo Game Boy Color
    const ly=Math.min(50,-16+bootT*150) - (bootT>0.44&&bootT<0.58?2:0);
    drawText('SETA BOY',(W-textW('SETA BOY',2))/2,ly,PAL.white,2);
    if(bootT>0.55){
      const cols=[PAL.capR,PAL.gold,'#48a038','#2858c0','#8858c8'];
      const shown=Math.min(5,((bootT-0.6)/0.12)|0);
      const cx=(W-5*10)/2;
      for(let i=0;i<shown;i++) drawText('COLOR'[i],cx+i*10,70,cols[i],2);
    }
    return;
  }
  if(state==='studio'){
    ctx.fillStyle='#0c2014'; ctx.fillRect(0,0,W,H);
    drawShroom(W/2,64,{dir:'down',e:(Math.sin(time*2.5)>0)?1:0,face:((time%3.5)<0.13)?'blink':'happy',moving:false,step:0});
    const t1='MICELIO GAMES';
    drawText(t1,(W-textW(t1,1))/2,78,PAL.gold,1);
    const t2='PRESENTA';
    drawText(t2,(W-textW(t2,1))/2,90,'#6a9a6a',1);
    // esporita subiendo
    const sy=110-(bootT*30)%50;
    ctx.fillStyle=PAL.spore; ctx.fillRect(W/2+14+Math.round(Math.sin(bootT*4)*3),sy,2,2);
    return;
  }

  if(state==='cine'){
    const shx=shake>0?((Math.random()*3)|0)-1:0;
    ctx.save(); ctx.translate(shx,0);
    if(cineScene===0){
      /* Micelia en armonia: el Gran Arbol grande ciclando estaciones */
      const SKY=[['#98d0f0','#c0e4f8'],['#78c0f0','#a8dcf8'],['#e8a060','#f0c088'],['#a8bcd0','#c8d8e4']][season];
      ctx.fillStyle=SKY[0]; ctx.fillRect(0,0,W,50);
      ctx.fillStyle=SKY[1]; ctx.fillRect(0,50,W,40);
      const P=CP();
      ctx.fillStyle=P.grass2; ctx.fillRect(0,90,W,6);
      ctx.fillStyle=P.grass; ctx.fillRect(0,96,W,48);
      ctx.save(); ctx.scale(2,2);
      drawGreatTree(40,52);
      ctx.restore();
      for(const p of tparts) drawTPart(p);
      caption('MICELIA, EL BOSQUE QUE RESPIRA, CANTABA CON LAS CUATRO ESTACIONES',true);
    } else if(cineScene===1){
      /* La Marchitez despierta: paleta muerta, moho trepando, truenos */
      ctx.fillStyle='#100c20'; ctx.fillRect(0,0,W,90);
      ctx.fillStyle='#181430'; ctx.fillRect(0,60,W,30);
      const so=season; season=4;
      const P=CP();
      ctx.fillStyle=P.grass2; ctx.fillRect(0,90,W,6);
      ctx.fillStyle=P.grass; ctx.fillRect(0,96,W,48);
      ctx.save(); ctx.scale(2,2); drawGreatTree(40,52); ctx.restore();
      season=so;
      // moho reptando desde abajo
      const cr=Math.min(1,cineT/3.4);
      for(let cx2=0;cx2<W;cx2+=4){
        const h=(14+((tRnd(13,cx2,1)*26)|0))*cr;
        ctx.fillStyle=PAL.mohoDk; ctx.fillRect(cx2,H-h,4,h);
        if(((cx2>>2)&3)===0){ctx.fillStyle=PAL.moho;ctx.fillRect(cx2+1,H-h+2,2,Math.max(0,h-4));}
      }
      // silueta del Rey Moho alzandose
      const by=144-Math.min(58,cineT*22);
      ctx.fillStyle=PAL.mohoDk;
      ctx.fillRect(112,by,40,H-by);
      ctx.fillRect(118,by-8,28,10);
      ctx.fillStyle=PAL.gold;
      ctx.fillRect(124,by-14,16,3);
      ctx.fillRect(124,by-18,4,4); ctx.fillRect(130,by-19,4,5); ctx.fillRect(136,by-18,4,4);
      if(((time*3)|0)&1){ // ojos rojos latiendo
        ctx.fillStyle=PAL.capR;
        ctx.fillRect(122,by-2,5,4); ctx.fillRect(137,by-2,5,4);
      }
      if(flashT>0){
        ctx.fillStyle='rgba(248,248,248,0.85)'; ctx.fillRect(0,0,W,H);
        ctx.fillStyle=PAL.white;
        let lx=30+((tRnd(7,(time*10)|0,3)*60)|0), ly=0;
        while(ly<86){ctx.fillRect(lx,ly,2,10);lx+=(((ly>>3)&1)?5:-6);ly+=10;}
      }
      caption('PERO LA MARCHITEZ DESPERTO BAJO LAS RAICES',true);
    } else if(cineScene===2){
      /* El Rey devora al Oraculo: estaciones rotas parpadeando */
      const skies=['#98d0f0','#e8a060','#a8bcd0','#78c0f0'];
      for(let b=0;b<6;b++){
        ctx.fillStyle=(cineT>3.1||(((time*9+b)|0)&3)===0)?skies[(b+((time*8)|0))%4]:'#0c0818';
        ctx.fillRect(0,b*15,W,15);
      }
      ctx.fillStyle='#0c0818'; ctx.fillRect(0,90,W,54);
      // fauces del Rey a la derecha
      ctx.fillStyle=PAL.mohoDk; ctx.fillRect(112,20,48,104);
      ctx.fillStyle=PAL.black; ctx.fillRect(118,48,42,46);
      ctx.fillStyle=PAL.mohoLt;
      for(let i=0;i<5;i++){ctx.fillRect(119+i*8,48,3,6);ctx.fillRect(119+i*8,88,3,6);}
      ctx.fillStyle=PAL.gold;
      ctx.fillRect(120,10,24,4); ctx.fillRect(120,4,5,6); ctx.fillRect(129,2,6,8); ctx.fillRect(139,4,5,6);
      if(cineT<=3.1){
        // el Oraculo: espora dorada radiante arrastrada hacia las fauces
        const t2=Math.min(1,cineT/3.1);
        const ox2=36+(118-36)*t2*t2, oy2=66+Math.sin(cineT*5)*3;
        ctx.fillStyle=PAL.goldDk; ctx.fillRect(ox2-3,oy2-3,7,7);
        ctx.fillStyle=PAL.gold; ctx.fillRect(ox2-2,oy2-3,5,7); ctx.fillRect(ox2-3,oy2-2,7,5);
        ctx.fillStyle=PAL.white; ctx.fillRect(ox2-1,oy2-1,2,2);
        const rl=5+((time*10|0)&1)*2;
        ctx.fillStyle=PAL.gold;
        ctx.fillRect(ox2-rl-2,oy2,rl,1); ctx.fillRect(ox2+3,oy2,rl,1);
        ctx.fillRect(ox2,oy2-rl-2,1,rl); ctx.fillRect(ox2,oy2+3,1,rl);
        // estela
        for(let k=1;k<5;k++){
          ctx.fillStyle='rgba(248,208,48,'+(0.5-k*0.1)+')';
          ctx.fillRect(ox2-k*7,oy2+Math.sin((cineT-k*0.08)*5)*3,2,2);
        }
      }
      if(flashT>0){ctx.fillStyle='rgba(248,248,248,0.9)';ctx.fillRect(0,0,W,H);}
      caption('Y EL REY MOHO DEVORO AL ORACULO. LAS ESTACIONES SE ROMPIERON',true);
    } else {
      /* La ultima espora germina: Bolet nace */
      ctx.fillStyle='#04080c'; ctx.fillRect(0,0,W,H);
      // estrellitas
      for(let i=0;i<12;i++){
        if(((time*2+i)|0)&3)continue;
        ctx.fillStyle='#c8d0dc';
        ctx.fillRect((tRnd(21,i,4)*156)|0,(tRnd(4,i,9)*70)|0,1,1);
      }
      const landY=100, sy=Math.min(landY,-4+cineT*44);
      const landed=sy>=landY, lt=landed?cineT-(landY+4)/44:0;
      // monticulo de tierra
      ctx.fillStyle=PAL.dirtDk; ctx.fillRect(W/2-8,landY+2,16,4);
      ctx.fillStyle=PAL.dirt; ctx.fillRect(W/2-6,landY+1,12,3);
      if(!landed){
        const sx=W/2+Math.sin(cineT*1.6)*16;
        ctx.fillStyle=PAL.sporeDk; ctx.fillRect(sx-2,sy-2,5,5);
        ctx.fillStyle=PAL.spore; ctx.fillRect(sx-1,sy-2,3,5); ctx.fillRect(sx-2,sy-1,5,3);
        ctx.fillStyle=PAL.white; ctx.fillRect(sx-1,sy-1,1,1);
        if(((time*6)|0)&1){ctx.fillStyle=PAL.spore;ctx.fillRect(sx-4,sy,1,1);ctx.fillRect(sx+3,sy,1,1);}
        caption('UNA SOLA ESPORA ESCAPO EN EL VIENTO...',false);
      } else if(lt<0.5){
        ctx.fillStyle=PAL.plant;
        ctx.fillRect(W/2-1,landY-Math.min(6,lt*16),2,Math.min(6,lt*16)+1);
        caption('...Y ENCONTRO TIERRA VIVA',false);
      } else if(lt<1.0){
        ctx.fillStyle=PAL.plant; ctx.fillRect(W/2-1,landY-6,2,7);
        ctx.fillStyle=PAL.capR; ctx.fillRect(W/2-4,landY-10,8,4);
        ctx.fillStyle=PAL.white; ctx.fillRect(W/2+1,landY-9,2,2);
        caption('...Y ENCONTRO TIERRA VIVA',false);
      } else {
        drawShroom(W/2,landY+2,{dir:'down',e:(Math.sin(time*3)>0)?1:0,
          face:lt<1.4?'blink':(lt>2.2?'happy':'normal'),moving:false,step:0});
        caption('TU.',true);
      }
    }
    if(flashT>0&&cineScene!==1&&cineScene!==2){ctx.fillStyle='rgba(248,248,248,0.8)';ctx.fillRect(0,0,W,H);}
    ctx.restore();
    return;
  }

  if(state==='title'){
    /* --- cielo en 3 bandas con dithering + astro por estacion --- */
    const TSKY=[['#88c8f0','#a8dcf8','#cceaf8'],['#60b4ec','#90d0f4','#b8e4f8'],
                ['#d88848','#eca868','#f4cc90'],['#98b0c4','#b8ccd8','#d4e2ea']][season];
    ctx.fillStyle=TSKY[0]; ctx.fillRect(0,0,W,30);
    ctx.fillStyle=TSKY[1]; ctx.fillRect(0,30,W,32);
    ctx.fillStyle=TSKY[2]; ctx.fillRect(0,62,W,24);
    for(let y=30;y<34;y+=2)for(let x=((y>>1)&1)*2;x<W;x+=4){ctx.fillStyle=TSKY[0];ctx.fillRect(x,y,2,2);}
    for(let y=62;y<66;y+=2)for(let x=((y>>1)&1)*2;x<W;x+=4){ctx.fillStyle=TSKY[1];ctx.fillRect(x,y,2,2);}
    // sol / sol de otono / luna de invierno
    if(season===3){
      ctx.fillStyle=PAL.white;
      ctx.fillRect(14,32,6,6); ctx.fillRect(13,33,8,4);
      ctx.fillStyle=TSKY[1]; ctx.fillRect(16,32,6,5);
      if(((time*2)|0)&1){ctx.fillStyle=PAL.white;ctx.fillRect(30,28,1,1);ctx.fillRect(24,42,1,1);}
    } else {
      const sy0=season===2?46:32, sc=season===2?'#f0d048':PAL.gold;
      ctx.fillStyle=sc;
      ctx.fillRect(14,sy0,6,6); ctx.fillRect(13,sy0+1,8,4);
      ctx.fillStyle='#f8f0c0'; ctx.fillRect(15,sy0+1,2,2);
      const f=((time*2)|0)&1; ctx.fillStyle=sc;
      if(f){ctx.fillRect(16,sy0-3,2,2);ctx.fillRect(16,sy0+7,2,2);ctx.fillRect(10,sy0+2,2,2);ctx.fillRect(22,sy0+2,2,2);}
      else{ctx.fillRect(11,sy0-2,2,2);ctx.fillRect(21,sy0-2,2,2);ctx.fillRect(11,sy0+6,2,2);ctx.fillRect(21,sy0+6,2,2);}
    }
    // pajaros migrando (primavera y verano)
    if(season<2){
      for(let i=0;i<3;i++){
        const bx=W+20-((time*11+i*76)%(W+50)), by=36+i*8+Math.round(Math.sin(time*3+i)*2);
        const f=(((time*6)|0)+i)&1;
        ctx.fillStyle='#304050';
        if(f){ctx.fillRect(bx,by,2,1);ctx.fillRect(bx+3,by,2,1);ctx.fillRect(bx+2,by+1,1,1);}
        else{ctx.fillRect(bx,by-1,2,1);ctx.fillRect(bx+3,by-1,2,1);ctx.fillRect(bx+2,by,1,1);}
      }
    }
    drawCloud(((time*4)%230)-45, 68);
    drawCloud(((time*4+120)%230)-45, 76);
    /* --- silueta de bosque lejano --- */
    const P=CP();
    ctx.fillStyle=P.treeDk;
    for(let i=0;i<12;i++){
      const bx=i*14-4, bh=6+((tRnd(31,i,2)*7)|0);
      ctx.fillRect(bx,86-bh,10,bh);
      ctx.fillRect(bx+2,86-bh-3,6,3);
    }
    /* --- colina con camino, rocas, charca y hierba viva --- */
    ctx.fillStyle=P.grass2; ctx.fillRect(0,86,W,5);
    ctx.fillStyle=P.grass;  ctx.fillRect(0,91,W,53);
    ctx.fillStyle=P.grassDk;
    for(let i=0;i<22;i++){
      const r=tRnd(5,i,3);
      ctx.fillRect((r*156)|0, 94+((tRnd(9,i,1)*46)|0), 2,1);
    }
    // camino serpenteante hasta el Gran Micelio
    const path=[[76,138],[70,131],[62,124],[54,117],[47,111],[40,106]];
    for(const [px2,py2] of path){
      ctx.fillStyle=P.path; ctx.fillRect(px2-4,py2,9,5);
      ctx.fillStyle=P.pathDk; ctx.fillRect(px2-3,py2+3,2,1); ctx.fillRect(px2+2,py2+1,1,1);
    }
    // rocas
    ctx.fillStyle=PAL.stoneDk; ctx.fillRect(94,120,7,5); ctx.fillRect(58,133,6,4);
    ctx.fillStyle=PAL.stone;   ctx.fillRect(95,120,5,3); ctx.fillRect(59,133,4,2);
    ctx.fillStyle=PAL.stoneLt; ctx.fillRect(95,120,2,1); ctx.fillRect(59,133,1,1);
    // charca reflejando el cielo
    ctx.fillStyle=P.grassDk; ctx.fillRect(3,127,20,10);
    ctx.fillStyle=TSKY[1]; ctx.fillRect(4,128,18,8);
    ctx.fillStyle=TSKY[0]; ctx.fillRect(6,129,8,2);
    if(((time*3)|0)&1){ctx.fillStyle=PAL.white;ctx.fillRect(15,131,3,1);}
    // matas de hierba que se mecen
    for(const [gx0,gy0] of [[28,116],[88,128],[142,118]]){
      const sway=(((time*2.5)|0)&1)?1:0;
      ctx.fillStyle=P.grassDk;
      ctx.fillRect(gx0,gy0-3,1,3); ctx.fillRect(gx0+2,gy0-4,1,4); ctx.fillRect(gx0+4,gy0-3,1,3);
      ctx.fillStyle=P.grass2;
      ctx.fillRect(gx0+sway-0,gy0-4,1,1); ctx.fillRect(gx0+2+sway,gy0-5,1,1); ctx.fillRect(gx0+4+sway,gy0-4,1,1);
    }
    // florecitas de temporada
    for(let i=0;i<5;i++){
      const fx=30+((tRnd(3,i,8)*118)|0), fy=110+((tRnd(11,i,2)*26)|0);
      if(season===3){ ctx.fillStyle=PAL.white; ctx.fillRect(fx,fy,3,2); }
      else { ctx.fillStyle=season===2?'#c84828':(season===1?PAL.gold:'#f0a0c8'); ctx.fillRect(fx,fy,2,2); }
    }
    /* --- el Gran Micelio (izq) y Bolet heroe con bufanda (der) --- */
    drawGreatTree(36,102);
    drawBoletHero(114,112);
    /* --- particulas de la estacion --- */
    for(const p of tparts) drawTPart(p);
    /* --- emblema + LOGO con degradado de dos tonos --- */
    drawLogoEmblem(80,3);
    const gx1=(W-textW('SPORE',4))/2, gx2=(W-textW('QUEST',4))/2;
    drawTextBevel('SPORE',gx1,8,4,'#ecc44c','#f8f0c0','#8c5c14','#c89430');
    drawTextBevel('QUEST',gx2,31,4,'#ecc44c','#f8f0c0','#8c5c14','#c89430');
    // estela de esporas cruzando el logo
    for(let k=0;k<7;k++){
      const sx2=gx2-14+k*16, sy2=52-k*6.5;
      if((((time*3)|0)+k)&1)continue;
      ctx.fillStyle=k===6?PAL.spore:PAL.sporeDk;
      ctx.fillRect(sx2,Math.round(sy2),k===6?3:2,k===6?3:2);
    }
    const spts=[[gx1+6,12],[gx1+52,20],[gx2+22,35],[gx2+66,44]];
    const spN=((titleT/1.2)|0)%spts.length, st=(titleT%1.2);
    if(st<0.36){
      const sz=st<0.18?1+((st/0.06)|0):3-(((st-0.18)/0.06)|0);
      const [sx,sy]=spts[spN];
      ctx.fillStyle=PAL.white;
      ctx.fillRect(sx-sz,sy,sz*2+1,1); ctx.fillRect(sx,sy-sz,1,sz*2+1);
    }
    /* --- placa de madera con hojas laterales --- */
    const pt='EL ORACULO DE LAS ESTACIONES';
    const pw=textW(pt,1)+10, px=(W-pw)/2, py=55;
    ctx.fillStyle=PAL.black; ctx.fillRect(px-1,py-1,pw+2,11);
    ctx.fillStyle=PAL.dirtDk; ctx.fillRect(px,py,pw,9);
    ctx.fillStyle=PAL.dirt;   ctx.fillRect(px+1,py+1,pw-2,7);
    ctx.fillStyle='#8c6438';  ctx.fillRect(px+1,py+1,pw-2,1);
    ctx.fillStyle=PAL.gold;
    ctx.fillRect(px+2,py+4,1,1); ctx.fillRect(px+pw-3,py+4,1,1);
    drawText(pt,px+5,py+2,PAL.stem,1);
    // hojitas decorando la placa
    ctx.fillStyle=P.tree;
    ctx.fillRect(px-5,py+2,4,2); ctx.fillRect(px-7,py+4,3,2);
    ctx.fillRect(px+pw+1,py+2,4,2); ctx.fillRect(px+pw+4,py+4,3,2);
    ctx.fillStyle=P.treeLt;
    ctx.fillRect(px-4,py+2,1,1); ctx.fillRect(px+pw+2,py+2,1,1);
    /* --- PULSA START --- */
    if(((titleT*1.6)|0)&1){
      const ps='PULSA START', psw=textW(ps,1)+10, psx=(W-psw)/2;
      ctx.fillStyle=PAL.black; ctx.fillRect(psx,116,psw,11);
      ctx.fillStyle=PAL.uiGold;
      ctx.fillRect(psx,116,psw,1); ctx.fillRect(psx,126,psw,1);
      drawText(ps,psx+5,119,PAL.white,1);
    }
    if(best>0){const sb='RECORD '+best+' SALAS';drawText(sb,(W-textW(sb,1))/2,130,PAL.uiGold,1);}
    const cr='2026 MICELIO GAMES';
    drawText(cr,(W-textW(cr,1))/2,138,'#3a6248',1);
    if(titleT<0.14){ctx.fillStyle='rgba(248,248,248,0.85)';ctx.fillRect(0,0,W,H);}
    return;
  }

  if(state==='intro'){
    ctx.fillStyle='#0c2014'; ctx.fillRect(0,0,W,H);
    const lines=wrap(INTRO[introPage],34);
    let ty=44-(lines.length*9)/2+10;
    for(const ln of lines){ drawText(ln,(W-textW(ln,1))/2,ty,PAL.white,1); ty+=9; }
    // Bolet pequeno abajo
    drawShroom(W/2,116,{dir:'down',e:(Math.sin(time*2.5)>0)?1:0,face:((time%4.2)<0.13)?'blink':'normal',moving:false,step:0});
    for(let i=0;i<INTRO.length;i++){
      ctx.fillStyle=i===introPage?PAL.uiGold:'#3a5a3a';
      ctx.fillRect(W/2-8+i*6,126,3,3);
    }
    if(((time*2)|0)&1){const s='A';drawText(s,W-12,H-10,PAL.uiGold,1);}
    return;
  }

  if(state==='over'){
    const s='GAME OVER'; drawText(s,(W-textW(s,2))/2,30,PAL.capR,2);
    const l1='SALAS: '+visited.size;
    const l2='NIVEL: '+player.lv;
    const l3='BICHOS: '+kills;
    drawText(l1,(W-textW(l1,1))/2,58,PAL.uiGold,1);
    drawText(l2,(W-textW(l2,1))/2,68,PAL.spore,1);
    drawText(l3,(W-textW(l3,1))/2,78,PAL.slimeB,1);
    if(best>0){const l4='RECORD: '+best;drawText(l4,(W-textW(l4,1))/2,92,PAL.white,1);}
    const ep='EL MICELIO TE RECORDARA';
    drawText(ep,(W-textW(ep,1))/2,106,'#6a9a6a',1);
    if(((time*2)|0)&1){const s4='PULSA A';drawText(s4,(W-textW(s4,1))/2,122,PAL.white,1);}
    return;
  }

  if(state==='slide'&&slide){
    drawHUD();
    ctx.save(); ctx.translate(0,HUD);
    ctx.beginPath(); ctx.rect(0,0,W,PH); ctx.clip();
    const s=slide.prog;
    const shx=slide.dx*W, shy=slide.dy*PH;
    ctx.drawImage(bgA, Math.round(-s*shx), Math.round(-s*shy));
    ctx.drawImage(bgB, Math.round(shx-s*shx), Math.round(shy-s*shy));
    const px=(slide.ox+((slide.ex+shx)-slide.ox)*s)-s*shx;
    const py=(slide.oy+((slide.ey+shy)-slide.oy)*s)-s*shy;
    drawShroom(px,py,{dir:player.dir,e:0,moving:true,step:((time*8|0)&1),bob:((time*8|0)&1)?-1:0});
    ctx.restore();
    return;
  }

  renderPlayfield();

  if(state==='pause'){
    ctx.fillStyle='rgba(8,24,32,0.85)'; ctx.fillRect(0,0,W,H);
    const s='PAUSA'; drawText(s,(W-textW(s,2))/2,16,PAL.white,2);
    const s2='ESTACION: '+CP().name;
    drawText(s2,(W-textW(s2,1))/2,36,PAL.uiGold,1);
    const s3='HABILIDAD B: '+(player.skill?SKILLS[player.skill].name+' LV'+player.skillLv:'NINGUNA AUN');
    drawText(s3,(W-textW(s3,1))/2,46,PAL.spore,1);
    // minimapa de salas visitadas
    const mt='MAPA DEL BOSQUE';
    drawText(mt,(W-textW(mt,1))/2,60,'#6a9a6a',1);
    const ox=(W-7*11)/2, oy=70;
    ctx.fillStyle='#0c2014'; ctx.fillRect(ox-3,oy-3,7*11+5,5*9+5);
    for(let dy=-2;dy<=2;dy++)for(let dx=-3;dx<=3;dx++){
      const k=(roomX+dx)+','+(roomY+dy);
      const cx=ox+(dx+3)*11, cy=oy+(dy+2)*9;
      if(visited.has(k)){
        const r=rooms.get(k);
        ctx.fillStyle=(r&&r.boss)?'#803040':(r&&r.cleared?'#3a6a48':'#28483a');
        ctx.fillRect(cx,cy,9,7);
        if(r&&r.treasure){ctx.fillStyle=PAL.gold;ctx.fillRect(cx+3,cy+2,3,3);}
        if(r&&r.fountain){ctx.fillStyle='#68b8e8';ctx.fillRect(cx+3,cy+2,3,3);}
        if(r&&r.boss&&!r.cleared){ctx.fillStyle=PAL.capR;ctx.fillRect(cx+3,cy+2,3,3);}
      } else {
        ctx.fillStyle='#16261c'; ctx.fillRect(cx+3,cy+3,2,1);
      }
      if(dx===0&&dy===0&&(((time*3)|0)&1)){
        ctx.fillStyle=PAL.gold;
        ctx.fillRect(cx-1,cy-1,11,1); ctx.fillRect(cx-1,cy+7,11,1);
        ctx.fillRect(cx-1,cy-1,1,9); ctx.fillRect(cx+9,cy-1,1,9);
      }
    }
    const hint='SELECT: SONIDO';
    drawText(hint,(W-textW(hint,1))/2,124,'#4a7a5a',1);
    const hint2='SALAS '+visited.size+' · NIVEL '+player.lv;
    drawText(hint2,(W-textW(hint2,1))/2,134,PAL.uiGold,1);
  }
  if(state==='read'&&readLore){
    drawTextBox(wrap(readLore,34));
  }
  if(state==='skill'){
    ctx.fillStyle='rgba(8,24,32,0.85)'; ctx.fillRect(0,0,W,H);
    const t='RELIQUIA DEL REY';
    drawText(t,(W-textW(t,1))/2,24,PAL.gold,1);
    const t2='ELIGE UNA NUEVA HABILIDAD B:';
    drawText(t2,(W-textW(t2,1))/2,34,'#6a9a6a',1);
    for(let i=0;i<skillChoices.length;i++){
      const ch=skillChoices[i];
      const sk={name:(ch.kind==='up'?'MEJORAR ':'')+SKILLS[ch.id].name,
                desc:ch.kind==='up'?SKILLS[ch.id].d2:SKILLS[ch.id].desc};
      const y=50+i*30, sel=i===skillCursor;
      ctx.fillStyle=sel?'#2a1838':'#180c20';
      ctx.fillRect(8,y,W-16,26);
      ctx.fillStyle=sel?PAL.dartLt:'#3a2a4a';
      ctx.fillRect(8,y,W-16,1); ctx.fillRect(8,y+25,W-16,1);
      ctx.fillRect(8,y,1,26); ctx.fillRect(W-9,y,1,26);
      drawText(sk.name,14,y+5,sel?PAL.gold:PAL.white,1);
      drawText(sk.desc,14,y+15,sel?PAL.white:'#8a6aaa',1);
    }
    const cur='AHORA: '+(player.skill?SKILLS[player.skill].name+' LV'+player.skillLv:'NINGUNA');
    drawText(cur,(W-textW(cur,1))/2,H-14,'#6a8a6a',1);
  }
  if(state==='level'){
    ctx.fillStyle='rgba(8,24,32,0.85)'; ctx.fillRect(0,0,W,H);
    const t='SUBES A NIVEL '+(player.lv+1);
    drawText(t,(W-textW(t,1))/2,20,PAL.gold,1);
    const t2='EL MICELIO TE OFRECE:';
    drawText(t2,(W-textW(t2,1))/2,30,'#6a9a6a',1);
    for(let i=0;i<levelChoices.length;i++){
      const y=44+i*28, sel=i===levelCursor;
      ctx.fillStyle=sel?'#183828':'#101c14';
      ctx.fillRect(8,y,W-16,24);
      ctx.fillStyle=sel?PAL.gold:'#2a3a2a';
      ctx.fillRect(8,y,W-16,1); ctx.fillRect(8,y+23,W-16,1);
      ctx.fillRect(8,y,1,24); ctx.fillRect(W-9,y,1,24);
      drawText(levelChoices[i].name,14,y+5,sel?PAL.gold:PAL.white,1);
      drawText(levelChoices[i].desc,14,y+14,sel?PAL.white:'#6a8a6a',1);
      if(sel)drawText('·',9,y+9,PAL.gold,1);
    }
  }
}
