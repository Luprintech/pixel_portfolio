// Lo que el valle ha crecido desde la plantilla original de 80 × 54 teselas: 12 filas por arriba (el Ayuntamiento y su zona de
// columnas) y 8 columnas por el oeste (la calle de trabajo y la piscina, con más aire). Casi todo lo que vive fuera de `world.js`
// (el río, los puntos de los NPC) se escribió en coordenadas de antes; `shiftY` y `shiftX` las pasan al mapa actual. Va en su
// propio módulo, sin imports, porque `river.js` también lo usa y `world.js` ya importa `river.js` (un ciclo dejaría las constantes
// sin valor al cargar).
export const TEMPLATE_ROWS = 54
export const NORTH_ROWS = 12
export const MAP_ROWS = TEMPLATE_ROWS + NORTH_ROWS
export const TEMPLATE_COLS = 80
export const WEST_COLS = 8
// Por el este se recortó la franja de bosque vacía que quedó al llevar la Mezquita junto a la Universidad (y al quitar el puente de
// tablones del sur): el borde queda a la derecha del conjunto monumental, con una franja de árboles.
export const EAST_TRIM = 16
export const MAP_COLS = TEMPLATE_COLS + WEST_COLS - EAST_TRIM
export const TILE_PX = 16

// Una fila o una columna de antes en teselas del mapa (con decimales si los hay).
export const shiftY = (y) => y + NORTH_ROWS
export const shiftX = (x) => x + WEST_COLS

// Lo mismo para coordenadas en píxeles de la escena (las puertas, los bancos y los puntos de paseo de los NPC).
export const shiftPx = (y) => y + NORTH_ROWS * TILE_PX
export const shiftPxX = (x) => x + WEST_COLS * TILE_PX
