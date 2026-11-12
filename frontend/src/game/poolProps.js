// Lo que rodea la piscina Santuario: las sombrillas, las tumbonas y una toalla. Las sombrillas usan la misma cubierta que la de la azotea de Lupe
// (`canopy` en `buildings/terraceProps.js`: rosa y crema, seis gajos con luz y festones), con el mástil y la sombra a la escala de la piscina.
import { TONE } from './palette.js'
import { dot, ellipse, makeCanvas, outline, rect } from './pixelKit.js'
import { BRASS, CREAM, PINK, RIM, canopy } from './buildings/terraceProps.js'

const [WOOD0, WOOD1, , WOOD3] = TONE.wood
const [STONE0, STONE1, STONE2] = TONE.stone
const FRAME = '#f1ece2'
const FRAME_SHADE = '#c9c2b4'
const TOWEL_BLUE = '#6fb3c6'

const sprite = (w, h) => {
  const canvas = makeCanvas(w, h)
  return { canvas, g: canvas.getContext('2d') }
}

// Sombrilla de piscina: mástil de madera de la base al remate de latón, pie de piedra, cubierta rosa y crema y su sombra de borde duro sobre el suelo.
export function poolUmbrella() {
  const { canvas, g } = sprite(52, 62)
  const cx = 26
  const top = 6
  const floor = 58
  // Sombra: plana, desplazada a la derecha, como la de la azotea.
  ellipse(g, cx + 5, floor + 1, 21, 3, 'rgba(40,24,50,0.28)')
  // Pie de piedra y mástil.
  ellipse(g, cx, floor, 7, 2.4, STONE0)
  ellipse(g, cx, floor - 1, 7, 2.4, STONE1)
  rect(g, cx - 4, floor - 4, 8, 2, STONE2)
  rect(g, cx - 1, top + 4, 2, floor - top - 3, WOOD1)
  rect(g, cx - 1, top + 4, 1, floor - top - 3, WOOD3)
  rect(g, cx + 1, top + 8, 1, floor - top - 7, WOOD0)
  canopy(g, { cx, top, rx: 23, ry: 15 })
  ellipse(g, cx, top - 1, 1.6, 1.6, BRASS[3])
  rect(g, cx, top + 1, 1, 2, BRASS[1])
  return { canvas: outline(canvas, 0.5), body: [{ l: -5, t: -5, r: 5, b: -1 }] }
}

// Tumbona vista de frente y algo desde arriba: armazón blanco, respaldo reclinado a un lado, colchoneta rosa con una raya crema y, en la variante 1,
// una toalla doblada a los pies. Mide 44×22 y apoya en la fila 21.
export function lounger(variant = 0) {
  const { canvas, g } = sprite(44, 22)
  ellipse(g, 22, 20, 20, 2, 'rgba(40,24,50,0.22)')
  // Patas.
  rect(g, 4, 17, 2, 4, FRAME_SHADE)
  rect(g, 38, 17, 2, 4, FRAME_SHADE)
  // Armazón y colchoneta: la parte de los pies, plana, y el respaldo, más alto, a la izquierda.
  rect(g, 3, 13, 38, 5, FRAME)
  rect(g, 3, 17, 38, 1, FRAME_SHADE)
  rect(g, 4, 10, 25, 4, PINK)
  rect(g, 4, 10, 25, 1, '#f2a0bb')
  rect(g, 4, 13, 25, 1, RIM)
  for (let x = 6; x < 28; x += 5) rect(g, x, 11, 2, 2, CREAM)
  rect(g, 4, 6, 9, 5, PINK)
  rect(g, 4, 6, 9, 1, '#f2a0bb')
  rect(g, 4, 10, 9, 1, RIM)
  rect(g, 2, 5, 1, 9, FRAME)
  dot(g, 3, 5, FRAME)
  if (variant === 1) {
    // Toalla doblada a los pies: crema con franjas azules.
    rect(g, 30, 8, 9, 5, CREAM)
    rect(g, 30, 8, 9, 1, '#ffffff')
    rect(g, 30, 10, 9, 1, TOWEL_BLUE)
    rect(g, 30, 12, 9, 1, TOWEL_BLUE)
    rect(g, 38, 9, 1, 4, '#d8d0bc')
  }
  return { canvas: outline(canvas, 0.45), body: [{ l: -18, t: -9, r: 18, b: -1 }] }
}

// Toalla extendida en el suelo, plana: se pisa por encima.
export function towel() {
  const { canvas, g } = sprite(26, 14)
  rect(g, 1, 1, 24, 12, CREAM)
  rect(g, 1, 1, 24, 1, '#ffffff')
  for (let x = 1; x < 25; x += 6) rect(g, x, 2, 3, 10, TOWEL_BLUE)
  rect(g, 0, 2, 1, 10, '#d8d0bc')
  rect(g, 25, 2, 1, 10, '#d8d0bc')
  for (let y = 2; y < 12; y += 2) {
    dot(g, 0, y, CREAM)
    dot(g, 25, y, CREAM)
  }
  rect(g, 1, 12, 24, 1, '#cfc7b2')
  return { canvas: outline(canvas, 0.35), body: [], flat: true }
}
