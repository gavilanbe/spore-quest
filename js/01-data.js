'use strict';
/* ============================================================
   SPORE QUEST · capa 01-data
   constantes, paleta GBC, estaciones, textos de intro y lore
   ============================================================ */
const W=160, H=144, TS=16, COLS=10, ROWS=8, HUD=16, PH=ROWS*TS;
const BOSS_EVERY=8, SEASON_LEN=6;

/* ---------- Paleta base ---------- */
const PAL = {
  black:'#081820', white:'#f8f8f8', uiGold:'#e8c860',
  capR:'#d83840', capDk:'#8c1828', capLt:'#f08078',
  stem:'#f8e8c0', stemDk:'#c8a068',
  spore:'#c8f088', sporeDk:'#78b838',
  gold:'#f8d030', goldDk:'#b08810',
  slimeA:'#8858c8', slimeADk:'#503088',
  slimeB:'#d84860', slimeBDk:'#881830',
  moho:'#485828', mohoDk:'#242e10', mohoLt:'#6c8038',
  heart:'#e83040',
  stone:'#788088', stoneDk:'#485058', stoneLt:'#a8b0b8',
  moth:'#b088d8', mothDk:'#604090', mothWing:'#e0c8f0',
  plant:'#307838', plantDk:'#184820', plantMaw:'#a03050', plantIn:'#501828',
  snail:'#c89050', snailDk:'#7c5428', snailLt:'#e8c088', snailBody:'#88a858',
  dart:'#7838a0', dartLt:'#b070d8',
  dirt:'#6c4828', dirtDk:'#48301c',
};

/* ---------- Estaciones (paletas de terreno) ---------- */
const SEASONS=[
 {name:'PRIMAVERA',art:'LA PRIMAVERA',grass:'#48a038',grass2:'#54ac40',grassDk:'#2c7028',path:'#e0c070',pathDk:'#b08840',tree:'#1c7030',treeDk:'#0c4418',treeLt:'#3c9448',trunk:'#8c5424',bush:'#288038',bushDk:'#145024',water:'#2858c0',waterLt:'#58a0e8',flow:'#e878a0'},
 {name:'VERANO',art:'EL VERANO',grass:'#3c9c30',grass2:'#48a838',grassDk:'#1c6420',path:'#e8cc78',pathDk:'#b89048',tree:'#187028',treeDk:'#084010',treeLt:'#48a848',trunk:'#8c5424',bush:'#20802c',bushDk:'#0c5018',water:'#2060d0',waterLt:'#68b0f0',flow:'#e8d048'},
 {name:'OTONO',art:'EL OTONO',grass:'#a89040',grass2:'#b09c48',grassDk:'#786028',path:'#d0a860',pathDk:'#a07838',tree:'#b05818',treeDk:'#703008',treeLt:'#d88030',trunk:'#7c4c20',bush:'#a06820',bushDk:'#684010',water:'#3868b0',waterLt:'#6898d0',flow:'#c84828'},
 {name:'INVIERNO',art:'EL INVIERNO',grass:'#c0d0d8',grass2:'#ccdae0',grassDk:'#90a8b8',path:'#a8b8c0',pathDk:'#7890a0',tree:'#186038',treeDk:'#0c3820',treeLt:'#e8f4f8',trunk:'#6c4828',bush:'#487858',bushDk:'#284838',water:'#a8d8e8',waterLt:'#e8f8f8',flow:'#f8f8f8'},
 {name:'MARCHITEZ',art:'LA MARCHITEZ',grass:'#4a4438',grass2:'#544e40',grassDk:'#2e2a20',path:'#6a5c44',pathDk:'#48402e',tree:'#3e3a2c',treeDk:'#211e14',treeLt:'#565040',trunk:'#4a3826',bush:'#3a3628',bushDk:'#211e14',water:'#2a3038',waterLt:'#3e4650',flow:'#5a5244'},
];
let season=0;
function seasonForCount(n){ return Math.floor(Math.max(0,n-1)/SEASON_LEN)%4; }
function CP(){ return SEASONS[season]; }

/* ---------- Lore ---------- */
const INTRO=[
 'MICELIA, EL BOSQUE QUE RESPIRA, HA SIDO DEVORADO POR LA MARCHITEZ.',
 'EL REY MOHO ROBO EL ORACULO Y AHORA LAS ESTACIONES GIRAN SIN ORDEN.',
 'TU ERES BOLET, ULTIMA ESPORA LIBRE DEL GRAN MICELIO. PURIFICA. CRECE. RECUERDA.',
];
const LORE=[
 'ANTES DE LA MARCHITEZ, MICELIA CANTABA CON LAS CUATRO ESTACIONES.',
 'EL REY MOHO DEVORO EL ORACULO. POR ESO LAS ESTACIONES GIRAN SIN RUMBO.',
 'BOLET, ULTIMA ESPORA DEL GRAN MICELIO. EL BOSQUE TE RECUERDA.',
 'CADA SALA PURIFICADA DEVUELVE UN LATIDO AL MICELIO.',
 'LOS LIMOS FUERON SETAS COMO TU, ANTES DE OLVIDAR SU NOMBRE.',
 'EL ORO DE ESPORA ES MEMORIA. REUNELO Y CRECERAS.',
 'BAJO EL HIELO DEL INVIERNO, EL AGUA GUARDA CAMINOS.',
 'CADA OCHO SALAS LATE UN CORAZON DEL MOHO. REVIENTALO.',
 'NO HAY SALIDA DEL BOSQUE. SOLO MAS BOSQUE. SIGUE.',
 'LAS RAICES DEL MOHO SELLAN LAS PUERTAS. SU CORAZON ES LA LLAVE.',
 'EL ORACULO SUSURRA: NI EL INVIERNO ES ETERNO.',
 'LAS POLILLAS DEL MOHO NO PISAN EL SUELO. APUNTA AL AIRE.',
 'EL BROTE FINGE SER TIERRA. GOLPEA CUANDO ABRE LA BOCA.',
 'EL CARACOL REAL NO TEME TUS ESPORAS. TEME LOS MUROS.',
 'EL REY GUARDA RELIQUIAS: NUEVAS FORMAS DE ESTORNUDAR.',
 'ALGUNOS ARBUSTOS GUARDAN ORO. ESCUPELES.',
 'EN LA ESPESURA HAY COFRES OLVIDADOS Y AGUAS QUE CURAN.',
];
const TUT_LORE=LORE.length;
LORE.push('MANTEN PULSADO A: TE HINCHAS. SUELTA: GRAN ESPORA.');
const BOSS_LINES=['UN CORAZON DEL MOHO SE APAGA','MICELIA RESPIRA UN POCO MEJOR','EL ORACULO LATE MAS FUERTE'];

/* ---------- Mini fuente 3x5 ---------- */
