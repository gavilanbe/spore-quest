# 🍄 SPORE QUEST · Seta Boy Color

Roguelike de acción estilo **Game Boy Color** (160×144), a lo *Oracle of
Seasons*: Bolet, la última espora libre de Micelia, avanza sala a sala contra
la Marchitez. **4 estaciones rotativas** que recolorean el mundo y transportan
la música, subidas de nivel con mejoras a elegir, **Rey Moho cada 8 salas**
(con reliquia de habilidad B), estelas con lore, cofres, fuentes y minimapa.

**[▶ Jugar](https://gavilanbe.github.io/spore-quest/)** — viene con su propia
**carcasa Seta Boy Color** (Kiwi): d-pad y botones A/B/START/SELECT táctiles
en móvil, teclado en escritorio (flechas/WASD, A=Z/J, B=X/K, START=Enter).

## Cómo está hecho

Todo en un canvas de 160×144 con volcado a escala entera × `devicePixelRatio`
(píxeles perfectos en Retina/iOS). Sin assets: tiles y sprites rasterizados por
código con rng determinista por sala, fuente bitmap 3×5, y chip de sonido Web
Audio con ondas de pulso, secuenciador y transposición por estación. El récord
persiste en `localStorage`.

## Arquitectura (capas ordenadas, sin build)

El juego se carga como **14 capas** de script clásico en orden de dependencia —
cada fichero es una capa cohesiva y la concatenación en orden equivale al
programa completo:

```
index.html           carcasa Seta Boy + manifiesto de capas
css/style.css        la carcasa GBC: pantalla, d-pad, botones, altavoz
js/
  00-screen.js       canvas 160x144, buffer y volcado con escala entera
  01-data.js         constantes, paleta GBC, estaciones, intro y lore
  02-text.js         fuente bitmap 3x5, drawText y ajuste de línea
  03-worldgen.js     rng determinista por sala, tiles y generación de salas
  04-audio.js        chip de audio: pulsos, voces, sfx y música
  05-input.js        teclado, d-pad táctil y botones A/B/START/SELECT
  06-progression.js  habilidades B, mejoras de nivel y tiradas
  07-title-art.js    arte de portada y cinemática
  08-state.js        estado global, salas visitadas y récord
  09-entities.js     enemigos, jefes, Bolet, cofres (dibujo)
  10-actions.js      disparo, carga, habilidades, daño y loot
  11-update.js       update(dt): lógica por estado
  12-render.js       render(): HUD, playfield, menús y overlays
  13-main.js         bucle principal
```

Hecho a mano con Claude Fable 5. ✦
