// Terraza del Bar Mihrab: mesas cuadradas oscuras con dos sillas de mimbre de estructura metálica y sombrillas grandes de
// color crema, a la escala de la viajera. Son objetos del valle como los demás (`props.js` los registra en `PROP_KINDS`).
import { makeCanvas, outline, rect } from './pixelKit.js'

const TABLE_TOP = '#3a302c'
const TABLE_EDGE = '#5a4a42'
const METAL = '#5a5a66'
const WICKER = '#c89a5a'
const WICKER_DARK = '#9a6e38'
const WICKER_LIGHT = '#e2bc7c'
const CANVAS = '#f4ead2'
const CANVAS_SHADE = '#d8c8a4'
const CANVAS_DARK = '#b8a47e'

// Silla de mimbre vista de frente: respaldo trenzado, asiento y patas de hierro.
function chair(g, x) {
  rect(g, x, 2, 7, 7, WICKER)
  for (let y = 3; y < 9; y += 2) rect(g, x + 1, y, 5, 1, WICKER_DARK)
  rect(g, x, 2, 7, 1, WICKER_LIGHT)
  rect(g, x - 1, 9, 9, 3, WICKER)
  rect(g, x - 1, 9, 9, 1, WICKER_LIGHT)
  rect(g, x - 1, 12, 1, 5, METAL)
  rect(g, x + 7, 12, 1, 5, METAL)
}

// Mesa cuadrada con una silla a cada lado.
export function cafeTable() {
  const canvas = makeCanvas(30, 18)
  const g = canvas.getContext('2d')
  chair(g, 2)
  chair(g, 21)
  rect(g, 9, 7, 12, 4, TABLE_TOP)
  rect(g, 9, 7, 12, 1, TABLE_EDGE)
  rect(g, 10, 11, 1, 6, METAL)
  rect(g, 19, 11, 1, 6, METAL)
  rect(g, 11, 15, 8, 1, METAL)
  return { canvas: outline(canvas, 0.5), body: [{ l: -14, t: -4, r: 14, b: -1 }] }
}

// Sombrilla grande: lona crema con el borde festoneado sobre un mástil de hierro, con el borde por encima de la cabeza de la
// viajera. La lona va en alto, así que la sombrilla se ordena unos píxeles por delante de su base (`lift`): quien pasa justo por
// delante del mástil sigue quedando debajo de la lona.
export function cafeUmbrella() {
  const canvas = makeCanvas(40, 46)
  const g = canvas.getContext('2d')
  rect(g, 19, 0, 2, 2, METAL)
  for (let row = 0; row < 8; row++) {
    const half = 6 + row * 2
    rect(g, 20 - half, 2 + row, half * 2, 1, row < 2 ? CANVAS : row < 6 ? CANVAS : CANVAS_SHADE)
  }
  rect(g, 4, 10, 32, 1, CANVAS_DARK)
  for (let x = 4; x < 36; x += 4) rect(g, x + 1, 11, 2, 1, CANVAS_SHADE)
  for (let x = 6; x < 36; x += 6) rect(g, x, 3, 1, 7, CANVAS_SHADE)
  rect(g, 19, 11, 2, 33, METAL)
  rect(g, 16, 44, 8, 2, METAL)
  return { canvas: outline(canvas, 0.5), body: [{ l: -2, t: -3, r: 2, b: -1 }], lift: 20 }
}
