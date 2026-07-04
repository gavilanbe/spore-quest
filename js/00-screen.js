'use strict';
/* ============================================================
   SPORE QUEST · capa 00-screen
   pantalla: canvas 160x144, buffer y volcado con escala entera (present)
   ============================================================ */
/* ============================================================
   SPORE QUEST v2 — roguelike GBC estilo Oracle of Seasons
   Bolet, ultima espora libre de Micelia, contra la Marchitez.
   Novedades: 4 estaciones rotativas, niveles y mejoras,
   Rey Moho cada 8 salas, estelas con lore.
   ============================================================ */
const cv = document.getElementById('game');
const vctx = cv.getContext('2d');
const buf = document.createElement('canvas'); buf.width=160; buf.height=144;
let ctx = buf.getContext('2d');
ctx.imageSmoothingEnabled = false;
/* volcado con escala entera x devicePixelRatio: pixeles perfectos en Retina/iOS */
function present(){
  const dpr=window.devicePixelRatio||1;
  const cssW=cv.clientWidth||320;
  const sc=Math.max(2,Math.round(cssW*dpr/160));
  if(cv.width!==160*sc||cv.height!==144*sc){ cv.width=160*sc; cv.height=144*sc; }
  vctx.imageSmoothingEnabled=false;
  vctx.drawImage(buf,0,0,cv.width,cv.height);
}

