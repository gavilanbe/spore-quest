'use strict';
/* ============================================================
   SPORE QUEST · capa 05-input
   entrada: teclado, dpad tactil y botones A/B/START/SELECT
   ============================================================ */
function pollEdges(){
  pressedA=input.a&&!prev.a; pressedB=input.b&&!prev.b; pressedStart=input.start&&!prev.start;
  pressedU=input.u&&!prev.u; pressedD=input.d&&!prev.d;
  prev.a=input.a; prev.b=input.b; prev.start=input.start; prev.u=input.u; prev.d=input.d;
}
window.addEventListener('keydown',e=>{
  initAudio();
  const k=e.key.toLowerCase();
  if(['arrowup','w'].includes(k))input.u=true;
  if(['arrowdown','s'].includes(k))input.d=true;
  if(['arrowleft','a'].includes(k))input.l=true;
  if(['arrowright','d'].includes(k))input.r=true;
  if([' ','x','j'].includes(k)){input.a=true;e.preventDefault();}
  if(['z','k'].includes(k))input.b=true;
  if(['enter','p'].includes(k))input.start=true;
  if(k==='m')muted=!muted;
  if(k.startsWith('arrow'))e.preventDefault();
});
window.addEventListener('keyup',e=>{
  const k=e.key.toLowerCase();
  if(['arrowup','w'].includes(k))input.u=false;
  if(['arrowdown','s'].includes(k))input.d=false;
  if(['arrowleft','a'].includes(k))input.l=false;
  if(['arrowright','d'].includes(k))input.r=false;
  if([' ','x','j'].includes(k))input.a=false;
  if(['z','k'].includes(k))input.b=false;
  if(['enter','p'].includes(k))input.start=false;
});
const dpad=document.getElementById('dpad');
const dpEls={u:document.getElementById('dp-u'),d:document.getElementById('dp-d'),l:document.getElementById('dp-l'),r:document.getElementById('dp-r')};
function dpadFromPoint(px,py){
  const b=dpad.getBoundingClientRect();
  const dx=px-(b.left+b.width/2), dy=py-(b.top+b.height/2);
  input.u=input.d=input.l=input.r=false;
  if(Math.hypot(dx,dy)>8){
    const th=Math.max(12, Math.abs(dx)+Math.abs(dy))*0.38;
    if(dx<-th)input.l=true; if(dx>th)input.r=true;
    if(dy<-th)input.u=true; if(dy>th)input.d=true;
    if(!input.l&&!input.r&&!input.u&&!input.d){
      if(Math.abs(dx)>Math.abs(dy)){ if(dx<0)input.l=true;else input.r=true; }
      else { if(dy<0)input.u=true;else input.d=true; }
    }
  }
  dpEls.u.classList.toggle('on',input.u); dpEls.d.classList.toggle('on',input.d);
  dpEls.l.classList.toggle('on',input.l); dpEls.r.classList.toggle('on',input.r);
}
function dpadClear(){
  input.u=input.d=input.l=input.r=false;
  for(const k in dpEls)dpEls[k].classList.remove('on');
}
dpad.addEventListener('touchstart',e=>{initAudio();e.preventDefault();const t=e.targetTouches[0];dpadFromPoint(t.clientX,t.clientY);},{passive:false});
dpad.addEventListener('touchmove',e=>{e.preventDefault();const t=e.targetTouches[0];if(t)dpadFromPoint(t.clientX,t.clientY);},{passive:false});
dpad.addEventListener('touchend',e=>{e.preventDefault();if(e.targetTouches.length===0)dpadClear();},{passive:false});
dpad.addEventListener('touchcancel',()=>dpadClear());
let mouseDp=false;
dpad.addEventListener('mousedown',e=>{initAudio();mouseDp=true;dpadFromPoint(e.clientX,e.clientY);});
window.addEventListener('mousemove',e=>{if(mouseDp)dpadFromPoint(e.clientX,e.clientY);});
window.addEventListener('mouseup',()=>{if(mouseDp){mouseDp=false;dpadClear();}});
function bindButton(id,prop,hapt){
  const el=document.getElementById(id);
  const on=e=>{initAudio();e.preventDefault();input[prop]=true;el.classList.add('on');if(hapt)buzz(8);};
  const off=e=>{e.preventDefault();input[prop]=false;el.classList.remove('on');};
  el.addEventListener('touchstart',on,{passive:false});
  el.addEventListener('touchend',off,{passive:false});
  el.addEventListener('touchcancel',off,{passive:false});
  el.addEventListener('mousedown',on);
  el.addEventListener('mouseup',off);
  el.addEventListener('mouseleave',off);
}
bindButton('btn-a','a',true); bindButton('btn-b','b',true); bindButton('p-start','start');
document.getElementById('p-select').addEventListener('touchstart',e=>{e.preventDefault();muted=!muted;},{passive:false});
document.getElementById('p-select').addEventListener('mousedown',()=>{muted=!muted;});
document.addEventListener('contextmenu',e=>e.preventDefault());

/* ---------- Habilidades B (reliquias del Rey Moho) ---------- */
