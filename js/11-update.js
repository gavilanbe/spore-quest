'use strict';
/* ============================================================
   SPORE QUEST · capa 11-update
   update(dt): logica por estado, fisica, combate y salas
   ============================================================ */
function update(dt){
  time+=dt;
  pollEdges();
  updateMusic(dt);

  if(state==='boot'){
    bootT+=dt;
    if(bootT>0.5 && !dingDone){dingDone=true;if(AC)S.gbding();}
    if(pressedA||pressedStart){initAudio();state='studio';bootT=0;}
    else if(bootT>2.1){state='studio';bootT=0;}
    return;
  }
  if(state==='studio'){
    bootT+=dt;
    if(pressedStart){initAudio();enterTitle();return;}
    if(pressedA){initAudio();enterCine();}
    else if(bootT>2.0) enterCine();
    return;
  }
  if(state==='cine'){
    cineT+=dt; flashT=Math.max(0,flashT-dt);
    if(pressedStart){enterTitle();return;}
    const durs=[4.6,4.6,4.2,5.4];
    if(pressedA||cineT>=durs[cineScene]){
      cineScene++; cineT=0; flashT=0;
      if(cineScene>=4){enterTitle();return;}
      if(cineScene===3&&AC)S.crunch();
    }
    if(cineScene===0){
      const si=((cineT/1.15)|0)%4;
      if(si!==cineLastSeason){
        cineLastSeason=si; season=si;
        for(let i=0;i<7;i++)tparts.push({x:40+Math.random()*80,y:30+Math.random()*50,ph:0,star:0.4});
        if(AC&&cineT>0.2)S.seasonJ();
      }
      updateFallParts(dt);
    } else if(cineScene===1){
      thunderT-=dt;
      if(thunderT<=0){thunderT=1.2+Math.random()*1.1;flashT=0.14;if(AC)S.thunder();shake=Math.max(shake,0.15);}
      shake=Math.max(0,shake-dt);
    } else if(cineScene===2){
      if(cineT>3.1&&cineT-dt<=3.1){flashT=0.2;if(AC)S.crunch();buzz(80);}
    }
    return;
  }
  if(state==='title'){
    updateTitle(dt);
    if(pressedA||pressedStart){initAudio(); newRun();}
    return;
  }
  if(state==='intro'){
    if(pressedA||pressedStart){
      introPage++;
      if(introPage>=INTRO.length){state='play';}
      else S.read();
    }
    return;
  }
  if(state==='over'){ if(pressedA||pressedStart){enterTitle();} return; }
  if(state==='pause'){ if(pressedStart)state='play'; return; }
  if(state==='read'){ if(pressedA||pressedStart){readLore=null;state='play';} return; }
  if(state==='skill'){
    if(pressedU)skillCursor=(skillCursor+skillChoices.length-1)%skillChoices.length;
    if(pressedD)skillCursor=(skillCursor+1)%skillChoices.length;
    if(pressedA){
      const ch=skillChoices[skillCursor];
      if(ch.kind==='up'){
        player.skillLv=2;
        banner={text:SKILLS[ch.id].name+' MEJORADA A LV2',t:2.4};
      } else {
        player.skill=ch.id; player.skillLv=1;
        banner={text:'NUEVA HABILIDAD: '+SKILLS[ch.id].name,t:2.4};
      }
      player.burstCd=0; S.relic(); state='play';
    }
    return;
  }
  if(state==='level'){
    if(pressedU)levelCursor=(levelCursor+levelChoices.length-1)%levelChoices.length;
    if(pressedD)levelCursor=(levelCursor+1)%levelChoices.length;
    if(pressedA){
      applyUpgrade(levelChoices[levelCursor].id);
      player.xp-=player.xpNext;
      player.xpNext=Math.round(player.xpNext*1.6+2);
      player.lv++;
      S.pick();
      if(!tryLevelUp()) state='play';
    }
    return;
  }
  if(state==='slide'){
    slide.prog=Math.min(1,slide.prog+dt/0.55);
    if(slide.prog>=1)finishSlide();
    return;
  }
  if(state==='dying'){
    dieT-=dt; shake=Math.max(0,shake-dt);
    if(!diePoof && dieT<=0.5){
      diePoof=true;
      poof(player.x,player.y-8,PAL.spore,16);
      poof(player.x,player.y-8,PAL.capR,10);
      poof(player.x,player.y-8,PAL.white,6);
      S.die();
    }
    for(let i=parts.length-1;i>=0;i--){
      const pa=parts[i]; pa.x+=pa.dx*dt; pa.y+=pa.dy*dt; pa.life-=dt;
      if(pa.life<=0)parts.splice(i,1);
    }
    if(dieT<=0){ state='over'; saveBest(); }
    return;
  }
  if(pressedStart){state='pause';return;}
  if(hitStop>0){ hitStop-=dt; return; } // congelacion de impacto

  const p=player;
  if(banner){banner.t-=dt;if(banner.t<=0)banner=null;}
  shake=Math.max(0,shake-dt);
  hurtVigT=Math.max(0,hurtVigT-dt);
  p.iframes=Math.max(0,p.iframes-dt);
  p.atkT=Math.max(0,p.atkT-dt);
  p.burstCd=Math.max(0,p.burstCd-dt);
  // expresiones: aburrimiento, parpadeo, celebracion
  p.celebT=Math.max(0,p.celebT-dt);
  if(p.moving||p.charging||p.atkT>0||p.kbt>0){p.idleT=0;}
  else p.idleT+=dt;
  p.blinkT-=dt;
  if(p.blinkT<=0){p.blinkOn=0.13;p.blinkT=2.2+Math.random()*2.6;}
  if(p.blinkOn>0)p.blinkOn-=dt;
  if(p.idleT>6){
    p.zzzT-=dt;
    if(p.zzzT<=0){p.zzzT=1.6;parts.push({x:p.x+5,y:p.y-18,dx:5,dy:-9,life:1.5,z:true});}
  } else p.zzzT=0.8;

  let mx=(input.r?1:0)-(input.l?1:0), my=(input.d?1:0)-(input.u?1:0);
  p.moving=(mx!==0||my!==0);
  if(p.moving){
    if(Math.abs(mx)>0&&Math.abs(my)>0){mx*=0.7071;my*=0.7071;}
    if(input.l)p.dir='left'; else if(input.r)p.dir='right';
    if(input.u&&!input.l&&!input.r)p.dir='up';
    if(input.d&&!input.l&&!input.r)p.dir='down';
    p.walkT+=dt*8;
    moveEntity(p,mx*p.spd*dt,my*p.spd*dt);
  }
  if(p.kbt>0){ p.kbt-=dt; moveEntity(p,p.kbx*dt,p.kby*dt); }

  if(pressedA){
    if(nearChest()){
      openChest();
      p.charging=false; p.charge=0;
      return;
    }
    if(nearStele()){
      readLore=LORE[room.stele.lore]; state='read'; S.read();
      p.charging=false; p.charge=0;
      return;
    }
    if(p.atkT<=0){ shoot(); p.charging=true; p.charge=0; p.dinged=false; }
  }
  if(p.charging){
    if(input.a){
      p.charge+=dt;
      if(!p.dinged && p.charge>=chargeNeed()){ p.dinged=true; S.ding(); }
    } else {
      if(p.charge>=chargeNeed()) fireCharged();
      p.charging=false; p.charge=0;
    }
  }
  if(pressedB){
    if(!p.skill){
      if(p.noSkillHint<=0){
        banner={text:'SIN HABILIDAD B: VENCE AL REY',t:1.8};
        p.noSkillHint=4; S.dartS();
      }
    } else if(p.burstCd<=0) useSkill();
  }
  p.noSkillHint=Math.max(0,p.noSkillHint-dt);

  if(!bossLock()){
    if(p.x<=4) return startSlide(-1,0);
    if(p.x>=156) return startSlide(1,0);
    if(p.y<=8) return startSlide(0,-1);
    if(p.y>=124) return startSlide(0,1);
  }

  // esporas
  for(let i=spores.length-1;i>=0;i--){
    const sp=spores[i];
    if(sp.orbit){
      sp.ang+=dt*4.2; sp.life-=dt; sp.cool=Math.max(0,sp.cool-dt);
      sp.x=p.x+Math.cos(sp.ang)*14; sp.y=p.y-6+Math.sin(sp.ang)*11;
      if(sp.life<=0){poof(sp.x,sp.y,PAL.spore,3);spores.splice(i,1);continue;}
      if(sp.cool<=0){
        for(let j=enemies.length-1;j>=0;j--){
          const en=enemies[j];
          if(en.type===4&&en.mode==='buried')continue;
          if(bossInvuln(en))continue;
          const hw=en.type===2?12:7, hh=en.type===2?10:7;
          const cy=en.type===2?en.y-7:en.y-4;
          if(Math.abs(sp.x-en.x)<hw && Math.abs(sp.y-cy)<hh){
            en.hp-=sp.dmg; en.flash=0.12; sp.cool=0.35;
            poof(sp.x,sp.y,PAL.spore,3);
            if(en.hp<=0)killEnemy(j); else S.hit();
            break;
          }
        }
      }
      continue;
    }
    sp.x+=sp.dx*dt; sp.y+=sp.dy*dt; sp.life-=dt;
    let hitWall=false;
    if(sp.life<=0) hitWall=true;
    else {
      const stx=Math.floor(sp.x/TS), sty=Math.floor(sp.y/TS);
      if(stx<0||stx>=COLS||sty<0||sty>=ROWS) hitWall=solidAtPx(sp.x,sp.y);
      else {
        const tv=room.tiles[sty*COLS+stx];
        if(tv===T_BUSH){ cutBush(stx,sty); if(!sp.big)hitWall=true; }
        else if(isSolidTile(tv)) hitWall=true;
        else if(room.chest&&!room.chest.open&&stx===room.chest.tx&&sty===room.chest.ty) hitWall=true;
      }
    }
    if(hitWall){
      if(sp.bomb){
        explode(sp.x,sp.y,sp.cluster?28:22,sp.dmg);
        if(sp.cluster){
          for(let k=0;k<3;k++){
            const a=Math.random()*6.28;
            spores.push({bomb:true,mini:true,x:sp.x,y:sp.y,dx:Math.cos(a)*95,dy:Math.sin(a)*95,life:0.22,pierce:0,dmg:Math.max(1,sp.dmg-1)});
          }
        }
      }
      else poof(sp.x,sp.y,PAL.spore,3);
      spores.splice(i,1); continue;
    }
    if(sp.bomb) continue; // la bomba solo estalla, no golpea al pasar
    let removed=false;
    for(let j=enemies.length-1;j>=0;j--){
      const en=enemies[j];
      if(en.type===4&&en.mode==='buried')continue; // brote enterrado: invulnerable
      const hw=en.type===2?12:(sp.big?9:7), hh=en.type===2?10:(sp.big?9:7);
      const cy=en.type===2?en.y-7:en.y-4;
      if(Math.abs(sp.x-en.x)<hw && Math.abs(sp.y-cy)<hh){
        if(bossInvuln(en)){ // acorazada: clink y fuera
          poof(sp.x,sp.y,PAL.white,3); S.clink();
          if(sp.pierce>0){sp.pierce--;} else spores.splice(i,1);
          break;
        }
        en.hp-=sp.dmg; en.flash=0.12;
        if(en.type!==2 && !en.armored){
          const d=Math.hypot(sp.dx,sp.dy)||1;
          en.kbx=sp.dx/d*90; en.kby=sp.dy/d*90; en.kbt=0.12;
        }
        poof(sp.x,sp.y,PAL.spore,4);
        if(sp.pierce>0){sp.pierce--;} else {spores.splice(i,1);removed=true;}
        if(en.hp<=0)killEnemy(j); else S.hit();
        break;
      }
    }
    if(removed)continue;
  }

  // dardos enemigos
  for(let i=darts.length-1;i>=0;i--){
    const dr=darts[i];
    dr.x+=dr.dx*dt; dr.y+=dr.dy*dt; dr.life-=dt;
    if(dr.life<=0 || solidAtPx(dr.x,dr.y)){darts.splice(i,1);continue;}
    // tus esporas destruyen dardos
    let cut=false;
    for(const sp of spores){
      if(!sp.bomb && Math.abs(sp.x-dr.x)<4 && Math.abs(sp.y-dr.y)<4){
        poof(dr.x,dr.y,PAL.dartLt,4); darts.splice(i,1); cut=true; break;
      }
    }
    if(cut)continue;
    if(Math.abs(p.x-dr.x)<5 && Math.abs((p.y-5)-dr.y)<7){
      darts.splice(i,1); hurtPlayer(dr.x,dr.y);
    }
  }

  // enemigos
  for(const en of enemies){
    en.ph+=dt*6; en.flash=Math.max(0,en.flash-dt);
    const distP=Math.hypot(p.x-en.x,p.y-en.y);
    if(en.type===2&&en.bkind===1){ // POLILLA REINA: vuela, llueve dardos, picados
      en.st-=dt;
      if(en.bstate==='hover'){
        const tx=p.x+Math.sin(time*1.5)*30, ty=30+Math.sin(time*2.1)*8;
        const d=Math.hypot(tx-en.x,ty-en.y)||1;
        en.x+=(tx-en.x)/d*Math.min(d,44*dt); en.y+=(ty-en.y)/d*Math.min(d,44*dt);
        if(en.st<=0){en.bstate=Math.random()<0.55?'rain':'swoopTele';en.st=en.bstate==='rain'?1.4:0.5;if(en.bstate!=='rain')S.tele();}
      } else if(en.bstate==='rain'){
        if(!en.shot1&&en.st<1.2){en.shot1=true;for(let k=-2;k<=2;k++)darts.push({x:en.x+k*4,y:en.y,dx:k*22,dy:82,life:2});S.dartS();}
        if(!en.shot2&&en.st<0.6){en.shot2=true;for(let k=-2;k<=2;k++)darts.push({x:en.x+k*4,y:en.y,dx:k*30+((p.x-en.x)>0?14:-14),dy:82,life:2});S.dartS();}
        if(en.st<=0){en.shot1=en.shot2=false;en.bstate='hover';en.st=1.6+Math.random();}
      } else if(en.bstate==='swoopTele'){
        if(en.st<=0){
          const d=Math.hypot(p.x-en.x,(p.y-5)-en.y)||1;
          en.dx=(p.x-en.x)/d*150; en.dy=((p.y-5)-en.y)/d*150;
          en.bstate='swoop'; en.st=0.5;
        }
      } else if(en.bstate==='swoop'){
        en.x+=en.dx*dt; en.y+=en.dy*dt;
        if(en.st<=0||en.y>PH-14){en.bstate='tired';en.st=1.4;}
      } else { // tired: en el suelo, ventana de castigo
        if(en.st<=0){en.bstate='hover';en.st=1.8;}
      }
      en.x=Math.max(14,Math.min(W-14,en.x));
      en.y=Math.max(16,Math.min(PH-8,en.y));
      if(!en.spawned && en.hp<=en.maxHp/2){
        en.spawned=true;
        enemies.push(mkEnemy(3,en.x-24,en.y)); enemies.push(mkEnemy(3,en.x+24,en.y));
        S.bossRoar();
      }
      if(Math.abs(p.x-en.x)<11 && Math.abs((p.y-5)-(en.y-5))<9) hurtPlayer(en.x,en.y);
      continue;
    }
    if(en.type===2&&en.bkind===2){ // BROTE MADRE: acorazada, espiral de dardos al abrirse
      en.st-=dt; en.arc=(en.arc||0)+dt*3.4;
      if(en.bstate==='closed'){
        if(en.st<=0){en.bstate='open';en.st=2.6;en.dart=0;S.tele();}
      } else {
        en.dart=(en.dart||0)-dt;
        if(en.dart<=0){
          en.dart=0.24;
          for(const off of [0,Math.PI]){
            const a=en.arc+off;
            darts.push({x:en.x,y:en.y-10,dx:Math.cos(a)*66,dy:Math.sin(a)*66,life:2.2});
          }
          S.dartS();
        }
        if(en.st<=0){en.bstate='closed';en.st=2.2;}
      }
      if(!en.spawned && en.hp<=en.maxHp/2){
        en.spawned=true;
        enemies.push(mkEnemy(4,40,44)); enemies.push(mkEnemy(4,120,92));
        S.bossRoar();
      }
      if(Math.abs(p.x-en.x)<12 && Math.abs((p.y-5)-(en.y-8))<11) hurtPlayer(en.x,en.y);
      continue;
    }
    if(en.type===2){ // REY MOHO
      en.st-=dt;
      if(en.bstate==='walk'){
        const d=distP||1;
        moveEntity(en,(p.x-en.x)/d*15*dt,(p.y-en.y)/d*15*dt);
        if(en.st<=0){en.bstate='tele';en.st=0.45;S.tele();}
      } else if(en.bstate==='tele'){
        if(en.st<=0){
          const d=distP||1;
          en.dx=(p.x-en.x)/d*140; en.dy=(p.y-en.y)/d*140;
          en.bstate='dash'; en.st=0.32;
        }
      } else {
        moveEntity(en,en.dx*dt,en.dy*dt);
        if(en.st<=0){
          en.bstate='walk';en.st=2+Math.random()*1.2;
          if(en.spawned){ // fase 2: anillo de dardos tras cada embestida
            for(let k=0;k<8;k++){
              const a=k*Math.PI/4;
              darts.push({x:en.x,y:en.y-7,dx:Math.cos(a)*70,dy:Math.sin(a)*70,life:2});
            }
            S.dartS();
          }
        }
      }
      if(!en.spawned && en.hp<=en.maxHp/2){
        en.spawned=true;
        enemies.push(mkEnemy(0,en.x-20,en.y));
        enemies.push(mkEnemy(3,en.x+20,en.y-10));
        S.bossRoar();
      }
      if(Math.abs(p.x-en.x)<13 && Math.abs((p.y-5)-(en.y-7))<11) hurtPlayer(en.x,en.y);
      continue;
    }
    if(en.type===3){ // POLILLA: vuela sobre todo
      en.st-=dt;
      if(en.mode==='wander'){
        if(en.st<=0){
          en.st=1.6+Math.random()*1.6;
          if(distP<80 && Math.random()<0.6){
            en.mode='dive';
            const d=distP||1;
            en.dx=(p.x-en.x)/d*115; en.dy=((p.y-5)-en.y)/d*115;
            en.st=0.45; S.tele();
          } else {
            en.tx=16+Math.random()*(W-32); en.ty=14+Math.random()*(PH-28);
          }
        }
        const d=Math.hypot(en.tx-en.x,en.ty-en.y);
        if(d>3){ en.x+=(en.tx-en.x)/d*32*dt; en.y+=(en.ty-en.y)/d*32*dt; }
        en.y+=Math.sin(en.ph*1.4)*8*dt;
      } else { // dive
        en.x+=en.dx*dt; en.y+=en.dy*dt;
        if(en.st<=0){en.mode='wander';en.st=0.8+Math.random();}
      }
      en.x=Math.max(12,Math.min(W-12,en.x));
      en.y=Math.max(12,Math.min(PH-8,en.y));
      if(Math.abs(p.x-en.x)<7 && Math.abs((p.y-5)-(en.y-4))<8) hurtPlayer(en.x,en.y);
      continue;
    }
    if(en.type===4){ // BROTE: trampa enterrada
      en.st-=dt;
      if(en.mode==='buried'){
        if(en.st<=0 && distP<75){en.mode='rise';en.st=0.3;}
      } else if(en.mode==='rise'){
        if(en.st<=0){en.mode='open';en.st=1.5;en.shot=false;}
      } else if(en.mode==='open'){
        if(!en.shot && en.st<0.9){
          en.shot=true;
          const base=Math.atan2((p.y-5)-en.y,p.x-en.x);
          for(let k=-1;k<=1;k++){
            const a=base+k*0.32;
            darts.push({x:en.x,y:en.y-6,dx:Math.cos(a)*72,dy:Math.sin(a)*72,life:2});
          }
          S.dartS();
        }
        if(en.st<=0){en.mode='sink';en.st=0.3;}
      } else { // sink
        if(en.st<=0){en.mode='buried';en.st=1.4+Math.random();}
      }
      if(en.mode!=='buried' && Math.abs(p.x-en.x)<7 && Math.abs((p.y-5)-(en.y-4))<8) hurtPlayer(en.x,en.y);
      continue;
    }
    if(en.type===5){ // CARACOL REAL: embiste en linea
      if(en.mode==='wander'){
        en.t-=dt;
        if(en.t<=0){en.t=1+Math.random()*1.5;const a=Math.random()*6.28;en.dx=Math.cos(a);en.dy=Math.sin(a);}
        moveEntity(en,en.dx*10*dt,en.dy*10*dt);
        if(Math.abs(p.x-en.x)<7 && Math.abs(p.y-en.y)>10){en.mode='aim';en.st=0.35;en.cdir=[0,(p.y>en.y?1:-1)];S.tele();}
        else if(Math.abs(p.y-en.y)<7 && Math.abs(p.x-en.x)>10){en.mode='aim';en.st=0.35;en.cdir=[(p.x>en.x?1:-1),0];S.tele();}
      } else if(en.mode==='aim'){
        en.st-=dt;
        if(en.st<=0){en.mode='charge';en.st=1.3;}
      } else if(en.mode==='charge'){
        en.st-=dt;
        const ox=en.x,oy=en.y;
        moveEntity(en,en.cdir[0]*95*dt,en.cdir[1]*95*dt);
        const movedSq=(en.x-ox)*(en.x-ox)+(en.y-oy)*(en.y-oy);
        if(movedSq<0.02 || en.st<=0){ // muro o fin
          en.mode='stun'; en.st=0.8;
          if(movedSq<0.02){shake=Math.max(shake,0.1);S.hit();}
        }
      } else { // stun
        en.st-=dt;
        if(en.st<=0)en.mode='wander';
      }
      if(Math.abs(p.x-en.x)<8 && Math.abs((p.y-5)-(en.y-4))<9) hurtPlayer(en.x,en.y);
      continue;
    }
    // limos (0 y 1)
    en.t-=dt;
    const spd=(en.type?30:22)+Math.min(10,depth());
    if(en.kbt>0){ en.kbt-=dt; moveEntity(en,en.kbx*dt,en.kby*dt); }
    else if(distP<60){
      const d=distP||1;
      moveEntity(en,(p.x-en.x)/d*spd*dt,(p.y-en.y)/d*spd*dt);
    } else {
      if(en.t<=0){ en.t=0.8+Math.random()*1.4; const a=Math.random()*6.28; en.dx=Math.cos(a); en.dy=Math.sin(a); if(Math.random()<0.3){en.dx=0;en.dy=0;} }
      moveEntity(en,en.dx*spd*0.7*dt,en.dy*spd*0.7*dt);
    }
    if(Math.abs(p.x-en.x)<8 && Math.abs((p.y-5)-(en.y-4))<9) hurtPlayer(en.x,en.y);
  }

  // drops
  for(let i=drops.length-1;i>=0;i--){
    const h=drops[i]; h.t+=dt;
    if(h.kind==='gold'){
      const d=Math.hypot(p.x-h.x,(p.y-4)-h.y);
      if(d<26 && d>1){ h.x+=(p.x-h.x)/d*95*dt; h.y+=((p.y-4)-h.y)/d*95*dt; }
    }
    const pr=h.kind==='gold'?7:8;
    if(Math.abs(p.x-h.x)<pr && Math.abs(p.y-4-h.y)<pr){
      if(h.kind==='heart'){ if(p.hp<p.maxHp)p.hp++; p.celebT=Math.max(p.celebT,0.6); S.pick(); poof(h.x,h.y,PAL.heart,5); }
      else if(h.kind==='cont'){ p.maxHp=Math.min(5,p.maxHp+1); p.hp=p.maxHp; p.celebT=Math.max(p.celebT,1.0); S.pick(); poof(h.x,h.y,PAL.gold,10); }
      else if(h.kind==='relic'){
        drops.splice(i,1);
        const others=Object.keys(SKILLS).filter(k=>k!==p.skill);
        skillChoices=[];
        if(p.skill&&p.skillLv===1) skillChoices.push({kind:'up',id:p.skill});
        while(skillChoices.length<2 && others.length){
          skillChoices.push({kind:'new',id:others.splice((Math.random()*others.length)|0,1)[0]});
        }
        skillCursor=0; state='skill'; S.relic();
        continue;
      }
      else { p.xp++; S.gold(); poof(h.x,h.y,PAL.gold,3); }
      drops.splice(i,1);
      if(h.kind==='gold') tryLevelUp();
      continue;
    }
    if(h.t>12) drops.splice(i,1);
  }

  // particulas
  for(let i=parts.length-1;i>=0;i--){
    const pa=parts[i];
    if(pa.ring){ pa.r+=90*dt; pa.life-=dt; if(pa.life<=0)parts.splice(i,1); continue; }
    pa.x+=pa.dx*dt; pa.y+=pa.dy*dt; pa.life-=dt;
    if(pa.life<=0)parts.splice(i,1);
  }
}

/* ---------- Render ---------- */
