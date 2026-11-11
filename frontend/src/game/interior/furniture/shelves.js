// Estantería de consolas (la colección documentada en `docs/DIALOGOS.md`, sección 8) y la vitrina de piezas impresas del
// rincón maker. Cada consola es reconocible por su silueta y su color, sin copiar logotipos: Nintendo 64, Game Boy
// Color, Nintendo 3DS y Wii arriba; PlayStation 1, 2, 3 y 4 en medio; una Xbox, una Switch, una GameCube y mandos abajo.
// El borde de cada balda lleva el color de su familia (rojo, azul, verde) para que se lea la clasificación. Cada pieza se
// coloca por su base (`SHELF` es la fila de la balda): apoya sobre la madera, nunca queda en el aire.
import { INK, WHITE_FURNITURE, rect, slab } from '../draw.js'
import { SIGN_H, drawLuprintechSign } from '../signs.js'
import { FIGURES, drawMap } from '../figures.js'

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

// Nintendo Switch con sus mandos acoplados: pantalla en medio, uno azul a la izquierda y otro rojo a la derecha.
function switchConsole(g, x, y) {
  rect(g, x, y, 14, 8, INK.night)
  rect(g, x, y, 3, 8, INK.lagoonLight)
  rect(g, x + 11, y, 3, 8, INK.tile)
  rect(g, x + 4, y + 1, 6, 5, INK.night2)
  rect(g, x + 5, y + 2, 4, 3, INK.lagoon)
  rect(g, x + 1, y + 2, 1, 1, INK.white)
  rect(g, x + 12, y + 5, 1, 1, INK.white)
}

// GameCube: un cubo violeta con el asa arriba y la tapa del disco.
function gameCube(g, x, y) {
  slab(g, x, y, 11, 9, INK.plum, '#a05fb5', '#4f2a60')
  rect(g, x + 4, y - 1, 3, 1, '#4f2a60')
  rect(g, x + 3, y + 2, 5, 4, INK.night)
  rect(g, x + 4, y + 3, 3, 2, INK.slate)
  rect(g, x + 8, y + 7, 2, 1, INK.saffronLight)
}

// Mando apoyado de lado: cuerpo con dos empuñaduras y botones de colores.
function pad(g, x, y, color) {
  rect(g, x + 1, y, 6, 3, color)
  rect(g, x, y + 2, 2, 2, color)
  rect(g, x + 6, y + 2, 2, 2, color)
  rect(g, x + 2, y + 1, 1, 1, INK.night)
  rect(g, x + 5, y + 1, 1, 1, INK.saffronLight)
  rect(g, x + 4, y, 1, 1, INK.tile)
}

export const consoleShelf = {
  w: 64,
  h: 56,
  // El cuerpo llega hasta la pared: así no queda una franja libre e inalcanzable entre la estantería y el fondo.
  body: [{ l: -32, t: -16, r: 32, b: 0 }],
  paint(g) {
    const [deep, dark, mid, light] = WHITE_FURNITURE
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
    // Cada pieza se coloca por su base: la altura de la balda menos lo que mide.
    n64(g, 6, 10)
    gameBoy(g, 23, 6)
    threeDS(g, 33, 10)
    wii(g, 49, 6)
    pad(g, 54, 13, INK.white)
    psOne(g, 5, 29)
    psTwo(g, 21, 25)
    psThree(g, 35, 26)
    psFour(g, 48, 27)
    xbox(g, 5, 44)
    switchConsole(g, 22, 45)
    gameCube(g, 38, 44)
    pad(g, 51, 49, INK.night2)
  },
}

// Vitrina del rincón maker: el rótulo de Luprintech encima y, debajo, las figuras de `FIGURES` con `shelf`, colocadas solas
// de tres en tres por balda (centradas en su fila). Añadir una figura al catálogo basta: si no cabe, la vitrina gana una balda.
export const SHELF_COLS = 3
const SLOT_W = 10
const ROW_PITCH = 15
const shelfFigures = FIGURES.filter((figure) => figure.shelf)
const ROWS = Math.max(1, Math.ceil(shelfFigures.length / SHELF_COLS))
// Alto del mueble sin el rótulo.
export const SHELF_BODY_H = ROW_PITCH * ROWS + 1

export const makerShelf = {
  w: 44,
  h: SIGN_H + SHELF_BODY_H,
  body: [{ l: -18, t: -10, r: 18, b: 0 }],
  paint(g) {
    const [deep, dark, mid, light] = WHITE_FURNITURE
    // El rótulo flota encima de la vitrina, más ancho que ella: arriba del todo y sin fondo.
    drawLuprintechSign(g, 0, 0, false)
    g.save()
    g.translate(4, SIGN_H)
    rect(g, 0, 0, 36, SHELF_BODY_H, mid)
    rect(g, 0, 0, 36, 2, light)
    rect(g, 0, 0, 2, SHELF_BODY_H, light)
    rect(g, 34, 0, 2, SHELF_BODY_H, dark)
    for (let row = 0; row < ROWS; row++) {
      const top = 3 + ROW_PITCH * row
      rect(g, 3, top, 30, 11, dark)
      rect(g, 3, top, 30, 1, deep)
      if (row < ROWS - 1) {
        rect(g, 2, top + 11, 32, 3, light)
        rect(g, 2, top + 13, 32, 1, dark)
      }
    }
    rect(g, 2, SHELF_BODY_H - 3, 32, 3, deep)
    // Cada figura apoya en el suelo de su compartimento (una fila de 3 ocupa los 30 de ancho; si hay menos, se centran).
    shelfFigures.forEach((figure, i) => {
      const row = Math.floor(i / SHELF_COLS)
      const inRow = Math.min(SHELF_COLS, shelfFigures.length - row * SHELF_COLS)
      const left = 3 + (30 - inRow * SLOT_W) / 2 + (i % SHELF_COLS) * SLOT_W + 1
      drawMap(g, left, 4 + ROW_PITCH * row, figure.shelf)
    })
    g.restore()
  },
}
