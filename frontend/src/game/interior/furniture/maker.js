// Rincón de impresión 3D con dos impresoras de estilo Bambu Lab (carcasa gris carbón, acentos verdes y pantalla en la
// base): a la izquierda la A1, grande, con el AMS lite arriba y sus cuatro bobinas a la vista; a la derecha la A1 mini,
// pequeña, con su pantalla para imprimir. El cabezal recorre el eje y los leds parpadean. La vitrina de piezas ya
// terminadas está en `shelves.js`.
import { drawText } from '../../pixelFont.js'
import { INK, WOOD, rect, slab } from '../draw.js'
import { drawPokemon } from '../figures.js'

const BODY = '#34343f'
const BODY_LIGHT = '#5c5a7a'
const SHELL = '#d9d6e6'
const BAMBU_GREEN = '#00ae42'

// Posición horizontal del cabezal en cada fotograma de impresión: va y viene.
const SWEEP = [0, 4, 8, 4]

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

// Cuerpo de una impresora Bambu de bastidor en C: base con pantalla y logotipo, columna a la izquierda, brazo con el cabezal
// y cama con su placa. `w` es el ancho útil; `x, top` la esquina de la base.
function bambu(g, { x, top, w, columnTop, headX, bed, screenLit }) {
  const baseTop = top
  slab(g, x, baseTop, w, 7, BODY, BODY_LIGHT, INK.night)
  rect(g, x + 3, baseTop + 2, 17, 3, INK.night)
  drawText(g, x + 4, baseTop + 1, 'BAMBU', BAMBU_GREEN)
  rect(g, x + w - 11, baseTop + 1, 8, 5, screenLit ? INK.lagoonLight : INK.night2)
  rect(g, x + w - 10, baseTop + 2, 6, 1, screenLit ? INK.white : INK.slate)
  rect(g, x + w - 10, baseTop + 4, 3, 1, screenLit ? BAMBU_GREEN : INK.slate)
  // Placa de impresión sobre la base.
  rect(g, x + 4, baseTop - 2, w - 8, 2, SHELL)
  rect(g, x + 4, baseTop - 2, w - 8, 1, '#ffffff')
  bed(g, x + 4, baseTop - 2)
  // Columna izquierda y brazo.
  slab(g, x, columnTop, 6, baseTop - columnTop, BODY, BODY_LIGHT, INK.night)
  rect(g, x + 2, columnTop + 2, 2, 4, BAMBU_GREEN)
  const armY = baseTop - 17
  slab(g, x, armY, w - 3, 5, BODY, BODY_LIGHT, INK.night)
  rect(g, x + 6, armY + 5, w - 9, 1, INK.steel)
  // Cabezal con su ventilador y la boquilla.
  const hx = x + 10 + headX
  slab(g, hx, armY + 5, 9, 8, SHELL, '#ffffff', INK.steelLight)
  rect(g, hx + 2, armY + 7, 5, 3, INK.night2)
  rect(g, hx + 3, armY + 8, 3, 1, BAMBU_GREEN)
  rect(g, hx + 3, armY + 13, 3, 2, INK.saffron)
}

export const printerA1 = {
  w: 64,
  h: 78,
  frames: 4,
  ms: 520,
  body: [{ l: -30, t: -14, r: 30, b: 0 }],
  paint(g, frame) {
    table(g, 2, 58, 60, 78)
    // AMS lite sobre la impresora: caja baja con las cuatro bobinas de filamento a la vista y los tubos hacia el cabezal.
    slab(g, 10, 2, 46, 5, SHELL, '#ffffff', INK.steelLight)
    rect(g, 12, 7, 42, 2, BODY)
    ;[INK.tile, INK.saffron, INK.lagoon, INK.meadow].forEach((color, i) => spool(g, 12 + i * 10, 8, color, (frame + i) % 2 === 0))
    rect(g, 10, 17, 46, 1, BODY_LIGHT)
    ;[16, 26, 36, 46].forEach((tx, i) => {
      rect(g, tx + 3, 17, 1, 8 + i * 0, INK.steelLight)
    })
    rect(g, 18, 25, 28, 1, INK.steelLight)
    rect(g, 31, 26, 1, 11, INK.steelLight)
    bambu(g, {
      x: 8,
      top: 51,
      w: 48,
      columnTop: 18,
      headX: SWEEP[frame % SWEEP.length] * 2,
      screenLit: frame % 2 === 0,
      // Pieza a medio imprimir sobre la placa.
      bed(gg, bx, by) {
        rect(gg, bx + 20, by - 5, 8, 5, INK.teal)
        rect(gg, bx + 21, by - 7, 6, 2, INK.lagoonLight)
      },
    })
  },
}

// A1 mini: modos de la pantalla de la impresora (ver `homeBuilder`): en reposo, imprimiendo (cabezal en marcha y pieza que
// crece) y terminada (con la figura sobre la placa).
export const printerMini = {
  w: 46,
  h: 62,
  ms: 480,
  frames: 6,
  modes: { idle: [0], printing: [1, 2, 3, 4], done: [5] },
  body: [{ l: -21, t: -14, r: 21, b: 0 }],
  paint(g, frame) {
    table(g, 2, 44, 42, 62)
    // Bobina colgada atrás, como en la A1 mini.
    spool(g, 31, 8, INK.saffron, frame % 2 === 0)
    rect(g, 34, 16, 1, 6, INK.steelLight)
    const printing = frame >= 1 && frame <= 4
    const done = frame === 5
    bambu(g, {
      x: 6,
      top: 38,
      w: 34,
      columnTop: 14,
      headX: printing ? SWEEP[frame % SWEEP.length] : 4,
      screenLit: printing || done || frame === 0,
      bed(gg, bx, by) {
        if (printing) {
          const layers = frame
          rect(gg, bx + 11, by - layers, 8, layers, '#f8d63a')
        } else if (done) drawPokemon(gg, bx + 10, by - 16)
      },
    })
  },
}
