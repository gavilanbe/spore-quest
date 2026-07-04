'use strict';
/* ============================================================
   SPORE QUEST · capa 06-progression
   habilidades B, mejoras de nivel y tiradas de eleccion
   ============================================================ */
const SKILLS={
 rafaga:  {name:'RAFAGA',   desc:'ANILLO DE 8 ESPORAS', d2:'LV2: 12 ESPORAS PERFORANTES', cd:2.5},
 estornudo:{name:'ESTORNUDO',desc:'CONO CERCANO Y FUERTE', d2:'LV2: 7 ESPORAS Y MAS DANO', cd:2.2},
 anillo:  {name:'ANILLO VIVO',desc:'3 ESPORAS TE ORBITAN', d2:'LV2: 5 ORBES MAS TIEMPO', cd:6.0},
 bomba:   {name:'ESPORA BOMBA',desc:'EXPLOSION EN AREA', d2:'LV2: EXPLOSION EN RACIMO', cd:3.5},
};
function skillCd(){ return player.skill?SKILLS[player.skill].cd*player.cdMul:1; }

/* ---------- Mejoras (subida de nivel) ---------- */
const UPGRADES=[
 {id:'heart', name:'CORAZON DEL BOSQUE', desc:'+1 CORAZON Y CURA TOTAL', max:()=>player.maxHp<5},
 {id:'twin',  name:'ESPORA GEMELA', desc:'DISPARAS DOS ESPORAS', max:()=>!player.twin},
 {id:'pierce',name:'ESPORA PERFORANTE', desc:'ATRAVIESA UN ENEMIGO MAS', max:()=>player.pierce<2},
 {id:'feet',  name:'PIES LIGEROS', desc:'CORRES MAS RAPIDO', max:()=>player.up.feet<3},
 {id:'wind',  name:'ALIENTO DEL VIENTO', desc:'ESPORAS MAS RAPIDAS Y LEJANAS', max:()=>player.up.wind<3},
 {id:'storm', name:'TORMENTA DE ESPORAS', desc:'LA HABILIDAD B RECARGA ANTES', max:()=>player.up.storm<2},
 {id:'fat',   name:'ESPORA MADURA', desc:'+1 DE DANO POR ESPORA', max:()=>player.up.fat<2},
 {id:'lungs', name:'PULMONES DE ROBLE', desc:'TE HINCHAS MAS RAPIDO', max:()=>player.up.lungs<2},
];
let levelChoices=[], levelCursor=0;
function applyUpgrade(id){
  const p=player;
  if(id==='heart'){p.maxHp=Math.min(5,p.maxHp+1);p.hp=p.maxHp;}
  if(id==='twin')p.twin=true;
  if(id==='pierce')p.pierce++;
  if(id==='feet'){p.up.feet++;p.spd+=8;}
  if(id==='wind'){p.up.wind++;p.projSpd+=30;p.projLife+=0.12;}
  if(id==='storm'){p.up.storm++;p.cdMul*=0.7;}
  if(id==='fat'){p.up.fat++;p.dmg++;}
  if(id==='lungs'){p.up.lungs++;}
}
function rollChoices(){
  const avail=UPGRADES.filter(u=>u.max());
  const pool=[...avail]; levelChoices=[];
  while(levelChoices.length<3 && pool.length){
    const i=(Math.random()*pool.length)|0;
    levelChoices.push(pool.splice(i,1)[0]);
  }
  levelCursor=0;
}
function tryLevelUp(){
  if(player.xp>=player.xpNext){
    rollChoices();
    if(levelChoices.length){ state='level'; S.level(); return true; }
  }
  return false;
}

/* ---------- Pantalla de titulo (estilo Oracle of Seasons) ---------- */
