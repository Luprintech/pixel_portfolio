// Luz cálida de la casa de Lupe al anochecer. Las ventanas y las bombillas ya brillan (`litWindows.js`); esta capa
// reparte su luz por el entorno: la fachada alrededor de cada ventana, el suelo del porche, la cubierta bajo la
// guirnalda y la sombrilla. Cada charco son óvalos concéntricos de poca opacidad (sin degradados: escalones), así
// que el centro se acumula y el borde se funde por pasos, como las farolas. La escena la enciende con las mismas
// curvas que las ventanas (`sky.addWindows`). El lienzo es más alto que el dibujo de la casa para alcanzar el suelo.
import { ellipse, makeCanvas } from '../pixelKit.js'
import { DECK, DECK_WIDEN, TABLE } from '../terrace.js'
import { STRAND, strandPoints } from './terraceProps.js'

export const GLOW_H = 190
const warm = (alpha) => `rgba(255,205,110,${alpha})`

function pool(g, cx, cy, rx, ry, { rings = 3, alpha = 0.07 } = {}) {
  for (let k = 0; k < rings; k++) {
    const shrink = 1 - (k / rings) * 0.7
    ellipse(g, cx, cy, rx * shrink, ry * shrink, warm(alpha))
  }
}

// Luz de una ventana sobre la fachada que la rodea, sobre la pared de debajo y sobre el suelo que tiene delante.
function windowLight(g, { x, y, w, h }) {
  const cx = x + w / 2
  pool(g, cx, y + h / 2, w * 0.75, h * 0.8, { rings: 2, alpha: 0.09 })
  pool(g, cx, y + h + 14, w * 0.85, 12, { rings: 2, alpha: 0.08 })
  pool(g, cx, 166, w * 0.95, 9, { rings: 3, alpha: 0.085 })
}

export function houseGlow() {
  const DX = DECK_WIDEN
  const canvas = makeCanvas(256 + DX, GLOW_H)
  const g = canvas.getContext('2d')
  // Las dos ventanas grandes y las dos de la sala baja.
  windowLight(g, { x: 120 + DX, y: 102, w: 36, h: 30 })
  windowLight(g, { x: 202 + DX, y: 102, w: 36, h: 30 })
  windowLight(g, { x: 54, y: 128, w: 32, h: 20 })
  windowLight(g, { x: 104 + DX / 2, y: 128, w: 32, h: 20 })
  // Puerta y farol.
  pool(g, 179 + DX, 165, 22, 8, { rings: 3, alpha: 0.08 })
  pool(g, 162 + DX, 138, 11, 9, { rings: 2, alpha: 0.09 })
  // Guirnalda: un charquito bajo cada bombilla, el suelo de la cubierta y la parte baja de la sombrilla.
  strandPoints(STRAND)
    .filter((p) => p.bulb)
    .forEach((p) => pool(g, p.x + 1, p.y + 2, 6, 5, { rings: 2, alpha: 0.08 }))
  pool(g, (DECK.left + DECK.right) / 2, 100, 52, 9, { rings: 3, alpha: 0.07 })
  pool(g, TABLE.x, 79, 17, 8, { rings: 2, alpha: 0.07 })
  pool(g, DECK.left - 2, 110, 10, 6, { rings: 2, alpha: 0.07 })
  return canvas
}
