// Placa de madera con el nombre de la casa de Lupe. Se dibuja sola y no sabe dónde va: `homeHouse.js` la coloca.
import { PAL, shade } from '../palette.js'
import { dot, rect } from '../pixelKit.js'
import { drawText, textWidth } from '../pixelFont.js'
import { WOOD0, WOOD1, WOOD2, WOOD3 } from './shared.js'

// Placa de madera con el nombre de la casa, colgada de dos clavos.
export function lupePlaque(g, x, y) {
  const label = 'LUPE'
  const w = textWidth(label) + 4
  rect(g, x, y, w, 9, WOOD2)
  rect(g, x, y, w, 1, WOOD3)
  rect(g, x, y + 8, w, 1, WOOD0)
  rect(g, x, y, 1, 9, WOOD3)
  rect(g, x + w - 1, y, 1, 9, WOOD1)
  rect(g, x + 1, y + 1, w - 2, 7, shade(WOOD2, 0.86))
  drawText(g, x + 2, y + 2, label, PAL.saffronLight)
  dot(g, x + 1, y + 1, WOOD0)
  dot(g, x + w - 2, y + 1, WOOD0)
  return w
}
