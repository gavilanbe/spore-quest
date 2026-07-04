'use strict';
/* ============================================================
   SPORE QUEST · capa 04-audio
   chip de audio: pulsos, voces, sfx y musica por secuenciador
   ============================================================ */
function initAudio(){
  if(!AC){
    try{
      AC=new (window.AudioContext||window.webkitAudioContext)();
      musGain=AC.createGain(); musGain.gain.value=0.9; musGain.connect(AC.destination);
      sfxGain=AC.createGain(); sfxGain.gain.value=1.0; sfxGain.connect(AC.destination);
      const n=AC.sampleRate|0, b=AC.createBuffer(1,n,AC.sampleRate), d=b.getChannelData(0);
      for(let i=0;i<n;i++)d[i]=Math.random()*2-1;
      noiseBuf=b;
    }catch(e){}
  }
  if(AC&&AC.state==='suspended')AC.resume();
}
function getPulse(duty){
  if(!AC)return null;
  const k=''+duty;
  if(!pulseCache[k]){
    const N=32, real=new Float32Array(N), imag=new Float32Array(N);
    for(let n=1;n<N;n++) imag[n]=(4/(n*Math.PI))*Math.sin(Math.PI*n*duty);
    pulseCache[k]=AC.createPeriodicWave(real,imag);
  }
  return pulseCache[k];
}
/* voz tonal: pulso/tri/seno/sierra con envolvente ADSR corta, slide y vibrato */
function voice(o2){
  if(!AC||muted)return;
  const t=(o2.at!==undefined?o2.at:AC.currentTime);
  const o=AC.createOscillator(), g=AC.createGain();
  if(o2.duty!==undefined){ const w=getPulse(o2.duty); if(w)o.setPeriodicWave(w); else o.type='square'; }
  else o.type=o2.type||'square';
  o.frequency.setValueAtTime(o2.f,t);
  if(o2.slide)o.frequency.exponentialRampToValueAtTime(Math.max(25,o2.slide),t+o2.d);
  const v=o2.v||0.04;
  g.gain.setValueAtTime(0.0001,t);
  g.gain.linearRampToValueAtTime(v,t+0.006);
  g.gain.linearRampToValueAtTime(v*0.65,t+o2.d*0.4);
  g.gain.exponentialRampToValueAtTime(0.0001,t+o2.d);
  if(o2.vib){
    const l=AC.createOscillator(), lg=AC.createGain();
    l.type='sine'; l.frequency.setValueAtTime(5.6,t);
    lg.gain.setValueAtTime(o2.f*0.007,t);
    l.connect(lg).connect(o.frequency);
    l.start(t+0.06); l.stop(t+o2.d+0.02);
  }
  o.connect(g).connect(o2.mus?musGain:sfxGain);
  o.start(t); o.stop(t+o2.d+0.03);
}
/* voz de ruido con filtro (percusion, golpes, explosiones) */
function noise(o2){
  if(!AC||muted||!noiseBuf)return;
  const t=(o2.at!==undefined?o2.at:AC.currentTime);
  const s=AC.createBufferSource(); s.buffer=noiseBuf; s.loop=true;
  const f=AC.createBiquadFilter(); f.type=o2.hp?'highpass':'lowpass';
  f.frequency.setValueAtTime(o2.f0||1200,t);
  if(o2.f1)f.frequency.exponentialRampToValueAtTime(Math.max(40,o2.f1),t+o2.d);
  const g=AC.createGain(), v=o2.v||0.05;
  g.gain.setValueAtTime(v,t);
  g.gain.exponentialRampToValueAtTime(0.0001,t+o2.d);
  s.connect(f).connect(g).connect(o2.mus?musGain:sfxGain);
  s.start(t); s.stop(t+o2.d+0.02);
}
function now(){ return AC?AC.currentTime:0; }
function buzz(p){ try{ if(typeof navigator!=='undefined'&&navigator.vibrate)navigator.vibrate(p); }catch(e){} }

/* ---------- SFX por capas ---------- */
const S={
  shoot:()=>{ voice({f:880,slide:1600,d:0.07,duty:0.125,v:0.045});
              noise({f0:5000,d:0.03,v:0.015,hp:true}); },
  bigShot:()=>{ voice({f:320,slide:820,d:0.15,duty:0.25,v:0.07});
                voice({f:160,slide:410,d:0.15,duty:0.5,v:0.04});
                noise({f0:2500,f1:600,d:0.1,v:0.05}); },
  burst:()=>{ voice({f:500,slide:1400,d:0.14,duty:0.25,v:0.055});
              noise({f0:3000,f1:800,d:0.12,v:0.05}); },
  hit:()=>{ noise({f0:1000,f1:250,d:0.06,v:0.09});
            voice({f:220,slide:140,d:0.05,duty:0.5,v:0.04}); },
  die:()=>{ voice({f:620,slide:85,d:0.22,duty:0.25,v:0.06});
            noise({f0:1400,f1:180,d:0.18,v:0.06}); },
  hurt:()=>{ voice({f:200,slide:52,d:0.28,type:'sawtooth',v:0.07});
             voice({f:211,slide:58,d:0.26,duty:0.5,v:0.04});
             noise({f0:900,f1:150,d:0.2,v:0.07}); },
  pick:()=>{ const t=now();
             voice({f:988,d:0.06,duty:0.25,v:0.05,at:t});
             voice({f:1319,d:0.14,duty:0.25,v:0.05,at:t+0.07});
             voice({f:1976,d:0.1,duty:0.125,v:0.02,at:t+0.07}); },
  gold:()=>{ const t=now();
             voice({f:1319,d:0.045,duty:0.125,v:0.035,at:t});
             voice({f:1976,d:0.05,duty:0.125,v:0.025,at:t+0.035}); },
  door:()=>{ noise({f0:280,f1:1600,d:0.24,v:0.035});
             voice({f:196,slide:440,d:0.22,type:'triangle',v:0.05}); },
  clear:()=>{ const t=now(),D=0.095;
              [[392,0],[523,1],[659,2],[784,3]].forEach(([f,i])=>voice({f,d:i===3?0.32:0.11,duty:0.25,v:0.05,at:t+i*D,vib:i===3}));
              voice({f:523,d:0.3,duty:0.5,v:0.02,at:t+3*D});
              noise({f0:2000,f1:900,d:0.09,v:0.03,at:t+3*D}); },
  level:()=>{ const t=now(),D=0.085;
              [523,659,784,1046].forEach((f,i)=>{
                voice({f,d:0.12,duty:0.25,v:0.05,at:t+i*D});
                voice({f,d:0.1,duty:0.25,v:0.018,at:t+i*D+0.09});
              }); },
  relic:()=>{ const t=now(),D=0.13;
              [440,523,659,880].forEach((f,i)=>{
                voice({f,d:0.34,type:'sine',v:0.045,at:t+i*D,vib:true});
                voice({f:f*2,d:0.2,duty:0.125,v:0.012,at:t+i*D});
              }); },
  boom:()=>{ noise({f0:2200,f1:55,d:0.5,v:0.14});
             voice({f:120,slide:32,d:0.42,type:'sine',v:0.13});
             voice({f:60,d:0.3,type:'triangle',v:0.08}); },
  tele:()=>{ voice({f:65,slide:150,d:0.3,type:'sawtooth',v:0.05});
             noise({f0:220,d:0.28,v:0.04}); },
  bossRoar:()=>{ voice({f:110,slide:38,d:0.55,type:'sawtooth',v:0.09});
                 voice({f:55,d:0.5,duty:0.5,v:0.06});
                 noise({f0:500,f1:70,d:0.55,v:0.09}); buzz(80); },
  bossDie:()=>{ const t=now();
                voice({f:300,slide:28,d:0.85,type:'sawtooth',v:0.11,at:t});
                noise({f0:1800,f1:60,d:0.8,v:0.1,at:t});
                [[523,0],[659,1],[784,2],[1046,3]].forEach(([f,i])=>voice({f,d:i===3?0.4:0.12,duty:0.25,v:0.05,at:t+0.65+i*0.1,vib:i===3})); },
  dartS:()=>{ voice({f:1300,slide:480,d:0.07,duty:0.125,v:0.032}); },
  ding:()=>{ const t=now();
             voice({f:1568,d:0.06,duty:0.25,v:0.045,at:t});
             voice({f:2093,d:0.09,duty:0.25,v:0.035,at:t+0.05}); },
  gbding:()=>{ const t=now();
               voice({f:1046,d:0.1,type:'sine',v:0.07,at:t});
               voice({f:2093,d:0.32,type:'sine',v:0.06,at:t+0.11}); },
  seasonJ:()=>{ const t=now();
                [523,659,784,1046,1319].forEach((f,i)=>voice({f,d:0.16,type:'sine',v:0.04,at:t+i*0.05})); },
  read:()=>{ voice({f:660,slide:880,d:0.06,duty:0.25,v:0.04}); },
  clink:()=>{ voice({f:2200,slide:1500,d:0.05,duty:0.125,v:0.04});
              noise({f0:6000,d:0.03,v:0.02,hp:true}); },
  thunder:()=>{ noise({f0:320,f1:45,d:0.6,v:0.12});
                voice({f:70,slide:28,d:0.5,type:'sine',v:0.1}); buzz(50); },
  crunch:()=>{ noise({f0:1600,f1:180,d:0.18,v:0.12});
               voice({f:190,slide:55,d:0.16,type:'sawtooth',v:0.08}); },
  start:()=>{ const t=now();
              [[440,0],[554,1],[659,2]].forEach(([f,i])=>voice({f,d:0.1,duty:0.25,v:0.05,at:t+i*0.1}));
              voice({f:880,slide:1760,d:0.24,duty:0.25,v:0.05,at:t+0.3}); },
  fanfare:()=>{ const t=now(),D=0.13;
                [[392,0],[523,1],[659,2],[784,3]].forEach(([f,i])=>{
                  voice({f,d:i===3?0.55:0.14,duty:0.25,v:0.055,at:t+i*D,vib:i===3});
                  voice({f:f*0.5,d:i===3?0.5:0.13,duty:0.5,v:0.025,at:t+i*D});
                });
                noise({f0:2500,f1:800,d:0.12,v:0.035,at:t+3*D}); },
};

/* ---------- Compositor: notas, secuencias y temas ---------- */
function NF(name){
  const m=/^([A-G])([b#]?)(\d)$/.exec(name);
  const base={C:0,D:2,E:4,F:5,G:7,A:9,B:11}[m[1]];
  const st=base+(m[2]==='#'?1:m[2]==='b'?-1:0);
  return 440*Math.pow(2,(st-9)/12+((+m[3])-4));
}
function seq(pairs){ // [['A4',3],['R',1],...] -> {f:[freq|0|-1], d:[pasos en el ataque]}
  const f=[],d=[];
  for(const [nm,du] of pairs){
    f.push(nm==='R'?0:NF(nm)); d.push(du);
    for(let k=1;k<du;k++){f.push(-1);d.push(0);}
  }
  return {f,d};
}
const arpBar=(a,b,c,hi)=>[[a,2],[c,2],[hi,2],[c,2],[b,2],[c,2],[hi,2],[c,2]];
const arpSlow=(a,b,c,d)=>[[a,4],[b,4],[c,4],[d,4]];
const bassBar=(r,f,rHi)=>[[r,2],['R',2],[r,2],[rHi,2],[f,2],['R',2],[r,2],['R',2]];
const chug=(r,n)=>{const a=[];for(let i=0;i<n;i++)a.push([r,1],['R',1]);return a;};

const THEMES={
  /* Tema de campo: 8 compases AABA', Am-C-Am-Em / F-C-Dm-E (semicadencia al V) */
  field:{sd:0.115, vMel:0.032, vHarm:0.013, vBass:0.05, echo:true,
    mel:seq([
      ['A4',3],['A4',1],['A4',2],['B4',2],['C5',3],['C5',1],['C5',2],['D5',2],
      ['E5',6],['D5',2],['C5',2],['B4',2],['A4',2],['G4',2],
      ['A4',3],['A4',1],['A4',2],['B4',2],['C5',3],['C5',1],['C5',2],['A4',2],
      ['G4',6],['E4',2],['G4',4],['R',4],
      ['F4',3],['F4',1],['F4',2],['G4',2],['A4',3],['A4',1],['A4',2],['B4',2],
      ['C5',6],['B4',2],['A4',2],['G4',2],['A4',2],['B4',2],
      ['C5',3],['C5',1],['C5',2],['D5',2],['E5',3],['E5',1],['E5',2],['F5',2],
      ['E5',4],['D5',2],['B4',2],['A4',6],['R',2],
    ]),
    harm:seq([].concat(
      arpBar('A3','C4','E4','A4'), arpBar('C4','E4','G4','C5'),
      arpBar('A3','C4','E4','A4'), arpBar('E3','G3','B3','E4'),
      arpBar('F3','A3','C4','F4'), arpBar('C4','E4','G4','C5'),
      arpBar('D3','F3','A3','D4'), arpBar('E3','G#3','B3','E4'),
    )),
    bass:seq([].concat(
      bassBar('A2','E2','A3'), bassBar('C3','G2','C3'),
      bassBar('A2','E2','A3'), bassBar('E2','B2','E3'),
      bassBar('F2','C3','F3'), bassBar('C3','G2','C3'),
      bassBar('D3','A2','D3'), bassBar('E2','B2','E3'),
    )),
    dr:('K.h.S.h.K.h.S.h.'.repeat(7)+'K.h.S.h.K.h.SSSS'),
  },
  /* Boss: frigio con subida cromatica al final del ciclo */
  boss:{sd:0.104, vMel:0.034, vHarm:0.014, vBass:0.055, echo:false,
    mel:seq([
      ['A4',1],['A4',1],['R',2],['A4',2],['C5',2],['Bb4',2],['A4',2],['G4',2],['A4',2],
      ['A4',1],['A4',1],['R',2],['A4',2],['C5',2],['D5',2],['C5',2],['Bb4',2],['C5',2],
      ['E5',3],['E5',1],['D5',2],['C5',2],['Bb4',3],['Bb4',1],['A4',2],['G4',2],
      ['A4',2],['Bb4',2],['B4',2],['C5',2],['C#5',2],['D5',2],['D#5',2],['E5',2],
    ]),
    harm:seq([].concat(
      chug('A3',8), chug('A3',8), chug('F3',4), chug('G3',4),
      [['A3',1],['R',1],['Bb3',1],['R',1],['B3',1],['R',1],['C4',1],['R',1],
       ['C#4',1],['R',1],['D4',1],['R',1],['D#4',1],['R',1],['E4',1],['R',1]],
    )),
    bass:seq([].concat(
      chug('A2',8), chug('A2',8), chug('F2',4), chug('G2',4),
      [['A2',1],['R',1],['Bb2',1],['R',1],['B2',1],['R',1],['C3',1],['R',1],
       ['C#3',1],['R',1],['D3',1],['R',1],['D#3',1],['R',1],['E3',1],['R',1]],
    )),
    dr:('K.hhS.h.K.hhS.hh'.repeat(3)+'K.hhS.h.KKSSKKSS'),
  },
  /* Titulo: nana lidia (el fa# es el misterio), arpas lentas, sin bateria */
  title:{sd:0.165, vMel:0.03, vHarm:0.016, vBass:0.045, echo:true, vib:true,
    mel:seq([
      ['C5',6],['D5',2],['E5',4],['G5',4],
      ['F#5',6],['E5',2],['D5',4],['E5',4],
      ['C5',6],['D5',2],['E5',4],['G5',2],['A5',2],
      ['G5',6],['E5',2],['D5',2],['C5',2],['D5',4],
      ['E5',6],['D5',2],['C5',4],['B4',4],
      ['A4',6],['B4',2],['C5',4],['E5',4],
      ['D5',6],['C5',2],['B4',2],['A4',2],['B4',2],['G4',2],
      ['C5',10],['R',6],
    ]),
    harm:seq([].concat(
      arpSlow('C4','E4','G4','B4'), arpSlow('D4','F#4','A4','C5'),
      arpSlow('C4','E4','G4','B4'), arpSlow('G3','B3','D4','G4'),
      arpSlow('A3','C4','E4','G4'), arpSlow('F3','A3','C4','E4'),
      arpSlow('G3','B3','D4','F4'), arpSlow('C4','E4','G4','C5'),
    )),
    bass:seq([
      ['C3',14],['R',2],['D3',14],['R',2],['C3',14],['R',2],['G2',14],['R',2],
      ['A2',14],['R',2],['F2',14],['R',2],['G2',14],['R',2],['C3',14],['R',2],
    ]),
    dr:'',
  },
  /* Lamento de game over: suena una sola vez */
  over:{sd:0.15, vMel:0.03, vHarm:0.014, vBass:0.045, echo:true, vib:true, once:true,
    mel:seq([
      ['A4',3],['G4',3],['F4',3],['E4',5],['R',2],
      ['F4',2],['E4',2],['D4',2],['C4',8],['R',2],
    ]),
    harm:seq([ ['E4',8],['C4',8],['D4',8],['E4',8] ]),
    bass:seq([ ['A2',16],['F2',8],['G2',4],['C3',4] ]),
    dr:'',
  },
};
const SEASON_TR=[1, 1.1225, 0.8909, 0.7937]; // +2, -2, -4 semitonos

let musTrack=null, musStep=0, musNext=0, musDone=false;
function schedStep(T,i,t,sd){
  const tr=(musTrack==='field')?SEASON_TR[season]:1;
  const M=T.mel, ii=i%M.f.length;
  if(M.f[ii]>0){
    const durSteps=M.d[ii];
    const f=M.f[ii]*tr, d=Math.min(durSteps*sd*0.92, 1.4);
    voice({f,d,duty:0.25,v:T.vMel,at:t,mus:true,vib:(T.vib||durSteps>=4)});
    if(T.echo) voice({f,d:d*0.8,duty:0.25,v:T.vMel*0.32,at:t+sd,mus:true});
  }
  const Hh=T.harm, hi=i%Hh.f.length;
  if(Hh.f[hi]>0) voice({f:Hh.f[hi]*tr,d:Math.min(Hh.d[hi]*sd*0.9,0.9),duty:0.5,v:T.vHarm,at:t,mus:true});
  const B=T.bass, bi=i%B.f.length;
  if(B.f[bi]>0) voice({f:B.f[bi]*tr,d:Math.min(B.d[bi]*sd*0.95,1.6),type:'triangle',v:T.vBass,at:t,mus:true});
  if(T.dr){
    const ch=T.dr[i%T.dr.length];
    const winter=(musTrack==='field'&&season===3);
    if(ch==='K') noise({f0:900,f1:60,d:0.09,v:0.1,at:t,mus:true});
    else if(ch==='S') noise({f0:2200,f1:900,d:0.08,v:0.05,at:t,mus:true});
    else if(ch==='h'&&!winter) noise({f0:8000,d:0.025,v:0.016,hp:true,at:t,mus:true});
  }
}
function updateMusic(){
  let want=null;
  if(state==='title'||state==='studio'||state==='intro') want='title';
  else if(state==='cine') want=(cineScene===0)?'title':(cineScene<3?'boss':null);
  else if(state==='over') want='over';
  else if(state==='play'||state==='pause'||state==='read'||state==='level'||state==='skill'||state==='slide')
    want=enemies.some(e=>e.type===2)?'boss':'field';
  if(want!==musTrack){
    musTrack=want; musStep=0; musDone=false;
    musNext=AC?AC.currentTime+0.06:0;
  }
  if(!musTrack||musDone||!AC||muted)return;
  const T=THEMES[musTrack];
  const sd=T.sd*((musTrack==='field'&&season===3)?1.14:1);
  while(musNext < AC.currentTime + 0.14){
    schedStep(T,musStep,musNext,sd);
    musNext+=sd; musStep++;
    if(T.once && musStep>=T.mel.f.length){ musDone=true; break; }
  }
}
/* ---------- Input ---------- */
const input={u:false,d:false,l:false,r:false,a:false,b:false,start:false};
const prev={a:false,b:false,start:false,u:false,d:false};
let pressedA=false,pressedB=false,pressedStart=false,pressedU=false,pressedD=false;
