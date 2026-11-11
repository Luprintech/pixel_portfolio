// Rincón de impresión 3D con dos impresoras de estilo Bambu Lab, blancas con detalles verdes: a la izquierda la A1, grande,
// de bastidor completo (dos columnas y un travesaño arriba) con el AMS lite encima y el eje del cabezal que sube con la pieza;
// a la derecha la A1 mini, con un único soporte vertical a la izquierda y la bobina a su lado. Imprimen de verdad, capa a capa:
// la pieza crece desde la placa, el eje (el brazo) sube con ella y el cabezal barre de lado a lado, de modo que la boquilla
// siempre apoya sobre la última capa (nunca por encima ni por dentro). La vitrina de piezas ya terminadas está en
// `shelves.js`.
import { drawSmallText } from '../../pixelFont.js'
import { line } from '../../pixelKit.js'
import { INK, WHITE_FURNITURE, canvasOf, rect, slab } from '../draw.js'
import { FIGURES, drawPokemon } from '../figures.js'

const WHITE = INK.white
const SHADE = INK.whiteShade
const BRIGHT = '#ffffff'
const GREEN = '#00ae42'
const GREEN_DARK = '#007a2e'
const GREEN_LIGHT = '#b8f5c8'

// Alto del cabezal, del brazo a la punta de la boquilla: la punta queda `NOZZLE_DROP` filas bajo el brazo.
const NOZZLE_DROP = 15
// La pieza más alta que imprimen (la figura del pokémon mide 16).
export const MAX_PIECE = 16

// Barrido del cabezal sobre la pieza: cuatro posiciones por tanda (centro-izquierda, derecha y vuelta). Los dos primeros
// tramos son de ida y los dos últimos de vuelta; en cada mitad se imprime una fila de la pieza.
const SWEEP = [-6, 0, 6, 0]
export const SWEEPS = SWEEP.length
// Cada tanda añade dos filas a la pieza (la figura mide 16 y se imprime en ocho tandas).
const ROWS_PER_STAGE = 2
export const MINI_STAGES = 8

function table(g, x, top, width, height) {
  const [deep, dark, mid, light] = WHITE_FURNITURE
  slab(g, x, top, width, 5, mid, light, dark)
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
  rect(g, x + (turn ? 5 : 1), y + 2, 1, 1, WHITE)
  rect(g, x, y + 1, 1, 6, WHITE)
}

// Dónde queda el brazo para que la boquilla toque la pieza de `height` filas sobre la placa de una base en `top`.
export const armFor = (top, height) => top - 2 - height - NOZZLE_DROP

// Altura impresa en un fotograma: la tanda `stage` (empezando en 0) ya lleva `stage` tandas completas y, según el tramo del
// barrido, una o dos filas de la suya.
export const printedRows = (stage, sweep) => stage * ROWS_PER_STAGE + (sweep < SWEEPS / 2 ? 1 : 2)

// Figura que crece desde los pies sobre la placa: se copian solo las filas de abajo, tantas como lleva impresas.
function growFigure(g, draw, height, centerX, plateTop) {
  if (!height) return
  const { canvas, g: figure } = canvasOf(16, 16)
  draw(figure)
  g.drawImage(canvas, 0, 16 - height, 16, height, centerX - 8, plateTop - height, 16, height)
}

// Soporte vertical blanco con la varilla del eje Z a la vista, tapa verde arriba y una banda verde de la marca.
function column(g, x, top, bottom) {
  slab(g, x, top, 5, bottom - top, WHITE, BRIGHT, SHADE)
  rect(g, x + 2, top + 2, 1, bottom - top - 3, INK.steelLight)
  rect(g, x, top, 5, 2, GREEN)
  rect(g, x, top, 5, 1, GREEN_LIGHT)
  rect(g, x + 1, top + 9, 3, 2, GREEN)
}

// Cuerpo de una impresora Bambu: base con pantalla y logotipo, soportes (uno a la izquierda, o los dos con un travesaño
// arriba), el brazo que sube y baja por ellos con el cabezal (cuya posición manda `armY`, a la altura de la pieza), el tubo de
// filamento hasta el cabezal, el rótulo (`label`, en letra pequeña para que no tape la pantalla) y la placa con la pieza (`piece`, que pinta sobre `plateTop`).
function bambu(g, { x, top, w, columnTop, framed, armY, headX, screenLit, piece, tubeFrom, label }) {
  slab(g, x, top, w, 7, WHITE, BRIGHT, SHADE)
  drawSmallText(g, x + 3, top + 2, label, GREEN)
  rect(g, x + w - 11, top + 1, 8, 5, INK.night)
  rect(g, x + w - 10, top + 2, 6, 3, screenLit ? INK.lagoonLight : INK.night2)
  rect(g, x + w - 10, top + 2, 3, 1, screenLit ? BRIGHT : INK.slate)
  rect(g, x + w - 7, top + 4, 3, 1, screenLit ? GREEN : INK.slate)
  const plateTop = top - 2
  rect(g, x + 4, plateTop, w - 8, 2, INK.steelLight)
  rect(g, x + 4, plateTop, w - 8, 1, BRIGHT)
  rect(g, x + 4, plateTop + 1, w - 8, 1, GREEN)
  piece(g, plateTop)
  column(g, x, columnTop, top)
  if (framed) {
    column(g, x + w - 5, columnTop, top)
    slab(g, x, columnTop, w, 4, WHITE, BRIGHT, SHADE)
    rect(g, x + 6, columnTop + 1, w - 12, 1, GREEN)
  }
  // El tubo va por detrás del brazo y acaba en el cabezal, así que sigue su movimiento.
  line(g, tubeFrom.x, tubeFrom.y, headX + 4, armY + 4, INK.steel)
  const arm = framed ? w : w - 3
  slab(g, x, armY, arm, 5, WHITE, BRIGHT, SHADE)
  rect(g, x + 2, armY + 2, arm - 4, 1, GREEN)
  rect(g, x + (framed ? 5 : 6), armY + 5, arm - (framed ? 10 : 9), 1, INK.steel)
  // Cabezal con su ventilador y la boquilla.
  slab(g, headX, armY + 5, 9, 8, WHITE, BRIGHT, SHADE)
  rect(g, headX + 2, armY + 7, 5, 3, INK.night2)
  rect(g, headX + 3, armY + 8, 3, 1, GREEN)
  rect(g, headX, armY + 11, 9, 1, GREEN_DARK)
  rect(g, headX + 3, armY + 13, 3, 2, INK.saffron)
}

// A1 (izquierda): imprime en bucle a Tanjiro, ocho tandas de cuatro movimientos del cabezal, y lo deja terminado un
// momento antes de empezar otro. Los fotogramas 0 a 31 son los movimientos (tanda × 4 + tramo) y el 32 la pieza acabada,
// con el brazo subido; `sequence` es el orden en que se enseñan.
const A1_STAGES = 8
const A1_DONE = A1_STAGES * SWEEPS
const TANJIRO_DRAW = FIGURES.find((figure) => figure.id === 'tanjiro').draw
export const printerA1 = {
  w: 64,
  h: 92,
  frames: A1_DONE + 1,
  // Lenta a propósito, para que se aprecie la figura creciendo; al acabar se queda un rato terminada y vuelve a empezar.
  ms: 560,
  sequence: [...Array.from({ length: A1_DONE }, (_, i) => i), ...Array(5).fill(A1_DONE)],
  body: [{ l: -30, t: -14, r: 30, b: 0 }],
  paint(g, frame) {
    const top = 65
    const x = 8
    const w = 48
    const center = x + w / 2
    table(g, 2, 72, 60, 92)
    // AMS lite sobre el travesaño: caja blanca baja con las cuatro bobinas de filamento a la vista.
    slab(g, 10, 2, 46, 5, WHITE, BRIGHT, SHADE)
    rect(g, 12, 3, 42, 1, GREEN)
    rect(g, 12, 7, 42, 2, SHADE)
    ;[INK.tile, INK.saffron, INK.lagoon, INK.meadow].forEach((color, i) => spool(g, 12 + i * 10, 8, color, (frame + i) % 2 === 0))
    rect(g, 10, 17, 46, 1, SHADE)
    rect(g, 18, 18, 28, 1, INK.steel)
    const done = frame === A1_DONE
    const stage = done ? A1_STAGES - 1 : Math.floor(frame / SWEEPS)
    const sweep = done ? 1 : frame % SWEEPS
    const height = done ? MAX_PIECE : printedRows(stage, sweep)
    const armY = done ? armFor(top, MAX_PIECE) - 4 : armFor(top, height)
    bambu(g, {
      x,
      top,
      w,
      columnTop: 20,
      framed: true,
      armY,
      headX: center - 4 + (done ? 0 : SWEEP[sweep]),
      screenLit: frame % 2 === 0,
      tubeFrom: { x: center, y: 18 },
      label: 'bambu A1',
      piece: (gg, plateTop) => growFigure(gg, TANJIRO_DRAW, height, center, plateTop),
    })
  },
}

// Fotogramas de la A1 mini: 0 en reposo, del 1 al 32 los movimientos de las tandas de la impresión (tanda × 4 + tramo + 1; la
// figura crece desde los pies) y el 33 terminada. La sala enseña en bucle los cuatro de la tanda en curso.
const MINI_DONE = MINI_STAGES * SWEEPS + 1
export const miniStageFrames = (stage) => Array.from({ length: SWEEPS }, (_, sweep) => 1 + stage * SWEEPS + sweep)
// Qué movimiento es un fotograma de impresión: la tanda, el tramo y si es el primero de una capa nueva.
export const miniFrameInfo = (frame) => ({ stage: Math.floor((frame - 1) / SWEEPS), sweep: (frame - 1) % SWEEPS })

export const printerMini = {
  w: 46,
  h: 78,
  ms: 420,
  frames: MINI_DONE + 1,
  modes: { idle: [0], printing: miniStageFrames(0), done: [MINI_DONE] },
  body: [{ l: -21, t: -14, r: 21, b: 0 }],
  paint(g, frame) {
    const top = 54
    const x = 6
    const w = 34
    const center = x + w / 2
    table(g, 2, 60, 42, 78)
    const done = frame === MINI_DONE
    const printing = frame >= 1 && frame < MINI_DONE
    const { stage, sweep } = printing ? miniFrameInfo(frame) : { stage: 0, sweep: 1 }
    const height = done ? MAX_PIECE : printing ? printedRows(stage, sweep) : 0
    const armY = done ? armFor(top, MAX_PIECE) - 4 : armFor(top, height)
    // La bobina cuelga de un eje junto al único soporte (a su derecha), a la altura de la tapa.
    rect(g, x + 5, 8, 2, 2, INK.steel)
    spool(g, x + 6, 6, INK.saffron, frame % 2 === 0)
    bambu(g, {
      x,
      top,
      w,
      columnTop: 6,
      framed: false,
      armY,
      headX: center - 4 + (printing ? SWEEP[sweep] : 0),
      screenLit: printing || done || frame === 0,
      tubeFrom: { x: x + 10, y: 14 },
      label: 'bambu',
      piece: (gg, plateTop) => growFigure(gg, (figure) => drawPokemon(figure, 0, 0), height, center, plateTop),
    })
  },
}
