// Escuela de Artes Dionisio Ortiz dibujada en píxeles, copiando la fachada que aportó la usuaria: remate con el medallón
// sobre la cornisa, ático con pilastras, rótulo en dos líneas, planta alta de balcones con contraventanas verdes y las
// tres banderas en el central, y planta baja con rejas, la puerta de madera bajo su montante de abanico y el zócalo con
// los respiraderos. Conserva las medidas del PNG (160×114, apoyada abajo en un lienzo de ocho teselas) y la columna de
// la puerta. La fachada es simétrica respecto a su eje: casi todas las piezas se dibujan a un lado y se reflejan al otro.
import { shade } from '../palette.js'
import { dot, rect } from '../pixelKit.js'
import { ROUNDED_GLYPHS, drawText } from '../pixelFont.js'
import { litPane } from './litPane.js'
import { finish, newSprite } from './shared.js'

export const ARTES_FACADE = { w: 160, h: 114 }
const ARTES_CANVAS_H = 128
const TOP = ARTES_CANVAS_H - ARTES_FACADE.h
// Centro de la puerta principal (entre sus dos hojas), bajo el balcón de las banderas.
export const ARTES_DOOR_COL = 80

const W = ARTES_FACADE.w
// Columna reflejada de un tramo que empieza en `x` y mide `w`.
const mirror = (x, w) => W - x - w
const both = (x, w, draw) => {
  draw(x)
  draw(mirror(x, w))
}

// Colores sacados del PNG. La piedra dorada y el enlucido crema son los de la fachada real; la paleta del valle no los tiene.
const CREAM = ['#f0c591', '#fddfb7', '#fdeac6', '#feedcc', '#f8e9c8']
const OCHRE = ['#9e7c62', '#b6835a', '#e7b170', '#ebb776']
const BROWN = ['#3e2c26', '#5b4a3c', '#6f3122', '#966643']
const IRON = '#71635a'
const STONE = ['#b79a7b', '#dcaf7a']
const SHUTTER = ['#0f2f2f', '#38726e', '#4d8a85']
const FAN = ['#3f6674', '#597c82']
const DOOR = ['#3e2c26', '#592b24', '#6f3122']
const GOLD = '#edb856'
const FLAG = { green: '#2d8a4e', white: '#f4f1eb', red: '#8e1611', yellow: '#fdb708', blue: '#154b94' }

// Balcones de la planta alta: los dos laterales de cada lado y el central, largo, el de las banderas.
const SIDE_BALCONIES = [[10, 21], [38, 20]]
const BALCONIES = [...SIDE_BALCONIES, ...SIDE_BALCONIES.map(([x, w]) => [mirror(x, w), w]), [60, 40]]

// Remate: florón, medallón con su anillo, cartela con volutas y las alas que bajan hasta la cornisa.
function crest(g) {
  rect(g, 64, 9, 32, 4, CREAM[1])
  rect(g, 64, 9, 32, 1, OCHRE[3])
  both(61, 6, (x) => {
    rect(g, x, 10, 6, 2, OCHRE[2])
    rect(g, x, 11, 6, 1, OCHRE[1])
  })
  dot(g, 61, 9, BROWN[3])
  dot(g, 98, 9, BROWN[3])
  rect(g, 68, 4, 24, 6, OCHRE[3])
  rect(g, 68, 4, 24, 1, CREAM[1])
  rect(g, 68, 9, 24, 1, OCHRE[1])
  // Volutas a los lados de la cartela: un rizo grande arriba y otro pequeño que baja hacia las alas.
  both(64, 6, (x) => {
    rect(g, x + 1, 4, 4, 1, BROWN[3])
    rect(g, x, 5, 1, 4, BROWN[3])
    rect(g, x + 1, 5, 4, 4, OCHRE[2])
    rect(g, x + 2, 6, 2, 2, BROWN[3])
    dot(g, x + 2, 6, CREAM[1])
    rect(g, x + 1, 9, 4, 1, BROWN[3])
  })
  both(70, 8, (x) => {
    for (let i = 0; i < 8; i++) dot(g, x + i, 9 + Math.round(Math.sin((Math.PI * i) / 7)), BROWN[3])
  })
  for (let dy = -5; dy <= 5; dy++) {
    for (let dx = -5; dx <= 5; dx++) {
      const d = dx * dx + dy * dy
      if (d <= 12) dot(g, 80 + dx, 6 + dy, CREAM[2])
      else if (d <= 26 && dy <= 4) dot(g, 80 + dx, 6 + dy, dy < 0 ? OCHRE[2] : OCHRE[1])
    }
  }
  rect(g, 79, 5, 2, 2, BROWN[3])
  rect(g, 78, 0, 4, 1, BROWN[3])
}

// Cornisa alta, ático con sus pilastras y la cornisa volada que recorre la fachada de borde a borde.
function cornice(g) {
  rect(g, 3, 11, 154, 1, BROWN[0])
  rect(g, 3, 12, 154, 1, BROWN[2])
  rect(g, 3, 13, 154, 1, OCHRE[0])
  rect(g, 3, 14, 154, 4, CREAM[1])
  ;[[4, 5], [30, 6], [62, 4]].forEach(([px, pw]) =>
    both(px, pw, (x) => {
      rect(g, x, 14, pw, 4, OCHRE[2])
      rect(g, x, 14, pw, 1, BROWN[3])
      rect(g, x, 14, 1, 4, BROWN[3])
      rect(g, x + pw - 1, 15, 1, 3, OCHRE[1])
    }),
  )
  both(0, 4, (x) => rect(g, x, 17, 4, 1, BROWN[0]))
  rect(g, 0, 18, W, 1, '#fbd4a2')
  rect(g, 0, 19, W, 1, CREAM[0])
  rect(g, 0, 20, W, 1, BROWN[3])
  rect(g, 2, 21, W - 4, 1, BROWN[1])
}

// Friso bajo la cornisa: banda dorada entre dos líneas oscuras (el rótulo la corta en el centro).
function frieze(g) {
  rect(g, 3, 22, 154, 1, BROWN[3])
  rect(g, 3, 23, 154, 3, OCHRE[2])
  rect(g, 3, 25, 154, 1, OCHRE[3])
  rect(g, 3, 26, 154, 1, IRON)
}

function sign(g) {
  rect(g, 45, 22, 69, 12, CREAM[4])
  rect(g, 45, 22, 1, 12, BROWN[3])
  rect(g, 113, 22, 1, 12, BROWN[3])
  rect(g, 45, 34, 69, 1, STONE[1])
  drawText(g, 48, 23, 'ESCUELA DE ARTES', BROWN[0], ROUNDED_GLYPHS)
  drawText(g, 52, 29, 'DIONISIO ORTIZ', BROWN[0], ROUNDED_GLYPHS)
}

// Pilastra dorada con sus cantos más oscuros y un filo de luz; `capital` añade el capitel bajo el friso.
function pilaster(g, x, top, bottom, capital) {
  const h = bottom - top
  rect(g, x, top, 5, h, OCHRE[2])
  rect(g, x, top, 1, h, OCHRE[1])
  rect(g, x + 4, top, 1, h, OCHRE[1])
  rect(g, x + 1, top, 1, h, OCHRE[3])
  if (!capital) return
  rect(g, x - 1, 22, 7, 1, BROWN[3])
  rect(g, x, 23, 5, 3, OCHRE[1])
  rect(g, x - 1, 26, 7, 1, BROWN[3])
  rect(g, x, 27, 5, 1, OCHRE[1])
}

// Guirnalda sobre una ventana alta: dos volutas y la caída entre ellas, y debajo la cornisa del hueco.
function garland(g, x, w) {
  rect(g, x - 3, 29, 2, 3, BROWN[3])
  rect(g, x + w + 1, 29, 2, 3, BROWN[3])
  for (let i = 0; i <= w + 1; i++) {
    const y = 30 + Math.round(2 * Math.sin((Math.PI * i) / (w + 1)))
    dot(g, x + i - 1, y, OCHRE[1])
    dot(g, x + i - 1, y + 1, OCHRE[0])
  }
  rect(g, x - 2, 34, w + 4, 1, OCHRE[1])
  rect(g, x - 3, 35, w + 6, 1, BROWN[3])
}

// Ventana alta: marco dorado, dintel oscuro y contraventanas verdes de lamas que bajan hasta el suelo del balcón.
function upperWindow(g, x, w) {
  rect(g, x, 36, w, 1, OCHRE[2])
  rect(g, x, 37, 2, 26, OCHRE[2])
  rect(g, x + w - 2, 37, 2, 26, OCHRE[2])
  rect(g, x + 2, 37, w - 4, 1, BROWN[2])
  rect(g, x + 2, 38, 1, 25, BROWN[0])
  rect(g, x + w - 3, 38, 1, 25, OCHRE[0])
  const sx = x + 3
  const sw = w - 6
  rect(g, sx, 38, sw, 25, SHUTTER[1])
  rect(g, sx + 1, 38, 1, 25, SHUTTER[2])
  rect(g, sx, 38, 1, 25, SHUTTER[0])
  rect(g, sx + Math.floor(sw / 2), 38, 1, 25, SHUTTER[0])
  for (let y = 38; y < 63; y += 5) rect(g, sx, y, sw, 1, SHUTTER[0])
}

// Balcón de hierro: pasamanos doble, barrotes y los machones de los extremos.
function balcony(g, x, w) {
  rect(g, x, 54, w, 1, IRON)
  rect(g, x, 56, w, 1, IRON)
  for (let bx = x + 2; bx < x + w - 2; bx += 3) {
    dot(g, bx, 55, IRON)
    rect(g, bx, 57, 1, 5, IRON)
  }
  rect(g, x, 61, w, 1, IRON)
  rect(g, x, 62, w, 1, BROWN[1])
  rect(g, x, 54, 1, 9, BROWN[1])
  rect(g, x + w - 1, 54, 1, 9, BROWN[1])
}

// Vuelo de los balcones: losa, moldura, sombra y las ménsulas bajo cada balcón; debajo, el friso de la planta baja.
function balconyLedge(g) {
  rect(g, 2, 63, 156, 1, BROWN[3])
  BALCONIES.forEach(([x, w]) => rect(g, x, 63, w, 1, CREAM[0]))
  rect(g, 2, 64, 156, 1, OCHRE[2])
  rect(g, 2, 65, 156, 1, BROWN[2])
  rect(g, 3, 66, 154, 1, BROWN[0])
  rect(g, 3, 67, 154, 4, CREAM[1])
  BALCONIES.forEach(([x, w]) => {
    ;[x + 2, x + w - 5].forEach((cx) => {
      rect(g, cx, 66, 3, 1, CREAM[0])
      rect(g, cx + 1, 67, 1, 2, OCHRE[1])
    })
  })
  SIDE_BALCONIES.forEach(([bx, bw]) =>
    both(bx, bw, (x) => {
      for (let i = 0; i < bw - 8; i++) dot(g, x + 4 + i, 68 + Math.round(Math.sin((Math.PI * i) / (bw - 9))), OCHRE[0])
    }),
  )
  rect(g, 62, 67, 36, 2, BROWN[1])
}

// Imposta entre plantas: línea oscura, banda dorada y su sombra.
function impost(g) {
  rect(g, 2, 71, 156, 1, BROWN[3])
  rect(g, 2, 72, 156, 1, OCHRE[2])
  rect(g, 3, 73, 154, 1, OCHRE[0])
  rect(g, 3, 74, 154, 1, CREAM[3])
}

// Ventana baja con reja: dintel, marco dorado, cristal oscuro, barrotes y alféizar. Devuelve el cristal y la reja para la luz.
function groundWindow(g, x, w) {
  rect(g, x - 3, 77, w + 6, 1, OCHRE[1])
  rect(g, x, 78, w, 1, OCHRE[2])
  rect(g, x, 79, 2, 20, OCHRE[2])
  rect(g, x + w - 2, 79, 2, 20, OCHRE[2])
  rect(g, x + 2, 79, w - 4, 20, BROWN[0])
  const bars = [x + 4, x + w - 5]
  bars.forEach((bx) => rect(g, bx, 79, 1, 20, OCHRE[0]))
  ;[81, 89, 96].forEach((y) => rect(g, x + 2, y, w - 4, 1, OCHRE[0]))
  rect(g, x - 1, 99, w + 2, 1, OCHRE[2])
  rect(g, x + 1, 100, w - 2, 1, STONE[0])
  const glass = { x: x + 2, y: 79, w: w - 4, h: 20 }
  const holes = [...bars.map((bx) => ({ x: bx - glass.x, y: 0, w: 1, h: 20 })), ...[81, 89, 96].map((y) => ({ x: 0, y: y - 79, w: glass.w, h: 1 }))]
  return { glass, holes }
}

// Portada: jambas de piedra, cabecero con su clave, montante de abanico y las dos hojas de madera con cuarterones y pomos.
function doorway(g) {
  both(62, 6, (x) => {
    rect(g, x, 67, 6, 46, OCHRE[2])
    rect(g, x, 67, 1, 46, BROWN[3])
    rect(g, x + 5, 67, 1, 46, BROWN[3])
    rect(g, x + 1, 67, 1, 46, OCHRE[3])
    rect(g, x, 100, 6, 13, STONE[1])
    rect(g, x, 100, 6, 1, STONE[0])
  })
  rect(g, 62, 71, 36, 1, CREAM[0])
  rect(g, 62, 72, 36, 1, BROWN[3])
  rect(g, 62, 73, 36, 1, OCHRE[1])
  rect(g, 68, 74, 24, 4, OCHRE[2])
  rect(g, 68, 74, 24, 1, OCHRE[3])
  rect(g, 78, 73, 4, 5, OCHRE[3])
  rect(g, 78, 77, 4, 1, OCHRE[1])
  rect(g, 69, 78, 22, 11, BROWN[0])
  rect(g, 72, 80, 16, 1, FAN[0])
  rect(g, 70, 81, 20, 6, FAN[0])
  rect(g, 70, 81, 20, 1, FAN[1])
  rect(g, 73, 80, 14, 1, FAN[1])
  ;[73, 76, 79, 80, 83, 86].forEach((bx) => rect(g, bx, 80, 1, 7, BROWN[0]))
  rect(g, 69, 87, 22, 2, BROWN[2])
  rect(g, 69, 89, 22, 23, DOOR[1])
  rect(g, 79, 89, 2, 23, DOOR[0])
  ;[69, 81].forEach((lx) => {
    rect(g, lx, 89, 10, 1, DOOR[0])
    ;[[91, 7], [101, 9]].forEach(([py, ph]) => {
      rect(g, lx + 2, py, 6, ph, DOOR[0])
      rect(g, lx + 3, py + 1, 4, ph - 2, DOOR[2])
    })
  })
  dot(g, 76, 101, GOLD)
  dot(g, 83, 101, GOLD)
  rect(g, 69, 112, 22, 1, STONE[1])
}

// Zócalo: remate, línea de sombra, sillares claros y la base más oscura.
function plinth(g) {
  rect(g, 2, 101, 156, 1, STONE[1])
  rect(g, 2, 102, 156, 1, OCHRE[0])
  rect(g, 3, 103, 154, 1, CREAM[0])
  rect(g, 3, 104, 154, 5, CREAM[1])
  for (let x = 9; x < 157; x += 13) rect(g, x, 104, 1, 5, CREAM[0])
  rect(g, 3, 109, 154, 1, CREAM[0])
  rect(g, 3, 110, 154, 3, STONE[0])
  both(3, 6, (x) => rect(g, x, 101, 6, 12, STONE[1]))
  both(31, 6, (x) => rect(g, x, 101, 6, 12, STONE[1]))
}

// Respiradero del sótano: hueco arqueado con barrotes.
function vent(g, x, w) {
  rect(g, x + 1, 105, w - 2, 1, BROWN[0])
  rect(g, x, 106, w, 7, BROWN[0])
  for (let bx = x + 1; bx < x + w - 1; bx += 2) rect(g, bx, 106, 1, 7, BROWN[1])
}

// Bandera colgada de su asta: cae en diagonal hacia la izquierda, con un pliegue más oscuro cada tres filas.
function flag(g, poleX, colors, dots = []) {
  rect(g, poleX, 41, 1, 18, BROWN[0])
  dot(g, poleX, 40, GOLD)
  for (let row = 0; row < 15; row++) {
    const left = poleX - 1 - colors.length - Math.floor(row / 4)
    colors.forEach((color, i) => dot(g, left + i + 1, 42 + row, row % 3 === 2 ? shade(color, 0.8) : color))
  }
  dots.forEach(([dx, dy]) => dot(g, poleX - 3 - Math.floor(dy / 4) + dx, 42 + dy, FLAG.yellow))
}

export function gallerySprite() {
  const s = newSprite(W, ARTES_CANVAS_H)
  const { g } = s
  // Las piezas trabajan en píxeles de la fachada; el lienzo es más alto y la fachada se apoya abajo.
  g.translate(0, TOP)
  cornice(g)
  crest(g)
  rect(g, 3, 27, 154, 36, CREAM[2])
  frieze(g)
  ;[3, 32, 61].forEach((px) => both(px, 5, (x) => pilaster(g, x, 27, 63, true)))
  sign(g)
  // Solo las ventanas de los extremos llevan guirnalda: las de junto al rótulo quedan bajo él.
  both(13, 14, (x) => garland(g, x, 14))
  ;[13, 42].forEach((wx) => both(wx, 14, (x) => upperWindow(g, x, 14)))
  both(40, 18, (x) => {
    rect(g, x, 34, 18, 1, OCHRE[1])
    rect(g, x - 1, 35, 20, 1, BROWN[3])
  })
  upperWindow(g, 72, 16)
  BALCONIES.forEach(([x, w]) => balcony(g, x, w))
  balconyLedge(g)
  impost(g)
  rect(g, 3, 75, 154, 26, CREAM[2])
  ;[3, 32].forEach((px) => both(px, 5, (x) => pilaster(g, x, 75, 101, false)))
  const lit = []
  ;[[14, 13], [43, 13]].forEach(([wx, ww]) => both(wx, ww, (x) => lit.push(groundWindow(g, x, ww))))
  plinth(g)
  doorway(g)
  ;[[15, 11], [43, 13], [105, 12]].forEach(([x, w]) => vent(g, x, w))
  flag(g, 68, [FLAG.green, FLAG.green, FLAG.white, FLAG.green])
  flag(g, 81, [FLAG.red, FLAG.yellow, FLAG.yellow, FLAG.red])
  flag(g, 93, [FLAG.blue, FLAG.blue, FLAG.blue, FLAG.blue], [[0, 2], [2, 6], [0, 10]])
  // Cantos oscuros de la fachada.
  rect(g, 3, 13, 1, 100, BROWN[1])
  rect(g, 156, 13, 1, 100, BROWN[1])
  g.setTransform(1, 0, 0, 1, 0, 0)
  s.doorCol = ARTES_DOOR_COL
  // De noche se encienden las ventanas bajas (con la reja en silueta) y el montante de la puerta.
  lit.forEach(({ glass, holes }) => s.windows.push(...litPane(glass.x, TOP + glass.y, glass.w, glass.h, holes)))
  s.windows.push(...litPane(70, TOP + 81, 20, 6))
  const sprite = finish(s)
  // El verde de la bandera andaluza no es hierba: sin esto la nieve la pintaría de blanco.
  return { ...sprite, painted: true }
}
