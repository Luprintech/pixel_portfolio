// Surtidores animados de la fuente de la plaza. Están donde los dibujaba la ilustración original (en píxeles del dibujo de la
// fuente, ver `granCapitanFountain.js`): `x` es el centro del chorro, `y` la fila donde toca el agua (fija en todos los
// fotogramas) y `h` su altura máxima. Cada fotograma pinta todos los chorros en una capa del tamaño de la fuente, con cada uno
// en una fase distinta, para que no suban y bajen todos a la vez. Sin Phaser.
import { makeCanvas, rect } from './pixelKit.js'
import { FOUNTAIN_SIZE } from './granCapitanFountain.js'

export const FOUNTAIN_JETS = [
  { x: 36, y: 89, h: 11 },
  { x: 106, y: 89, h: 11 },
  { x: 25, y: 97, h: 10 },
  { x: 116, y: 97, h: 10 },
  { x: 20, y: 109, h: 11 },
  { x: 121, y: 109, h: 11 },
  { x: 30, y: 120, h: 12 },
  { x: 111, y: 120, h: 12 },
  { x: 48, y: 127, h: 13 },
  { x: 95, y: 127, h: 13 },
  { x: 71, y: 129, h: 14 },
]

// Altura de cada fotograma respecto a la máxima: sube, llega arriba y baja.
export const JET_HEIGHTS = [0.55, 0.8, 1, 0.8]
export const JET_FRAME_MS = 170
// Fase de cada chorro: repartidas para que los vecinos no coincidan.
export const jetPhase = (index) => (index * 3) % JET_HEIGHTS.length

const WHITE = '#f4fbff'
const LIGHT = '#bfe6f2'
const MID = '#7cc6dc'

// Un chorro con su pie en (x, y): el corro de espuma sobre el agua no se mueve; la columna crece hasta `height`.
export function drawJet(g, x, y, height, frame) {
  rect(g, x - 3, y, 7, 1, LIGHT)
  rect(g, x - 2, y - 1, 5, 1, WHITE)
  rect(g, x - 4, y + 1, 1, 1, MID)
  rect(g, x + 4, y + 1, 1, 1, MID)
  const top = y - 1 - height
  rect(g, x - 1, top + 1, 2, height, WHITE)
  rect(g, x - 2, top + 3, 1, height - 3, LIGHT)
  rect(g, x + 1, top + 3, 1, height - 3, MID)
  rect(g, x, top, 1, 1, WHITE)
  // Gotas que caen a los lados de la cresta, alternando de lado en cada fotograma.
  const side = frame % 2 ? -2 : 2
  rect(g, x + side, top + 1, 1, 1, LIGHT)
}

// Las capas de la animación: una por fotograma, con cada chorro en su fase.
export function jetFrames() {
  return JET_HEIGHTS.map((_, frame) => {
    const canvas = makeCanvas(FOUNTAIN_SIZE.w, FOUNTAIN_SIZE.h)
    const g = canvas.getContext('2d')
    FOUNTAIN_JETS.forEach((jet, i) => {
      const step = (frame + jetPhase(i)) % JET_HEIGHTS.length
      drawJet(g, jet.x, jet.y, Math.max(3, Math.round(jet.h * JET_HEIGHTS[step])), step)
    })
    return canvas
  })
}
