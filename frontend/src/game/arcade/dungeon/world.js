// Mundo de «La espada del Bucle»: una aventura corta de cinco salas conectadas, a la manera de las mazmorras de 8 bits.
//   bosque  -> el mago explica la invasión de limos y la viajera encuentra su primera espada.
//   limos   -> bosque de los limos: enemigos sencillos, obstáculos y monedas; al norte, la cueva.
//   cueva   -> pasillos con murciélagos, una llave en un cofre y una puerta cerrada.
//   acertijo-> dos bloques que hay que empujar sobre dos placas para abrir la reja.
//   jefe    -> el Rey Limo, con tres fases, y el Cristal del Bucle como recompensa.
// Son solo datos; la lógica está en `logic.js` y el dibujo en `render.js`. Sin dependencias de Phaser ni de React.

export const TILE = 16
export const COLS = 15
export const ROWS = 11
// Franja superior del lienzo para el marcador (corazones, llave, monedas).
export const HUD = 16
export const WIDTH = COLS * TILE
export const HEIGHT = ROWS * TILE + HUD

// Leyenda del mapa: '.' suelo · 'F' flores (suelo) · 'T' árbol · 'R' roca · 'B' arbusto · '~' agua · '#' muro · 'P' pilar ·
// 'W' el mago · 'C' cofre (sus datos están en `chests`) · 'L' puerta con llave · 'G' reja del acertijo · 'U' entrada de la
// cueva o escalera · 'S' placa del suelo. Los bloques empujables no son casillas: van en `blocks`.
export const SOLID_TILES = new Set(['T', 'R', '~', '#', 'P', 'W', 'B'])

export const ROOMS = {
  bosque: {
    theme: 'forest',
    map: [
      'TTTTTTTTTTTTTTT',
      'T.....F...BBBBT',
      'T..W.......BCBT',
      'T.............T',
      'T......RR.....T',
      'T..............',
      'T.............T',
      'T..~~.........T',
      'T..~~......F..T',
      'T.............T',
      'TTTTTTTTTTTTTTT',
    ],
    // Sin espada no se sale del claro: el mago lo avisa y la viajera no se ve sola entre limos.
    links: { right: { room: 'limos', needs: 'sword' } },
    chests: [{ col: 12, row: 2, item: 'sword' }],
    enemies: [],
  },
  limos: {
    theme: 'forest',
    map: [
      'TTTTTTTUTTTTTTT',
      'T.............T',
      'T..RR....~~...T',
      'T..RR....~~...T',
      'T.............T',
      '..............T',
      'T.....TT......T',
      'T.....TT..RR..T',
      'T.............T',
      'T..B.......B..T',
      'TTTTTTTTTTTTTTT',
    ],
    links: { left: 'bosque' },
    stairs: { '7,0': { room: 'cueva', x: 7, y: 9 } },
    enemies: [
      { type: 'slime', col: 4, row: 4 },
      { type: 'slime', col: 11, row: 4 },
      { type: 'slime', col: 8, row: 8 },
      { type: 'slime', col: 12, row: 8 },
    ],
    coins: [{ col: 2, row: 1 }, { col: 12, row: 1 }, { col: 10, row: 5 }, { col: 3, row: 8 }, { col: 7, row: 5 }],
  },
  cueva: {
    theme: 'dungeon',
    map: [
      '###############',
      '#C....P.......#',
      '#.............#',
      '###########.###',
      '#.............#',
      '#.....P.......L',
      '###.###########',
      '#.............#',
      '#.............#',
      '#.............#',
      '#######U#######',
    ],
    links: { right: 'acertijo' },
    stairs: { '7,10': { room: 'limos', x: 7, y: 1 } },
    chests: [{ col: 1, row: 1, item: 'key' }],
    enemies: [
      { type: 'bat', col: 9, row: 8 },
      { type: 'slime', col: 4, row: 8 },
      { type: 'bat', col: 10, row: 4 },
      { type: 'slime', col: 3, row: 5 },
      { type: 'bat', col: 8, row: 2 },
    ],
    coins: [{ col: 13, row: 9 }, { col: 12, row: 4 }, { col: 2, row: 2 }, { col: 13, row: 7 }],
  },
  acertijo: {
    theme: 'dungeon',
    map: [
      '###############',
      '#.............#',
      '#.....P.......#',
      '#.........S...#',
      '#.............#',
      '..............G',
      '#.............#',
      '#.........S...#',
      '#.....P.......#',
      '#.............#',
      '###############',
    ],
    links: { left: 'cueva', right: 'jefe' },
    // Dos bloques que empujar por sus filas hasta las dos placas. Si uno se atasca, salir y volver a entrar lo devuelve a su sitio.
    blocks: [{ col: 4, row: 3 }, { col: 4, row: 7 }],
    enemies: [],
    coins: [{ col: 12, row: 1 }, { col: 12, row: 9 }, { col: 2, row: 5 }],
  },
  jefe: {
    theme: 'dungeon',
    map: [
      '###############',
      '#.............#',
      '#..P.......P..#',
      '#.............#',
      '#.............#',
      '..............#',
      '#.............#',
      '#.............#',
      '#..P.......P..#',
      '#.............#',
      '###############',
    ],
    links: { left: 'acertijo' },
    // El cristal está en el centro y solo aparece tras la escena de victoria (`logic.js`).
    enemies: [{ type: 'boss', col: 11, row: 5 }],
  },
}

export const START = { room: 'bosque', x: 7, y: 7 }

// Dónde cae la viajera al entrar en una sala por primera vez (puntos de control): se guarda al pisar cada sala nueva.
export const CHECKPOINT_ROOMS = new Set(['limos', 'cueva', 'acertijo', 'jefe'])

// Cuánto vale cada enemigo: vida, velocidad (px/s) y tamaño de su caja.
export const ENEMIES = {
  slime: { hp: 2, speed: 26, size: 12 },
  bat: { hp: 1, speed: 46, size: 12 },
  boss: { hp: 14, speed: 22, size: 24 },
}

// Vida del jefe en la que empieza cada fase: de 14 a 10 la primera, de 9 a 5 la segunda y de 4 a 1 la tercera.
export const BOSS_PHASES = [14, 9, 4]

// Cuánto vale una moneda y qué da vencer al jefe (para la pantalla de resultados).
export const COIN_SCORE = 10
export const BOSS_SCORE = 500
export const CRYSTAL_BONUS = 200
