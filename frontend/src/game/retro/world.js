// Mundo del juego retro de la consola de Lupe: una aventura de pantallas sueltas, como las de 8 bits. Cinco salas: la
// aldea con su sabio, el bosque con la entrada de la cueva, y tres de mazmorra (la cámara del cofre de la espada, la sala
// de los monstruos con la llave y la sala del jefe, con el Cristal del Bucle). Son solo datos; la lógica está en
// `logic.js` y el dibujo en `render.js`. Sin dependencias de Phaser ni de React.

export const TILE = 16
export const COLS = 10
export const ROWS = 9
// Franja superior del lienzo para el marcador (corazones, llave, monedas).
export const HUD = 16
export const WIDTH = COLS * TILE
export const HEIGHT = ROWS * TILE + HUD

// Leyenda del mapa: '.' suelo · 'T' árbol · 'R' roca · '~' agua · '#' muro · 'P' pilar · 'N' el sabio · 'C' cofre
// (sus datos están en `chests`) · 'L' puerta cerrada con llave · 'U' escalera o entrada de la cueva · 'B' arbusto.
export const SOLID_TILES = new Set(['T', 'R', '~', '#', 'P', 'N', 'B'])

export const ROOMS = {
  aldea: {
    theme: 'forest',
    map: [
      'TTTTTTTTTT',
      'T........T',
      'T..N.....T',
      'T........T',
      'T.........',
      'T........T',
      'T..RR....T',
      'T........T',
      'TTTTTTTTTT',
    ],
    links: { right: 'bosque' },
    enemies: [],
  },
  bosque: {
    theme: 'forest',
    map: [
      'TTTTTUTTTT',
      'T........T',
      'T..~~....T',
      'T..~~....T',
      '.........T',
      'T........T',
      'T....RR..T',
      'T........T',
      'TTTTTTTTTT',
    ],
    links: { left: 'aldea' },
    // Entrar en la cueva lleva a la cámara del cofre, ante su escalera de salida.
    stairs: { '5,0': { room: 'camara', x: 5, y: 7 } },
    enemies: [{ type: 'slime', col: 6, row: 2 }, { type: 'slime', col: 7, row: 6 }],
  },
  camara: {
    theme: 'dungeon',
    map: [
      '##########',
      '#........#',
      '#........#',
      '#...C....#',
      '#.........',
      '#........#',
      '#........#',
      '#........#',
      '#####U####',
    ],
    // La cámara del cofre sale a la sala de los monstruos por la derecha.
    links: { right: 'sala' },
    stairs: { '5,8': { room: 'bosque', x: 5, y: 1 } },
    chests: [{ col: 4, row: 3, item: 'sword' }],
    enemies: [],
  },
  sala: {
    theme: 'dungeon',
    map: [
      '#####L####',
      '#.......C#',
      '#........#',
      '#...##...#',
      '.........#',
      '#........#',
      '#...##...#',
      '#........#',
      '##########',
    ],
    links: { left: 'camara', up: 'jefe' },
    chests: [{ col: 8, row: 1, item: 'key' }],
    enemies: [{ type: 'slime', col: 3, row: 2 }, { type: 'slime', col: 6, row: 6 }, { type: 'bat', col: 7, row: 3 }],
  },
  jefe: {
    theme: 'dungeon',
    map: [
      '##########',
      '#........#',
      '#........#',
      '#..P..P..#',
      '#........#',
      '#..P..P..#',
      '#........#',
      '#........#',
      '#####.####',
    ],
    links: { down: 'sala' },
    // El cofre del cristal aparece cuando el jefe cae.
    chests: [{ col: 5, row: 1, item: 'crystal', afterClear: true }],
    enemies: [{ type: 'boss', col: 5, row: 3 }],
  },
}

export const START = { room: 'aldea', x: 4, y: 7 }

// Cuánto vale cada enemigo: vida, velocidad (px/s) y daño por contacto.
export const ENEMIES = {
  slime: { hp: 2, speed: 26, size: 12 },
  bat: { hp: 1, speed: 46, size: 12 },
  boss: { hp: 8, speed: 20, size: 22 },
}
