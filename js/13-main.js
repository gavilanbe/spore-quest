'use strict';
/* ============================================================
   SPORE QUEST · capa 13-main
   bucle principal
   ============================================================ */

/* ---------- Bucle ---------- */
let last=performance.now();
function loop(now){
  let dt=(now-last)/1000; last=now;
  if(dt>0.05)dt=0.05;
  update(dt);
  render();
  present();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
