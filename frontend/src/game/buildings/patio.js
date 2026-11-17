// Casa del Encuentro: un patio cordobés dibujado en píxeles a partir de la ilustración de la usuaria. Casa de dos plantas
// encalada, con carpintería añil, galería con balcón de geranios, escalera de azulejos a la izquierda y, delante, el patio
// empedrado con el limonero, la mesa con vino, el pozo y las macetas. Ocupa el lienzo de la casa anterior (128×128, ocho
// por ocho teselas) y la entrada es el escalón que sobresale del empedrado por abajo (`PATIO_DOOR_COL`).
import { dot, line, rect } from '../pixelKit.js'
import { finish, newSprite } from './shared.js'
import {
  BLUE, BRICK, GLASS, LIME,
  azulejoRiser, beam, brickTread, corbel, lantern, lemon, lemonTree, mosaic, pebbles, pottedFlowers, post, roof, well,
} from './patioParts.js'

const SIZE = 128
// Centro del escalón de entrada del empedrado; ValleScene alinea con él la tesela de la puerta.
export const PATIO_DOOR_COL = 70

// Paredes encaladas: la lateral de la escalera, más clara porque le da el sol, la de la galería alta y la de la planta baja.
function walls(g) {
  rect(g, 3, 30, 10, 95, LIME.hi)
  for (let i = 0; i < 4; i++) rect(g, 3, 30 - i, 10 - i * 2, 1, LIME.hi)
  rect(g, 3, 30, 1, 95, '#ffffff')
  rect(g, 11, 27, 2, 98, LIME.mid)
  rect(g, 13, 29, 108, 36, LIME.base)
  rect(g, 13, 29, 108, 2, LIME.shade)
  rect(g, 30, 67, 91, 31, LIME.base)
  rect(g, 30, 67, 91, 2, LIME.shade)
  // Zócalo de barro al pie de la planta baja.
  rect(g, 38, 95, 83, 3, BRICK.mid)
  rect(g, 38, 95, 83, 1, BRICK.hi)
}

// Bajante de cinc en la esquina derecha, del alero al suelo.
function drainpipe(g) {
  rect(g, 121, 28, 2, 72, '#e0d0c8')
  rect(g, 122, 28, 1, 72, '#a09098')
  rect(g, 120, 62, 4, 2, '#c4b4ac')
}

// Galería alta: puerta de la escalera, cuadritos y macetas en la pared, ventana con contraventanas, plato de cerámica y faroles.
function upperFloor(s) {
  const { g } = s
  // Puerta de cuarterones a la que llega la escalera.
  rect(g, 21, 31, 14, 28, BLUE.dark)
  rect(g, 22, 32, 12, 27, BLUE.base)
  rect(g, 22, 32, 1, 27, BLUE.hi)
  ;[34, 42, 50].forEach((y) => [24, 29].forEach((x) => {
    rect(g, x, y, 4, 6, BLUE.mid)
    rect(g, x, y, 4, 1, BLUE.dark)
    rect(g, x, y + 5, 4, 1, BLUE.light)
  }))
  dot(g, 32, 46, '#2a1a10')
  // Dos macetitas de barro con flores moradas a los lados de un ventanuco.
  ;[45, 57].forEach((cx) => {
    rect(g, cx - 3, 34, 6, 3, '#a24aa8')
    ;[[-2, 34], [0, 34], [2, 35], [-1, 35]].forEach(([dx, y]) => dot(g, cx + dx, y, '#f0b8f0'))
    rect(g, cx - 3, 37, 6, 1, '#4f7a1c')
    rect(g, cx - 2, 38, 4, 3, BRICK.mid)
    rect(g, cx - 2, 38, 4, 1, BRICK.hi)
  })
  rect(g, 49, 33, 5, 9, '#8f432a')
  rect(g, 50, 34, 3, 7, BLUE.mid)
  dot(g, 50, 34, GLASS.base)
  // Ventana con visillos y contraventanas añiles.
  ;[62, 84].forEach((x) => {
    rect(g, x, 32, 6, 13, BLUE.base)
    rect(g, x, 32, 6, 1, BLUE.hi)
    for (let y = 34; y < 44; y += 2) rect(g, x + 1, y, 4, 1, BLUE.mid)
    rect(g, x + (x < 70 ? 5 : 0), 32, 1, 13, BLUE.dark)
  })
  rect(g, 68, 32, 16, 13, BLUE.dark)
  rect(g, 69, 33, 14, 11, GLASS.base)
  rect(g, 69, 33, 14, 3, GLASS.hi)
  rect(g, 69, 33, 4, 11, GLASS.curtain)
  rect(g, 79, 33, 4, 11, GLASS.curtain)
  rect(g, 72, 33, 1, 11, GLASS.fold)
  rect(g, 79, 33, 1, 11, GLASS.fold)
  rect(g, 75, 33, 2, 11, BLUE.dark)
  s.windows.push({ x: 69, y: 33, w: 14, h: 11 })
  // Plato de cerámica colgado.
  for (let y = -5; y <= 5; y++) for (let x = -5; x <= 5; x++) {
    const d = x * x + y * y
    if (d <= 25) dot(g, 110 + x, 35 + y, d > 18 ? '#a04020' : d > 9 ? '#e0663f' : '#ee8a50')
  }
  ;[[0, -2], [2, 0], [0, 2], [-2, 0], [0, 0]].forEach(([x, y]) => dot(g, 110 + x, 35 + y, '#a04020'))
}

// Balcón de la galería: geranios en macetas añiles apoyadas sobre la baranda, los balaustres torneados y otra fila de
// macetas al pie, sobre el suelo de la galería.
function balcony(g) {
  rect(g, 41, 52, 80, 2, BLUE.dark)
  rect(g, 41, 52, 80, 1, BLUE.mid)
  for (let x = 42; x < 120; x += 4) {
    rect(g, x, 54, 2, 5, BLUE.base)
    dot(g, x, 54, BLUE.hi)
    rect(g, x + 1, 55, 1, 3, BLUE.dark)
    dot(g, x, 56, BLUE.light)
  }
  rect(g, 41, 59, 80, 1, BLUE.dark)
  const top = ['red', 'pink']
  ;[45, 54, 63, 72, 81, 90, 99, 108, 116].forEach((cx, i) => pottedFlowers(g, cx, 47, [top[i % 2]], { w: 9, h: 7, seed: i }))
  ;[50, 59, 68, 77, 86, 95, 104, 113].forEach((cx, i) => pottedFlowers(g, cx, 58, [top[(i + 1) % 2]], { w: 9, h: 6, seed: 20 + i }))
  rect(g, 30, 62, 91, 1, '#8f432a')
  beam(g, 28, 63, 93, 4)
}

// Planta baja: puerta acristalada, pie derecho con la jaula, ventana con contraventanas, faroles y geranios junto al pozo.
function lowerFloor(s) {
  const { g } = s
  rect(g, 53, 70, 16, 27, BLUE.dark)
  rect(g, 54, 71, 14, 26, BLUE.base)
  rect(g, 54, 71, 1, 26, BLUE.hi)
  rect(g, 55, 72, 12, 16, BLUE.dark)
  ;[[56, 73], [61, 73], [56, 78], [61, 78], [56, 83], [61, 83]].forEach(([x, y]) => {
    rect(g, x, y, 4, 4, GLASS.base)
    dot(g, x, y, GLASS.hi)
    dot(g, x + 1, y, GLASS.hi)
    dot(g, x, y + 1, GLASS.hi)
  })
  s.windows.push({ x: 56, y: 73, w: 10, h: 14 })
  rect(g, 56, 89, 10, 6, BLUE.mid)
  rect(g, 56, 89, 10, 1, BLUE.dark)
  dot(g, 65, 90, '#2a1a10')
  // Ventana baja.
  ;[83, 101].forEach((x) => {
    rect(g, x, 72, 5, 15, BLUE.base)
    rect(g, x, 72, 5, 1, BLUE.hi)
    for (let y = 74; y < 86; y += 2) rect(g, x + 1, y, 3, 1, BLUE.mid)
  })
  rect(g, 88, 72, 13, 15, BLUE.dark)
  rect(g, 89, 73, 11, 13, GLASS.base)
  rect(g, 89, 73, 11, 3, GLASS.hi)
  rect(g, 89, 73, 3, 13, GLASS.curtain)
  rect(g, 97, 73, 3, 13, GLASS.curtain)
  rect(g, 94, 73, 1, 13, BLUE.dark)
  s.windows.push({ x: 89, y: 73, w: 11, h: 13 })
  post(g, 74, 67, 31)
  rect(g, 73, 96, 6, 3, BLUE.dark)
  post(g, 113, 67, 30)
  // Jaula de madera colgada del pie derecho.
  dot(g, 76, 73, '#5a3010')
  rect(g, 75, 74, 3, 1, '#8a5020')
  rect(g, 74, 75, 5, 1, '#c08040')
  rect(g, 73, 76, 7, 1, '#8a5020')
  for (let x = 73; x < 80; x += 2) rect(g, x, 77, 1, 8, '#c08040')
  rect(g, 72, 85, 9, 2, '#8a5020')
  rect(g, 72, 85, 9, 1, '#d89a50')
  dot(g, 76, 81, '#f8d808')
  dot(g, 77, 81, '#c08a00')
  pottedFlowers(g, 86, 90, ['red', 'red', 'pink'], { w: 10, h: 6, seed: 40 })
  pottedFlowers(g, 109, 89, ['red', 'red'], { w: 10, h: 6, seed: 41 })
}

// Estructura de la cubierta de la galería: viga del alero, zapatas y pies derechos.
function frame(g) {
  beam(g, 11, 25, 114, 4)
  ;[11, 40, 73, 106, 119].forEach((x) => corbel(g, x, 25))
  post(g, 37, 29, 34)
  post(g, 117, 29, 34)
}

// Escalera de la izquierda: huellas de barro y contrahuellas de azulejo hasta el rellano de la puerta alta, con su
// barandilla añil.
function stairs(g) {
  rect(g, 13, 58, 18, 6, BRICK.base)
  rect(g, 13, 58, 18, 1, BRICK.hi)
  for (let i = 0; i < 11; i++) {
    const y = 64 + i * 5
    const x = 14 - Math.round(i * 0.35)
    brickTread(g, x, y, 30 - x, 2)
    azulejoRiser(g, x, y + 2, 30 - x, 3)
  }
  rect(g, 4, 119, 36, 6, BRICK.base)
  rect(g, 4, 119, 36, 1, BRICK.hi)
  for (let x = 6; x < 40; x += 5) rect(g, x, 121, 1, 4, BRICK.mid)
  // Barandilla: pasamanos desde el rellano y pilar al pie.
  post(g, 29, 46, 64, 3)
  rect(g, 28, 46, 6, 2, BLUE.base)
  rect(g, 28, 46, 6, 1, BLUE.hi)
  line(g, 33, 47, 37, 52, BLUE.base, 2)
  rect(g, 27, 104, 6, 16, BLUE.base)
  rect(g, 27, 104, 1, 16, BLUE.hi)
  rect(g, 32, 104, 1, 16, BLUE.dark)
  rect(g, 26, 103, 8, 2, BLUE.light)
}

// Macetas colgadas en la pared de la escalera y al pie de los peldaños.
function wallPots(g) {
  pottedFlowers(g, 9, 42, ['yellow', 'red', 'yellow'], { w: 10, h: 8, seed: 50 })
  pottedFlowers(g, 15, 42, ['red', 'pink'], { w: 8, h: 8, potW: 5, seed: 51 })
  pottedFlowers(g, 18, 48, ['red', 'pink'], { w: 6, h: 6, potW: 4, seed: 52 })
  pottedFlowers(g, 8, 58, ['purple', 'pink', 'purple'], { w: 10, h: 8, seed: 53 })
  pottedFlowers(g, 18, 60, ['red'], { w: 6, h: 5, potW: 4, seed: 54 })
  pottedFlowers(g, 9, 76, ['yellow', 'red', 'yellow'], { w: 11, h: 9, seed: 55 })
  pottedFlowers(g, 7, 93, ['red', 'red', 'pink'], { w: 10, h: 8, seed: 56 })
  pottedFlowers(g, 7, 110, ['blue', 'red', 'pink'], { w: 9, h: 7, seed: 57 })
  pottedFlowers(g, 28, 118, ['red'], { w: 8, h: 6, seed: 58 })
  pottedFlowers(g, 35, 110, ['red', 'red'], { w: 7, h: 5, potW: 5, seed: 59 })
}

// Empedrado del patio con el escalón de la entrada abajo y el mosaico de la flor.
const onFloor = (x, y) => (x >= 38 && x < 124 && y >= 98 && y < 124) || (x >= 54 && x < 87 && y >= 124 && y < 127)
function patioFloor(g) {
  pebbles(g, 38, 98, 86, 29, onFloor)
  rect(g, 38, 98, 83, 1, '#a89070')
  rect(g, 54, 126, 33, 1, '#b09474')
  mosaic(g, 69, 111, 27, 11, onFloor)
}

// Mesa de madera con dos botellas de vino y un plato, y un taburete delante.
function table(g) {
  rect(g, 44, 99, 2, 9, '#7a3a14')
  rect(g, 56, 99, 2, 9, '#7a3a14')
  rect(g, 43, 96, 16, 3, '#d07828')
  rect(g, 43, 96, 16, 1, '#e8a050')
  rect(g, 43, 98, 16, 1, '#a85018')
  ;[[46, 88], [49, 89]].forEach(([x, y]) => {
    rect(g, x, y + 2, 2, 96 - y - 2, '#2a2018')
    rect(g, x, y, 1, 2, '#2a2018')
    rect(g, x, y + 4, 2, 2, '#f0e0b0')
    dot(g, x, y + 2, '#6a5040')
  })
  rect(g, 51, 95, 6, 1, '#ffffff')
  rect(g, 52, 94, 4, 1, '#f0d070')
  rect(g, 47, 104, 7, 2, '#d07828')
  rect(g, 47, 104, 7, 1, '#e8a050')
  rect(g, 48, 106, 1, 7, '#8a4418')
  rect(g, 52, 106, 1, 7, '#8a4418')
  rect(g, 48, 110, 5, 1, '#8a4418')
}

// Rincón de la derecha: aspidistra de hojas anchas, geranios rosas en macetas añiles y un cántaro de barro volcado con
// flores que se salen por la boca.
function rightCorner(g) {
  const leaves = [[-10, -2], [-9, -8], [-5, -12], [0, -13], [5, -12], [9, -9], [11, -3], [-6, -5], [6, -6], [1, -8]]
  leaves.forEach(([dx, dy], i) => {
    const len = Math.hypot(dx, dy)
    for (let t = 0; t <= 1; t += 1 / (len * 2)) {
      const half = Math.sin(t * Math.PI) * 2
      const x = 114 + dx * t
      const y = 103 + dy * t
      for (let k = -half; k <= half; k += 0.5) dot(g, x - (dy / len) * k, y + (dx / len) * k, k < 0 ? '#a8d040' : i % 3 ? '#5a9a2a' : '#3f7420')
    }
    line(g, 114, 103, 114 + Math.round(dx * 0.8), 103 + Math.round(dy * 0.8), '#cce468')
  })
  pottedFlowers(g, 112, 110, ['pink', 'pink', 'purple'], { w: 9, h: 7, seed: 60 })
  pottedFlowers(g, 119, 110, ['pink', 'purple'], { w: 7, h: 6, potW: 5, seed: 61 })
  for (let y = -4; y <= 4; y++) for (let x = -5; x <= 5; x++) {
    const d = (x * x) / 25 + (y * y) / 16
    if (d <= 1) dot(g, 106 + x, 113 + y, d > 0.75 ? '#9a4a22' : x + y < -2 ? '#f0a060' : '#d0763c')
  }
  rect(g, 101, 111, 2, 4, '#4a2010')
  rect(g, 100, 110, 1, 6, '#b05a2a')
  ;[[99, 112], [100, 114], [98, 115], [101, 116], [102, 113]].forEach(([x, y]) => {
    rect(g, x, y, 2, 2, '#f888b8')
    dot(g, x, y, '#ffd0e4')
  })
}

function lemonTreeWithFruit(g) {
  lemonTree(g, 41, 57, 108)
  ;[[39, 63], [43, 66], [34, 72], [47, 71], [44, 78], [37, 81], [48, 62], [40, 75]].forEach(([x, y]) => lemon(g, x, y))
}

export function patioSprite() {
  const s = newSprite(SIZE, SIZE)
  const { g } = s
  walls(g)
  drainpipe(g)
  upperFloor(s)
  balcony(g)
  lowerFloor(s)
  frame(g)
  ;[[33, 29], [67, 29], [101, 29], [71, 67], [109, 67], [17, 48]].forEach(([x, y]) => s.windows.push(lantern(g, x, y)))
  patioFloor(g)
  stairs(g)
  wallPots(g)
  lemonTreeWithFruit(g)
  table(g)
  well(g, 85, 97)
  rightCorner(g)
  roof(g, { top: 1, bottom: 22, left: { top: 19, bottom: 5 }, right: { top: 116, bottom: 127 } })
  s.doorCol = PATIO_DOOR_COL
  return finish(s)
}
