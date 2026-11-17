// Objetos de la plaza del Ayuntamiento: el arriate de piedra con flores que acompaña a los bancos y el mosaico del suelo ante la
// portada (el castillo de la ciudad entre dos palmeras). El mosaico es plano: se pisa, así que va por debajo de quien pasa.
import { dot, makeCanvas, outline, rect } from './pixelKit.js'
import { BLOOM } from './buildings/shared.js'

const LIME = { light: '#f4e8c8', base: '#e8d3a8', dark: '#c9b994', deep: '#a89874' }
const LEAF = ['#34643a', '#4f7f3f', '#7da844']

// Arriate bajo de piedra clara, lleno de flores en matas.
export function flowerBed() {
  const canvas = makeCanvas(30, 16)
  const g = canvas.getContext('2d')
  rect(g, 1, 8, 28, 7, LIME.dark)
  rect(g, 1, 8, 28, 2, LIME.light)
  rect(g, 1, 14, 28, 1, LIME.deep)
  for (let i = 0; i < 26; i++) {
    const h = 3 + ((i * 7) % 4)
    rect(g, 2 + i, 9 - h, 1, h, i % 2 ? LEAF[1] : LEAF[0])
    if (i % 2 === 0) dot(g, 2 + i, 9 - h, BLOOM[(i >> 1) % BLOOM.length])
    if (i % 3 === 0) dot(g, 2 + i, 10 - h, '#f09ab6')
  }
  outline(canvas, 0.5)
  return { canvas, body: [{ l: -14, t: -8, r: 14, b: -1 }] }
}

// Mosaico de guijarros: marco claro, campo de arena, el castillo en almagre y una palmera a cada lado.
export function cityMosaic() {
  const canvas = makeCanvas(44, 22)
  const g = canvas.getContext('2d')
  rect(g, 0, 0, 44, 22, LIME.deep)
  rect(g, 1, 1, 42, 20, LIME.light)
  rect(g, 3, 3, 38, 16, '#efe0bc')
  for (let x = 4; x < 40; x += 3) {
    dot(g, x, 3, LIME.dark)
    dot(g, x + 1, 18, LIME.dark)
  }
  // Castillo: tres torres almenadas y la puerta.
  const red = '#b84c3c'
  rect(g, 16, 9, 12, 8, red)
  rect(g, 14, 7, 4, 10, red)
  rect(g, 26, 7, 4, 10, red)
  rect(g, 20, 5, 4, 5, red)
  ;[14, 16, 26, 28, 20, 22].forEach((x, i) => dot(g, x, i < 4 ? 6 : 4, red))
  rect(g, 21, 13, 2, 4, '#efe0bc')
  // Palmeras: tronco y penacho.
  ;[8, 36].forEach((cx) => {
    rect(g, cx, 10, 1, 7, '#8a6a40')
    ;[[-3, 9], [-2, 8], [-1, 8], [1, 8], [2, 8], [3, 9], [0, 7]].forEach(([dx, y]) => dot(g, cx + dx, y, LEAF[1]))
    dot(g, cx - 1, 10, LEAF[0])
    dot(g, cx + 1, 10, LEAF[0])
  })
  return { canvas, body: [], flat: true }
}
