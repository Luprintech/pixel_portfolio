// Restos del templo romano de Córdoba, a la izquierda del Ayuntamiento (como en la calle Claudio Marcelo): un podio de piedra con
// escalinata, cinco columnas corintias de distinta altura (dos completas con un trozo de arquitrabe encima, otra completa, una
// rota y un muñón con su basa), el muro de sillares arruinado detrás, tambores caídos, matas de flores y un atril con la
// explicación. Es un elemento exterior, sin interior.
//
// El podio entero es sólido: la viajera lo rodea, no se sube a él. Si pudiera pisarlo, quedaría por delante del punto de apoyo y
// el dibujo la taparía a medias. Por detrás sí puede pasar: allí queda oculta tras las columnas, como tras unas ruinas de verdad.
import { dot, makeCanvas, outline, rect } from './pixelKit.js'
import { SAND, SAND_SHADE } from './buildings/mosqueParts.js'
import { BLOOM, WOOD0, WOOD1, WOOD2 } from './buildings/shared.js'

// Mármol claro de las columnas y del podio, y la piedra dorada del muro arruinado (más oscura, para que las columnas destaquen).
const MARBLE = { light: '#f4e8c8', base: '#e8d3a8', dark: '#c9b994', deep: '#a89874' }
const [RUIN_DARK, RUIN, RUIN_LIGHT] = SAND
const LEAF = ['#34643a', '#4f7f3f', '#7da844']

const WIDTH = 144
const HEIGHT = 104
// El punto de apoyo es el centro de la base (ver `ValleScene.buildProps`): los cuerpos se miden desde ahí.
const ORIGIN_X = WIDTH / 2
// Fila donde apoyan las columnas: lo alto del podio.
const PODIUM_TOP = 80
// Cada columna: eje y fila del capitel (`top`). `broken` deja el fuste partido y sin capitel; `stub` es solo basa y un tambor.
const COLUMNS = [
  { cx: 26, top: 17 },
  { cx: 50, top: 17 },
  { cx: 76, top: 44, broken: true },
  { cx: 100, top: 22 },
  { cx: 122, top: 62, stub: true },
]

// Basa ática: plinto y dos toros. `cx` es el eje y `bottom` la fila donde apoya.
function atticBase(g, cx, bottom) {
  rect(g, cx - 8, bottom - 3, 16, 3, MARBLE.light)
  rect(g, cx - 8, bottom - 1, 16, 1, MARBLE.deep)
  rect(g, cx - 7, bottom - 5, 14, 2, MARBLE.base)
  rect(g, cx - 7, bottom - 5, 14, 1, MARBLE.light)
  rect(g, cx - 6, bottom - 6, 12, 1, MARBLE.dark)
}

// Fuste estriado de diez píxeles: luz a la izquierda, sombra a la derecha y tres estrías.
function shaft(g, cx, top, bottom) {
  rect(g, cx - 5, top, 10, bottom - top, MARBLE.base)
  rect(g, cx - 5, top, 2, bottom - top, MARBLE.light)
  rect(g, cx + 3, top, 2, bottom - top, MARBLE.dark)
  ;[-2, 0, 2].forEach((dx) => rect(g, cx + dx, top + 1, 1, bottom - top - 2, dx === 2 ? MARBLE.deep : MARBLE.dark))
}

// Capitel corintio: collarino, dos coronas de hojas de acanto con sus volutas y el ábaco encima.
function corinthian(g, cx, top) {
  rect(g, cx - 9, top, 18, 3, MARBLE.light)
  rect(g, cx - 9, top + 2, 18, 1, MARBLE.deep)
  rect(g, cx - 8, top + 3, 16, 7, MARBLE.base)
  for (let x = cx - 8; x < cx + 8; x += 3) {
    rect(g, x, top + 6, 2, 4, MARBLE.light)
    dot(g, x + 2, top + 7, MARBLE.deep)
  }
  for (let x = cx - 7; x < cx + 7; x += 4) {
    rect(g, x, top + 3, 2, 3, MARBLE.light)
    dot(g, x + 2, top + 4, MARBLE.dark)
  }
  ;[-1, 1].forEach((side) => {
    const vx = cx + side * 8 - (side > 0 ? 1 : 0)
    dot(g, vx, top + 3, MARBLE.deep)
    dot(g, vx - side, top + 4, MARBLE.deep)
  })
  rect(g, cx - 6, top + 10, 12, 1, MARBLE.dark)
}

// Canto partido de un fuste roto: el borde irregular, con un trozo que falta a la derecha.
function brokenTop(g, cx, top) {
  rect(g, cx - 5, top, 6, 3, MARBLE.base)
  rect(g, cx - 5, top, 2, 3, MARBLE.light)
  rect(g, cx + 1, top + 2, 4, 2, MARBLE.base)
  rect(g, cx - 3, top - 1, 3, 1, MARBLE.base)
  rect(g, cx + 1, top + 1, 1, 1, MARBLE.deep)
  rect(g, cx - 5, top + 3, 10, 1, MARBLE.dark)
}

function column(g, { cx, top, broken, stub }) {
  atticBase(g, cx, PODIUM_TOP)
  if (stub) {
    shaft(g, cx, top + 4, PODIUM_TOP - 6)
    brokenTop(g, cx, top)
    return
  }
  if (broken) {
    shaft(g, cx, top + 3, PODIUM_TOP - 6)
    brokenTop(g, cx, top)
    return
  }
  shaft(g, cx, top + 11, PODIUM_TOP - 6)
  corinthian(g, cx, top)
}

// Trozo de arquitrabe sobre las dos primeras columnas: tres fajas, un friso liso y la cornisa con dentículos.
function architrave(g, x0, x1, top) {
  const w = x1 - x0
  rect(g, x0, top - 12, w, 12, MARBLE.base)
  rect(g, x0 - 2, top - 14, w + 4, 3, MARBLE.light)
  rect(g, x0 - 2, top - 12, w + 4, 1, MARBLE.deep)
  for (let x = x0; x < x1; x += 3) rect(g, x, top - 11, 2, 2, MARBLE.light)
  rect(g, x0, top - 8, w, 1, MARBLE.dark)
  rect(g, x0, top - 4, w, 1, MARBLE.dark)
  rect(g, x0, top - 1, w, 1, MARBLE.deep)
  // El extremo derecho está roto: una mella que deja ver que el resto se perdió.
  g.clearRect(x1 - 3, top - 14, 5, 5)
  g.clearRect(x1 - 1, top - 9, 3, 4)
}

// Muro de sillares arruinado detrás de las columnas: hiladas a distinta altura, como si se hubieran caído piedras.
function ruinedWall(g) {
  const heights = [18, 26, 30, 22, 14, 24, 32, 20, 12, 18, 10]
  heights.forEach((h, i) => {
    const x = 10 + i * 11
    const top = PODIUM_TOP - h
    rect(g, x, top, 11, h, RUIN)
    for (let y = top; y < PODIUM_TOP; y += 6) {
      rect(g, x, y, 11, 1, RUIN_LIGHT)
      const joint = x + (((y - top) / 6) % 2 ? 5 : 2)
      rect(g, joint, y + 1, 1, 5, RUIN_DARK)
    }
    rect(g, x + 10, top, 1, h, RUIN_DARK)
  })
  rect(g, 10, PODIUM_TOP - 2, 121, 2, SAND_SHADE)
}

// Podio con escalinata de tres peldaños que se ensanchan hacia abajo.
function podium(g) {
  rect(g, 6, PODIUM_TOP, 132, 8, MARBLE.base)
  rect(g, 6, PODIUM_TOP, 132, 1, MARBLE.light)
  for (let x = 12; x < 136; x += 12) rect(g, x, PODIUM_TOP + 1, 1, 7, MARBLE.dark)
  rect(g, 4, PODIUM_TOP + 8, 136, 6, MARBLE.light)
  rect(g, 4, PODIUM_TOP + 13, 136, 1, MARBLE.dark)
  rect(g, 1, PODIUM_TOP + 14, 142, 8, MARBLE.base)
  rect(g, 1, PODIUM_TOP + 14, 142, 1, MARBLE.light)
  rect(g, 1, PODIUM_TOP + 21, 142, 1, MARBLE.deep)
}

// Tambor de columna caído, tumbado sobre el podio, con la cara redonda a la derecha.
function fallenDrum(g, x, y) {
  rect(g, x, y, 14, 8, MARBLE.base)
  rect(g, x, y, 14, 2, MARBLE.light)
  rect(g, x, y + 7, 14, 1, MARBLE.deep)
  ;[3, 7].forEach((dx) => rect(g, x + dx, y + 2, 1, 5, MARBLE.dark))
  rect(g, x + 12, y + 1, 3, 6, MARBLE.dark)
  dot(g, x + 13, y + 3, MARBLE.deep)
}

// Sillar suelto en el suelo.
function block(g, x, y, w, h) {
  rect(g, x, y, w, h, RUIN)
  rect(g, x, y, w, 1, RUIN_LIGHT)
  rect(g, x + w - 1, y, 1, h, RUIN_DARK)
}

// Mata de flores al pie del muro.
function flowerBush(g, cx, bottom, w) {
  for (let i = 0; i < w; i++) {
    const h = 4 + ((i * 5) % 4)
    const x = cx - (w >> 1) + i
    rect(g, x, bottom - h, 1, h, i % 2 ? LEAF[1] : LEAF[0])
    dot(g, x, bottom - h + 2, LEAF[2])
    if (i % 2 === 0) dot(g, x, bottom - h, BLOOM[(i >> 1) % BLOOM.length])
    if (i % 3 === 1) dot(g, x, bottom - h - 1, '#f09ab6')
  }
}

// Atril con la explicación del yacimiento, al pie de la escalinata.
function infoLectern(g, x, bottom) {
  rect(g, x + 5, bottom - 8, 2, 8, WOOD1)
  rect(g, x, bottom - 16, 12, 9, WOOD2)
  rect(g, x + 1, bottom - 15, 10, 7, '#f6ecd2')
  ;[0, 2, 4].forEach((dy) => rect(g, x + 2, bottom - 14 + dy, dy === 4 ? 5 : 8, 1, WOOD0))
}

function drawColumns() {
  const canvas = makeCanvas(WIDTH, HEIGHT)
  const g = canvas.getContext('2d')
  ruinedWall(g)
  flowerBush(g, 38, PODIUM_TOP - 1, 12)
  flowerBush(g, 63, PODIUM_TOP - 1, 8)
  flowerBush(g, 111, PODIUM_TOP - 1, 10)
  flowerBush(g, 135, PODIUM_TOP - 1, 6)
  COLUMNS.forEach((c) => column(g, c))
  architrave(g, COLUMNS[0].cx - 10, COLUMNS[1].cx + 12, COLUMNS[0].top)
  podium(g)
  fallenDrum(g, 88, PODIUM_TOP + 7)
  block(g, 126, PODIUM_TOP + 15, 9, 5)
  infoLectern(g, 4, HEIGHT - 2)
  outline(canvas, 0.5)
  return canvas
}

// Cuerpo sólido: el podio con su escalinata y la franja de las basas.
export const COLUMN_BODY = [{ l: 1 - ORIGIN_X, t: PODIUM_TOP - 8 - HEIGHT, r: WIDTH - 1 - ORIGIN_X, b: -1 }]

export function romanColumns() {
  return { canvas: drawColumns(), body: COLUMN_BODY }
}
