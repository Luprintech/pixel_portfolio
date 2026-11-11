// Rincón de impresión 3D con dos impresoras de estilo Bambu Lab (carcasa gris carbón, acentos verdes y pantalla en la
// base): a la izquierda la A1, grande, con el AMS lite arriba y sus cuatro bobinas a la vista; a la derecha la A1 mini,
// pequeña, con su pantalla para imprimir. Imprimen de verdad, capa a capa: la pieza crece desde la placa y el brazo sube
// con ella, de modo que la boquilla siempre apoya sobre la última capa (nunca por encima ni por dentro). La vitrina de
// piezas ya terminadas está en `shelves.js`.
import { drawText } from '../../pixelFont.js'
import { INK, WOOD, canvasOf, rect, slab } from '../draw.js'
import { drawPokemon } from '../figures.js'

const BODY = '#34343f'
const BODY_LIGHT = '#5c5a7a'
const SHELL = '#d9d6e6'
const BAMBU_GREEN = '#00ae42'

// Alto del cabezal, del brazo a la punta de la boquilla: la punta queda `NOZZLE_DROP` filas bajo el brazo.
const NOZZLE_DROP = 15
// La pieza más alta que imprimen (la figura del pokémon mide 16).
export const MAX_PIECE = 16

function table(g, x, top, width, height) {
  const [deep, dark, mid, light] = WOOD
  slab(g, x, top, width, 5, light, '#d9a173', mid)
  rect(g, x, top + 5, width, 2, dark)
  ;[x + 2, x + width - 5].forEach((lx) => {
    rect(g, lx, top + 7, 3, height - top - 7, mid)
    rect(g, lx, top + 7, 1, height - top - 7, light)
    rect(g, lx - 1, height - 1, 5, 1, deep)
  })
  rect(g, x + 2, top + 14, width - 4, 2, dark)
}

function spool(g, x, y, color, turn) {
  rect(g, x + 1, y, 6, 8, color)
  rect(g, x, y + 1, 8, 6, color)
  rect(g, x + 3, y + 3, 2, 2, INK.night)
  rect(g, x + (turn ? 5 : 1), y + 2, 1, 1, SHELL)
  rect(g, x, y + 1, 1, 6, SHELL)
}

// Dónde queda el brazo para que la boquilla toque la pieza de `height` filas sobre la placa de una base en `top`.
export const armFor = (top, height) => top - 2 - height - NOZZLE_DROP

// Cuerpo de una impresora Bambu de bastidor en C: base con pantalla y logotipo, columna a la izquierda, brazo con el cabezal
// (cuya posición manda `armY`, a la altura de la pieza) y la placa con la pieza (`piece`, que pinta sobre `plateTop`).
function bambu(g, { x, top, w, columnTop, armY, headX, screenLit, piece }) {
  slab(g, x, top, w, 7, BODY, BODY_LIGHT, INK.night)
  rect(g, x + 3, top + 2, 17, 3, INK.night)
  drawText(g, x + 4, top + 1, 'BAMBU', BAMBU_GREEN)
  rect(g, x + w - 11, top + 1, 8, 5, screenLit ? INK.lagoonLight : INK.night2)
  rect(g, x + w - 10, top + 2, 6, 1, screenLit ? INK.white : INK.slate)
  rect(g, x + w - 10, top + 4, 3, 1, screenLit ? BAMBU_GREEN : INK.slate)
  const plateTop = top - 2
  rect(g, x + 4, plateTop, w - 8, 2, SHELL)
  rect(g, x + 4, plateTop, w - 8, 1, '#ffffff')
  piece(g, plateTop)
  slab(g, x, columnTop, 6, top - columnTop, BODY, BODY_LIGHT, INK.night)
  rect(g, x + 2, columnTop + 2, 2, 4, BAMBU_GREEN)
  slab(g, x, armY, w - 3, 5, BODY, BODY_LIGHT, INK.night)
  rect(g, x + 6, armY + 5, w - 9, 1, INK.steel)
  // Cabezal con su ventilador y la boquilla.
  slab(g, headX, armY + 5, 9, 8, SHELL, '#ffffff', INK.steelLight)
  rect(g, headX + 2, armY + 7, 5, 3, INK.night2)
  rect(g, headX + 3, armY + 8, 3, 1, BAMBU_GREEN)
  rect(g, headX + 3, armY + 13, 3, 2, INK.saffron)
}

// Barrido del cabezal sobre la pieza: va y viene alrededor de su centro.
const SWEEP = [-6, 0, 6, 0]

// A1 (izquierda): imprime en bucle un jarrón turquesa, ocho tandas de dos filas, y lo deja terminado un momento antes de
// empezar otro. Los fotogramas 0 a 7 son las tandas y el 8 la pieza acabada, con el brazo subido.
export const printerA1 = {
  w: 64,
  h: 92,
  frames: 9,
  ms: 900,
  body: [{ l: -30, t: -14, r: 30, b: 0 }],
  paint(g, frame) {
    const top = 65
    table(g, 2, 72, 60, 92)
    // AMS lite sobre la impresora: caja baja con las cuatro bobinas de filamento a la vista y los tubos hacia el cabezal.
    slab(g, 10, 2, 46, 5, SHELL, '#ffffff', INK.steelLight)
    rect(g, 12, 7, 42, 2, BODY)
    ;[INK.tile, INK.saffron, INK.lagoon, INK.meadow].forEach((color, i) => spool(g, 12 + i * 10, 8, color, (frame + i) % 2 === 0))
    rect(g, 10, 17, 46, 1, BODY_LIGHT)
    rect(g, 18, 18, 28, 1, INK.steelLight)
    const done = frame === 8
    const height = done ? MAX_PIECE : 2 + frame * 2
    const armY = done ? armFor(top, MAX_PIECE) - 4 : armFor(top, height)
    const headX = 8 + 28 - 4 + (done ? 0 : SWEEP[frame % SWEEP.length])
    rect(g, 31, 18, 1, Math.max(0, armY - 18), INK.steelLight)
    bambu(g, {
      x: 8,
      top,
      w: 48,
      columnTop: 22,
      armY,
      headX,
      screenLit: frame % 2 === 0,
      piece(gg, plateTop) {
        for (let row = 0; row < height; row++) {
          rect(gg, 8 + 4 + 18, plateTop - 1 - row, 12, 1, row % 2 ? INK.teal : INK.lagoonLight)
        }
        rect(gg, 8 + 4 + 18, plateTop - height, 12, 1, '#ffffff')
      },
    })
  },
}

// Fotogramas de la A1 mini: 0 en reposo, 1 a 8 las tandas de la impresión (la figura crece desde los pies) y 9 terminada.
export const MINI_STAGES = 8
export const printerMini = {
  w: 46,
  h: 78,
  ms: 480,
  frames: MINI_STAGES + 2,
  modes: { idle: [0], printing: Array.from({ length: MINI_STAGES }, (_, i) => i + 1), done: [MINI_STAGES + 1] },
  body: [{ l: -21, t: -14, r: 21, b: 0 }],
  paint(g, frame) {
    const top = 54
    table(g, 2, 60, 42, 78)
    spool(g, 31, 2, INK.saffron, frame % 2 === 0)
    rect(g, 34, 10, 1, 12, INK.steelLight)
    const stage = frame >= 1 && frame <= MINI_STAGES ? frame : 0
    const done = frame === MINI_STAGES + 1
    const height = done ? MAX_PIECE : Math.round((stage / MINI_STAGES) * MAX_PIECE)
    const armY = done ? armFor(top, MAX_PIECE) - 4 : armFor(top, height)
    const headX = 6 + 13 + (stage ? SWEEP[stage % SWEEP.length] : 4)
    bambu(g, {
      x: 6,
      top,
      w: 34,
      columnTop: 14,
      armY,
      headX,
      screenLit: stage > 0 || done || frame === 0,
      piece(gg, plateTop) {
        if (!height) return
        // La figura crece desde los pies: se copian solo las filas de abajo, tantas como lleva impresas.
        const { canvas, g: figure } = canvasOf(16, 16)
        drawPokemon(figure, 0, 0)
        gg.drawImage(canvas, 0, 16 - height, 16, height, 6 + 4 + 5, plateTop - height, 16, height)
      },
    })
  },
}
