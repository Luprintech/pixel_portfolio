// Estantería de consolas (la colección documentada en `docs/DIALOGOS.md`, sección 8) y la vitrina de piezas impresas del
// rincón maker. Cada consola es reconocible por su silueta y su color, sin copiar logotipos: Nintendo 64, Game Boy
// Color, Nintendo 3DS y Wii arriba; PlayStation 1, 2, 3 y 4 en medio; una Xbox y juegos abajo. El borde de cada balda
// lleva el color de su familia (rojo, azul, verde) para que se lea la clasificación.
import { INK, WOOD, rect, slab } from '../draw.js'

const SHELF_RED = INK.tile
const SHELF_BLUE = INK.blue
const SHELF_GREEN = INK.moss

function n64(g, x, y) {
  slab(g, x, y + 3, 14, 4, '#8d8aa8', '#aaa7c4', '#5c5a7a')
  rect(g, x + 4, y, 6, 3, '#5c5a7a')
  rect(g, x + 5, y + 1, 4, 1, INK.night)
  ;[INK.tile, INK.saffronLight, INK.meadow, INK.lagoonLight].forEach((color, i) => rect(g, x + 2 + i * 3, y + 5, 2, 1, color))
}

// Game Boy Color de pie: cuerpo violeta, pantalla y cruceta.
function gameBoy(g, x, y) {
  slab(g, x, y, 7, 11, INK.plum, '#a05fb5', '#4f2a60')
  rect(g, x + 1, y + 1, 5, 4, INK.night)
  rect(g, x + 2, y + 2, 3, 2, INK.meadow)
  rect(g, x + 1, y + 7, 3, 1, INK.steelLight)
  rect(g, x + 2, y + 6, 1, 3, INK.steelLight)
  rect(g, x + 5, y + 7, 1, 1, INK.tile)
}

// Nintendo 3DS cerrada: dos mitades turquesa con la ranura de luz.
function threeDS(g, x, y) {
  slab(g, x, y + 3, 13, 4, INK.lagoon, INK.lagoonLight, '#2f7a92')
  rect(g, x + 1, y, 11, 3, '#2f7a92')
  rect(g, x + 2, y + 1, 9, 1, INK.lagoonLight)
  rect(g, x + 10, y + 4, 1, 1, INK.saffronLight)
}

// Wii blanca, vertical y estrecha, con la ranura azul del disco.
function wii(g, x, y) {
  slab(g, x, y, 5, 11, INK.white, '#ffffff', INK.whiteShade)
  rect(g, x + 2, y + 2, 1, 6, INK.lagoonLight)
  rect(g, x + 1, y + 9, 3, 1, INK.whiteShade)
}

function psOne(g, x, y) {
  slab(g, x, y + 1, 14, 5, '#a8a6c0', '#cfd0e3', '#6c6a8c')
  rect(g, x + 2, y, 4, 2, '#8d8aa8')
  rect(g, x + 3, y + 1, 2, 1, INK.steelLight)
  rect(g, x + 10, y + 4, 2, 1, INK.night2)
}

function psTwo(g, x, y) {
  slab(g, x, y, 11, 10, INK.night2, INK.slateLight, INK.night)
  rect(g, x + 2, y + 2, 7, 1, INK.night)
  rect(g, x + 2, y + 5, 7, 1, INK.night)
  rect(g, x + 8, y + 8, 2, 1, INK.lagoonLight)
}

function psThree(g, x, y) {
  slab(g, x, y + 1, 11, 8, INK.night, INK.slateLight, '#14132a')
  rect(g, x + 1, y + 2, 9, 1, INK.slate)
  rect(g, x + 8, y + 6, 2, 1, INK.rose)
}

// PlayStation 4: cuña oscura con su franja de luz azul.
function psFour(g, x, y) {
  slab(g, x, y + 3, 14, 5, INK.night, INK.slateLight, '#14132a')
  rect(g, x + 2, y + 1, 11, 2, INK.night2)
  rect(g, x + 3, y + 5, 9, 1, INK.lagoonLight)
}

// Xbox: caja negra con su aro verde.
function xbox(g, x, y) {
  slab(g, x, y, 15, 9, INK.night, INK.slateLight, '#14132a')
  rect(g, x + 5, y + 2, 5, 5, INK.moss)
  rect(g, x + 6, y + 3, 3, 3, INK.meadow)
  rect(g, x + 7, y + 4, 1, 1, INK.night)
  rect(g, x + 1, y + 7, 3, 1, INK.slate)
}

function games(g, x, y, count, offset) {
  const tones = [INK.tile, INK.saffronLight, INK.lagoon, INK.plum, INK.meadow, INK.rose, INK.blue]
  for (let i = 0; i < count; i++) {
    const color = tones[(i + offset) % tones.length]
    rect(g, x + i * 3, y + (i % 3 === 0 ? 1 : 0), 2, 11 - (i % 3 === 0 ? 1 : 0), color)
    rect(g, x + i * 3, y + (i % 3 === 0 ? 1 : 0), 1, 11, INK.whiteShade)
  }
}

export const consoleShelf = {
  w: 64,
  h: 56,
  // El cuerpo llega hasta la pared: así no queda una franja libre e inalcanzable entre la estantería y el fondo.
  body: [{ l: -32, t: -16, r: 32, b: 0 }],
  paint(g) {
    const [deep, dark, mid, light] = WOOD
    rect(g, 0, 0, 64, 56, mid)
    rect(g, 0, 0, 64, 2, light)
    rect(g, 0, 0, 2, 56, light)
    rect(g, 62, 0, 2, 56, dark)
    // Fondo de cada compartimento, más oscuro que la madera.
    ;[[3, 3], [3, 21], [3, 39]].forEach(([x, y]) => {
      rect(g, x, y, 58, 14, dark)
      rect(g, x, y, 58, 1, deep)
    })
    // Baldas con el color de cada familia en el canto.
    ;[[17, SHELF_RED], [35, SHELF_BLUE], [53, SHELF_GREEN]].forEach(([y, color]) => {
      rect(g, 2, y, 60, 3, light)
      rect(g, 2, y + 2, 60, 1, dark)
      rect(g, 2, y, 60, 1, color)
    })
    rect(g, 2, 53, 60, 3, deep)
    n64(g, 6, 6)
    gameBoy(g, 23, 6)
    threeDS(g, 33, 10)
    wii(g, 49, 6)
    psOne(g, 5, 28)
    psTwo(g, 21, 24)
    psThree(g, 35, 26)
    psFour(g, 48, 27)
    xbox(g, 5, 43)
    games(g, 25, 41, 9, 0)
    // Un mando apoyado y una maceta pequeña cierran la fila de abajo.
    rect(g, 52, 47, 8, 3, INK.night2)
    rect(g, 51, 48, 2, 3, INK.night2)
    rect(g, 59, 48, 2, 3, INK.night2)
    rect(g, 54, 48, 1, 1, INK.meadow)
  },
}

// Vitrina del rincón maker: un cartel luminoso en forma de corazón, figuras pintadas a mano y llaveros colgados.
export const makerShelf = {
  w: 36,
  h: 46,
  body: [{ l: -18, t: -10, r: 18, b: 0 }],
  paint(g) {
    const [deep, dark, mid, light] = WOOD
    rect(g, 0, 0, 36, 46, mid)
    rect(g, 0, 0, 36, 2, light)
    rect(g, 0, 0, 2, 46, light)
    rect(g, 34, 0, 2, 46, dark)
    ;[[3, 3], [3, 18], [3, 33]].forEach(([x, y]) => {
      rect(g, x, y, 30, 11, dark)
      rect(g, x, y, 30, 1, deep)
    })
    ;[14, 29].forEach((y) => {
      rect(g, 2, y, 32, 3, light)
      rect(g, 2, y + 2, 32, 1, dark)
    })
    rect(g, 2, 43, 32, 3, deep)
    // Cartel luminoso: placa oscura con un corazón encendido.
    rect(g, 8, 4, 20, 9, INK.night2)
    ;[[11, 6, 2], [14, 6, 2], [18, 6, 2], [21, 6, 2]].forEach(([x, y, w]) => rect(g, x, y, w, 2, INK.rose))
    rect(g, 11, 8, 12, 1, INK.rose)
    rect(g, 12, 9, 10, 1, INK.rose)
    rect(g, 14, 10, 6, 1, INK.rose)
    rect(g, 16, 11, 2, 1, INK.rose)
    rect(g, 12, 6, 1, 1, '#fde0e8')
    // Figuritas pintadas: una redonda con orejas y otra con alas, sobre su balda.
    rect(g, 6, 21, 7, 7, INK.saffronLight)
    rect(g, 7, 19, 2, 2, INK.saffronLight)
    rect(g, 10, 19, 2, 2, INK.saffronLight)
    rect(g, 8, 23, 1, 1, INK.night)
    rect(g, 11, 23, 1, 1, INK.night)
    rect(g, 9, 25, 1, 1, INK.tile)
    rect(g, 18, 22, 6, 6, INK.lagoonLight)
    rect(g, 16, 23, 2, 3, INK.lagoon)
    rect(g, 24, 23, 2, 3, INK.lagoon)
    rect(g, 19, 24, 1, 1, INK.night)
    rect(g, 22, 24, 1, 1, INK.night)
    rect(g, 27, 24, 4, 4, INK.plum)
    // Jarrón de líneas y llaveros colgados de ganchos.
    rect(g, 6, 38, 6, 5, INK.teal)
    rect(g, 7, 36, 4, 2, INK.teal)
    rect(g, 6, 40, 6, 1, '#1f6b68')
    ;[[16, INK.tile], [20, INK.saffronLight], [24, INK.meadow], [28, INK.lagoonLight]].forEach(([x, color]) => {
      rect(g, x, 35, 1, 3, INK.steelLight)
      rect(g, x - 1, 38, 3, 3, color)
    })
  },
}
